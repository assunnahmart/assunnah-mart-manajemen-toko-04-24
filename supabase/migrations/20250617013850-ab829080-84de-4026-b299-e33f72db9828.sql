
-- Fix remaining ambiguous column references in payment functions
DROP FUNCTION IF EXISTS public.sync_pos_credit_to_receivables();

CREATE OR REPLACE FUNCTION public.sync_pos_credit_to_receivables()
RETURNS VOID AS $$
DECLARE
  pos_record RECORD;
  pelanggan_name_var VARCHAR;
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
    pelanggan_name_var := COALESCE(
      NULLIF(TRIM(SPLIT_PART(pos_record.notes, ':', 2)), ''),
      'Pelanggan Kredit'
    );
    
    -- Get current balance with explicit table alias
    SELECT COALESCE(crl_balance.running_balance, 0) INTO current_balance
    FROM customer_receivables_ledger crl_balance
    WHERE crl_balance.pelanggan_name = pelanggan_name_var
    ORDER BY crl_balance.created_at DESC, crl_balance.id DESC
    LIMIT 1;
    
    current_balance := COALESCE(current_balance, 0);
    new_balance := current_balance + pos_record.total_amount;
    
    -- Insert receivables entry
    INSERT INTO customer_receivables_ledger (
      pelanggan_name, transaction_date, reference_type, reference_id,
      reference_number, description, debit_amount, running_balance,
      transaction_type, kasir_name
    ) VALUES (
      pelanggan_name_var, pos_record.created_at::DATE, 'pos_transaction', pos_record.id::UUID,
      pos_record.transaction_number, 
      'Penjualan Kredit POS - ' || pos_record.transaction_number,
      pos_record.total_amount, new_balance, 'penjualan_kredit', pos_record.kasir_name
    );
    
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function for comprehensive profit and loss report
CREATE OR REPLACE FUNCTION public.get_comprehensive_profit_loss_report(
  p_start_date DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE),
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  penjualan_tunai NUMERIC := 0;
  penjualan_kredit NUMERIC := 0;
  konsinyasi_harian_tunai NUMERIC := 0;
  konsinyasi_harian_kredit NUMERIC := 0;
  konsinyasi_mingguan_tunai NUMERIC := 0;
  konsinyasi_mingguan_kredit NUMERIC := 0;
  pendapatan_lain NUMERIC := 0;
  total_penjualan NUMERIC := 0;
  
  persediaan_awal NUMERIC := 0;
  pembelian_tunai NUMERIC := 0;
  pembelian_kredit NUMERIC := 0;
  barang_tersedia NUMERIC := 0;
  beban_konsinyasi_harian NUMERIC := 0;
  beban_konsinyasi_mingguan NUMERIC := 0;
  persediaan_akhir NUMERIC := 0;
  hpp_total NUMERIC := 0;
  laba_kotor NUMERIC := 0;
  
  beban_administrasi NUMERIC := 0;
  laba_bersih NUMERIC := 0;
BEGIN
  -- Calculate sales (cash)
  SELECT COALESCE(SUM(pt.total_amount), 0) INTO penjualan_tunai
  FROM pos_transactions pt
  WHERE pt.payment_method = 'cash' 
  AND pt.status = 'completed'
  AND DATE(pt.created_at) BETWEEN p_start_date AND p_end_date;
  
  -- Calculate sales (credit)
  SELECT COALESCE(SUM(pt.total_amount), 0) INTO penjualan_kredit
  FROM pos_transactions pt
  WHERE pt.payment_method = 'credit' 
  AND pt.status = 'completed'
  AND DATE(pt.created_at) BETWEEN p_start_date AND p_end_date;
  
  -- Calculate konsinyasi harian (cash and credit)
  SELECT 
    COALESCE(SUM(CASE WHEN kh.status = 'approved' THEN kh.total_pembayaran ELSE 0 END), 0)
  INTO konsinyasi_harian_tunai
  FROM konsinyasi_harian kh
  WHERE DATE(kh.created_at) BETWEEN p_start_date AND p_end_date;
  
  -- Calculate konsinyasi mingguan (estimated from konsinyasi laporan)
  SELECT COALESCE(SUM(kl.total_penjualan), 0) INTO konsinyasi_mingguan_tunai
  FROM konsinyasi_laporan kl
  WHERE kl.status = 'approved'
  AND kl.periode_mulai >= p_start_date 
  AND kl.periode_selesai <= p_end_date;
  
  -- Calculate other income from kas transactions
  SELECT COALESCE(SUM(kt.jumlah), 0) INTO pendapatan_lain
  FROM kas_umum_transactions kt
  WHERE kt.jenis_transaksi = 'masuk'
  AND kt.keterangan ILIKE '%lain%' OR kt.keterangan ILIKE '%selisih%'
  AND kt.tanggal_transaksi BETWEEN p_start_date AND p_end_date;
  
  total_penjualan := penjualan_tunai + penjualan_kredit + konsinyasi_harian_tunai + 
                    konsinyasi_harian_kredit + konsinyasi_mingguan_tunai + 
                    konsinyasi_mingguan_kredit + pendapatan_lain;
  
  -- Calculate purchases
  SELECT COALESCE(SUM(CASE WHEN tp.jenis_pembayaran = 'cash' THEN tp.total ELSE 0 END), 0),
         COALESCE(SUM(CASE WHEN tp.jenis_pembayaran = 'kredit' THEN tp.total ELSE 0 END), 0)
  INTO pembelian_tunai, pembelian_kredit
  FROM transaksi_pembelian tp
  WHERE tp.status = 'completed'
  AND DATE(tp.tanggal_pembelian) BETWEEN p_start_date AND p_end_date;
  
  -- Calculate current inventory value (simplified)
  SELECT COALESCE(SUM(bk.stok_saat_ini * bk.harga_beli), 0) INTO persediaan_akhir
  FROM barang_konsinyasi bk
  WHERE bk.status = 'aktif';
  
  -- Estimate beginning inventory (current inventory + sold items cost)
  SELECT COALESCE(SUM(pti.quantity * COALESCE(bk.harga_beli, 0)), 0) INTO hpp_total
  FROM pos_transaction_items pti
  JOIN pos_transactions pt ON pt.id = pti.transaction_id
  LEFT JOIN barang_konsinyasi bk ON bk.id::TEXT = pti.product_id
  WHERE pt.status = 'completed'
  AND DATE(pt.created_at) BETWEEN p_start_date AND p_end_date;
  
  persediaan_awal := persediaan_akhir + hpp_total;
  barang_tersedia := persediaan_awal + pembelian_tunai + pembelian_kredit;
  
  -- Calculate konsinyasi costs
  SELECT COALESCE(SUM(kh.total_pembayaran * 0.85), 0) INTO beban_konsinyasi_harian
  FROM konsinyasi_harian kh
  WHERE kh.status = 'approved'
  AND DATE(kh.created_at) BETWEEN p_start_date AND p_end_date;
  
  SELECT COALESCE(SUM(kl.total_penjualan * 0.85), 0) INTO beban_konsinyasi_mingguan
  FROM konsinyasi_laporan kl
  WHERE kl.status = 'approved'
  AND kl.periode_mulai >= p_start_date 
  AND kl.periode_selesai <= p_end_date;
  
  hpp_total := hpp_total + beban_konsinyasi_harian + beban_konsinyasi_mingguan;
  laba_kotor := total_penjualan - hpp_total;
  
  -- Calculate administrative expenses
  SELECT COALESCE(SUM(kt.jumlah), 0) INTO beban_administrasi
  FROM kas_umum_transactions kt
  WHERE kt.jenis_transaksi = 'keluar'
  AND (kt.keterangan ILIKE '%beban%' OR kt.keterangan ILIKE '%biaya%')
  AND kt.tanggal_transaksi BETWEEN p_start_date AND p_end_date;
  
  laba_bersih := laba_kotor - beban_administrasi;
  
  -- Build result JSON
  result := json_build_object(
    'periode', json_build_object(
      'start_date', p_start_date,
      'end_date', p_end_date
    ),
    'pendapatan', json_build_object(
      'penjualan_tunai', penjualan_tunai,
      'penjualan_kredit', penjualan_kredit,
      'konsinyasi_harian_tunai', konsinyasi_harian_tunai,
      'konsinyasi_harian_kredit', konsinyasi_harian_kredit,
      'konsinyasi_mingguan_tunai', konsinyasi_mingguan_tunai,
      'konsinyasi_mingguan_kredit', konsinyasi_mingguan_kredit,
      'pendapatan_lain', pendapatan_lain,
      'total_penjualan', total_penjualan
    ),
    'hpp', json_build_object(
      'persediaan_awal', persediaan_awal,
      'pembelian_tunai', pembelian_tunai,
      'pembelian_kredit', pembelian_kredit,
      'barang_tersedia', barang_tersedia,
      'beban_konsinyasi_harian', beban_konsinyasi_harian,
      'beban_konsinyasi_mingguan', beban_konsinyasi_mingguan,
      'persediaan_akhir', persediaan_akhir,
      'hpp_total', hpp_total
    ),
    'laba_kotor', laba_kotor,
    'beban_administrasi', beban_administrasi,
    'laba_bersih', laba_bersih,
    'segmentasi', json_build_object(
      'barang_milik', json_build_object(
        'omset', penjualan_tunai + penjualan_kredit,
        'hpp', hpp_total - beban_konsinyasi_harian - beban_konsinyasi_mingguan,
        'laba_kotor', (penjualan_tunai + penjualan_kredit) - (hpp_total - beban_konsinyasi_harian - beban_konsinyasi_mingguan)
      ),
      'konsinyasi_harian', json_build_object(
        'omset', konsinyasi_harian_tunai + konsinyasi_harian_kredit,
        'hpp', beban_konsinyasi_harian,
        'laba_kotor', (konsinyasi_harian_tunai + konsinyasi_harian_kredit) - beban_konsinyasi_harian
      ),
      'konsinyasi_mingguan', json_build_object(
        'omset', konsinyasi_mingguan_tunai + konsinyasi_mingguan_kredit,
        'hpp', beban_konsinyasi_mingguan,
        'laba_kotor', (konsinyasi_mingguan_tunai + konsinyasi_mingguan_kredit) - beban_konsinyasi_mingguan
      )
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
