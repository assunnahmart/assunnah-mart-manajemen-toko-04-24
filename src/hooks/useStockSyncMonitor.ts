
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date;
  pendingSync: boolean;
  syncErrors: string[];
}

export const useStockSyncMonitor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    lastSync: new Date(),
    pendingSync: false,
    syncErrors: []
  });

  useEffect(() => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    
    // Create unique channel names
    const posChannelName = `pos_stock_sync_${timestamp}_${randomId}`;
    const stockChannelName = `stock_mutations_sync_${timestamp}_${randomId}`;
    const inventoryChannelName = `inventory_sync_${timestamp}_${randomId}`;

    // Monitor POS transactions for immediate stock sync
    const posChannel = supabase
      .channel(posChannelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pos_transactions'
        },
        async (payload) => {
          console.log('POS transaction detected for stock sync:', payload);
          
          if (payload.eventType === 'INSERT' && payload.new?.status === 'completed') {
            setSyncStatus(prev => ({ ...prev, pendingSync: true }));
            
            try {
              // Invalidate all stock-related queries immediately
              await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] }),
                queryClient.invalidateQueries({ queryKey: ['barang-konsinyasi'] }),
                queryClient.invalidateQueries({ queryKey: ['stock_data'] }),
                queryClient.invalidateQueries({ queryKey: ['stock_mutations'] }),
                queryClient.invalidateQueries({ queryKey: ['low_stock_products'] }),
                queryClient.invalidateQueries({ queryKey: ['barang'] })
              ]);
              
              setSyncStatus(prev => ({
                ...prev,
                pendingSync: false,
                lastSync: new Date(),
                syncErrors: []
              }));
              
              console.log('Stock data synchronized after POS transaction');
            } catch (error) {
              console.error('Error syncing stock after POS transaction:', error);
              setSyncStatus(prev => ({
                ...prev,
                pendingSync: false,
                syncErrors: [...prev.syncErrors, `POS sync error: ${error.message}`]
              }));
            }
          }
        }
      )
      .subscribe();

    // Monitor stock mutations for real-time updates
    const stockChannel = supabase
      .channel(stockChannelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mutasi_stok'
        },
        (payload) => {
          console.log('Stock mutation detected:', payload);
          
          // Invalidate stock queries when mutations occur
          queryClient.invalidateQueries({ queryKey: ['stock_mutations'] });
          queryClient.invalidateQueries({ queryKey: ['stock_data'] });
          
          setSyncStatus(prev => ({
            ...prev,
            lastSync: new Date()
          }));
        }
      )
      .subscribe();

    // Monitor barang_konsinyasi changes
    const inventoryChannel = supabase
      .channel(inventoryChannelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'barang_konsinyasi'
        },
        (payload) => {
          console.log('Inventory change detected:', payload);
          
          // Invalidate all inventory-related queries
          queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
          queryClient.invalidateQueries({ queryKey: ['barang-konsinyasi'] });
          queryClient.invalidateQueries({ queryKey: ['barang'] });
          queryClient.invalidateQueries({ queryKey: ['stock_data'] });
          queryClient.invalidateQueries({ queryKey: ['low_stock_products'] });
          
          setSyncStatus(prev => ({
            ...prev,
            lastSync: new Date()
          }));
          
          if (payload.eventType === 'UPDATE') {
            const oldStock = payload.old?.stok_saat_ini;
            const newStock = payload.new?.stok_saat_ini;
            
            if (oldStock !== newStock) {
              toast({
                title: "Stok Tersinkronisasi",
                description: `${payload.new?.nama}: ${oldStock} → ${newStock}`,
                duration: 3000
              });
            }
          }
        }
      )
      .subscribe();

    // Check connection status periodically
    const connectionCheck = setInterval(() => {
      setSyncStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine
      }));
    }, 5000);

    return () => {
      supabase.removeChannel(posChannel);
      supabase.removeChannel(stockChannel);
      supabase.removeChannel(inventoryChannel);
      clearInterval(connectionCheck);
    };
  }, [queryClient, toast]);

  const forceSyncAll = async () => {
    setSyncStatus(prev => ({ ...prev, pendingSync: true }));
    
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] }),
        queryClient.invalidateQueries({ queryKey: ['barang-konsinyasi'] }),
        queryClient.invalidateQueries({ queryKey: ['stock_data'] }),
        queryClient.invalidateQueries({ queryKey: ['stock_mutations'] }),
        queryClient.invalidateQueries({ queryKey: ['low_stock_products'] }),
        queryClient.invalidateQueries({ queryKey: ['barang'] }),
        queryClient.invalidateQueries({ queryKey: ['pos_transactions_today'] })
      ]);
      
      setSyncStatus(prev => ({
        ...prev,
        pendingSync: false,
        lastSync: new Date(),
        syncErrors: []
      }));
      
      toast({
        title: "Sinkronisasi Berhasil",
        description: "Semua data stok telah disinkronisasi"
      });
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        pendingSync: false,
        syncErrors: [...prev.syncErrors, `Force sync error: ${error.message}`]
      }));
      
      toast({
        title: "Error Sinkronisasi",
        description: "Gagal sinkronisasi data: " + error.message,
        variant: "destructive"
      });
    }
  };

  return {
    syncStatus,
    forceSyncAll
  };
};
