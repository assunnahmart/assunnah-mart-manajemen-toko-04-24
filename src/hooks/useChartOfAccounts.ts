
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type ChartOfAccount = Tables<'chart_of_accounts'>;
type ChartOfAccountInsert = TablesInsert<'chart_of_accounts'>;
type ChartOfAccountUpdate = TablesUpdate<'chart_of_accounts'>;

export const useChartOfAccounts = () => {
  return useQuery({
    queryKey: ['chart_of_accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('is_active', true)
        .order('kode_akun', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateChartOfAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (account: ChartOfAccountInsert) => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .insert(account)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chart_of_accounts'] });
    },
  });
};

export const useUpdateChartOfAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ChartOfAccountUpdate }) => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chart_of_accounts'] });
    },
  });
};

export const useDeleteChartOfAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete by setting is_active to false
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chart_of_accounts'] });
    },
  });
};

export const useChartOfAccountsByType = (jenisAkun: string) => {
  return useQuery({
    queryKey: ['chart_of_accounts', 'by_type', jenisAkun],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('jenis_akun', jenisAkun)
        .eq('is_active', true)
        .order('kode_akun', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
};
