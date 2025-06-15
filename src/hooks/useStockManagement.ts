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
          supplier!barang_konsinyasi_supplier_id_fkey(nama),
          kategori_barang(nama)
        `)
        .order('nama');
      
      if (error) throw error;
      
      return barang;
    },
    refetchInterval: 5000, // Refresh every 5 seconds for real-time sync with opname
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
          barang_konsinyasi(nama, satuan, harga_beli),
          kasir(nama)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data;
    },
    refetchInterval: 3000, // Frequent refresh for opname data
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
    refetchInterval: 3000, // Refresh frequently for real-time sync
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
      // Invalidate all related queries for immediate sync across all tabs
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['stock_opname'] });
      queryClient.invalidateQueries({ queryKey: ['stock_mutations'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang-konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang'] });
      queryClient.invalidateQueries({ queryKey: ['low_stock_products'] });
      queryClient.invalidateQueries({ queryKey: ['stock_opname_recap'] });
      queryClient.invalidateQueries({ queryKey: ['pos_transactions_today'] });
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
      // Invalidate all related queries for immediate sync across all tabs
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['stock_mutations'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang-konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang'] });
      queryClient.invalidateQueries({ queryKey: ['low_stock_products'] });
      queryClient.invalidateQueries({ queryKey: ['stock_opname_recap'] });
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
          supplier!barang_konsinyasi_supplier_id_fkey(nama)
        `)
        .filter('stok_saat_ini', 'lte', 'stok_minimal')
        .order('stok_saat_ini', { ascending: true });
      
      if (error) throw error;
      
      return data;
    },
    refetchInterval: 5000, // Refresh to catch low stock from stock opname
  });
};

// Enhanced hook for real-time stock synchronization with POS and Stock Opname
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
      // Invalidate all stock-related queries to refresh data immediately
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['stock_mutations'] });
      queryClient.invalidateQueries({ queryKey: ['low_stock_products'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang-konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang'] });
      queryClient.invalidateQueries({ queryKey: ['stock_opname_recap'] });
    },
  });
};

// New hook for comprehensive sync status including stock opname
export const useStockSyncStatus = () => {
  return useQuery({
    queryKey: ['stock_sync_status'],
    queryFn: async () => {
      // Get today's data
      const today = new Date().toISOString().split('T')[0];
      
      const { data: posTransactions, error: posError } = await supabase
        .from('pos_transactions')
        .select('id')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .eq('status', 'completed');
      
      if (posError) throw posError;
      
      const { data: stockMutations, error: mutationError } = await supabase
        .from('mutasi_stok')
        .select('id')
        .eq('referensi_tipe', 'penjualan')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);
      
      if (mutationError) throw mutationError;

      const { data: stockOpname, error: opnameError } = await supabase
        .from('stok_opname')
        .select('id')
        .eq('tanggal_opname', today)
        .eq('status', 'approved');
      
      if (opnameError) throw opnameError;
      
      return {
        posTransactionsCount: posTransactions?.length || 0,
        stockMutationsCount: stockMutations?.length || 0,
        stockOpnameCount: stockOpname?.length || 0,
        isSynced: (posTransactions?.length || 0) === (stockMutations?.length || 0),
        lastSyncTime: new Date()
      };
    },
    refetchInterval: 3000, // Check sync status frequently
  });
};

// Delete mutation function
export const useDeleteStockMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mutasi_stok')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_mutations'] });
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
    },
  });
};

// Edit mutation function
export const useEditStockMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, keterangan }: { id: string; keterangan: string }) => {
      const { error } = await supabase
        .from('mutasi_stok')
        .update({ keterangan })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_mutations'] });
    },
  });
};

// Delete stock opname function
export const useDeleteStockOpname = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stok_opname')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_opname'] });
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['stock_opname_recap'] });
    },
  });
};

// Edit stock opname function
export const useEditStockOpname = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, stok_fisik, keterangan }: { id: string; stok_fisik: number; keterangan?: string }) => {
      const { error } = await supabase
        .from('stok_opname')
        .update({ stok_fisik, keterangan })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_opname'] });
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['stock_opname_recap'] });
    },
  });
};
