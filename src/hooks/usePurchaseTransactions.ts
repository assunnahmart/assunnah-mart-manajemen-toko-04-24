
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
      
      return { transaction: insertedTransaction, items: itemsData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['hutang_supplier'] });
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
