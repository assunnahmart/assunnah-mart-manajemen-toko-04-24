
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type KasUmumTransaction = Tables<'kas_umum_transactions'>;
type KasUmumTransactionInsert = TablesInsert<'kas_umum_transactions'>;

export const useKasUmumTransactions = (limit?: number) => {
  return useQuery({
    queryKey: ['kas_umum_transactions', limit],
    queryFn: async () => {
      let query = supabase
        .from('kas_umum_transactions')
        .select(`
          *,
          chart_of_accounts!kas_umum_transactions_akun_id_fkey (
            kode_akun,
            nama_akun,
            jenis_akun,
            kategori
          )
        `)
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateKasUmumTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transaction: Omit<KasUmumTransactionInsert, 'transaction_number'>) => {
      // Generate transaction number
      const { data: transactionNumber, error: numberError } = await supabase
        .rpc('generate_kas_transaction_number');
      
      if (numberError) {
        console.error('Error generating transaction number:', numberError);
        throw numberError;
      }
      
      // Insert transaction with the generated number
      const transactionData = {
        ...transaction,
        transaction_number: transactionNumber as string
      };
      
      const { data: insertedTransaction, error: transactionError } = await supabase
        .from('kas_umum_transactions')
        .insert(transactionData)
        .select(`
          *,
          chart_of_accounts!kas_umum_transactions_akun_id_fkey (
            kode_akun,
            nama_akun,
            jenis_akun,
            kategori
          )
        `)
        .single();
      
      if (transactionError) {
        console.error('Error inserting transaction:', transactionError);
        throw transactionError;
      }
      
      return insertedTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kas_umum_transactions'] });
    },
  });
};

export const useKasUmumSummary = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['kas_umum_summary', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('kas_umum_transactions')
        .select('jenis_transaksi, jumlah, tanggal_transaksi');
      
      if (startDate) {
        query = query.gte('tanggal_transaksi', startDate);
      }
      
      if (endDate) {
        query = query.lte('tanggal_transaksi', endDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const summary = {
        totalMasuk: 0,
        totalKeluar: 0,
        saldo: 0,
        totalTransaksi: data.length
      };
      
      data.forEach(transaction => {
        if (transaction.jenis_transaksi === 'masuk') {
          summary.totalMasuk += Number(transaction.jumlah);
        } else {
          summary.totalKeluar += Number(transaction.jumlah);
        }
      });
      
      summary.saldo = summary.totalMasuk - summary.totalKeluar;
      
      return summary;
    },
  });
};
