
-- Function to recalculate customer balance from transactions
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

-- Function to manually add customer receivable entry (for fixing data)
CREATE OR REPLACE FUNCTION add_customer_receivable_entry(
  p_pelanggan_name VARCHAR,
  p_transaction_date DATE,
  p_description TEXT,
  p_debit_amount NUMERIC DEFAULT 0,
  p_credit_amount NUMERIC DEFAULT 0,
  p_reference_type VARCHAR DEFAULT 'manual_adjustment',
  p_reference_number VARCHAR DEFAULT NULL,
  p_kasir_name VARCHAR DEFAULT 'System'
)
RETURNS JSON AS $$
DECLARE
  current_balance NUMERIC := 0;
  new_balance NUMERIC;
  result_json JSON;
BEGIN
  -- Get current balance
  SELECT COALESCE(running_balance, 0) INTO current_balance
  FROM customer_receivables_ledger 
  WHERE pelanggan_name = p_pelanggan_name
  ORDER BY created_at DESC, id DESC
  LIMIT 1;
  
  -- Calculate new balance
  new_balance := current_balance + p_debit_amount - p_credit_amount;
  
  -- Insert new entry
  INSERT INTO customer_receivables_ledger (
    pelanggan_name, transaction_date, reference_type, reference_number,
    description, debit_amount, credit_amount, running_balance,
    transaction_type, kasir_name
  ) VALUES (
    p_pelanggan_name, p_transaction_date, p_reference_type, p_reference_number,
    p_description, p_debit_amount, p_credit_amount, new_balance,
    'manual_adjustment', p_kasir_name
  );
  
  result_json := json_build_object(
    'success', true,
    'message', 'Entry added successfully',
    'previous_balance', current_balance,
    'new_balance', new_balance
  );
  
  RETURN result_json;
  
EXCEPTION
  WHEN OTHERS THEN
    result_json := json_build_object(
      'success', false,
      'message', SQLERRM
    );
    RETURN result_json;
END;
$$ LANGUAGE plpgsql;
