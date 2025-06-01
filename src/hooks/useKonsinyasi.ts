
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type KonsinyasiLaporan = Tables<'konsinyasi_laporan'>;
type KonsinyasiLaporanInsert = TablesInsert<'konsinyasi_laporan'>;
type KonsinyasiDetail = Tables<'konsinyasi_detail'>;

export const useKonsinyasiLaporan = () => {
  return useQuery({
    queryKey: ['konsinyasi_laporan'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('konsinyasi_laporan')
        .select(`
          *,
          supplier (nama),
          konsinyasi_detail (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateKonsinyasiLaporan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      laporan, 
      details 
    }: { 
      laporan: KonsinyasiLaporanInsert; 
      details: { barang_id: string; nama_barang: string; harga_beli: number; jumlah_terjual: number; total_nilai: number }[] 
    }) => {
      // Insert laporan
      const { data: insertedLaporan, error: laporanError } = await supabase
        .from('konsinyasi_laporan')
        .insert(laporan)
        .select()
        .single();
      
      if (laporanError) throw laporanError;
      
      // Insert details
      const detailsWithLaporanId = details.map(detail => ({
        ...detail,
        laporan_id: insertedLaporan.id
      }));
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('konsinyasi_detail')
        .insert(detailsWithLaporanId)
        .select();
      
      if (itemsError) throw itemsError;
      
      return { laporan: insertedLaporan, details: itemsData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['konsinyasi_laporan'] });
    },
  });
};

export const useKonsinyasiBarang = () => {
  return useQuery({
    queryKey: ['konsinyasi_barang'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barang_konsinyasi')
        .select(`
          *,
          supplier (nama)
        `)
        .eq('jenis_konsinyasi', 'konsinyasi')
        .order('nama', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
};
