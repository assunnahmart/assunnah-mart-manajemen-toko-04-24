
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type POSTransaction = Tables<'pos_transactions'>;
type POSTransactionItem = Tables<'pos_transaction_items'>;
type POSTransactionInsert = TablesInsert<'pos_transactions'>;
type POSTransactionItemInsert = TablesInsert<'pos_transaction_items'>;

export const usePOSTransactions = (limit?: number) => {
  return useQuery({
    queryKey: ['pos_transactions', limit],
    queryFn: async () => {
      let query = supabase
        .from('pos_transactions')
        .select(`
          *,
          pos_transaction_items (*)
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

export const useCreatePOSTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      transaction, 
      items 
    }: { 
      transaction: Omit<POSTransactionInsert, 'transaction_number'>; 
      items: Omit<POSTransactionItemInsert, 'transaction_id'>[] 
    }) => {
      // Generate transaction number
      const { data: transactionNumber, error: numberError } = await supabase
        .rpc('generate_pos_transaction_number');
      
      if (numberError) {
        console.error('Error generating transaction number:', numberError);
        throw numberError;
      }
      
      console.log('Generated transaction number:', transactionNumber);
      
      // Insert transaction with the generated number as string
      const transactionData = {
        ...transaction,
        transaction_number: transactionNumber as string
      };
      
      console.log('Inserting transaction:', transactionData);
      
      const { data: insertedTransaction, error: transactionError } = await supabase
        .from('pos_transactions')
        .insert(transactionData)
        .select()
        .single();
      
      if (transactionError) {
        console.error('Error inserting transaction:', transactionError);
        throw transactionError;
      }
      
      console.log('Transaction inserted successfully:', insertedTransaction);
      
      // Insert transaction items
      const itemsWithTransactionId = items.map(item => ({
        ...item,
        transaction_id: insertedTransaction.id
      }));
      
      console.log('Inserting items:', itemsWithTransactionId);
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('pos_transaction_items')
        .insert(itemsWithTransactionId)
        .select();
      
      if (itemsError) {
        console.error('Error inserting items:', itemsError);
        throw itemsError;
      }
      
      console.log('Items inserted successfully:', itemsData);

      // Dispatch custom event for transaction completion
      const event = new CustomEvent('pos-transaction-complete', {
        detail: {
          transaction: insertedTransaction,
          items: itemsData
        }
      });
      window.dispatchEvent(event);
      
      return { transaction: insertedTransaction, items: itemsData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['pos_transactions_today'] });
      queryClient.invalidateQueries({ queryKey: ['barang'] });
    },
  });
};

export const usePOSTransactionsToday = () => {
  return useQuery({
    queryKey: ['pos_transactions_today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('pos_transactions')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .eq('status', 'completed');
      
      if (error) throw error;
      
      const totalTransactions = data.length;
      const totalAmount = data.reduce((sum, t) => sum + (t.total_amount || 0), 0);
      
      return {
        totalTransactions,
        totalAmount,
        transactions: data as POSTransaction[]
      };
    },
  });
};
