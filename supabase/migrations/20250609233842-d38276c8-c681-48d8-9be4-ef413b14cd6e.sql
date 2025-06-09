
-- Fix the kasir_id column type in kasir_kas_transactions table
-- Change from text to uuid to match the kasir table
ALTER TABLE public.kasir_kas_transactions 
ALTER COLUMN kasir_id TYPE uuid USING kasir_id::uuid;
