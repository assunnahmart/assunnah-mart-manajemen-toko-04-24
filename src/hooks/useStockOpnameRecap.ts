
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StockOpnameRecapItem {
  barang_id: string;
  nama_barang: string;
  satuan: string;
  harga_beli?: number;
  stok_sistem: number;
  real_stok_total: number;
  jumlah_pengguna_input: number;
  selisih_stok: number;
  kategori_selisih: string;
  detail_input_pengguna: Array<{
    nama_kasir: string;
    stok_fisik: number;
    tanggal_opname: string;
    keterangan?: string;
    kasir_id: string;
  }>;
}

export const useStockOpnameRecap = (dateFrom?: string, dateTo?: string) => {
  return useQuery({
    queryKey: ['stock_opname_recap', dateFrom, dateTo],
    queryFn: async () => {
      console.log('Fetching stock opname recap with dates:', { dateFrom, dateTo });
      
      try {
        // Get recap data from function
        const { data: recapData, error: recapError } = await supabase.rpc('get_stock_opname_recap', {
          date_from: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          date_to: dateTo || new Date().toISOString().split('T')[0]
        });
        
        if (recapError) {
          console.error('Stock opname recap RPC error:', recapError);
          throw new Error(`Database error: ${recapError.message}`);
        }

        // Get product data with purchase prices
        const productIds = recapData?.map(item => item.barang_id) || [];
        
        if (productIds.length > 0) {
          const { data: productData, error: productError } = await supabase
            .from('barang_konsinyasi')
            .select('id, harga_beli')
            .in('id', productIds);

          if (productError) {
            console.error('Product data error:', productError);
            // Continue without purchase price data
          }

          // Merge recap data with purchase prices
          const enrichedData = recapData?.map(item => {
            const product = productData?.find(p => p.id === item.barang_id);
            return {
              ...item,
              harga_beli: product?.harga_beli || 0
            };
          });

          console.log('Stock opname recap RPC success, data length:', enrichedData?.length || 0);
          console.log('Sample data:', enrichedData?.[0]);
          return enrichedData as StockOpnameRecapItem[];
        }
        
        console.log('Stock opname recap RPC success, data length:', recapData?.length || 0);
        console.log('Sample data:', recapData?.[0]);
        return recapData as StockOpnameRecapItem[];
      } catch (error) {
        console.error('Stock opname recap fetch error:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });
};

export const useStockOpnameRecapView = () => {
  return useQuery({
    queryKey: ['stock_opname_recap_view'],
    queryFn: async () => {
      console.log('Fetching stock opname recap from view');
      
      try {
        const { data, error } = await supabase
          .from('stock_opname_recap')
          .select('*');
        
        if (error) {
          console.error('Stock opname recap view error:', error);
          throw new Error(`View error: ${error.message}`);
        }
        
        console.log('Stock opname recap view success, data length:', data?.length || 0);
        return data as StockOpnameRecapItem[];
      } catch (error) {
        console.error('Stock opname recap view fetch error:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// New hook for real-time stock opname monitoring
export const useStockOpnameRealTime = () => {
  return useQuery({
    queryKey: ['stock_opname_realtime'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's stock opname entries
      const { data: opnameData, error: opnameError } = await supabase
        .from('stok_opname')
        .select(`
          *,
          barang_konsinyasi(nama, satuan, stok_saat_ini),
          kasir(nama)
        `)
        .eq('tanggal_opname', today)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (opnameError) {
        console.error('Error fetching stock opname data:', opnameError);
        throw opnameError;
      }
      
      // Calculate summary
      const totalItems = opnameData?.length || 0;
      const totalVariance = opnameData?.reduce((sum, item) => sum + Math.abs(item.selisih || 0), 0) || 0;
      const itemsWithVariance = opnameData?.filter(item => (item.selisih || 0) !== 0).length || 0;
      
      return {
        todayOpname: opnameData || [],
        summary: {
          totalItems,
          totalVariance,
          itemsWithVariance,
          accuracyRate: totalItems > 0 ? ((totalItems - itemsWithVariance) / totalItems * 100).toFixed(1) : '100'
        }
      };
    },
    refetchInterval: 10000, // Refresh every 10 seconds for real-time monitoring
  });
};
