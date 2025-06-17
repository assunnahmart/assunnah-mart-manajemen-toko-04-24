
-- Fix ambiguous pelanggan_name reference in customer receivables functions

-- Drop and recreate the function with proper table aliases
DROP FUNCTION IF EXISTS public.get_customer_receivables_summary();

CREATE OR REPLACE FUNCTION public.get_customer_receivables_summary()
RETURNS TABLE (
  pelanggan_name VARCHAR,
  total_receivables NUMERIC,
  total_transactions INTEGER,
  last_transaction_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    crl_outer.pelanggan_name,
    COALESCE(crl_outer.running_balance, 0) as total_receivables,
    COUNT(crl_outer.id)::INTEGER as total_transactions,
    MAX(crl_outer.transaction_date) as last_transaction_date
  FROM customer_receivables_ledger crl_outer
  WHERE crl_outer.id IN (
    SELECT DISTINCT ON (crl_inner.pelanggan_name) crl_inner.id
    FROM customer_receivables_ledger crl_inner
    ORDER BY crl_inner.pelanggan_name, crl_inner.created_at DESC, crl_inner.id DESC
  )
  AND COALESCE(crl_outer.running_balance, 0) > 0
  GROUP BY crl_outer.pelanggan_name, crl_outer.running_balance
  ORDER BY crl_outer.running_balance DESC;
END;
$$ LANGUAGE plpgsql;

-- Also fix the sync function that might have similar issues
DROP FUNCTION IF EXISTS public.sync_pos_credit_to_receivables();

CREATE OR REPLACE FUNCTION public.sync_pos_credit_to_receivables()
RETURNS VOID AS $$
DECLARE
  pos_record RECORD;
  pelanggan_name_var VARCHAR;
  current_balance NUMERIC;
  new_balance NUMERIC;
BEGIN
  -- Process unsynced POS credit transactions
  FOR pos_record IN 
    SELECT pt.* FROM pos_transactions pt
    LEFT JOIN customer_receivables_ledger crl ON crl.reference_id = pt.id::UUID
    WHERE pt.payment_method = 'credit' 
    AND pt.status = 'completed'
    AND crl.id IS NULL
  LOOP
    -- Extract customer name from notes
    pelanggan_name_var := COALESCE(
      NULLIF(TRIM(SPLIT_PART(pos_record.notes, ':', 2)), ''),
      'Pelanggan Kredit'
    );
    
    -- Get current balance with explicit table alias
    SELECT COALESCE(crl_balance.running_balance, 0) INTO current_balance
    FROM customer_receivables_ledger crl_balance
    WHERE crl_balance.pelanggan_name = pelanggan_name_var
    ORDER BY crl_balance.created_at DESC, crl_balance.id DESC
    LIMIT 1;
    
    current_balance := COALESCE(current_balance, 0);
    new_balance := current_balance + pos_record.total_amount;
    
    -- Insert receivables entry
    INSERT INTO customer_receivables_ledger (
      pelanggan_name, transaction_date, reference_type, reference_id,
      reference_number, description, debit_amount, running_balance,
      transaction_type, kasir_name
    ) VALUES (
      pelanggan_name_var, pos_record.created_at::DATE, 'pos_transaction', pos_record.id::UUID,
      pos_record.transaction_number, 
      'Penjualan Kredit POS - ' || pos_record.transaction_number,
      pos_record.total_amount, new_balance, 'penjualan_kredit', pos_record.kasir_name
    );
    
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fix the recalculate function as well
DROP FUNCTION IF EXISTS public.recalculate_customer_balance(VARCHAR);

CREATE OR REPLACE FUNCTION public.recalculate_customer_balance(p_customer_name VARCHAR)
RETURNS VOID AS $$
DECLARE
  transaction_record RECORD;
  running_total NUMERIC := 0;
BEGIN
  -- Get all transactions for the customer ordered by date and created_at
  FOR transaction_record IN 
    SELECT crl_calc.* FROM customer_receivables_ledger crl_calc
    WHERE crl_calc.pelanggan_name = p_customer_name
    ORDER BY crl_calc.transaction_date ASC, crl_calc.created_at ASC, crl_calc.id ASC
  LOOP
    -- Calculate running balance
    running_total := running_total + COALESCE(transaction_record.debit_amount, 0) - COALESCE(transaction_record.credit_amount, 0);
    
    -- Update the record with correct running balance
    UPDATE customer_receivables_ledger 
    SET running_balance = running_total
    WHERE id = transaction_record.id;
  END LOOP;
  
  -- If no transactions exist but customer has debt from POS, sync it
  IF NOT EXISTS (SELECT 1 FROM customer_receivables_ledger crl_exists WHERE crl_exists.pelanggan_name = p_customer_name) THEN
    PERFORM sync_pos_credit_to_receivables();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Fix the integrated payment function that might also have issues
DROP FUNCTION IF EXISTS public.record_customer_payment_integrated(VARCHAR, NUMERIC, DATE, VARCHAR, VARCHAR, TEXT);

CREATE OR REPLACE FUNCTION public.record_customer_payment_integrated(
  p_pelanggan_name VARCHAR,
  p_amount NUMERIC,
  p_payment_date DATE,
  p_reference_number VARCHAR,
  p_kasir_name VARCHAR,
  p_keterangan TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  current_balance NUMERIC;
  new_balance NUMERIC;
  kas_transaction_id UUID;
  payment_result JSON;
BEGIN
  -- Get current balance with explicit table alias
  SELECT COALESCE(crl_balance.running_balance, 0) INTO current_balance
  FROM customer_receivables_ledger crl_balance
  WHERE crl_balance.pelanggan_name = p_pelanggan_name
  ORDER BY crl_balance.created_at DESC, crl_balance.id DESC
  LIMIT 1;
  
  current_balance := COALESCE(current_balance, 0);
  
  -- Validate payment amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Jumlah pembayaran harus lebih dari 0';
  END IF;
  
  IF p_amount > current_balance THEN
    RAISE EXCEPTION 'Jumlah pembayaran (%) melebihi saldo piutang (%)', p_amount, current_balance;
  END IF;
  
  new_balance := current_balance - p_amount;
  
  -- Insert payment entry in receivables ledger
  INSERT INTO customer_receivables_ledger (
    pelanggan_name, transaction_date, reference_type,
    reference_number, description, credit_amount, running_balance,
    transaction_type, kasir_name
  ) VALUES (
    p_pelanggan_name, p_payment_date, 'payment',
    p_reference_number, 
    'Pembayaran Piutang - ' || COALESCE(p_keterangan, p_reference_number),
    p_amount, new_balance, 'pembayaran', p_kasir_name
  );

  -- Record in Kas Umum (cash in)
  INSERT INTO kas_umum_transactions (
    tanggal_transaksi, jenis_transaksi, jumlah,
    keterangan, referensi, kasir_name, created_at,
    transaction_number
  ) VALUES (
    p_payment_date, 'masuk', p_amount,
    'Pembayaran piutang dari ' || p_pelanggan_name || ' - ' || COALESCE(p_keterangan, ''),
    p_reference_number, p_kasir_name, NOW(),
    'KAS-' || TO_CHAR(NOW(), 'YYYY-MMDD-HH24MISS')
  ) RETURNING id INTO kas_transaction_id;

  -- Create general ledger entries
  -- Debit: Cash (Asset account)
  PERFORM create_general_ledger_entry(
    p_payment_date,
    (SELECT coa_cash.id FROM chart_of_accounts coa_cash WHERE coa_cash.kode_akun = '1110' LIMIT 1),
    p_amount, 0,
    'Pembayaran piutang dari ' || p_pelanggan_name,
    'customer_payment', kas_transaction_id,
    NULL, p_pelanggan_name, 'cash', p_kasir_name, 'pembayaran', p_reference_number
  );

  -- Credit: Accounts Receivable (Asset account)
  PERFORM create_general_ledger_entry(
    p_payment_date,
    (SELECT coa_ar.id FROM chart_of_accounts coa_ar WHERE coa_ar.kode_akun = '1120' LIMIT 1),
    0, p_amount,
    'Pembayaran piutang dari ' || p_pelanggan_name,
    'customer_payment', kas_transaction_id,
    NULL, p_pelanggan_name, 'cash', p_kasir_name, 'pembayaran', p_reference_number
  );

  -- Return result
  payment_result := json_build_object(
    'success', true,
    'message', 'Pembayaran berhasil dicatat',
    'previous_balance', current_balance,
    'payment_amount', p_amount,
    'new_balance', new_balance,
    'kas_transaction_id', kas_transaction_id
  );

  RETURN payment_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error
    payment_result := json_build_object(
      'success', false,
      'message', SQLERRM,
      'error_code', SQLSTATE
    );
    RETURN payment_result;
END;
$$ LANGUAGE plpgsql;
