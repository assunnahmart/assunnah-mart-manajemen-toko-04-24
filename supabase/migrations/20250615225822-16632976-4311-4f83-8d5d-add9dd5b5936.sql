
-- Pastikan function generate_kas_transaction_number berfungsi dengan baik
CREATE OR REPLACE FUNCTION public.generate_kas_transaction_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    formatted_number TEXT;
    date_part TEXT;
BEGIN
    -- Format date part as YYYY-MMDD
    date_part := TO_CHAR(CURRENT_DATE, 'YYYY-MMDD');

    -- Get the next sequence number for today
    SELECT COALESCE(MAX(CAST(RIGHT(transaction_number, 3) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.kas_umum_transactions
    WHERE transaction_number LIKE 'KAS-' || date_part || '-%'
    AND DATE(created_at) = CURRENT_DATE;

    -- Format as KAS-YYYY-MMDD-XXX
    formatted_number := 'KAS-' || date_part || '-' || LPAD(next_number::TEXT, 3, '0');

    RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT generate_kas_transaction_number() as sample_number;
