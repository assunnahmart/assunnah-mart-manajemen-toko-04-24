
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CreateStockOpnameParams {
  barang_id: string;
  stok_fisik: number;
  kasir_id: string;
  keterangan?: string;
}

export const useCreateNewStokOpname = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: CreateStockOpnameParams) => {
      const { barang_id, stok_fisik, kasir_id, keterangan } = params;
      
      // Get current product data to calculate selisih
      const { data: productData, error: productError } = await supabase
        .from('barang_konsinyasi')
        .select('stok_saat_ini')
        .eq('id', barang_id)
        .single();
      
      if (productError) {
        console.error('Error fetching product data:', productError);
        throw new Error('Gagal mengambil data produk: ' + productError.message);
      }
      
      const stok_sistem = productData.stok_saat_ini || 0;
      const selisih = stok_sistem - stok_fisik;
      
      // Insert stock opname record - using correct table name 'stok_opname'
      const { data: stockOpnameData, error: stockOpnameError } = await supabase
        .from('stok_opname')
        .insert({
          barang_id,
          stok_sistem,
          stok_fisik,
          selisih,
          kasir_id,
          keterangan: keterangan || 'Input stok tambahan',
          tanggal_opname: new Date().toISOString().split('T')[0] // Use correct field name and date format
        })
        .select()
        .single();
      
      if (stockOpnameError) {
        console.error('Error creating stock opname:', stockOpnameError);
        throw new Error('Gagal menyimpan data stock opname: ' + stockOpnameError.message);
      }
      
      return stockOpnameData;
    },
    onSuccess: () => {
      // Invalidate related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['stock_opname'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['stock_opname_recap'] });
    },
    onError: (error) => {
      console.error('Stock opname creation failed:', error);
    }
  });
};
