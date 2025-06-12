
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StockOpnameRecapItem {
  barang_id: string;
  nama_barang: string;
  satuan: string;
  stok_sistem: number;
  real_stok_total: number;
  selisih_stok: number;
  jumlah_pengguna_input: number;
  harga_beli?: number;
  detail_input_pengguna?: Array<{
    nama_kasir: string;
    stok_fisik: number;
    tanggal_opname: string;
    keterangan?: string;
  }>;
}

export const useStockOpnameRecap = (dateFrom: string, dateTo: string) => {
  return useQuery({
    queryKey: ['stock_opname_recap', dateFrom, dateTo],
    queryFn: async (): Promise<StockOpnameRecapItem[]> => {
      console.log('Fetching stock opname recap for period:', { dateFrom, dateTo });
      
      const { data, error } = await supabase
        .from('stock_opname_recap')
        .select(`
          barang_id,
          nama_barang,
          satuan,
          stok_sistem,
          real_stok_total,
          selisih_stok,
          jumlah_pengguna_input,
          detail_input_pengguna
        `);
      
      if (error) {
        console.error('Error fetching stock opname recap:', error);
        throw error;
      }
      
      // Transform the data to match our interface
      const transformedData: StockOpnameRecapItem[] = (data || []).map(item => ({
        ...item,
        detail_input_pengguna: Array.isArray(item.detail_input_pengguna) 
          ? item.detail_input_pengguna as Array<{
              nama_kasir: string;
              stok_fisik: number;
              tanggal_opname: string;
              keterangan?: string;
            }>
          : []
      }));
      
      return transformedData;
    },
    enabled: !!dateFrom && !!dateTo,
  });
};

export const useStockOpnameRealTime = () => {
  return useQuery({
    queryKey: ['stock_opname_realtime'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's stock opname data
      const { data: todayOpname, error: opnameError } = await supabase
        .from('stok_opname')
        .select(`
          *,
          barang_konsinyasi(nama, satuan),
          kasir(nama)
        `)
        .eq('tanggal_opname', today)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (opnameError) throw opnameError;

      // Calculate summary statistics
      const totalItems = todayOpname?.length || 0;
      const totalVariance = todayOpname?.reduce((sum, item) => {
        return sum + Math.abs(item.selisih || 0);
      }, 0) || 0;
      
      // Calculate accuracy rate
      const perfectMatches = todayOpname?.filter(item => (item.selisih || 0) === 0).length || 0;
      const accuracyRate = totalItems > 0 ? ((perfectMatches / totalItems) * 100).toFixed(1) : '100';

      return {
        todayOpname,
        summary: {
          totalItems,
          totalVariance,
          accuracyRate
        }
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useCreateNewStokOpname = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      barang_id, 
      stok_fisik, 
      kasir_id, 
      keterangan 
    }: { 
      barang_id: string; 
      stok_fisik: number; 
      kasir_id: string; 
      keterangan?: string; 
    }) => {
      console.log('Creating new stock opname:', { barang_id, stok_fisik, kasir_id, keterangan });
      
      // Get current system stock
      const { data: barang, error: barangError } = await supabase
        .from('barang_konsinyasi')
        .select('stok_saat_ini')
        .eq('id', barang_id)
        .single();
      
      if (barangError) {
        console.error('Error fetching barang:', barangError);
        throw barangError;
      }
      
      const stok_sistem = barang.stok_saat_ini;
      
      // Insert stock opname record without selisih - let database calculate it
      const { error: insertError } = await supabase
        .from('stok_opname')
        .insert({
          barang_id,
          stok_sistem,
          stok_fisik,
          kasir_id,
          tanggal_opname: new Date().toISOString().split('T')[0],
          keterangan,
          status: 'approved'
          // Note: not inserting selisih - let database calculate it automatically
        });
      
      if (insertError) {
        console.error('Error inserting stock opname:', insertError);
        throw insertError;
      }
      
      console.log('Stock opname created successfully');
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate related queries for immediate sync
      queryClient.invalidateQueries({ queryKey: ['stock_opname_realtime'] });
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['stock_opname'] });
      queryClient.invalidateQueries({ queryKey: ['stock_opname_recap'] });
    },
  });
};
