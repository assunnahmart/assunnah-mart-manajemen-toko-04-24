
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StockOpnameRecapItem {
  barang_id: string;
  nama_barang: string;
  satuan: string;
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
        const { data, error } = await supabase.rpc('get_stock_opname_recap', {
          date_from: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          date_to: dateTo || new Date().toISOString().split('T')[0]
        });
        
        if (error) {
          console.error('Stock opname recap RPC error:', error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        console.log('Stock opname recap RPC success, data length:', data?.length || 0);
        console.log('Sample data:', data?.[0]);
        return data as StockOpnameRecapItem[];
      } catch (error) {
        console.error('Stock opname recap fetch error:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
  });
};
