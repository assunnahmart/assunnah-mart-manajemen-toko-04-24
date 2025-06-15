
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
      
      // Check if there are existing stock opname entries for this product today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingEntries, error: existingError } = await supabase
        .from('stok_opname')
        .select('*')
        .eq('barang_id', barang_id)
        .eq('tanggal_opname', today)
        .eq('status', 'approved');
      
      if (existingError) {
        console.error('Error checking existing entries:', existingError);
        throw new Error('Gagal memeriksa data stock opname: ' + existingError.message);
      }
      
      // Calculate total physical stock from all existing entries plus the new one
      const existingTotalStokFisik = existingEntries?.reduce((sum, entry) => sum + entry.stok_fisik, 0) || 0;
      const newTotalStokFisik = existingTotalStokFisik + stok_fisik;
      const selisih = stok_sistem - newTotalStokFisik;
      
      // Insert the new stock opname record
      const { data: stockOpnameData, error: stockOpnameError } = await supabase
        .from('stok_opname')
        .insert({
          barang_id,
          stok_sistem,
          stok_fisik,
          selisih: stok_sistem - stok_fisik, // Individual selisih for this entry
          kasir_id,
          keterangan: keterangan || 'Input stok tambahan',
          tanggal_opname: today,
          status: 'approved'
        })
        .select()
        .single();
      
      if (stockOpnameError) {
        console.error('Error creating stock opname:', stockOpnameError);
        throw new Error('Gagal menyimpan data stock opname: ' + stockOpnameError.message);
      }
      
      console.log('Stock opname created successfully:', {
        individual_entry: stockOpnameData,
        total_physical_stock: newTotalStokFisik,
        system_stock: stok_sistem,
        combined_selisih: selisih
      });
      
      return {
        ...stockOpnameData,
        combined_physical_stock: newTotalStokFisik,
        combined_selisih: selisih
      };
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
