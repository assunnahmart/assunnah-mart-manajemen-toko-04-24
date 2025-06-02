
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useKasirKasTransactions = () => {
  return useQuery({
    queryKey: ['kasir_kas_transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kasir_kas_transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateKasirKasTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      // Generate transaction number
      const { data: transactionNumber } = await supabase
        .rpc('generate_kasir_kas_transaction_number');

      const transactionData = {
        ...data,
        transaction_number: transactionNumber
      };

      const { error } = await supabase
        .from('kasir_kas_transactions')
        .insert(transactionData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasir_kas_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['kas_umum_transactions'] });
    },
  });
};

export const useKasirKasBalance = () => {
  return useQuery({
    queryKey: ['kasir_kas_balance'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('kasir_kas_transactions')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);
      
      if (error) throw error;
      
      const masuk = data
        .filter(t => t.jenis_transaksi === 'masuk')
        .reduce((sum, t) => sum + (t.jumlah || 0), 0);
      
      const keluar = data
        .filter(t => t.jenis_transaksi === 'keluar')
        .reduce((sum, t) => sum + (t.jumlah || 0), 0);
      
      return {
        masuk,
        keluar,
        saldo: masuk - keluar,
        transactions: data
      };
    },
  });
};
