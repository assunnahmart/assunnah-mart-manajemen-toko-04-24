
-- Create table for barang_konsinyasi (products/inventory)
CREATE TABLE public.barang_konsinyasi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  barcode TEXT,
  harga_jual INTEGER NOT NULL DEFAULT 0,
  harga_beli INTEGER NOT NULL DEFAULT 0,
  stok_saat_ini INTEGER NOT NULL DEFAULT 0,
  stok_minimal INTEGER NOT NULL DEFAULT 0,
  satuan TEXT NOT NULL DEFAULT 'pcs',
  kategori TEXT,
  supplier TEXT,
  status TEXT NOT NULL DEFAULT 'aktif',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for pelanggan (customers) 
CREATE TABLE public.pelanggan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  nama_unit TEXT,
  jabatan TEXT,
  phone TEXT,
  alamat TEXT,
  jenis_pembayaran TEXT DEFAULT 'tunai',
  limit_kredit INTEGER DEFAULT 0,
  sisa_piutang INTEGER DEFAULT 0,
  total_tagihan INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'aktif',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for POS transactions
CREATE TABLE public.pos_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kasir_username TEXT NOT NULL,
  kasir_name TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  amount_paid INTEGER NOT NULL,
  change_amount INTEGER NOT NULL DEFAULT 0,
  items_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for POS transaction items
CREATE TABLE public.pos_transaction_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.pos_transactions(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  unit_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  unit TEXT NOT NULL DEFAULT 'pcs',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some sample products for testing
INSERT INTO public.barang_konsinyasi (nama, barcode, harga_jual, harga_beli, stok_saat_ini, stok_minimal, satuan, kategori) VALUES
('Beras Premium 5kg', '8991234567890', 75000, 65000, 50, 10, 'pcs', 'Sembako'),
('Minyak Goreng 2L', '8991234567891', 35000, 30000, 30, 5, 'pcs', 'Sembako'),
('Gula Pasir 1kg', '8991234567892', 15000, 12000, 25, 5, 'pcs', 'Sembako'),
('Teh Celup 25s', '8991234567893', 8000, 6000, 40, 10, 'pcs', 'Minuman'),
('Kopi Sachet 20s', '8991234567894', 12000, 9000, 35, 8, 'pcs', 'Minuman');

-- Insert sample customer for testing
INSERT INTO public.pelanggan (nama, nama_unit, jabatan, phone, jenis_pembayaran, limit_kredit) VALUES
('Toko Berkah', 'Unit 1', 'Pemilik', '08123456789', 'kredit', 1000000),
('Warung Maju', 'Unit 2', 'Pemilik', '08123456790', 'tunai', 0),
('Guest Customer', '', '', '', 'tunai', 0);
