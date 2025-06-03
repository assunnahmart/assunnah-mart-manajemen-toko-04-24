
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePOSTransactionSync = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const syncStockMutation = useMutation({
    mutationFn: async (items: any[]) => {
      console.log('Syncing stock for items:', items);
      
      for (const item of items) {
        // Update stock in barang_konsinyasi table
        const { error: stockError } = await supabase
          .rpc('update_stok_barang', {
            barang_id: item.product_id,
            jumlah_keluar: item.quantity
          });
        
        if (stockError) {
          console.error('Error updating stock for item:', item.product_id, stockError);
          throw new Error(`Failed to update stock for ${item.product_name}: ${stockError.message}`);
        }
      }
    },
    onSuccess: () => {
      // Invalidate stock-related queries for real-time sync
      queryClient.invalidateQueries({ queryKey: ['barang'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['stock_mutations'] });
      queryClient.invalidateQueries({ queryKey: ['low_stock_products'] });
    },
    onError: (error) => {
      console.error('Stock sync error:', error);
      toast({
        title: "Gagal update stok",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const syncCustomerDebtMutation = useMutation({
    mutationFn: async ({ customer, amount }: { customer: any; amount: number }) => {
      if (!customer || customer.type === 'guest') return;

      console.log('Syncing customer debt:', customer, amount);

      if (customer.type === 'unit') {
        const { error } = await supabase
          .rpc('increment_unit_debt', {
            unit_id: customer.id,
            amount: amount
          });
        
        if (error) {
          throw new Error(`Failed to update unit debt: ${error.message}`);
        }
      } else if (customer.type === 'perorangan') {
        const { error } = await supabase
          .rpc('increment_personal_debt', {
            person_id: customer.id,
            amount: amount
          });
        
        if (error) {
          throw new Error(`Failed to update personal debt: ${error.message}`);
        }
      }
    },
    onSuccess: () => {
      // Invalidate customer-related queries
      queryClient.invalidateQueries({ queryKey: ['pelanggan_unit'] });
      queryClient.invalidateQueries({ queryKey: ['pelanggan_perorangan'] });
    },
    onError: (error) => {
      console.error('Customer debt sync error:', error);
      toast({
        title: "Gagal update piutang pelanggan",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    syncStock: syncStockMutation.mutateAsync,
    syncCustomerDebt: syncCustomerDebtMutation.mutateAsync,
    isSyncingStock: syncStockMutation.isPending,
    isSyncingDebt: syncCustomerDebtMutation.isPending
  };
};
