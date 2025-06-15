
-- Fix the calculate_monthly_receivables_summary function to resolve ambiguous column reference
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
      crl.pelanggan_name,
      EXTRACT(month FROM crl.transaction_date)::integer as bulan,
      COALESCE(SUM(CASE WHEN crl.debit_amount > 0 THEN crl.debit_amount ELSE 0 END), 0) as piutang_baru,
      COALESCE(SUM(CASE WHEN crl.credit_amount > 0 THEN crl.credit_amount ELSE 0 END), 0) as bayar
    FROM customer_receivables_ledger crl
    WHERE EXTRACT(year FROM crl.transaction_date) = p_year
    GROUP BY crl.pelanggan_name, EXTRACT(month FROM crl.transaction_date)
  ),
  customer_ids AS (
    SELECT DISTINCT
      gen_random_uuid() as pelanggan_id,
      pelanggan_name
    FROM monthly_data
  )
  SELECT 
    ci.pelanggan_id,
    ci.pelanggan_name,  -- Use ci.pelanggan_name instead of md.pelanggan_name to avoid ambiguity
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
  JOIN customer_ids ci ON ci.pelanggan_name = md.pelanggan_name
  ORDER BY ci.pelanggan_name, md.bulan;
END;
$$;
