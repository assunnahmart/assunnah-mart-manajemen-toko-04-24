
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useKonsinyasiHarian = () => {
  return useQuery({
    queryKey: ['konsinyasi_harian'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('konsinyasi_harian')
        .select(`
          *,
          supplier:supplier_id (nama),
          barang_konsinyasi:product_id (nama, stok_saat_ini)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateKonsinyasiHarian = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('konsinyasi_harian')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['konsinyasi_harian'] });
    },
  });
};

export const useUpdateKonsinyasiHarian = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('konsinyasi_harian')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['konsinyasi_harian'] });
    },
  });
};
