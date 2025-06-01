
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type BarangKonsinyasi = Tables<'barang_konsinyasi'>;
type BarangKonsinyasiInsert = TablesInsert<'barang_konsinyasi'>;
type BarangKonsinyasiUpdate = TablesUpdate<'barang_konsinyasi'>;

export const useBarang = (searchQuery?: string) => {
  return useQuery({
    queryKey: ['barang', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('barang_konsinyasi')
        .select(`
          *,
          kategori_barang (nama),
          supplier (nama)
        `);
      
      if (searchQuery && searchQuery.trim()) {
        query = query.or(`nama.ilike.%${searchQuery}%,barcode.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query.order('nama');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateBarang = () => {
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
      queryClient.invalidateQueries({ queryKey: ['barang'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
    },
  });
};

export const useUpdateBarang = () => {
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
      queryClient.invalidateQueries({ queryKey: ['barang'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
    },
  });
};
