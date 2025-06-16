
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Zap } from 'lucide-react';

interface POSProductSyncProps {
  children: React.ReactNode;
}

const POSProductSync = ({ children }: POSProductSyncProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    let productChannel: any = null;
    const channelId = `pos-product-sync-${Date.now()}-${Math.random()}`;

    // Listen for product data updates from the Data Produk page
    const handleProductDataUpdate = (event: CustomEvent) => {
      const { action } = event.detail;
      
      console.log('POS Product Sync: Product data updated', action);
      
      // Invalidate all product-related queries in POS
      queryClient.invalidateQueries({ queryKey: ['barang-konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['pos-barang-konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang'] });
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      
      toast({
        title: "Data produk tersinkronisasi",
        description: `Perubahan data produk berhasil disinkronkan dengan POS System`,
        duration: 3000
      });
    };

    // Setup real-time subscription for product changes
    const setupProductSync = () => {
      productChannel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'barang_konsinyasi'
          },
          (payload) => {
            console.log('POS Product Sync: Real-time product change detected', payload);
            
            // Invalidate product queries to refresh POS data
            queryClient.invalidateQueries({ queryKey: ['barang-konsinyasi'] });
            queryClient.invalidateQueries({ queryKey: ['pos-barang-konsinyasi'] });
            queryClient.invalidateQueries({ queryKey: ['barang'] });
            queryClient.invalidateQueries({ queryKey: ['stock_data'] });
            queryClient.invalidateQueries({ queryKey: ['low_stock_products'] });
            
            // Show sync notification
            if (payload.eventType === 'INSERT') {
              toast({
                title: "Produk baru ditambahkan",
                description: `${payload.new?.nama} berhasil ditambahkan ke sistem`,
                duration: 3000
              });
            } else if (payload.eventType === 'UPDATE') {
              const oldStock = payload.old?.stok_saat_ini;
              const newStock = payload.new?.stok_saat_ini;
              
              if (oldStock !== newStock) {
                toast({
                  title: "Stok produk diperbarui",
                  description: `${payload.new?.nama}: ${oldStock} → ${newStock}`,
                  duration: 3000
                });
              } else {
                toast({
                  title: "Data produk diperbarui",
                  description: `${payload.new?.nama} berhasil diperbarui`,
                  duration: 3000
                });
              }
            } else if (payload.eventType === 'DELETE') {
              toast({
                title: "Produk dihapus",
                description: `Produk berhasil dihapus dari sistem`,
                duration: 3000
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'produk_pembelian'
          },
          (payload) => {
            console.log('POS Product Sync: Produk pembelian change detected', payload);
            
            // Sync with barang_konsinyasi when produk_pembelian changes
            queryClient.invalidateQueries({ queryKey: ['barang-konsinyasi'] });
            queryClient.invalidateQueries({ queryKey: ['pos-barang-konsinyasi'] });
            
            if (payload.eventType === 'INSERT') {
              toast({
                title: "Produk pembelian baru",
                description: `${payload.new?.nama_produk} tersedia di POS`,
                duration: 3000
              });
            }
          }
        )
        .subscribe();
    };

    // Listen for custom product update events
    window.addEventListener('product-data-updated', handleProductDataUpdate as EventListener);
    
    // Setup real-time sync
    setupProductSync();

    return () => {
      window.removeEventListener('product-data-updated', handleProductDataUpdate as EventListener);
      if (productChannel) {
        supabase.removeChannel(productChannel);
      }
    };
  }, [queryClient, toast]);

  return (
    <>
      {children}
      <ProductSyncIndicator />
    </>
  );
};

const ProductSyncIndicator = () => {
  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 bg-blue-50 border-blue-200">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-full bg-blue-100">
            <Database className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-blue-900">Sinkronisasi Produk Aktif</h4>
              <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Real-time
              </Badge>
            </div>
            <p className="text-xs text-blue-600">
              Data produk tersinkronisasi otomatis dengan POS System
            </p>
          </div>
          <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
        </div>
      </CardContent>
    </Card>
  );
};

export default POSProductSync;
