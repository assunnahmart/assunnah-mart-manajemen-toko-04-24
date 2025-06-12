
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePOSTransactionSync } from '@/hooks/usePOSTransactionSync';

export const useStockSync = () => {
  const queryClient = useQueryClient();
  const { syncStock } = usePOSTransactionSync();

  useEffect(() => {
    let stockChannel: any = null;
    const channelId = `stock-changes-${Date.now()}-${Math.random()}`;

    // Listen for the custom POS transaction event
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
        queryClient.invalidateQueries({ queryKey: ['barang'] });
        
        console.log('Stock sync: Successfully synced stock for POS transaction');
      } catch (error) {
        console.error('Stock sync: Failed to sync stock for POS transaction:', error);
      }
    };

    // Setup real-time subscription for stock changes
    const setupRealTimeSync = () => {
      stockChannel = supabase
        .channel(channelId)
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
            queryClient.invalidateQueries({ queryKey: ['barang'] });
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
            queryClient.invalidateQueries({ queryKey: ['stock_data'] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pos_transactions'
          },
          (payload) => {
            console.log('Stock sync: Real-time POS transaction detected', payload);
            
            if (payload.eventType === 'INSERT' && payload.new?.status === 'completed') {
              // Invalidate POS and stock related queries
              queryClient.invalidateQueries({ queryKey: ['pos_transactions_today'] });
              queryClient.invalidateQueries({ queryKey: ['stock_data'] });
              queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
            }
          }
        )
        .subscribe();
    };

    // Listen for the custom POS transaction event
    window.addEventListener('pos-transaction-complete', handlePOSTransaction as EventListener);
    
    // Setup real-time sync
    setupRealTimeSync();

    return () => {
      window.removeEventListener('pos-transaction-complete', handlePOSTransaction as EventListener);
      if (stockChannel) {
        supabase.removeChannel(stockChannel);
      }
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
      queryClient.invalidateQueries({ queryKey: ['barang'] });
      queryClient.invalidateQueries({ queryKey: ['pos_transactions_today'] });
    }
  };
};
