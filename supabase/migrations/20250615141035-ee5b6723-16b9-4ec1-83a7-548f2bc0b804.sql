
-- DROP the old function to allow changing the return type/structure
DROP FUNCTION IF EXISTS public.get_customer_receivables_summary();

-- Fungsi backend untuk mencatat pembayaran piutang terintegrasi
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
  -- Ambil saldo terakhir
  SELECT COALESCE(running_balance, 0) INTO current_balance
  FROM customer_receivables_ledger 
  WHERE pelanggan_name = p_pelanggan_name
  ORDER BY created_at DESC, id DESC
  LIMIT 1;
  
  current_balance := COALESCE(current_balance, 0);

  -- Validasi pembayaran
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Jumlah pembayaran harus lebih dari 0';
  END IF;
  
  IF p_amount > current_balance THEN
    RAISE EXCEPTION 'Jumlah pembayaran (%) melebihi saldo piutang (%)', p_amount, current_balance;
  END IF;
  
  new_balance := current_balance - p_amount;

  -- Insert pembayaran ke ledger, update running_balance
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

  -- Insert ke kas umum (penerimaan)
  INSERT INTO kas_umum_transactions (
    tanggal_transaksi, jenis_transaksi, kategori, jumlah,
    keterangan, referensi, kasir_name, created_at
  ) VALUES (
    p_payment_date, 'masuk', 'Piutang Pelanggan', p_amount,
    'Pembayaran piutang dari ' || p_pelanggan_name || ' - ' || COALESCE(p_keterangan, ''),
    p_reference_number, p_kasir_name, NOW()
  ) RETURNING id INTO kas_transaction_id;

  -- Buat entry ke general ledger (debit kas, kredit piutang)
  -- Debit kas
  PERFORM create_general_ledger_entry(
    p_payment_date,
    (SELECT id FROM chart_of_accounts WHERE account_code = '1110' LIMIT 1), -- Kas
    p_amount, 0,
    'Pembayaran piutang dari ' || p_pelanggan_name,
    'customer_payment', kas_transaction_id,
    NULL, p_pelanggan_name, 'cash', p_kasir_name, 'pembayaran', p_reference_number
  );
  -- Kredit Piutang
  PERFORM create_general_ledger_entry(
    p_payment_date,
    (SELECT id FROM chart_of_accounts WHERE account_code = '1120' LIMIT 1), -- Piutang
    0, p_amount,
    'Pembayaran piutang dari ' || p_pelanggan_name,
    'customer_payment', kas_transaction_id,
    NULL, p_pelanggan_name, 'cash', p_kasir_name, 'pembayaran', p_reference_number
  );

  -- Hasil
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
    payment_result := json_build_object(
      'success', false,
      'message', SQLERRM,
      'error_code', SQLSTATE
    );
    RETURN payment_result;
END;
$$ LANGUAGE plpgsql;

-- Fungsi rekap piutang, sudah mengambil saldo terakhir per pelanggan
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
