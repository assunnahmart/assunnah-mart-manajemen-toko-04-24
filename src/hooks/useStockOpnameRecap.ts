
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      // Get current system stock
      const { data: barang, error: barangError } = await supabase
        .from('barang_konsinyasi')
        .select('stok_saat_ini')
        .eq('id', barang_id)
        .single();
      
      if (barangError) throw barangError;
      
      const stok_sistem = barang.stok_saat_ini;
      const selisih = stok_fisik - stok_sistem;
      
      // Insert stock opname record
      const { error: insertError } = await supabase
        .from('stok_opname')
        .insert({
          barang_id,
          stok_sistem,
          stok_fisik,
          selisih,
          kasir_id,
          tanggal_opname: new Date().toISOString().split('T')[0],
          keterangan,
          status: 'approved'
        });
      
      if (insertError) throw insertError;
      
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate related queries for immediate sync
      queryClient.invalidateQueries({ queryKey: ['stock_opname_realtime'] });
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['stock_opname'] });
    },
  });
};
