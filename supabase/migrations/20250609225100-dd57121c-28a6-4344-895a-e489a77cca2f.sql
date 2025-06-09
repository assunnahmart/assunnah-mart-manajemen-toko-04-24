
-- Drop the foreign key constraint first
ALTER TABLE public.kasir_kas_transactions 
DROP CONSTRAINT IF EXISTS kasir_kas_transactions_kasir_id_fkey;

-- Change kasir_id column type from UUID to TEXT to support custom kasir IDs
ALTER TABLE public.kasir_kas_transactions 
ALTER COLUMN kasir_id TYPE TEXT;
