
-- Enhanced customer receivables integration

-- Function to get customer receivables summary with real-time POS data
CREATE OR REPLACE FUNCTION get_customer_receivables_summary()
RETURNS TABLE (
  pelanggan_name VARCHAR,
  total_receivables NUMERIC,
  total_transactions INTEGER,
  last_transaction_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    crl.pelanggan_name,
    COALESCE(crl.running_balance, 0) as total_receivables,
    COUNT(crl.id)::INTEGER as total_transactions,
    MAX(crl.transaction_date) as last_transaction_date
  FROM customer_receivables_ledger crl
  WHERE crl.id IN (
    SELECT DISTINCT ON (crl2.pelanggan_name) crl2.id
    FROM customer_receivables_ledger crl2
    ORDER BY crl2.pelanggan_name, crl2.created_at DESC, crl2.id DESC
  )
  AND COALESCE(crl.running_balance, 0) > 0
  GROUP BY crl.pelanggan_name, crl.running_balance
  ORDER BY crl.running_balance DESC;
END;
$$ LANGUAGE plpgsql;

-- Enhanced customer payment recording with Kas Umum integration
CREATE OR REPLACE FUNCTION record_customer_payment_integrated(
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
  -- Get current balance
  SELECT COALESCE(running_balance, 0) INTO current_balance
  FROM customer_receivables_ledger 
  WHERE pelanggan_name = p_pelanggan_name
  ORDER BY created_at DESC, id DESC
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
    keterangan, referensi, kasir_name, created_at
  ) VALUES (
    p_payment_date, 'masuk', p_amount,
    'Pembayaran piutang dari ' || p_pelanggan_name || ' - ' || COALESCE(p_keterangan, ''),
    p_reference_number, p_kasir_name, NOW()
  ) RETURNING id INTO kas_transaction_id;
  
  -- Create general ledger entries
  -- Debit: Cash (Asset account)
  PERFORM create_general_ledger_entry(
    p_payment_date,
    (SELECT id FROM chart_of_accounts WHERE account_code = '1110' LIMIT 1), -- Cash account
    p_amount, 0,
    'Pembayaran piutang dari ' || p_pelanggan_name,
    'customer_payment', kas_transaction_id,
    NULL, p_pelanggan_name, 'cash', p_kasir_name, 'pembayaran', p_reference_number
  );
  
  -- Credit: Accounts Receivable (Asset account)
  PERFORM create_general_ledger_entry(
    p_payment_date,
    (SELECT id FROM chart_of_accounts WHERE account_code = '1120' LIMIT 1), -- Accounts Receivable
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

-- Function to sync POS credit transactions with receivables ledger
CREATE OR REPLACE FUNCTION sync_pos_credit_to_receivables()
RETURNS VOID AS $$
DECLARE
  pos_record RECORD;
  pelanggan_name VARCHAR;
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
    pelanggan_name := COALESCE(
      NULLIF(TRIM(SPLIT_PART(pos_record.notes, ':', 2)), ''),
      'Pelanggan Kredit'
    );
    
    -- Get current balance
    SELECT COALESCE(running_balance, 0) INTO current_balance
    FROM customer_receivables_ledger 
    WHERE pelanggan_name = pelanggan_name
    ORDER BY created_at DESC, id DESC
    LIMIT 1;
    
    current_balance := COALESCE(current_balance, 0);
    new_balance := current_balance + pos_record.total_amount;
    
    -- Insert receivables entry
    INSERT INTO customer_receivables_ledger (
      pelanggan_name, transaction_date, reference_type, reference_id,
      reference_number, description, debit_amount, running_balance,
      transaction_type, kasir_name
    ) VALUES (
      pelanggan_name, pos_record.created_at::DATE, 'pos_transaction', pos_record.id::UUID,
      pos_record.transaction_number, 
      'Penjualan Kredit POS - ' || pos_record.transaction_number,
      pos_record.total_amount, new_balance, 'penjualan_kredit', pos_record.kasir_name
    );
    
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-sync POS transactions
CREATE OR REPLACE FUNCTION trigger_sync_pos_receivables()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_method = 'credit' AND NEW.status = 'completed' THEN
    PERFORM sync_pos_credit_to_receivables();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_pos_receivables_sync ON pos_transactions;

-- Create new trigger
CREATE TRIGGER trigger_pos_receivables_sync
  AFTER INSERT OR UPDATE ON pos_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_pos_receivables();
