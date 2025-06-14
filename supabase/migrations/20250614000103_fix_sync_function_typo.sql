
-- Fix the typo in function name and ensure proper sync function exists
DROP FUNCTION IF EXISTS public.sync_pos_credit_to_receivabes();

-- Recreate the correct function name
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

-- Also ensure the recalculate function works properly
CREATE OR REPLACE FUNCTION recalculate_customer_balance(p_customer_name VARCHAR)
RETURNS VOID AS $$
DECLARE
  transaction_record RECORD;
  running_total NUMERIC := 0;
BEGIN
  -- Get all transactions for the customer ordered by date and created_at
  FOR transaction_record IN 
    SELECT * FROM customer_receivables_ledger
    WHERE pelanggan_name = p_customer_name
    ORDER BY transaction_date ASC, created_at ASC, id ASC
  LOOP
    -- Calculate running balance
    running_total := running_total + COALESCE(transaction_record.debit_amount, 0) - COALESCE(transaction_record.credit_amount, 0);
    
    -- Update the record with correct running balance
    UPDATE customer_receivables_ledger 
    SET running_balance = running_total
    WHERE id = transaction_record.id;
  END LOOP;
  
  -- If no transactions exist but customer has debt from POS, sync it
  IF NOT EXISTS (SELECT 1 FROM customer_receivables_ledger WHERE pelanggan_name = p_customer_name) THEN
    PERFORM sync_pos_credit_to_receivables();
  END IF;
END;
$$ LANGUAGE plpgsql;
