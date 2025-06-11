
-- Create function to generate POS transaction numbers
CREATE OR REPLACE FUNCTION public.generate_pos_transaction_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    current_date_str TEXT;
    sequence_num INTEGER;
    transaction_number TEXT;
BEGIN
    -- Get current date in YYYYMMDD format
    current_date_str := TO_CHAR(NOW(), 'YYYYMMDD');
    
    -- Get the next sequence number for today
    SELECT COALESCE(MAX(CAST(SUBSTRING(id::text FROM 10 FOR 4) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM pos_transactions
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- If no sequence found, start with 1
    IF sequence_num IS NULL THEN
        sequence_num := 1;
    END IF;
    
    -- Format: TRX-YYYYMMDD-NNNN
    transaction_number := 'TRX-' || current_date_str || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN transaction_number;
END;
$$;

-- Add transaction_number column to pos_transactions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pos_transactions' 
                   AND column_name = 'transaction_number') THEN
        ALTER TABLE pos_transactions ADD COLUMN transaction_number TEXT;
    END IF;
END $$;

-- Create function to update stock when products are sold
CREATE OR REPLACE FUNCTION public.update_stok_barang(barang_id TEXT, jumlah_keluar INTEGER)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE barang_konsinyasi 
    SET stok_saat_ini = GREATEST(0, stok_saat_ini - jumlah_keluar),
        updated_at = NOW()
    WHERE id::text = barang_id OR barcode = barang_id;
END;
$$;

-- Create functions to update customer debt for unit customers
CREATE OR REPLACE FUNCTION public.increment_unit_debt(unit_id UUID, amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE pelanggan 
    SET total_tagihan = total_tagihan + amount,
        updated_at = NOW()
    WHERE id = unit_id;
END;
$$;

-- Create functions to update customer debt for individual customers  
CREATE OR REPLACE FUNCTION public.increment_personal_debt(person_id UUID, amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE pelanggan 
    SET sisa_piutang = sisa_piutang + amount,
        updated_at = NOW()
    WHERE id = person_id;
END;
$$;
