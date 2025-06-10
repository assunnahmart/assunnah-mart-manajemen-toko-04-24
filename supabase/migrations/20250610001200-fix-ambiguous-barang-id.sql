
-- Fix ambiguous column references in get_stock_opname_recap function
-- This resolves the "column reference barang_id is ambiguous" error

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_stock_opname_recap(DATE, DATE);

-- Create the corrected function with proper table aliasing
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
      barang.id as calc_barang_id,
      barang.nama as calc_nama_barang,
      barang.satuan as calc_satuan,
      -- System stock calculation: current stock + stock in - stock out
      (
        COALESCE(barang.stok_saat_ini, 0) + 
        COALESCE((
          SELECT SUM(mutasi_masuk.jumlah) 
          FROM mutasi_stok mutasi_masuk
          WHERE mutasi_masuk.barang_id = barang.id 
            AND mutasi_masuk.jenis_mutasi = 'masuk'
            AND DATE(mutasi_masuk.created_at) BETWEEN date_from AND date_to
        ), 0) - 
        COALESCE((
          SELECT SUM(mutasi_keluar.jumlah) 
          FROM mutasi_stok mutasi_keluar
          WHERE mutasi_keluar.barang_id = barang.id 
            AND mutasi_keluar.jenis_mutasi = 'keluar'
            AND DATE(mutasi_keluar.created_at) BETWEEN date_from AND date_to
        ), 0)
      ) as calc_stok_sistem,
      -- Real stock from opname inputs in the date range
      COALESCE((
        SELECT SUM(opname_sum.stok_fisik)
        FROM stok_opname opname_sum
        WHERE opname_sum.barang_id = barang.id 
          AND opname_sum.status = 'approved'
          AND opname_sum.tanggal_opname BETWEEN date_from AND date_to
      ), 0) as calc_real_stok_total,
      -- Count of unique users who input this product
      COALESCE((
        SELECT COUNT(DISTINCT opname_count.kasir_id)
        FROM stok_opname opname_count
        WHERE opname_count.barang_id = barang.id 
          AND opname_count.status = 'approved'
          AND opname_count.tanggal_opname BETWEEN date_from AND date_to
      ), 0) as calc_jumlah_pengguna_input
    FROM barang_konsinyasi barang
  ),
  opname_details AS (
    SELECT 
      opname_detail.barang_id as detail_barang_id,
      opname_detail.stok_fisik as detail_stok_fisik,
      opname_detail.tanggal_opname as detail_tanggal_opname,
      opname_detail.keterangan as detail_keterangan,
      kasir_detail.nama as detail_nama_kasir,
      opname_detail.kasir_id as detail_kasir_id
    FROM stok_opname opname_detail
    JOIN kasir kasir_detail ON kasir_detail.id = opname_detail.kasir_id
    WHERE opname_detail.status = 'approved'
      AND opname_detail.tanggal_opname BETWEEN date_from AND date_to
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_stock_opname_recap(DATE, DATE) TO anon, authenticated;
