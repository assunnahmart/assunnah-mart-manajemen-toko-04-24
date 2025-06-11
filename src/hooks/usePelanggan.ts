
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePelangganUnit = () => {
  return useQuery({
    queryKey: ['pelanggan_unit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pelanggan')
        .select('*')
        .not('nama_unit', 'is', null)
        .neq('nama_unit', '')
        .eq('status', 'aktif');
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const usePelangganPerorangan = () => {
  return useQuery({
    queryKey: ['pelanggan_perorangan'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pelanggan')
        .select('*')
        .or('nama_unit.is.null,nama_unit.eq.')
        .eq('status', 'aktif');
      
      if (error) throw error;
      return data || [];
    },
  });
};

// Alias for backward compatibility
export const usePelangganKredit = usePelangganUnit;

export const useCreatePelangganUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('pelanggan')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pelanggan_unit'] });
      queryClient.invalidateQueries({ queryKey: ['piutang_pelanggan'] });
    },
  });
};

export const useCreatePelangganPerorangan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('pelanggan')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pelanggan_perorangan'] });
      queryClient.invalidateQueries({ queryKey: ['piutang_pelanggan'] });
    },
  });
};
