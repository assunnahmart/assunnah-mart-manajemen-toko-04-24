
-- Fix account_code reference in record_customer_payment_integrated function
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
  kas_transaction_number TEXT;
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

  -- Generate kas transaction number
  SELECT generate_kas_transaction_number() INTO kas_transaction_number;
  
  -- Check if number was generated successfully
  IF kas_transaction_number IS NULL OR LENGTH(TRIM(kas_transaction_number)) = 0 THEN
    RAISE EXCEPTION 'Gagal menghasilkan nomor transaksi kas umum';
  END IF;

  -- Record in Kas Umum (cash in)
  INSERT INTO kas_umum_transactions (
    transaction_number,
    tanggal_transaksi, jenis_transaksi, jumlah,
    keterangan, referensi, kasir_name, created_at
  ) VALUES (
    kas_transaction_number,
    p_payment_date, 'masuk', p_amount,
    'Pembayaran piutang dari ' || p_pelanggan_name || ' - ' || COALESCE(p_keterangan, ''),
    p_reference_number, p_kasir_name, NOW()
  ) RETURNING id INTO kas_transaction_id;

  -- Create general ledger entries using kode_akun instead of account_code
  -- Debit: Cash (Asset account)
  PERFORM create_general_ledger_entry(
    p_payment_date,
    (SELECT id FROM chart_of_accounts WHERE kode_akun = '1110' LIMIT 1),
    p_amount, 0,
    'Pembayaran piutang dari ' || p_pelanggan_name,
    'customer_payment', kas_transaction_id,
    NULL, p_pelanggan_name, 'cash', p_kasir_name, 'pembayaran', p_reference_number
  );

  -- Credit: Accounts Receivable (Asset account)
  PERFORM create_general_ledger_entry(
    p_payment_date,
    (SELECT id FROM chart_of_accounts WHERE kode_akun = '1120' LIMIT 1),
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
    'kas_transaction_id', kas_transaction_id,
    'transaction_number', kas_transaction_number
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
