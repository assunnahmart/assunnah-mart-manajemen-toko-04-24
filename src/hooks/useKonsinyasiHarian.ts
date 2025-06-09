import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useKonsinyasiHarian = () => {
  return useQuery({
    queryKey: ['konsinyasi_harian'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('konsinyasi_harian')
        .select(`
          *,
          supplier:supplier_id (nama),
          barang_konsinyasi:product_id (nama, stok_saat_ini)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

// Fixed hook to get suppliers with daily consignment products
export const useKonsinyasiSuppliers = () => {
  return useQuery({
    queryKey: ['konsinyasi_suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier')
        .select(`
          id,
          nama,
          alamat,
          telepon,
          email,
          jenis,
          created_at
        `)
        .order('nama');
      
      if (error) throw error;
      
      // Get suppliers that have daily consignment products
      const suppliersWithProducts = await Promise.all(
        data.map(async (supplier) => {
          const { data: products, error: productsError } = await supabase
            .from('barang_konsinyasi')
            .select('id, nama, jenis_konsinyasi')
            .eq('supplier_id', supplier.id)
            .eq('jenis_konsinyasi', 'harian');
          
          if (productsError) {
            console.error('Error fetching products for supplier:', supplier.id, productsError);
            return { ...supplier, barang_konsinyasi: [] };
          }
          
          return {
            ...supplier,
            barang_konsinyasi: products || []
          };
        })
      );
      
      // Filter suppliers that have at least one daily consignment product
      return suppliersWithProducts.filter(supplier => 
        supplier.barang_konsinyasi && supplier.barang_konsinyasi.length > 0
      );
    },
  });
};

// New hook to get daily consignment products by supplier
export const useKonsinyasiProductsBySupplier = (supplierId: string) => {
  return useQuery({
    queryKey: ['konsinyasi_products', supplierId],
    queryFn: async () => {
      if (!supplierId) return [];
      
      const { data, error } = await supabase
        .from('barang_konsinyasi')
        .select('*')
        .eq('supplier_id', supplierId)
        .eq('jenis_konsinyasi', 'harian')
        .order('nama');
      
      if (error) throw error;
      return data;
    },
    enabled: !!supplierId,
  });
};

// New hook to get POS sales data for a product
export const usePOSSalesForProduct = (productId: string, date?: string) => {
  return useQuery({
    queryKey: ['pos_sales', productId, date],
    queryFn: async () => {
      if (!productId) return { totalSold: 0 };
      
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('pos_transaction_items')
        .select(`
          quantity,
          pos_transactions!inner (
            created_at,
            status
          )
        `)
        .eq('product_id', productId)
        .eq('pos_transactions.status', 'completed')
        .gte('pos_transactions.created_at', `${targetDate}T00:00:00`)
        .lt('pos_transactions.created_at', `${targetDate}T23:59:59`);
      
      if (error) throw error;
      
      const totalSold = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      return { totalSold };
    },
    enabled: !!productId,
  });
};

export const useCreateKonsinyasiHarian = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating konsinyasi harian with data:', data);
      
      const { data: result, error } = await supabase
        .from('konsinyasi_harian')
        .insert([data])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log('Successfully created konsinyasi:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['konsinyasi_harian'] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });
};

export const useUpdateKonsinyasiHarian = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('konsinyasi_harian')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['konsinyasi_harian'] });
    },
  });
};
