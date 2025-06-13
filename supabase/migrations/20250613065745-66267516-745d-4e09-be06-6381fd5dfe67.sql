
-- Create function to get customer receivables summary
CREATE OR REPLACE FUNCTION get_customer_receivables_summary()
RETURNS TABLE(
  pelanggan_name VARCHAR,
  total_receivables NUMERIC,
  total_transactions BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    crl.pelanggan_name,
    COALESCE(MAX(crl.running_balance), 0) as total_receivables,
    COUNT(*)::BIGINT as total_transactions
  FROM customer_receivables_ledger crl
  WHERE crl.running_balance > 0
  GROUP BY crl.pelanggan_name
  ORDER BY total_receivables DESC;
END;
$$;

-- Create function to get supplier payables summary
CREATE OR REPLACE FUNCTION get_supplier_payables_summary()
RETURNS TABLE(
  supplier_name VARCHAR,
  total_payables NUMERIC,
  total_transactions BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    spl.supplier_name,
    COALESCE(MAX(spl.running_balance), 0) as total_payables,
    COUNT(*)::BIGINT as total_transactions
  FROM supplier_payables_ledger spl
  WHERE spl.running_balance > 0
  GROUP BY spl.supplier_name
  ORDER BY total_payables DESC;
END;
$$;
