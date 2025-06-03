
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStockData = () => {
  return useQuery({
    queryKey: ['stock_data'],
    queryFn: async () => {
      const { data: barang, error } = await supabase
        .from('barang_konsinyasi')
        .select(`
          *,
          supplier!supplier_id(nama),
          kategori_barang(nama)
        `)
        .order('nama');
      
      if (error) throw error;
      
      return barang;
    },
    refetchInterval: 30000, // Refresh every 30 seconds to sync with POS transactions
  });
};

export const useStockOpname = () => {
  return useQuery({
    queryKey: ['stock_opname'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stok_opname')
        .select(`
          *,
          barang_konsinyasi(nama, satuan),
          kasir(nama)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data;
    },
  });
};

export const useStockMutations = () => {
  return useQuery({
    queryKey: ['stock_mutations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mutasi_stok')
        .select(`
          *,
          barang_konsinyasi(nama, satuan)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      return data;
    },
    refetchInterval: 10000, // Refresh frequently to show POS transactions
  });
};

export const useCreateStockOpname = () => {
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
      // Call the database function
      const { error } = await supabase.rpc('update_stok_from_opname', {
        p_barang_id: barang_id,
        p_stok_fisik: stok_fisik,
        p_kasir_id: kasir_id,
        p_keterangan: keterangan
      });
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['stock_opname'] });
      queryClient.invalidateQueries({ queryKey: ['stock_mutations'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang'] });
    },
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      barang_id, 
      stok_baru,
      keterangan 
    }: { 
      barang_id: string; 
      stok_baru: number;
      keterangan?: string; 
    }) => {
      // Get current stock first
      const { data: currentStock, error: stockError } = await supabase
        .from('barang_konsinyasi')
        .select('stok_saat_ini')
        .eq('id', barang_id)
        .single();
      
      if (stockError) throw stockError;
      
      const stok_lama = currentStock.stok_saat_ini;
      const selisih = stok_baru - stok_lama;
      
      // Update stock
      const { error: updateError } = await supabase
        .from('barang_konsinyasi')
        .update({ 
          stok_saat_ini: stok_baru,
          updated_at: new Date().toISOString()
        })
        .eq('id', barang_id);
      
      if (updateError) throw updateError;
      
      // Record mutation
      const { error: mutationError } = await supabase
        .from('mutasi_stok')
        .insert({
          barang_id,
          jenis_mutasi: selisih > 0 ? 'masuk' : 'keluar',
          jumlah: Math.abs(selisih),
          stok_sebelum: stok_lama,
          stok_sesudah: stok_baru,
          referensi_tipe: 'manual_adjustment',
          keterangan: keterangan || 'Manual stock adjustment'
        });
      
      if (mutationError) throw mutationError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['stock_mutations'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang'] });
    },
  });
};

export const useLowStockProducts = () => {
  return useQuery({
    queryKey: ['low_stock_products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barang_konsinyasi')
        .select(`
          *,
          supplier!supplier_id(nama)
        `)
        .filter('stok_saat_ini', 'lte', 'stok_minimal')
        .order('stok_saat_ini', { ascending: true });
      
      if (error) throw error;
      
      return data;
    },
    refetchInterval: 30000, // Refresh to catch low stock from POS sales
  });
};

// New hook for real-time stock synchronization
export const usePOSStockSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionItems: any[]) => {
      // This will be called when POS transactions complete
      for (const item of transactionItems) {
        await supabase.rpc('update_stok_barang', {
          barang_id: item.product_id,
          jumlah_keluar: item.quantity
        });
      }
    },
    onSuccess: () => {
      // Invalidate all stock-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['stock_mutations'] });
      queryClient.invalidateQueries({ queryKey: ['low_stock_products'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang'] });
    },
  });
};
