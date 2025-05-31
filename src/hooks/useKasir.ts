
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Kasir = Tables<'kasir'>;
type KasirInsert = TablesInsert<'kasir'>;
type KasirUpdate = TablesUpdate<'kasir'>;

export const useKasir = () => {
  return useQuery({
    queryKey: ['kasir'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kasir')
        .select('*')
        .order('nama');
      
      if (error) throw error;
      return data as Kasir[];
    },
  });
};

export const useCreateKasir = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (kasir: KasirInsert) => {
      const { data, error } = await supabase
        .from('kasir')
        .insert(kasir)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasir'] });
    },
  });
};

export const useUpdateKasir = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: KasirUpdate }) => {
      const { data, error } = await supabase
        .from('kasir')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasir'] });
    },
  });
};

export const useDeleteKasir = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('kasir')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasir'] });
    },
  });
};
