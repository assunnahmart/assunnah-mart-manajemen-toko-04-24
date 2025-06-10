
-- Fix the get_stock_opname_recap function to resolve ambiguous column references
-- and improve the stock opname recap functionality

-- Drop the existing function and view first
DROP FUNCTION IF EXISTS get_stock_opname_recap(DATE, DATE);
DROP VIEW IF EXISTS stock_opname_recap;

-- Create improved function with proper column aliasing
CREATE OR REPLACE FUNCTION get_stock_opname_recap(
  date_from DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  date_to DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  barang_id UUID,
  nama_barang VARCHAR,
  satuan VARCHAR,
  stok_sistem BIGINT,
  real_stok_total BIGINT,
  jumlah_pengguna_input BIGINT,
  selisih_stok BIGINT,
  detail_input_pengguna JSON,
  kategori_selisih VARCHAR
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH stock_calculations AS (
    SELECT 
      b.id as calc_barang_id,
      b.nama as calc_nama_barang,
      b.satuan as calc_satuan,
      -- System stock calculation: current stock + stock in - stock out
      (
        COALESCE(b.stok_saat_ini, 0) + 
        COALESCE((
          SELECT SUM(ms.jumlah) 
          FROM mutasi_stok ms
          WHERE ms.barang_id = b.id 
            AND ms.jenis_mutasi = 'masuk'
            AND DATE(ms.created_at) BETWEEN date_from AND date_to
        ), 0) - 
        COALESCE((
          SELECT SUM(ms.jumlah) 
          FROM mutasi_stok ms
          WHERE ms.barang_id = b.id 
            AND ms.jenis_mutasi = 'keluar'
            AND DATE(ms.created_at) BETWEEN date_from AND date_to
        ), 0)
      ) as calc_stok_sistem,
      -- Real stock from opname inputs in the date range
      COALESCE((
        SELECT SUM(so.stok_fisik)
        FROM stok_opname so
        WHERE so.barang_id = b.id 
          AND so.status = 'approved'
          AND so.tanggal_opname BETWEEN date_from AND date_to
      ), 0) as calc_real_stok_total,
      -- Count of unique users who input this product
      COALESCE((
        SELECT COUNT(DISTINCT so.kasir_id)
        FROM stok_opname so
        WHERE so.barang_id = b.id 
          AND so.status = 'approved'
          AND so.tanggal_opname BETWEEN date_from AND date_to
      ), 0) as calc_jumlah_pengguna_input
    FROM barang_konsinyasi b
  ),
  opname_details AS (
    SELECT 
      so.barang_id as detail_barang_id,
      so.stok_fisik as detail_stok_fisik,
      so.tanggal_opname as detail_tanggal_opname,
      so.keterangan as detail_keterangan,
      k.nama as detail_nama_kasir,
      so.kasir_id as detail_kasir_id
    FROM stok_opname so
    JOIN kasir k ON k.id = so.kasir_id
    WHERE so.status = 'approved'
      AND so.tanggal_opname BETWEEN date_from AND date_to
  )
  SELECT 
    sc.calc_barang_id as barang_id,
    sc.calc_nama_barang as nama_barang,
    sc.calc_satuan as satuan,
    sc.calc_stok_sistem as stok_sistem,
    sc.calc_real_stok_total as real_stok_total,
    sc.calc_jumlah_pengguna_input as jumlah_pengguna_input,
    (sc.calc_stok_sistem - sc.calc_real_stok_total) as selisih_stok,
    COALESCE((
      SELECT json_agg(
        json_build_object(
          'nama_kasir', od.detail_nama_kasir,
          'stok_fisik', od.detail_stok_fisik,
          'tanggal_opname', od.detail_tanggal_opname,
          'keterangan', od.detail_keterangan,
          'kasir_id', od.detail_kasir_id
        )
      )
      FROM opname_details od
      WHERE od.detail_barang_id = sc.calc_barang_id
    ), '[]'::json) as detail_input_pengguna,
    CASE 
      WHEN (sc.calc_stok_sistem - sc.calc_real_stok_total) > 0 THEN 'Lebih Sistem'
      WHEN (sc.calc_stok_sistem - sc.calc_real_stok_total) < 0 THEN 'Lebih Real'
      ELSE 'Seimbang'
    END as kategori_selisih
  FROM stock_calculations sc
  WHERE sc.calc_jumlah_pengguna_input > 0
  ORDER BY ABS(sc.calc_stok_sistem - sc.calc_real_stok_total) DESC;
END;
$$;

-- Create a simplified view for quick access
CREATE OR REPLACE VIEW stock_opname_recap AS
SELECT * FROM get_stock_opname_recap();

-- Grant permissions
GRANT SELECT ON stock_opname_recap TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_stock_opname_recap(DATE, DATE) TO anon, authenticated;
