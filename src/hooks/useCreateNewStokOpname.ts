
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      console.log('Creating new stock opname with data:', {
        barang_id,
        stok_fisik,
        kasir_id,
        keterangan
      });
      
      // Get current system stock
      const { data: currentStock, error: stockError } = await supabase
        .from('produk_pembelian')
        .select('stok_saat_ini')
        .eq('id', barang_id)
        .single();
      
      if (stockError) {
        console.error('Error getting current stock:', stockError);
        throw stockError;
      }
      
      // Insert new stock opname record
      const { data, error } = await supabase
        .from('stok_opname')
        .insert({
          barang_id,
          stok_sistem: currentStock.stok_saat_ini,
          stok_fisik,
          kasir_id,
          keterangan,
          tanggal_opname: new Date().toISOString().split('T')[0],
          status: 'approved'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating stock opname:', error);
        throw error;
      }
      
      console.log('Stock opname created successfully:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate all related queries for immediate sync
      queryClient.invalidateQueries({ queryKey: ['stock-opname-recap'] });
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['stock_opname'] });
    },
  });
};
