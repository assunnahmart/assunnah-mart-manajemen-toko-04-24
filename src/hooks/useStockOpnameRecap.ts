
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
      
      const { data, error } = await supabase.rpc('get_stock_opname_recap', {
        date_from: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        date_to: dateTo || new Date().toISOString().split('T')[0]
      });
      
      if (error) {
        console.error('Stock opname recap error:', error);
        throw error;
      }
      
      console.log('Stock opname recap data:', data);
      return data as StockOpnameRecapItem[];
    },
  });
};

export const useStockOpnameRecapView = () => {
  return useQuery({
    queryKey: ['stock_opname_recap_view'],
    queryFn: async () => {
      console.log('Fetching stock opname recap from view');
      
      const { data, error } = await supabase
        .from('stock_opname_recap')
        .select('*');
      
      if (error) {
        console.error('Stock opname recap view error:', error);
        throw error;
      }
      
      console.log('Stock opname recap view data:', data);
      return data as StockOpnameRecapItem[];
    },
  });
};
