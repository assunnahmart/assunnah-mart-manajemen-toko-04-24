
-- Tambahkan kolom referensi di kas_umum_transactions.
ALTER TABLE public.kas_umum_transactions
ADD COLUMN IF NOT EXISTS referensi VARCHAR;

-- Optional: update deskripsi kolom jika perlu.
COMMENT ON COLUMN public.kas_umum_transactions.referensi IS 'Referensi transaksi terkait, contoh: nomor pembayaran piutang';
