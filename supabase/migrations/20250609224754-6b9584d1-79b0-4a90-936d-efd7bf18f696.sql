
-- Enable RLS on kasir_kas_transactions table
ALTER TABLE public.kasir_kas_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to insert kasir kas transactions
CREATE POLICY "Allow authenticated users to insert kasir kas transactions" 
ON public.kasir_kas_transactions 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create policy to allow all authenticated users to select kasir kas transactions
CREATE POLICY "Allow authenticated users to select kasir kas transactions" 
ON public.kasir_kas_transactions 
FOR SELECT 
TO authenticated 
USING (true);

-- Create policy to allow all authenticated users to update kasir kas transactions
CREATE POLICY "Allow authenticated users to update kasir kas transactions" 
ON public.kasir_kas_transactions 
FOR UPDATE 
TO authenticated 
USING (true);
