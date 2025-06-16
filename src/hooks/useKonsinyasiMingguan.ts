
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useKonsinyasiMingguan = () => {
  return useQuery({
    queryKey: ['konsinyasi_mingguan'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('konsinyasi_mingguan')
        .select(`
          *,
          supplier:supplier_id (nama),
          barang_konsinyasi:product_id (nama, stok_saat_ini, harga_jual)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

// Reuse suppliers hook from daily consignment for weekly
export const useKonsinyasiSuppliers = () => {
  return useQuery({
    queryKey: ['konsinyasi_suppliers_mingguan'],
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
      
      // Get suppliers that have weekly consignment products
      const suppliersWithProducts = await Promise.all(
        data.map(async (supplier) => {
          const { data: products, error: productsError } = await supabase
            .from('barang_konsinyasi')
            .select('id, nama, jenis_konsinyasi')
            .eq('supplier_id', supplier.id)
            .eq('jenis_konsinyasi', 'mingguan');
          
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
      
      // Filter suppliers that have at least one weekly consignment product
      return suppliersWithProducts.filter(supplier => 
        supplier.barang_konsinyasi && supplier.barang_konsinyasi.length > 0
      );
    },
  });
};

// Get weekly consignment products by supplier
export const useKonsinyasiProductsBySupplier = (supplierId: string) => {
  return useQuery({
    queryKey: ['konsinyasi_products_mingguan', supplierId],
    queryFn: async () => {
      if (!supplierId) return [];
      
      const { data, error } = await supabase
        .from('barang_konsinyasi')
        .select('*')
        .eq('supplier_id', supplierId)
        .eq('jenis_konsinyasi', 'mingguan')
        .order('nama');
      
      if (error) throw error;
      return data;
    },
    enabled: !!supplierId,
  });
};

// Get POS sales data for a product within a week range
export const usePOSSalesForProduct = (productId: string, startDate?: string) => {
  return useQuery({
    queryKey: ['pos_sales_mingguan', productId, startDate],
    queryFn: async () => {
      if (!productId || !startDate) return { totalSold: 0 };
      
      // Calculate end date (7 days from start date)
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      
      const startDateStr = start.toISOString().split('T')[0];
      const endDateStr = end.toISOString().split('T')[0];
      
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
        .gte('pos_transactions.created_at', `${startDateStr}T00:00:00`)
        .lte('pos_transactions.created_at', `${endDateStr}T23:59:59`);
      
      if (error) throw error;
      
      const totalSold = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      return { totalSold };
    },
    enabled: !!productId && !!startDate,
  });
};

export const useCreateKonsinyasiMingguan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating konsinyasi mingguan with data:', data);
      
      const { data: result, error } = await supabase
        .from('konsinyasi_mingguan')
        .insert([data])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log('Successfully created konsinyasi mingguan:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['konsinyasi_mingguan'] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });
};

export const useUpdateKonsinyasiMingguan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('konsinyasi_mingguan')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['konsinyasi_mingguan'] });
    },
  });
};
