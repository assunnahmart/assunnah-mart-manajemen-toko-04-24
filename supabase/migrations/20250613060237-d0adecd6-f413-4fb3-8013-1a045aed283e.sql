
-- Drop existing create_general_ledger_entry functions to avoid conflicts
DROP FUNCTION IF EXISTS public.create_general_ledger_entry(date, uuid, numeric, numeric, text, character varying, uuid);
DROP FUNCTION IF EXISTS public.create_general_ledger_entry(date, uuid, numeric, numeric, text, unknown, uuid);

-- Create a single comprehensive create_general_ledger_entry function
CREATE OR REPLACE FUNCTION public.create_general_ledger_entry(
  p_transaction_date date,
  p_account_id uuid,
  p_debit_amount numeric DEFAULT 0,
  p_credit_amount numeric DEFAULT 0,
  p_description text DEFAULT ''::text,
  p_reference_type character varying DEFAULT NULL::character varying,
  p_reference_id uuid DEFAULT NULL::uuid,
  p_supplier_name character varying DEFAULT NULL::character varying,
  p_pelanggan_name character varying DEFAULT NULL::character varying,
  p_payment_method character varying DEFAULT NULL::character varying,
  p_kasir_name character varying DEFAULT NULL::character varying,
  p_transaction_type character varying DEFAULT NULL::character varying,
  p_transaction_number character varying DEFAULT NULL::character varying
) RETURNS void
LANGUAGE plpgsql
AS $function$
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
  
  -- Insert general ledger entry with all columns
  INSERT INTO public.general_ledger (
    transaction_date, account_id, debit_amount, credit_amount, 
    description, reference_type, reference_id, financial_period_id,
    supplier_name, pelanggan_name, payment_method, kasir_name,
    transaction_type, transaction_number
  ) VALUES (
    p_transaction_date, p_account_id, p_debit_amount, p_credit_amount,
    p_description, p_reference_type, p_reference_id, current_period_id,
    p_supplier_name, p_pelanggan_name, p_payment_method, p_kasir_name,
    p_transaction_type, p_transaction_number
  );
END;
$function$;
