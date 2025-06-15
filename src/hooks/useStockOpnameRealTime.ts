
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStockOpnameRealTime = () => {
  return useQuery({
    queryKey: ['stock-opname-realtime'],
    queryFn: async () => {
      console.log('Fetching real-time stock opname data');
      
      const { data, error } = await supabase
        .from('stok_opname')
        .select(`
          *,
          produk_pembelian!inner(nama_produk, satuan, stok_saat_ini),
          kasir(nama)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching real-time stock opname:', error);
        throw error;
      }
      
      console.log('Real-time stock opname data:', data);
      return data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });
};
