
-- Create the pelanggan table that combines both unit and perorangan customers
CREATE TABLE IF NOT EXISTS public.pelanggan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama CHARACTER VARYING NOT NULL,
  nama_unit CHARACTER VARYING,
  jabatan CHARACTER VARYING,
  telepon CHARACTER VARYING,
  alamat TEXT,
  jenis_pembayaran CHARACTER VARYING DEFAULT 'tunai',
  limit_kredit NUMERIC DEFAULT 0,
  total_tagihan NUMERIC DEFAULT 0,
  sisa_piutang NUMERIC DEFAULT 0,
  status CHARACTER VARYING DEFAULT 'aktif',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trigger to update updated_at
CREATE OR REPLACE TRIGGER update_pelanggan_updated_at
  BEFORE UPDATE ON public.pelanggan
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.pelanggan ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on pelanggan" ON public.pelanggan
  FOR ALL USING (true) WITH CHECK (true);
