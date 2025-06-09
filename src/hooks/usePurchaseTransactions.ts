
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type PurchaseTransaction = Tables<'transaksi_pembelian'>;
type PurchaseTransactionInsert = TablesInsert<'transaksi_pembelian'>;
type PurchaseTransactionItem = Tables<'detail_transaksi_pembelian'>;
type PurchaseTransactionItemInsert = TablesInsert<'detail_transaksi_pembelian'>;

export const usePurchaseTransactions = () => {
  return useQuery({
    queryKey: ['purchase_transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transaksi_pembelian')
        .select(`
          *,
          supplier (nama),
          kasir (nama),
          detail_transaksi_pembelian (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreatePurchaseTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      transaction, 
      items 
    }: { 
      transaction: Omit<PurchaseTransactionInsert, 'nomor_transaksi'>; 
      items: Omit<PurchaseTransactionItemInsert, 'transaksi_id'>[] 
    }) => {
      // Generate transaction number
      const { data: transactionNumber, error: numberError } = await supabase
        .rpc('generate_purchase_transaction_number');
      
      if (numberError) throw numberError;
      
      // Insert transaction
      const { data: insertedTransaction, error: transactionError } = await supabase
        .from('transaksi_pembelian')
        .insert({
          ...transaction,
          nomor_transaksi: transactionNumber as string
        })
        .select()
        .single();
      
      if (transactionError) throw transactionError;
      
      // Insert transaction items
      const itemsWithTransactionId = items.map(item => ({
        ...item,
        transaksi_id: insertedTransaction.id
      }));
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('detail_transaksi_pembelian')
        .insert(itemsWithTransactionId)
        .select();
      
      if (itemsError) throw itemsError;

      // Update stock for each item
      for (const item of itemsData) {
        const { error: stockError } = await supabase
          .rpc('update_stok_from_pembelian', {
            p_barang_id: item.barang_id,
            p_jumlah: item.jumlah,
            p_transaksi_id: insertedTransaction.id
          });
        
        if (stockError) throw stockError;
      }

      // Create supplier debt if credit transaction
      if (transaction.jenis_pembayaran === 'kredit' && transaction.supplier_id) {
        const { error: debtError } = await supabase
          .rpc('create_supplier_debt', {
            p_supplier_id: transaction.supplier_id,
            p_transaksi_id: insertedTransaction.id,
            p_jumlah: transaction.total,
            p_jatuh_tempo: transaction.jatuh_tempo
          });
        
        if (debtError) throw debtError;
      }

      // ADDED: Sync with kas umum for cash transactions
      if (transaction.jenis_pembayaran === 'cash') {
        const { data: kasTransactionNumber, error: kasNumberError } = await supabase
          .rpc('generate_kas_transaction_number');
        
        if (kasNumberError) throw kasNumberError;
        
        // Get kas account (Cash account)
        const { data: kasAccount, error: kasAccountError } = await supabase
          .from('chart_of_accounts')
          .select('id')
          .eq('kode_akun', '1001')
          .single();
        
        if (kasAccountError) throw kasAccountError;
        
        // Create kas keluar entry for cash purchase
        const { error: kasError } = await supabase
          .from('kas_umum_transactions')
          .insert({
            transaction_number: kasTransactionNumber as string,
            tanggal_transaksi: new Date().toISOString().split('T')[0],
            jenis_transaksi: 'keluar',
            akun_id: kasAccount.id,
            jumlah: transaction.total,
            keterangan: `Pembelian tunai - ${transactionNumber}`,
            referensi_tipe: 'purchase_transaction',
            referensi_id: insertedTransaction.id,
            kasir_username: transaction.kasir_id ? 'system' : 'admin',
            kasir_name: 'Admin'
          });
        
        if (kasError) throw kasError;
      }
      
      return { transaction: insertedTransaction, items: itemsData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['hutang_supplier'] });
      queryClient.invalidateQueries({ queryKey: ['kas_umum_transactions'] }); // Added to refresh kas umum
    },
  });
};

export const useSupplierDebts = () => {
  return useQuery({
    queryKey: ['supplier_debts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hutang_supplier')
        .select(`
          *,
          supplier (nama),
          transaksi_pembelian (nomor_transaksi)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};
