
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePOSTransactionSync } from '@/hooks/usePOSTransactionSync';

export const useStockSync = () => {
  const queryClient = useQueryClient();
  const { syncStock } = usePOSTransactionSync();

  useEffect(() => {
    // Listen for POS transaction completion events
    const handlePOSTransaction = async (event: CustomEvent) => {
      const { transaction, items } = event.detail;
      
      console.log('Stock sync: Processing POS transaction', transaction.transaction_number);
      
      try {
        // Sync stock for each item
        await syncStock(items);
        
        // Invalidate all stock-related queries for immediate UI update
        queryClient.invalidateQueries({ queryKey: ['stock_data'] });
        queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
        queryClient.invalidateQueries({ queryKey: ['barang-konsinyasi'] });
        queryClient.invalidateQueries({ queryKey: ['stock_mutations'] });
        queryClient.invalidateQueries({ queryKey: ['low_stock_products'] });
        
        console.log('Stock sync: Successfully synced stock for POS transaction');
      } catch (error) {
        console.error('Stock sync: Failed to sync stock for POS transaction:', error);
      }
    };

    // Listen for the custom POS transaction event
    window.addEventListener('pos-transaction-complete', handlePOSTransaction as EventListener);

    // Setup real-time subscription for stock changes
    const stockChannel = supabase
      .channel('stock-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'barang_konsinyasi'
        },
        (payload) => {
          console.log('Stock sync: Real-time stock change detected', payload);
          
          // Invalidate stock queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['stock_data'] });
          queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
          queryClient.invalidateQueries({ queryKey: ['barang-konsinyasi'] });
          queryClient.invalidateQueries({ queryKey: ['low_stock_products'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mutasi_stok'
        },
        (payload) => {
          console.log('Stock sync: Real-time stock mutation detected', payload);
          
          // Invalidate mutation queries
          queryClient.invalidateQueries({ queryKey: ['stock_mutations'] });
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('pos-transaction-complete', handlePOSTransaction as EventListener);
      supabase.removeChannel(stockChannel);
    };
  }, [queryClient, syncStock]);

  return {
    // Real-time sync is handled automatically
    forceSync: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang-konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['stock_mutations'] });
      queryClient.invalidateQueries({ queryKey: ['low_stock_products'] });
    }
  };
};
