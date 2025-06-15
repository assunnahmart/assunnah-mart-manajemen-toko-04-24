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
    mutationFn: async (transaction: Omit<KasTransactionInsert, 'transaction_number'> & { referensi?: string }) => {
      console.log('Creating kas umum transaction with data:', transaction);
      
      // Validate required fields
      if (!transaction.jenis_transaksi || !transaction.jumlah) {
        throw new Error('Data transaksi tidak lengkap');
      }
      
      // Ensure jumlah is a positive number
      if (transaction.jumlah <= 0) {
        throw new Error('Jumlah transaksi harus lebih dari 0');
      }
      
      // Validate that akun_id exists and is active if provided
      if (transaction.akun_id) {
        const { data: account, error: accountError } = await supabase
          .from('chart_of_accounts')
          .select('id, nama_akun')
          .eq('id', transaction.akun_id)
          .eq('is_active', true)
          .single();
        
        if (accountError || !account) {
          throw new Error('Akun yang dipilih tidak valid atau tidak aktif');
        }
      }
      
      // Generate transaction number
      const { data: transactionNumber, error: numberError } = await supabase
        .rpc('generate_kas_transaction_number');

      if (numberError) {
        console.error('Error generating transaction number:', numberError);
        throw new Error('Gagal membuat nomor transaksi');
      }
      if (!transactionNumber || typeof transactionNumber !== 'string' || transactionNumber.trim() === '') {
        console.error('Received invalid transaction_number from rpc:', transactionNumber);
        throw new Error('Gagal membuat nomor transaksi (nomor tidak valid)');
      }
      
      // Prepare transaction data
      const transactionData = {
        ...transaction,
        jumlah: parseInt(transaction.jumlah.toString()), // Ensure it's an integer
        transaction_number: transactionNumber as string,
        referensi: transaction.referensi ?? null,
      };
      
      console.log('Final kas umum transaction data:', transactionData);
      
      // Insert transaction
      const { data, error } = await supabase
        .from('kas_umum_transactions')
        .insert(transactionData)
        .select()
        .single();
      
      if (error) {
        console.error('Error inserting kas umum transaction:', error);
        throw new Error(`Gagal menyimpan transaksi kas umum: ${error.message}`);
      }
      
      console.log('Successfully created kas umum transaction:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kas_umum_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['kas_umum_summary'] });
    },
    onError: (error) => {
      console.error('Kas umum transaction error:', error);
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
