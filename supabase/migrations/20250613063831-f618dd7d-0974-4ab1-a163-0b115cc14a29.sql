
-- Create table for purchase returns (retur pembelian)
CREATE TABLE public.retur_pembelian (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nomor_retur VARCHAR NOT NULL,
  transaksi_pembelian_id UUID REFERENCES public.transaksi_pembelian(id),
  supplier_id UUID REFERENCES public.supplier(id),
  kasir_id UUID REFERENCES public.kasir(id),
  tanggal_retur DATE NOT NULL DEFAULT CURRENT_DATE,
  total_retur NUMERIC NOT NULL DEFAULT 0,
  alasan_retur TEXT,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for purchase return items
CREATE TABLE public.detail_retur_pembelian (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retur_id UUID REFERENCES public.retur_pembelian(id) ON DELETE CASCADE,
  barang_id UUID REFERENCES public.barang_konsinyasi(id),
  nama_barang VARCHAR NOT NULL,
  jumlah_retur INTEGER NOT NULL,
  harga_satuan NUMERIC NOT NULL,
  subtotal_retur NUMERIC NOT NULL,
  alasan_item TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for sales returns (retur penjualan)
CREATE TABLE public.retur_penjualan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nomor_retur VARCHAR NOT NULL,
  transaksi_penjualan_id UUID REFERENCES public.transaksi_penjualan(id),
  pos_transaction_id UUID REFERENCES public.pos_transactions(id),
  pelanggan_id UUID,
  pelanggan_name VARCHAR,
  kasir_id UUID REFERENCES public.kasir(id),
  tanggal_retur DATE NOT NULL DEFAULT CURRENT_DATE,
  total_retur NUMERIC NOT NULL DEFAULT 0,
  jenis_retur VARCHAR DEFAULT 'barang' CHECK (jenis_retur IN ('barang', 'uang')),
  alasan_retur TEXT,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for sales return items
CREATE TABLE public.detail_retur_penjualan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retur_id UUID REFERENCES public.retur_penjualan(id) ON DELETE CASCADE,
  barang_id UUID REFERENCES public.barang_konsinyasi(id),
  nama_barang VARCHAR NOT NULL,
  jumlah_retur INTEGER NOT NULL,
  harga_satuan NUMERIC NOT NULL,
  subtotal_retur NUMERIC NOT NULL,
  alasan_item TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add additional columns to general_ledger for better tracking
ALTER TABLE public.general_ledger 
ADD COLUMN IF NOT EXISTS supplier_name VARCHAR,
ADD COLUMN IF NOT EXISTS pelanggan_name VARCHAR,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR,
ADD COLUMN IF NOT EXISTS kasir_name VARCHAR,
ADD COLUMN IF NOT EXISTS transaction_type VARCHAR,
ADD COLUMN IF NOT EXISTS transaction_number VARCHAR;

-- Function to generate retur pembelian number
CREATE OR REPLACE FUNCTION public.generate_retur_pembelian_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $function$
DECLARE
    next_number INTEGER;
    formatted_number TEXT;
    date_part TEXT;
BEGIN
    date_part := TO_CHAR(CURRENT_DATE, 'YYYY-MMDD');
    
    SELECT COALESCE(MAX(CAST(RIGHT(nomor_retur, 3) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.retur_pembelian
    WHERE nomor_retur LIKE 'RPB-' || date_part || '-%'
    AND DATE(created_at) = CURRENT_DATE;
    
    formatted_number := 'RPB-' || date_part || '-' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN formatted_number;
END;
$function$;

-- Function to generate retur penjualan number
CREATE OR REPLACE FUNCTION public.generate_retur_penjualan_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $function$
DECLARE
    next_number INTEGER;
    formatted_number TEXT;
    date_part TEXT;
BEGIN
    date_part := TO_CHAR(CURRENT_DATE, 'YYYY-MMDD');
    
    SELECT COALESCE(MAX(CAST(RIGHT(nomor_retur, 3) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.retur_penjualan
    WHERE nomor_retur LIKE 'RPJ-' || date_part || '-%'
    AND DATE(created_at) = CURRENT_DATE;
    
    formatted_number := 'RPJ-' || date_part || '-' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN formatted_number;
END;
$function$;

-- Function to handle purchase return stock updates
CREATE OR REPLACE FUNCTION public.process_purchase_return(
  p_retur_id UUID
) RETURNS VOID AS $$
DECLARE
  return_item RECORD;
BEGIN
  -- Update stock for each returned item
  FOR return_item IN 
    SELECT * FROM public.detail_retur_pembelian WHERE retur_id = p_retur_id
  LOOP
    -- Decrease stock (remove returned items from inventory)
    UPDATE public.barang_konsinyasi 
    SET stok_saat_ini = stok_saat_ini - return_item.jumlah_retur,
        updated_at = NOW()
    WHERE id = return_item.barang_id;
    
    -- Record stock mutation
    INSERT INTO public.mutasi_stok (
      barang_id, jenis_mutasi, jumlah, 
      stok_sebelum, stok_sesudah, 
      referensi_tipe, referensi_id, keterangan
    ) VALUES (
      return_item.barang_id, 'keluar', return_item.jumlah_retur,
      (SELECT stok_saat_ini + return_item.jumlah_retur FROM public.barang_konsinyasi WHERE id = return_item.barang_id),
      (SELECT stok_saat_ini FROM public.barang_konsinyasi WHERE id = return_item.barang_id),
      'retur_pembelian', p_retur_id,
      'Retur pembelian - ' || return_item.nama_barang
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to handle sales return stock updates
CREATE OR REPLACE FUNCTION public.process_sales_return(
  p_retur_id UUID
) RETURNS VOID AS $$
DECLARE
  return_item RECORD;
BEGIN
  -- Update stock for each returned item
  FOR return_item IN 
    SELECT * FROM public.detail_retur_penjualan WHERE retur_id = p_retur_id
  LOOP
    -- Increase stock (add returned items back to inventory)
    UPDATE public.barang_konsinyasi 
    SET stok_saat_ini = stok_saat_ini + return_item.jumlah_retur,
        updated_at = NOW()
    WHERE id = return_item.barang_id;
    
    -- Record stock mutation
    INSERT INTO public.mutasi_stok (
      barang_id, jenis_mutasi, jumlah, 
      stok_sebelum, stok_sesudah, 
      referensi_tipe, referensi_id, keterangan
    ) VALUES (
      return_item.barang_id, 'masuk', return_item.jumlah_retur,
      (SELECT stok_saat_ini - return_item.jumlah_retur FROM public.barang_konsinyasi WHERE id = return_item.barang_id),
      (SELECT stok_saat_ini FROM public.barang_konsinyasi WHERE id = return_item.barang_id),
      'retur_penjualan', p_retur_id,
      'Retur penjualan - ' || return_item.nama_barang
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create ledger entries from purchase returns
CREATE OR REPLACE FUNCTION auto_create_ledger_from_purchase_return() RETURNS TRIGGER AS $$
DECLARE
  kas_account_id UUID;
  inventory_account_id UUID;
  supplier_name_var TEXT;
  kasir_name_var TEXT;
BEGIN
  IF NEW.status = 'approved' THEN
    -- Get account IDs
    SELECT id INTO kas_account_id FROM public.chart_of_accounts WHERE kode_akun = '1001';
    SELECT id INTO inventory_account_id FROM public.chart_of_accounts WHERE kode_akun = '1301';
    
    -- Get supplier and kasir names
    SELECT nama INTO supplier_name_var FROM public.supplier WHERE id = NEW.supplier_id;
    SELECT nama INTO kasir_name_var FROM public.kasir WHERE id = NEW.kasir_id;
    
    -- Debit kas (cash in from return)
    PERFORM create_general_ledger_entry(
      NEW.tanggal_retur,
      kas_account_id,
      NEW.total_retur,
      0,
      'Retur Pembelian - ' || NEW.nomor_retur,
      'purchase_return',
      NEW.id,
      supplier_name_var,
      NULL,
      'cash',
      kasir_name_var,
      'retur_pembelian',
      NEW.nomor_retur
    );
    
    -- Credit inventory (reduce inventory value)
    PERFORM create_general_ledger_entry(
      NEW.tanggal_retur,
      inventory_account_id,
      0,
      NEW.total_retur,
      'Retur Pembelian - ' || NEW.nomor_retur,
      'purchase_return',
      NEW.id,
      supplier_name_var,
      NULL,
      'cash',
      kasir_name_var,
      'retur_pembelian',
      NEW.nomor_retur
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create ledger entries from sales returns
CREATE OR REPLACE FUNCTION auto_create_ledger_from_sales_return() RETURNS TRIGGER AS $$
DECLARE
  kas_account_id UUID;
  sales_account_id UUID;
  inventory_account_id UUID;
  kasir_name_var TEXT;
BEGIN
  IF NEW.status = 'approved' THEN
    -- Get account IDs
    SELECT id INTO kas_account_id FROM public.chart_of_accounts WHERE kode_akun = '1001';
    SELECT id INTO sales_account_id FROM public.chart_of_accounts WHERE kode_akun = '4001';
    SELECT id INTO inventory_account_id FROM public.chart_of_accounts WHERE kode_akun = '1301';
    
    -- Get kasir name
    SELECT nama INTO kasir_name_var FROM public.kasir WHERE id = NEW.kasir_id;
    
    -- Credit kas (cash out for return)
    PERFORM create_general_ledger_entry(
      NEW.tanggal_retur,
      kas_account_id,
      0,
      NEW.total_retur,
      'Retur Penjualan - ' || NEW.nomor_retur,
      'sales_return',
      NEW.id,
      NULL,
      NEW.pelanggan_name,
      'cash',
      kasir_name_var,
      'retur_penjualan',
      NEW.nomor_retur
    );
    
    -- Debit sales (reduce sales revenue)
    PERFORM create_general_ledger_entry(
      NEW.tanggal_retur,
      sales_account_id,
      NEW.total_retur,
      0,
      'Retur Penjualan - ' || NEW.nomor_retur,
      'sales_return',
      NEW.id,
      NULL,
      NEW.pelanggan_name,
      'cash',
      kasir_name_var,
      'retur_penjualan',
      NEW.nomor_retur
    );
    
    -- Credit inventory (increase inventory value)
    PERFORM create_general_ledger_entry(
      NEW.tanggal_retur,
      inventory_account_id,
      0,
      NEW.total_retur,
      'Retur Penjualan - ' || NEW.nomor_retur,
      'sales_return',
      NEW.id,
      NULL,
      NEW.pelanggan_name,
      'cash',
      kasir_name_var,
      'retur_penjualan',
      NEW.nomor_retur
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_auto_ledger_purchase_return
  AFTER INSERT OR UPDATE ON public.retur_pembelian
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_ledger_from_purchase_return();

CREATE TRIGGER trigger_auto_ledger_sales_return
  AFTER INSERT OR UPDATE ON public.retur_penjualan
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_ledger_from_sales_return();

-- Enable RLS on new tables
ALTER TABLE public.retur_pembelian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detail_retur_pembelian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retur_penjualan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detail_retur_penjualan ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all on retur_pembelian" ON public.retur_pembelian FOR ALL USING (true);
CREATE POLICY "Allow all on detail_retur_pembelian" ON public.detail_retur_pembelian FOR ALL USING (true);
CREATE POLICY "Allow all on retur_penjualan" ON public.retur_penjualan FOR ALL USING (true);
CREATE POLICY "Allow all on detail_retur_penjualan" ON public.detail_retur_penjualan FOR ALL USING (true);
