
-- Add sisa_hutang column to transaksi_pembelian table
ALTER TABLE public.transaksi_pembelian 
ADD COLUMN sisa_hutang NUMERIC DEFAULT 0;

-- Update existing credit transactions to set sisa_hutang equal to total
UPDATE public.transaksi_pembelian 
SET sisa_hutang = total 
WHERE jenis_pembayaran = 'kredit' AND sisa_hutang = 0;

-- Update existing cash transactions to have sisa_hutang = 0
UPDATE public.transaksi_pembelian 
SET sisa_hutang = 0 
WHERE jenis_pembayaran = 'cash';
