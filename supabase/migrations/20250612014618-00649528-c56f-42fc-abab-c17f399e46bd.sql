
-- Drop and recreate the function with correct return types
DROP FUNCTION IF EXISTS get_stock_opname_recap(DATE, DATE);

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
      bk.id::UUID as item_barang_id,
      bk.nama::VARCHAR as item_nama_barang,
      bk.satuan::VARCHAR as item_satuan,
      -- System stock calculation with explicit casting
      (
        COALESCE(bk.stok_saat_ini, 0) + 
        COALESCE((
          SELECT SUM(ms_in.jumlah)::BIGINT 
          FROM mutasi_stok ms_in
          WHERE ms_in.barang_id = bk.id 
            AND ms_in.jenis_mutasi = 'masuk'
            AND DATE(ms_in.created_at) BETWEEN date_from AND date_to
        ), 0) - 
        COALESCE((
          SELECT SUM(ms_out.jumlah)::BIGINT 
          FROM mutasi_stok ms_out
          WHERE ms_out.barang_id = bk.id 
            AND ms_out.jenis_mutasi = 'keluar'
            AND DATE(ms_out.created_at) BETWEEN date_from AND date_to
        ), 0)
      )::BIGINT as item_stok_sistem,
      -- Real stock from opname inputs with explicit casting
      COALESCE((
        SELECT SUM(so_sum.stok_fisik)::BIGINT
        FROM stok_opname so_sum
        WHERE so_sum.barang_id = bk.id 
          AND so_sum.status = 'approved'
          AND so_sum.tanggal_opname BETWEEN date_from AND date_to
      ), 0::BIGINT) as item_real_stok_total,
      -- Count of unique users with explicit casting
      COALESCE((
        SELECT COUNT(DISTINCT so_count.kasir_id)::BIGINT
        FROM stok_opname so_count
        WHERE so_count.barang_id = bk.id 
          AND so_count.status = 'approved'
          AND so_count.tanggal_opname BETWEEN date_from AND date_to
      ), 0::BIGINT) as item_jumlah_pengguna_input
    FROM barang_konsinyasi bk
  ),
  opname_details AS (
    SELECT 
      so_detail.barang_id as detail_barang_id,
      so_detail.stok_fisik as detail_stok_fisik,
      so_detail.tanggal_opname as detail_tanggal_opname,
      so_detail.keterangan as detail_keterangan,
      k_detail.nama as detail_nama_kasir,
      so_detail.kasir_id as detail_kasir_id
    FROM stok_opname so_detail
    JOIN kasir k_detail ON k_detail.id = so_detail.kasir_id
    WHERE so_detail.status = 'approved'
      AND so_detail.tanggal_opname BETWEEN date_from AND date_to
  )
  SELECT 
    sc.item_barang_id,
    sc.item_nama_barang,
    sc.item_satuan,
    sc.item_stok_sistem,
    sc.item_real_stok_total,
    sc.item_jumlah_pengguna_input,
    (sc.item_stok_sistem - sc.item_real_stok_total)::BIGINT as selisih_stok,
    COALESCE((
      SELECT json_agg(
        json_build_object(
          'nama_kasir', od.detail_nama_kasir,
          'stok_fisik', od.detail_stok_fisik,
          'tanggal_opname', od.detail_tanggal_opname,
          'keterangan', od.detail_keterangan,
          'kasir_id', od.detail_kasir_id
        )
      )::JSON
      FROM opname_details od
      WHERE od.detail_barang_id = sc.item_barang_id
    ), '[]'::JSON) as detail_input_pengguna,
    CASE 
      WHEN (sc.item_stok_sistem - sc.item_real_stok_total) > 0 THEN 'Lebih Sistem'::VARCHAR
      WHEN (sc.item_stok_sistem - sc.item_real_stok_total) < 0 THEN 'Lebih Real'::VARCHAR
      ELSE 'Seimbang'::VARCHAR
    END as kategori_selisih
  FROM stock_calculations sc
  WHERE sc.item_jumlah_pengguna_input > 0
  ORDER BY ABS(sc.item_stok_sistem - sc.item_real_stok_total) DESC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_stock_opname_recap(DATE, DATE) TO anon, authenticated;
