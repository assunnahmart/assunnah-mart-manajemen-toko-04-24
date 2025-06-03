
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type BarangKonsinyasi = Tables<'barang_konsinyasi'>;
type BarangKonsinyasiInsert = TablesInsert<'barang_konsinyasi'>;
type BarangKonsinyasiUpdate = TablesUpdate<'barang_konsinyasi'>;

export const useBarangKonsinyasi = (jenisKonsinyasi?: 'harian' | 'mingguan') => {
  return useQuery({
    queryKey: ['barang_konsinyasi', jenisKonsinyasi],
    queryFn: async () => {
      let query = supabase
        .from('barang_konsinyasi')
        .select(`
          *,
          kategori_barang (nama),
          supplier!supplier_id (nama)
        `);
      
      if (jenisKonsinyasi) {
        query = query.eq('jenis_konsinyasi', jenisKonsinyasi);
      }
      
      const { data, error } = await query.order('nama');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useBarangStokRendah = () => {
  return useQuery({
    queryKey: ['barang_stok_rendah'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barang_konsinyasi')
        .select(`
          *,
          kategori_barang (nama),
          supplier!supplier_id (nama)
        `)
        .filter('stok_saat_ini', 'lt', 'stok_minimal')
        .eq('status', 'aktif')
        .order('nama');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateBarangKonsinyasi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (barang: BarangKonsinyasiInsert) => {
      const { data, error } = await supabase
        .from('barang_konsinyasi')
        .insert(barang)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang_stok_rendah'] });
    },
  });
};

export const useUpdateBarangKonsinyasi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BarangKonsinyasiUpdate }) => {
      const { data, error } = await supabase
        .from('barang_konsinyasi')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang_stok_rendah'] });
    },
  });
};
