
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type BarangKonsinyasi = Tables<'barang_konsinyasi'>;
type BarangKonsinyasiInsert = TablesInsert<'barang_konsinyasi'>;
type BarangKonsinyasiUpdate = TablesUpdate<'barang_konsinyasi'>;

export const useBarang = (searchQuery?: string) => {
  return useQuery({
    queryKey: ['barang_konsinyasi', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('barang_konsinyasi')
        .select('*')
        .eq('status', 'aktif')
        .order('nama', { ascending: true });
      
      if (searchQuery && searchQuery.trim()) {
        query = query.or(`nama.ilike.%${searchQuery}%,barcode.eq.${searchQuery}`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as BarangKonsinyasi[];
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
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
    },
  });
};

export const useUpdateBarang = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BarangKonsinyasiUpdate }) => {
      const { data: result, error } = await supabase
        .from('barang_konsinyasi')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
    },
  });
};

export const useDeleteBarang = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('barang_konsinyasi')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
    },
  });
};
