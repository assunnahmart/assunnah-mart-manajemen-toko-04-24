
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
      console.log('Creating kasir kas transaction with data:', data);
      
      // Generate transaction number
      const { data: transactionNumber, error: numberError } = await supabase
        .rpc('generate_kasir_kas_transaction_number');

      if (numberError) {
        console.error('Error generating transaction number:', numberError);
        throw numberError;
      }

      const transactionData = {
        ...data,
        transaction_number: transactionNumber,
        tanggal_transaksi: new Date().toISOString().split('T')[0],
        sync_to_kas_umum: true
      };

      console.log('Final transaction data:', transactionData);

      const { data: result, error } = await supabase
        .from('kasir_kas_transactions')
        .insert(transactionData)
        .select()
        .single();
      
      if (error) {
        console.error('Error inserting kasir kas transaction:', error);
        throw error;
      }
      
      console.log('Successfully created kasir kas transaction:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasir_kas_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['kas_umum_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['kasir_kas_balance'] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
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
