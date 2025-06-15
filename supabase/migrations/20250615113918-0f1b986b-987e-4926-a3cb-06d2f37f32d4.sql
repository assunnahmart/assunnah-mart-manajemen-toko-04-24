
-- Fix both receivables and debt summary functions
-- 1. Fix receivables function to clean customer names (remove transaction method)
CREATE OR REPLACE FUNCTION calculate_monthly_receivables_summary(p_year integer DEFAULT EXTRACT(year FROM CURRENT_DATE))
RETURNS TABLE(
  pelanggan_id uuid, 
  pelanggan_name character varying, 
  bulan integer, 
  nama_bulan character varying, 
  saldo_awal numeric, 
  jumlah_piutang_baru numeric, 
  jumlah_bayar numeric, 
  sisa_piutang numeric
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    SELECT 
      -- Clean customer name by removing transaction method prefixes
      CASE 
        WHEN crl.pelanggan_name LIKE 'Pelanggan:%' THEN TRIM(SPLIT_PART(crl.pelanggan_name, ':', 2))
        WHEN crl.pelanggan_name LIKE '%:%' THEN TRIM(SPLIT_PART(crl.pelanggan_name, ':', 2))
        ELSE TRIM(crl.pelanggan_name)
      END as customer_name,
      EXTRACT(month FROM crl.transaction_date)::integer as bulan,
      COALESCE(SUM(CASE WHEN crl.debit_amount > 0 THEN crl.debit_amount ELSE 0 END), 0) as piutang_baru,
      COALESCE(SUM(CASE WHEN crl.credit_amount > 0 THEN crl.credit_amount ELSE 0 END), 0) as bayar
    FROM customer_receivables_ledger crl
    WHERE EXTRACT(year FROM crl.transaction_date) = p_year
    GROUP BY 
      CASE 
        WHEN crl.pelanggan_name LIKE 'Pelanggan:%' THEN TRIM(SPLIT_PART(crl.pelanggan_name, ':', 2))
        WHEN crl.pelanggan_name LIKE '%:%' THEN TRIM(SPLIT_PART(crl.pelanggan_name, ':', 2))
        ELSE TRIM(crl.pelanggan_name)
      END,
      EXTRACT(month FROM crl.transaction_date)
  ),
  customer_ids AS (
    SELECT DISTINCT
      gen_random_uuid() as pelanggan_id,
      customer_name
    FROM monthly_data
  )
  SELECT 
    ci.pelanggan_id,
    ci.customer_name::character varying as pelanggan_name,
    md.bulan,
    CASE md.bulan
      WHEN 1 THEN 'Januari'::character varying
      WHEN 2 THEN 'Februari'::character varying
      WHEN 3 THEN 'Maret'::character varying
      WHEN 4 THEN 'April'::character varying
      WHEN 5 THEN 'Mei'::character varying
      WHEN 6 THEN 'Juni'::character varying
      WHEN 7 THEN 'Juli'::character varying
      WHEN 8 THEN 'Agustus'::character varying
      WHEN 9 THEN 'September'::character varying
      WHEN 10 THEN 'Oktober'::character varying
      WHEN 11 THEN 'November'::character varying
      WHEN 12 THEN 'Desember'::character varying
    END as nama_bulan,
    0::numeric as saldo_awal,
    md.piutang_baru as jumlah_piutang_baru,
    md.bayar as jumlah_bayar,
    (md.piutang_baru - md.bayar)::numeric as sisa_piutang
  FROM monthly_data md
  JOIN customer_ids ci ON ci.customer_name = md.customer_name
  ORDER BY ci.customer_name, md.bulan;
END;
$$;

-- 2. Fix debt summary function to match expected return type
CREATE OR REPLACE FUNCTION calculate_monthly_debt_summary(p_year integer DEFAULT EXTRACT(year FROM CURRENT_DATE))
RETURNS TABLE(
  supplier_id uuid, 
  supplier_name character varying, 
  bulan integer, 
  nama_bulan character varying, 
  saldo_awal numeric, 
  jumlah_hutang_baru numeric, 
  jumlah_bayar numeric, 
  sisa_hutang numeric
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    SELECT 
      spl.supplier_name as supplier_name_clean,
      spl.supplier_id,
      EXTRACT(month FROM spl.transaction_date)::integer as bulan,
      COALESCE(SUM(CASE WHEN spl.credit_amount > 0 THEN spl.credit_amount ELSE 0 END), 0) as hutang_baru,
      COALESCE(SUM(CASE WHEN spl.debit_amount > 0 THEN spl.debit_amount ELSE 0 END), 0) as bayar
    FROM supplier_payables_ledger spl
    WHERE EXTRACT(year FROM spl.transaction_date) = p_year
    GROUP BY spl.supplier_name, spl.supplier_id, EXTRACT(month FROM spl.transaction_date)
  )
  SELECT 
    md.supplier_id,
    md.supplier_name_clean::character varying as supplier_name,
    md.bulan,
    CASE md.bulan
      WHEN 1 THEN 'Januari'::character varying
      WHEN 2 THEN 'Februari'::character varying
      WHEN 3 THEN 'Maret'::character varying
      WHEN 4 THEN 'April'::character varying
      WHEN 5 THEN 'Mei'::character varying
      WHEN 6 THEN 'Juni'::character varying
      WHEN 7 THEN 'Juli'::character varying
      WHEN 8 THEN 'Agustus'::character varying
      WHEN 9 THEN 'September'::character varying
      WHEN 10 THEN 'Oktober'::character varying
      WHEN 11 THEN 'November'::character varying
      WHEN 12 THEN 'Desember'::character varying
    END as nama_bulan,
    0::numeric as saldo_awal,
    md.hutang_baru as jumlah_hutang_baru,
    md.bayar as jumlah_bayar,
    (md.hutang_baru - md.bayar)::numeric as sisa_hutang
  FROM monthly_data md
  ORDER BY md.supplier_name_clean, md.bulan;
END;
$$;
