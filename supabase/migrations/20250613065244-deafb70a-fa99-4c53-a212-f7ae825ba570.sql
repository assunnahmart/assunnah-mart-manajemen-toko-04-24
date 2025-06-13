
-- Create customer receivables ledger table
CREATE TABLE public.customer_receivables_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pelanggan_id UUID REFERENCES pelanggan(id),
  pelanggan_name VARCHAR NOT NULL,
  transaction_date DATE NOT NULL,
  reference_type VARCHAR NOT NULL, -- 'pos_transaction', 'payment', 'adjustment'
  reference_id UUID,
  reference_number VARCHAR,
  description TEXT,
  debit_amount NUMERIC DEFAULT 0,
  credit_amount NUMERIC DEFAULT 0,
  running_balance NUMERIC DEFAULT 0,
  transaction_type VARCHAR, -- 'penjualan_kredit', 'pembayaran', 'penyesuaian'
  kasir_name VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create supplier payables ledger table  
CREATE TABLE public.supplier_payables_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES supplier(id),
  supplier_name VARCHAR NOT NULL,
  transaction_date DATE NOT NULL,
  reference_type VARCHAR NOT NULL, -- 'purchase_transaction', 'payment', 'adjustment'
  reference_id UUID,
  reference_number VARCHAR,
  description TEXT,
  debit_amount NUMERIC DEFAULT 0,
  credit_amount NUMERIC DEFAULT 0,
  running_balance NUMERIC DEFAULT 0,
  transaction_type VARCHAR, -- 'pembelian_kredit', 'pembayaran', 'penyesuaian'
  kasir_name VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_customer_receivables_pelanggan_id ON customer_receivables_ledger(pelanggan_id);
CREATE INDEX idx_customer_receivables_date ON customer_receivables_ledger(transaction_date);
CREATE INDEX idx_supplier_payables_supplier_id ON supplier_payables_ledger(supplier_id);
CREATE INDEX idx_supplier_payables_date ON supplier_payables_ledger(transaction_date);

-- Create function to update customer receivables ledger
CREATE OR REPLACE FUNCTION update_customer_receivables_ledger()
RETURNS TRIGGER AS $$
DECLARE
  customer_name VARCHAR;
  current_balance NUMERIC;
  new_balance NUMERIC;
BEGIN
  -- Get customer name based on the transaction type
  IF NEW.payment_method = 'credit' AND NEW.status = 'completed' THEN
    -- From POS transaction
    customer_name := COALESCE(NEW.notes, 'Pelanggan Kredit');
    
    -- Get current balance
    SELECT COALESCE(running_balance, 0) INTO current_balance
    FROM customer_receivables_ledger 
    WHERE pelanggan_name = customer_name
    ORDER BY created_at DESC, id DESC
    LIMIT 1;
    
    current_balance := COALESCE(current_balance, 0);
    new_balance := current_balance + NEW.total_amount;
    
    -- Insert receivables entry (debit - increase receivables)
    INSERT INTO customer_receivables_ledger (
      pelanggan_name, transaction_date, reference_type, reference_id,
      reference_number, description, debit_amount, running_balance,
      transaction_type, kasir_name
    ) VALUES (
      customer_name, NEW.created_at::DATE, 'pos_transaction', NEW.id,
      NEW.transaction_number, 'Penjualan Kredit - ' || NEW.transaction_number,
      NEW.total_amount, new_balance, 'penjualan_kredit', NEW.kasir_name
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update supplier payables ledger
CREATE OR REPLACE FUNCTION update_supplier_payables_ledger()
RETURNS TRIGGER AS $$
DECLARE
  supplier_name VARCHAR;
  current_balance NUMERIC;
  new_balance NUMERIC;
BEGIN
  IF NEW.jenis_pembayaran = 'kredit' AND NEW.status = 'completed' THEN
    -- Get supplier name
    SELECT nama INTO supplier_name FROM supplier WHERE id = NEW.supplier_id;
    
    -- Get current balance
    SELECT COALESCE(running_balance, 0) INTO current_balance
    FROM supplier_payables_ledger 
    WHERE supplier_id = NEW.supplier_id
    ORDER BY created_at DESC, id DESC
    LIMIT 1;
    
    current_balance := COALESCE(current_balance, 0);
    new_balance := current_balance + NEW.total;
    
    -- Insert payables entry (credit - increase payables)
    INSERT INTO supplier_payables_ledger (
      supplier_id, supplier_name, transaction_date, reference_type, reference_id,
      reference_number, description, credit_amount, running_balance,
      transaction_type, kasir_name
    ) VALUES (
      NEW.supplier_id, supplier_name, NEW.tanggal_pembelian::DATE, 'purchase_transaction', NEW.id,
      NEW.nomor_transaksi, 'Pembelian Kredit - ' || NEW.nomor_transaksi,
      NEW.total, new_balance, 'pembelian_kredit', 
      (SELECT nama FROM kasir WHERE id = NEW.kasir_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_customer_receivables
  AFTER INSERT OR UPDATE ON pos_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_receivables_ledger();

CREATE TRIGGER trigger_update_supplier_payables
  AFTER INSERT OR UPDATE ON transaksi_pembelian
  FOR EACH ROW
  EXECUTE FUNCTION update_supplier_payables_ledger();

-- Create function to handle customer payments
CREATE OR REPLACE FUNCTION record_customer_payment(
  p_pelanggan_name VARCHAR,
  p_amount NUMERIC,
  p_payment_date DATE,
  p_reference_number VARCHAR,
  p_kasir_name VARCHAR,
  p_keterangan TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  current_balance NUMERIC;
  new_balance NUMERIC;
BEGIN
  -- Get current balance
  SELECT COALESCE(running_balance, 0) INTO current_balance
  FROM customer_receivables_ledger 
  WHERE pelanggan_name = p_pelanggan_name
  ORDER BY created_at DESC, id DESC
  LIMIT 1;
  
  current_balance := COALESCE(current_balance, 0);
  new_balance := current_balance - p_amount;
  
  -- Insert payment entry (credit - decrease receivables)
  INSERT INTO customer_receivables_ledger (
    pelanggan_name, transaction_date, reference_type,
    reference_number, description, credit_amount, running_balance,
    transaction_type, kasir_name
  ) VALUES (
    p_pelanggan_name, p_payment_date, 'payment',
    p_reference_number, 'Pembayaran Piutang - ' || COALESCE(p_keterangan, ''),
    p_amount, new_balance, 'pembayaran', p_kasir_name
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to handle supplier payments
CREATE OR REPLACE FUNCTION record_supplier_payment(
  p_supplier_id UUID,
  p_amount NUMERIC,
  p_payment_date DATE,
  p_reference_number VARCHAR,
  p_kasir_name VARCHAR,
  p_keterangan TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  supplier_name VARCHAR;
  current_balance NUMERIC;
  new_balance NUMERIC;
BEGIN
  -- Get supplier name
  SELECT nama INTO supplier_name FROM supplier WHERE id = p_supplier_id;
  
  -- Get current balance
  SELECT COALESCE(running_balance, 0) INTO current_balance
  FROM supplier_payables_ledger 
  WHERE supplier_id = p_supplier_id
  ORDER BY created_at DESC, id DESC
  LIMIT 1;
  
  current_balance := COALESCE(current_balance, 0);
  new_balance := current_balance - p_amount;
  
  -- Insert payment entry (debit - decrease payables)
  INSERT INTO supplier_payables_ledger (
    supplier_id, supplier_name, transaction_date, reference_type,
    reference_number, description, debit_amount, running_balance,
    transaction_type, kasir_name
  ) VALUES (
    p_supplier_id, supplier_name, p_payment_date, 'payment',
    p_reference_number, 'Pembayaran Hutang - ' || COALESCE(p_keterangan, ''),
    p_amount, new_balance, 'pembayaran', p_kasir_name
  );
END;
$$ LANGUAGE plpgsql;
