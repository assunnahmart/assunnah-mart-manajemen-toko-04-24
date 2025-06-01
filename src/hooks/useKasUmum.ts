
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type KasTransaction = Tables<'kas_umum_transactions'>;
type KasTransactionInsert = TablesInsert<'kas_umum_transactions'>;

export const useKasUmumTransactions = () => {
  return useQuery({
    queryKey: ['kas_umum_transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kas_umum_transactions')
        .select(`
          *,
          chart_of_accounts (nama_akun, kode_akun)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateKasTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transaction: Omit<KasTransactionInsert, 'transaction_number'>) => {
      // Generate transaction number
      const { data: transactionNumber, error: numberError } = await supabase
        .rpc('generate_kas_transaction_number');
      
      if (numberError) throw numberError;
      
      // Insert transaction
      const { data, error } = await supabase
        .from('kas_umum_transactions')
        .insert({
          ...transaction,
          transaction_number: transactionNumber as string
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kas_umum_transactions'] });
    },
  });
};

export const useKasUmumSummary = () => {
  return useQuery({
    queryKey: ['kas_umum_summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kas_umum_transactions')
        .select('jenis_transaksi, jumlah');
      
      if (error) throw error;
      
      const totalMasuk = data
        .filter(t => t.jenis_transaksi === 'masuk')
        .reduce((sum, t) => sum + (t.jumlah || 0), 0);
      
      const totalKeluar = data
        .filter(t => t.jenis_transaksi === 'keluar')
        .reduce((sum, t) => sum + (t.jumlah || 0), 0);
      
      return {
        totalMasuk,
        totalKeluar,
        saldo: totalMasuk - totalKeluar
      };
    },
  });
};
