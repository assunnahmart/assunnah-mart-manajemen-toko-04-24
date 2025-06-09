
-- Fix kasir_kas_transactions table - ensure kasir_id is consistent type
-- Also add table for stock opname recap tracking

-- First, let's make sure kasir_id in kasir_kas_transactions is TEXT consistently
-- (This was already done in migration but let's ensure it's working)

-- Create a view for stock opname recap that calculates stock differences
CREATE OR REPLACE VIEW stock_opname_recap AS
WITH stock_calculations AS (
  -- Calculate system stock for each product
  SELECT 
    b.id as barang_id,
    b.nama as nama_barang,
    b.satuan,
    -- Initial stock + stock in - stock out = system stock
    (
      COALESCE(b.stok_saat_ini, 0) + 
      COALESCE((
        SELECT SUM(jumlah) 
        FROM mutasi_stok 
        WHERE barang_id = b.id AND jenis_mutasi = 'masuk'
      ), 0) - 
      COALESCE((
        SELECT SUM(jumlah) 
        FROM mutasi_stok 
        WHERE barang_id = b.id AND jenis_mutasi = 'keluar'
      ), 0)
    ) as stok_sistem,
    -- Real stock from all opname inputs (sum of all user inputs for same product)
    COALESCE((
      SELECT SUM(so.stok_fisik)
      FROM stok_opname so
      WHERE so.barang_id = b.id 
        AND so.status = 'approved'
        AND so.tanggal_opname >= CURRENT_DATE - INTERVAL '30 days'
    ), 0) as real_stok_total,
    -- Count of users who input this product
    COALESCE((
      SELECT COUNT(DISTINCT so.kasir_id)
      FROM stok_opname so
      WHERE so.barang_id = b.id 
        AND so.status = 'approved'
        AND so.tanggal_opname >= CURRENT_DATE - INTERVAL '30 days'
    ), 0) as jumlah_pengguna_input
  FROM barang_konsinyasi b
),
opname_details AS (
  -- Get detailed opname entries with user info
  SELECT 
    so.barang_id,
    so.stok_fisik,
    so.tanggal_opname,
    so.keterangan,
    k.nama as nama_kasir,
    so.kasir_id
  FROM stok_opname so
  JOIN kasir k ON k.id = so.kasir_id
  WHERE so.status = 'approved'
    AND so.tanggal_opname >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT 
  sc.barang_id,
  sc.nama_barang,
  sc.satuan,
  sc.stok_sistem,
  sc.real_stok_total,
  sc.jumlah_pengguna_input,
  (sc.stok_sistem - sc.real_stok_total) as selisih_stok,
  -- Aggregate user details as JSON
  COALESCE((
    SELECT json_agg(
      json_build_object(
        'nama_kasir', od.nama_kasir,
        'stok_fisik', od.stok_fisik,
        'tanggal_opname', od.tanggal_opname,
        'keterangan', od.keterangan
      )
    )
    FROM opname_details od
    WHERE od.barang_id = sc.barang_id
  ), '[]'::json) as detail_input_pengguna
FROM stock_calculations sc
WHERE sc.jumlah_pengguna_input > 0
ORDER BY ABS(sc.stok_sistem - sc.real_stok_total) DESC;

-- Create function to get stock opname recap data
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
      b.id as barang_id,
      b.nama as nama_barang,
      b.satuan,
      -- System stock calculation
      (
        COALESCE(b.stok_saat_ini, 0) + 
        COALESCE((
          SELECT SUM(jumlah) 
          FROM mutasi_stok 
          WHERE barang_id = b.id AND jenis_mutasi = 'masuk'
            AND DATE(created_at) BETWEEN date_from AND date_to
        ), 0) - 
        COALESCE((
          SELECT SUM(jumlah) 
          FROM mutasi_stok 
          WHERE barang_id = b.id AND jenis_mutasi = 'keluar'
            AND DATE(created_at) BETWEEN date_from AND date_to
        ), 0)
      ) as stok_sistem,
      -- Real stock from opname inputs
      COALESCE((
        SELECT SUM(so.stok_fisik)
        FROM stok_opname so
        WHERE so.barang_id = b.id 
          AND so.status = 'approved'
          AND so.tanggal_opname BETWEEN date_from AND date_to
      ), 0) as real_stok_total,
      -- Count users
      COALESCE((
        SELECT COUNT(DISTINCT so.kasir_id)
        FROM stok_opname so
        WHERE so.barang_id = b.id 
          AND so.status = 'approved'
          AND so.tanggal_opname BETWEEN date_from AND date_to
      ), 0) as jumlah_pengguna_input
    FROM barang_konsinyasi b
  ),
  opname_details AS (
    SELECT 
      so.barang_id,
      so.stok_fisik,
      so.tanggal_opname,
      so.keterangan,
      k.nama as nama_kasir,
      so.kasir_id
    FROM stok_opname so
    JOIN kasir k ON k.id = so.kasir_id
    WHERE so.status = 'approved'
      AND so.tanggal_opname BETWEEN date_from AND date_to
  )
  SELECT 
    sc.barang_id,
    sc.nama_barang,
    sc.satuan,
    sc.stok_sistem,
    sc.real_stok_total,
    sc.jumlah_pengguna_input,
    (sc.stok_sistem - sc.real_stok_total) as selisih_stok,
    COALESCE((
      SELECT json_agg(
        json_build_object(
          'nama_kasir', od.nama_kasir,
          'stok_fisik', od.stok_fisik,
          'tanggal_opname', od.tanggal_opname,
          'keterangan', od.keterangan,
          'kasir_id', od.kasir_id
        )
      )
      FROM opname_details od
      WHERE od.barang_id = sc.barang_id
    ), '[]'::json) as detail_input_pengguna,
    CASE 
      WHEN (sc.stok_sistem - sc.real_stok_total) > 0 THEN 'Lebih Sistem'
      WHEN (sc.stok_sistem - sc.real_stok_total) < 0 THEN 'Lebih Real'
      ELSE 'Seimbang'
    END as kategori_selisih
  FROM stock_calculations sc
  WHERE sc.jumlah_pengguna_input > 0
  ORDER BY ABS(sc.stok_sistem - sc.real_stok_total) DESC;
END;
$$;
