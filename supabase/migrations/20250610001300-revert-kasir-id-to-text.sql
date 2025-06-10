
-- Revert kasir_id column type back to text to match authentication system
-- The auth system uses string identifiers like "admin-002", "kasir-001" etc.

ALTER TABLE public.kasir_kas_transactions 
ALTER COLUMN kasir_id TYPE text;

-- Update any existing RLS policies if needed
-- The existing policies should continue to work with text type
