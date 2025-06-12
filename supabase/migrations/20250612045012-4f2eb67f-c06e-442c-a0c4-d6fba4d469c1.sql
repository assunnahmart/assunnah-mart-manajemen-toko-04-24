
-- Create table for financial periods
CREATE TABLE public.financial_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for general ledger entries
CREATE TABLE public.general_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_date DATE NOT NULL,
  account_id UUID REFERENCES public.chart_of_accounts(id),
  debit_amount NUMERIC DEFAULT 0,
  credit_amount NUMERIC DEFAULT 0,
  description TEXT,
  reference_type VARCHAR,
  reference_id UUID,
  financial_period_id UUID REFERENCES public.financial_periods(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for trial balance
CREATE TABLE public.trial_balance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_period_id UUID REFERENCES public.financial_periods(id),
  account_id UUID REFERENCES public.chart_of_accounts(id),
  beginning_balance NUMERIC DEFAULT 0,
  debit_total NUMERIC DEFAULT 0,
  credit_total NUMERIC DEFAULT 0,
  ending_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(financial_period_id, account_id)
);

-- Create table for balance sheet
CREATE TABLE public.balance_sheet (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_period_id UUID REFERENCES public.financial_periods(id),
  account_type VARCHAR NOT NULL,
  account_id UUID REFERENCES public.chart_of_accounts(id),
  amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for income statement (profit & loss)
CREATE TABLE public.income_statement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_period_id UUID REFERENCES public.financial_periods(id),
  account_type VARCHAR NOT NULL,
  account_id UUID REFERENCES public.chart_of_accounts(id),
  amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for financial notes
CREATE TABLE public.financial_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_period_id UUID REFERENCES public.financial_periods(id),
  note_type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT,
  amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Function to create general ledger entry
CREATE OR REPLACE FUNCTION create_general_ledger_entry(
  p_transaction_date DATE,
  p_account_id UUID,
  p_debit_amount NUMERIC DEFAULT 0,
  p_credit_amount NUMERIC DEFAULT 0,
  p_description TEXT DEFAULT '',
  p_reference_type VARCHAR DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  current_period_id UUID;
BEGIN
  -- Get or create current financial period
  SELECT id INTO current_period_id 
  FROM public.financial_periods 
  WHERE p_transaction_date >= start_date AND p_transaction_date <= end_date AND status = 'active'
  LIMIT 1;
  
  IF current_period_id IS NULL THEN
    -- Create new period for current month
    INSERT INTO public.financial_periods (name, start_date, end_date)
    VALUES (
      TO_CHAR(p_transaction_date, 'YYYY-MM'),
      DATE_TRUNC('month', p_transaction_date),
      (DATE_TRUNC('month', p_transaction_date) + INTERVAL '1 month - 1 day')::DATE
    ) RETURNING id INTO current_period_id;
  END IF;
  
  -- Insert general ledger entry
  INSERT INTO public.general_ledger (
    transaction_date, account_id, debit_amount, credit_amount, 
    description, reference_type, reference_id, financial_period_id
  ) VALUES (
    p_transaction_date, p_account_id, p_debit_amount, p_credit_amount,
    p_description, p_reference_type, p_reference_id, current_period_id
  );
END;
$$ LANGUAGE plpgsql;

-- Function to generate trial balance
CREATE OR REPLACE FUNCTION generate_trial_balance(p_period_id UUID) RETURNS VOID AS $$
BEGIN
  -- Clear existing trial balance for the period
  DELETE FROM public.trial_balance WHERE financial_period_id = p_period_id;
  
  -- Generate trial balance
  INSERT INTO public.trial_balance (financial_period_id, account_id, debit_total, credit_total, ending_balance)
  SELECT 
    p_period_id,
    gl.account_id,
    COALESCE(SUM(gl.debit_amount), 0) as debit_total,
    COALESCE(SUM(gl.credit_amount), 0) as credit_total,
    CASE 
      WHEN coa.saldo_normal = 'debit' THEN COALESCE(SUM(gl.debit_amount), 0) - COALESCE(SUM(gl.credit_amount), 0)
      ELSE COALESCE(SUM(gl.credit_amount), 0) - COALESCE(SUM(gl.debit_amount), 0)
    END as ending_balance
  FROM public.general_ledger gl
  JOIN public.chart_of_accounts coa ON coa.id = gl.account_id
  WHERE gl.financial_period_id = p_period_id
  GROUP BY gl.account_id, coa.saldo_normal;
END;
$$ LANGUAGE plpgsql;

-- Function to generate income statement
CREATE OR REPLACE FUNCTION generate_income_statement(p_period_id UUID) RETURNS VOID AS $$
BEGIN
  -- Clear existing income statement for the period
  DELETE FROM public.income_statement WHERE financial_period_id = p_period_id;
  
  -- Generate income statement
  INSERT INTO public.income_statement (financial_period_id, account_type, account_id, amount)
  SELECT 
    p_period_id,
    coa.jenis_akun,
    tb.account_id,
    tb.ending_balance
  FROM public.trial_balance tb
  JOIN public.chart_of_accounts coa ON coa.id = tb.account_id
  WHERE tb.financial_period_id = p_period_id
    AND coa.jenis_akun IN ('pendapatan', 'beban', 'hpp')
  ORDER BY coa.kode_akun;
END;
$$ LANGUAGE plpgsql;

-- Function to generate balance sheet
CREATE OR REPLACE FUNCTION generate_balance_sheet(p_period_id UUID) RETURNS VOID AS $$
BEGIN
  -- Clear existing balance sheet for the period
  DELETE FROM public.balance_sheet WHERE financial_period_id = p_period_id;
  
  -- Generate balance sheet
  INSERT INTO public.balance_sheet (financial_period_id, account_type, account_id, amount)
  SELECT 
    p_period_id,
    coa.jenis_akun,
    tb.account_id,
    tb.ending_balance
  FROM public.trial_balance tb
  JOIN public.chart_of_accounts coa ON coa.id = tb.account_id
  WHERE tb.financial_period_id = p_period_id
    AND coa.jenis_akun IN ('aset', 'kewajiban', 'modal')
  ORDER BY coa.kode_akun;
END;
$$ LANGUAGE plpgsql;

-- Function to auto generate financial reports
CREATE OR REPLACE FUNCTION auto_generate_financial_reports(p_period_id UUID) RETURNS VOID AS $$
BEGIN
  -- Generate trial balance first
  PERFORM generate_trial_balance(p_period_id);
  
  -- Generate income statement
  PERFORM generate_income_statement(p_period_id);
  
  -- Generate balance sheet
  PERFORM generate_balance_sheet(p_period_id);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create ledger entries from kas transactions
CREATE OR REPLACE FUNCTION auto_create_ledger_from_kas() RETURNS TRIGGER AS $$
BEGIN
  -- Create ledger entry for kas transaction
  PERFORM create_general_ledger_entry(
    NEW.tanggal_transaksi,
    NEW.akun_id,
    CASE WHEN NEW.jenis_transaksi = 'masuk' THEN NEW.jumlah ELSE 0 END,
    CASE WHEN NEW.jenis_transaksi = 'keluar' THEN NEW.jumlah ELSE 0 END,
    NEW.keterangan,
    'kas_transaction',
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for kas transactions
DROP TRIGGER IF EXISTS trigger_auto_ledger_kas ON public.kas_umum_transactions;
CREATE TRIGGER trigger_auto_ledger_kas
  AFTER INSERT ON public.kas_umum_transactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_ledger_from_kas();

-- Trigger to auto-create ledger entries from purchase transactions
CREATE OR REPLACE FUNCTION auto_create_ledger_from_purchase() RETURNS TRIGGER AS $$
DECLARE
  kas_account_id UUID;
  inventory_account_id UUID;
BEGIN
  IF NEW.status = 'completed' THEN
    -- Get account IDs
    SELECT id INTO kas_account_id FROM public.chart_of_accounts WHERE kode_akun = '1001';
    SELECT id INTO inventory_account_id FROM public.chart_of_accounts WHERE kode_akun = '1301';
    
    -- Credit kas (cash out)
    PERFORM create_general_ledger_entry(
      NEW.tanggal_pembelian::DATE,
      kas_account_id,
      0,
      NEW.total,
      'Pembelian - ' || NEW.nomor_transaksi,
      'purchase_transaction',
      NEW.id
    );
    
    -- Debit inventory
    PERFORM create_general_ledger_entry(
      NEW.tanggal_pembelian::DATE,
      inventory_account_id,
      NEW.total,
      0,
      'Pembelian - ' || NEW.nomor_transaksi,
      'purchase_transaction',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for purchase transactions
DROP TRIGGER IF EXISTS trigger_auto_ledger_purchase ON public.transaksi_pembelian;
CREATE TRIGGER trigger_auto_ledger_purchase
  AFTER INSERT OR UPDATE ON public.transaksi_pembelian
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_ledger_from_purchase();

-- Trigger to auto-create ledger entries from POS transactions
CREATE OR REPLACE FUNCTION auto_create_ledger_from_pos() RETURNS TRIGGER AS $$
DECLARE
  kas_account_id UUID;
  sales_account_id UUID;
  inventory_account_id UUID;
  cogs_account_id UUID;
  total_cogs NUMERIC := 0;
BEGIN
  IF NEW.status = 'completed' THEN
    -- Get account IDs
    SELECT id INTO kas_account_id FROM public.chart_of_accounts WHERE kode_akun = '1001';
    SELECT id INTO sales_account_id FROM public.chart_of_accounts WHERE kode_akun = '4001';
    SELECT id INTO inventory_account_id FROM public.chart_of_accounts WHERE kode_akun = '1301';
    SELECT id INTO cogs_account_id FROM public.chart_of_accounts WHERE kode_akun = '5001';
    
    -- Debit kas (cash in)
    PERFORM create_general_ledger_entry(
      NEW.created_at::DATE,
      kas_account_id,
      NEW.total_amount,
      0,
      'Penjualan POS - ' || NEW.transaction_number,
      'pos_transaction',
      NEW.id
    );
    
    -- Credit sales
    PERFORM create_general_ledger_entry(
      NEW.created_at::DATE,
      sales_account_id,
      0,
      NEW.total_amount,
      'Penjualan POS - ' || NEW.transaction_number,
      'pos_transaction',
      NEW.id
    );
    
    -- Calculate COGS and create entries
    SELECT COALESCE(SUM(pti.quantity * COALESCE(bk.harga_beli, 0)), 0)
    INTO total_cogs
    FROM public.pos_transaction_items pti
    LEFT JOIN public.barang_konsinyasi bk ON bk.id::TEXT = pti.product_id
    WHERE pti.transaction_id = NEW.id;
    
    IF total_cogs > 0 THEN
      -- Debit COGS
      PERFORM create_general_ledger_entry(
        NEW.created_at::DATE,
        cogs_account_id,
        total_cogs,
        0,
        'HPP - ' || NEW.transaction_number,
        'pos_transaction',
        NEW.id
      );
      
      -- Credit inventory
      PERFORM create_general_ledger_entry(
        NEW.created_at::DATE,
        inventory_account_id,
        0,
        total_cogs,
        'HPP - ' || NEW.transaction_number,
        'pos_transaction',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for POS transactions
DROP TRIGGER IF EXISTS trigger_auto_ledger_pos ON public.pos_transactions;
CREATE TRIGGER trigger_auto_ledger_pos
  AFTER INSERT OR UPDATE ON public.pos_transactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_ledger_from_pos();

-- Enable RLS on financial tables
ALTER TABLE public.financial_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.general_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_sheet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_statement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now since it's admin functionality)
CREATE POLICY "Allow all on financial_periods" ON public.financial_periods FOR ALL USING (true);
CREATE POLICY "Allow all on general_ledger" ON public.general_ledger FOR ALL USING (true);
CREATE POLICY "Allow all on trial_balance" ON public.trial_balance FOR ALL USING (true);
CREATE POLICY "Allow all on balance_sheet" ON public.balance_sheet FOR ALL USING (true);
CREATE POLICY "Allow all on income_statement" ON public.income_statement FOR ALL USING (true);
CREATE POLICY "Allow all on financial_notes" ON public.financial_notes FOR ALL USING (true);
