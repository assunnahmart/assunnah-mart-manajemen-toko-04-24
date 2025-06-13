
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
      
      // Validate required fields
      if (!data.kasir_id || !data.jenis_transaksi || !data.jumlah) {
        throw new Error('Data transaksi tidak lengkap');
      }
      
      // Ensure jumlah is a positive number
      if (data.jumlah <= 0) {
        throw new Error('Jumlah transaksi harus lebih dari 0');
      }
      
      // Generate transaction number
      const { data: transactionNumber, error: numberError } = await supabase
        .rpc('generate_kasir_kas_transaction_number');

      if (numberError) {
        console.error('Error generating transaction number:', numberError);
        throw new Error('Gagal membuat nomor transaksi');
      }

      const transactionData = {
        kasir_id: data.kasir_id,
        jenis_transaksi: data.jenis_transaksi,
        jumlah: parseInt(data.jumlah), // Ensure it's an integer
        keterangan: data.keterangan || '',
        transaction_number: transactionNumber,
        tanggal_transaksi: new Date().toISOString().split('T')[0],
        sync_to_kas_umum: true
      };

      console.log('Final transaction data:', transactionData);

      // Insert kasir kas transaction
      const { data: result, error } = await supabase
        .from('kasir_kas_transactions')
        .insert(transactionData)
        .select()
        .single();
      
      if (error) {
        console.error('Error inserting kasir kas transaction:', error);
        throw new Error(`Gagal menyimpan transaksi kas kasir: ${error.message}`);
      }
      
      // If this is a cash transaction, also create corresponding kas umum transaction
      if (data.sync_to_kas_umum !== false) {
        try {
          console.log('Creating corresponding kas umum transaction...');
          
          const kasUmumData = {
            jenis_transaksi: data.jenis_transaksi,
            jumlah: parseInt(data.jumlah),
            keterangan: `Kas Kasir - ${data.keterangan || 'Transaksi tunai'}`,
            akun_id: null, // Will use default cash account
            sumber_transaksi: 'kas_kasir',
            referensi_id: result.id
          };
          
          const { data: kasUmumNumber, error: kasUmumNumberError } = await supabase
            .rpc('generate_kas_transaction_number');
          
          if (kasUmumNumberError) {
            console.error('Warning: Could not generate kas umum transaction number:', kasUmumNumberError);
          } else {
            const { error: kasUmumError } = await supabase
              .from('kas_umum_transactions')
              .insert({
                ...kasUmumData,
                transaction_number: kasUmumNumber
              });
            
            if (kasUmumError) {
              console.error('Warning: Could not sync to kas umum:', kasUmumError);
              // Don't throw error here, just log it as the main transaction succeeded
            } else {
              console.log('Successfully synced to kas umum');
            }
          }
        } catch (syncError) {
          console.error('Warning: Kas umum sync failed:', syncError);
          // Don't throw error here, the main transaction succeeded
        }
      }
      
      console.log('Successfully created kasir kas transaction:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasir_kas_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['kas_umum_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['kasir_kas_balance'] });
      queryClient.invalidateQueries({ queryKey: ['kas_umum_summary'] });
    },
    onError: (error) => {
      console.error('Kasir kas transaction error:', error);
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
