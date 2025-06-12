
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAutoJournalEntries = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for POS transaction changes
    const posChannel = supabase
      .channel('pos_transaction_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pos_transactions'
        },
        (payload) => {
          console.log('POS transaction change detected:', payload);
          // Invalidate general ledger queries
          queryClient.invalidateQueries({ queryKey: ['general_ledger'] });
          queryClient.invalidateQueries({ queryKey: ['trial_balance'] });
          queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
        }
      )
      .subscribe();

    // Listen for purchase transaction changes
    const purchaseChannel = supabase
      .channel('purchase_transaction_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transaksi_pembelian'
        },
        (payload) => {
          console.log('Purchase transaction change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['general_ledger'] });
          queryClient.invalidateQueries({ queryKey: ['trial_balance'] });
          queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
        }
      )
      .subscribe();

    // Listen for sales transaction changes
    const salesChannel = supabase
      .channel('sales_transaction_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transaksi_penjualan'
        },
        (payload) => {
          console.log('Sales transaction change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['general_ledger'] });
          queryClient.invalidateQueries({ queryKey: ['trial_balance'] });
          queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
        }
      )
      .subscribe();

    // Listen for kas umum transaction changes
    const kasChannel = supabase
      .channel('kas_transaction_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kas_umum_transactions'
        },
        (payload) => {
          console.log('Kas transaction change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['general_ledger'] });
          queryClient.invalidateQueries({ queryKey: ['trial_balance'] });
          queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
        }
      )
      .subscribe();

    // Listen for stock opname changes
    const stockOpnameChannel = supabase
      .channel('stock_opname_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stok_opname'
        },
        (payload) => {
          console.log('Stock opname change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['general_ledger'] });
          queryClient.invalidateQueries({ queryKey: ['trial_balance'] });
          queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(posChannel);
      supabase.removeChannel(purchaseChannel);
      supabase.removeChannel(salesChannel);
      supabase.removeChannel(kasChannel);
      supabase.removeChannel(stockOpnameChannel);
    };
  }, [queryClient]);

  return {};
};
