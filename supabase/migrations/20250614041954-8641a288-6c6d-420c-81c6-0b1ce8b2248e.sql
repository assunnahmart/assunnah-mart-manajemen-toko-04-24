
-- Hapus data piutang sejumlah 69000 pada piutang perorangan
UPDATE pelanggan_perorangan 
SET sisa_piutang = sisa_piutang - 69000 
WHERE sisa_piutang >= 69000;

-- Jika ada record spesifik dengan piutang tepat 69000, bisa juga menggunakan:
-- UPDATE pelanggan_perorangan 
-- SET sisa_piutang = 0 
-- WHERE sisa_piutang = 69000;

-- Tambahkan hook untuk memperbarui produk pembelian ke barang konsinyasi jika diperlukan
CREATE OR REPLACE FUNCTION sync_produk_pembelian_to_barang_konsinyasi()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update barang_konsinyasi when produk_pembelian is modified
  INSERT INTO barang_konsinyasi (
    nama, barcode, jenis_konsinyasi, satuan, harga_beli, harga_jual,
    stok_saat_ini, stok_minimal, status, supplier_id, kategori_pembelian
  ) VALUES (
    NEW.nama_produk, NEW.barcode, 'lainnya', NEW.satuan, NEW.harga_beli, NEW.harga_jual,
    NEW.stok_saat_ini, NEW.stok_minimal, NEW.status, NEW.supplier_id, NEW.kategori
  )
  ON CONFLICT (barcode) DO UPDATE SET
    nama = EXCLUDED.nama,
    harga_beli = EXCLUDED.harga_beli,
    harga_jual = EXCLUDED.harga_jual,
    stok_saat_ini = EXCLUDED.stok_saat_ini,
    stok_minimal = EXCLUDED.stok_minimal,
    status = EXCLUDED.status,
    supplier_id = EXCLUDED.supplier_id,
    kategori_pembelian = EXCLUDED.kategori_pembelian,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for produk_pembelian
DROP TRIGGER IF EXISTS trigger_sync_produk_pembelian ON produk_pembelian;
CREATE TRIGGER trigger_sync_produk_pembelian
  AFTER INSERT OR UPDATE ON produk_pembelian
  FOR EACH ROW EXECUTE FUNCTION sync_produk_pembelian_to_barang_konsinyasi();
