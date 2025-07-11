
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Enhanced hook with pagination support for large datasets
export const useBarangKonsinyasi = (limit?: number, offset?: number) => {
  return useQuery({
    queryKey: ['barang-konsinyasi', limit, offset],
    queryFn: async () => {
      console.log('Fetching barang konsinyasi with limit:', limit, 'offset:', offset);
      
      let query = supabase
        .from('barang_konsinyasi')
        .select(`
          *,
          supplier!barang_konsinyasi_supplier_id_fkey (
            id,
            nama
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply pagination if specified
      if (limit && offset !== undefined) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching barang konsinyasi:', error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} products out of ${count || 0} total`);
      return { data: data || [], count: count || 0 };
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds for POS sync
  });
};

// Hook to get ALL products without pagination (for exports, reports, etc)
export const useAllBarangKonsinyasi = () => {
  return useQuery({
    queryKey: ['all-barang-konsinyasi'],
    queryFn: async () => {
      console.log('Fetching ALL barang konsinyasi products...');
      
      const { data, error, count } = await supabase
        .from('barang_konsinyasi')
        .select(`
          *,
          supplier!barang_konsinyasi_supplier_id_fkey (
            id,
            nama
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all barang konsinyasi:', error);
        throw error;
      }
      
      console.log(`Successfully fetched ALL ${data?.length || 0} products (total: ${count || 0})`);
      return { data: data || [], count: count || 0 };
    },
    refetchInterval: 10000, // Less frequent refresh for all data
    staleTime: 30000, // Keep data fresh for 30 seconds
  });
};

// Export alias for backward compatibility
export const useBarang = useBarangKonsinyasi;

export const useBarangStokRendah = () => {
  return useQuery({
    queryKey: ['barang-stok-rendah'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barang_konsinyasi')
        .select(`
          *,
          supplier!barang_konsinyasi_supplier_id_fkey (
            id,
            nama
          )
        `)
        .filter('stok_saat_ini', 'lte', 'stok_minimal')
        .eq('status', 'aktif')
        .order('nama');

      if (error) throw error;
      return data;
    },
    refetchInterval: 3000, // Frequent refresh for low stock alerts
  });
};

export const useCreateBarang = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('barang_konsinyasi')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      // Comprehensive cache invalidation for POS sync
      queryClient.invalidateQueries({ queryKey: ['barang-konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['all-barang-konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang-stok-rendah'] });
      queryClient.invalidateQueries({ queryKey: ['barang'] });
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['low_stock_products'] });
      
      // Emit custom event for POS system sync
      window.dispatchEvent(new CustomEvent('product-data-updated', {
        detail: { action: 'create' }
      }));
    },
  });
};

export const useUpdateBarang = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('barang_konsinyasi')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Comprehensive cache invalidation for POS sync
      queryClient.invalidateQueries({ queryKey: ['barang-konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['all-barang-konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang-stok-rendah'] });
      queryClient.invalidateQueries({ queryKey: ['barang'] });
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['low_stock_products'] });
      
      // Emit custom event for POS system sync
      window.dispatchEvent(new CustomEvent('product-data-updated', {
        detail: { action: 'update' }
      }));
    },
  });
};

export const useDeleteBarang = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('barang_konsinyasi')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Comprehensive cache invalidation for POS sync
      queryClient.invalidateQueries({ queryKey: ['barang-konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['all-barang-konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang-stok-rendah'] });
      queryClient.invalidateQueries({ queryKey: ['barang'] });
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['low_stock_products'] });
      
      // Emit custom event for POS system sync
      window.dispatchEvent(new CustomEvent('product-data-updated', {
        detail: { action: 'delete' }
      }));
    },
  });
};

// Enhanced hook for POS system usage with real-time updates
export const usePOSBarangKonsinyasi = () => {
  return useQuery({
    queryKey: ['pos-barang-konsinyasi'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barang_konsinyasi')
        .select(`
          *,
          supplier!barang_konsinyasi_supplier_id_fkey (
            id,
            nama
          )
        `)
        .eq('status', 'aktif')
        .gt('stok_saat_ini', 0)
        .order('nama');

      if (error) throw error;
      return data;
    },
    refetchInterval: 2000, // Very frequent refresh for POS active use
  });
};

// Alias exports for compatibility
export const useCreateBarangKonsinyasi = useCreateBarang;
export const useUpdateBarangKonsinyasi = useUpdateBarang;
export const useDeleteBarangKonsinyasi = useDeleteBarang;
