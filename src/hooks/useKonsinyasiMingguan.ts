
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Use konsinyasi_harian table but with a naming convention to identify weekly records
export const useKonsinyasiMingguan = () => {
  return useQuery({
    queryKey: ['konsinyasi_mingguan'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('konsinyasi_harian')
        .select(`
          *,
          supplier:supplier_id (nama),
          barang_konsinyasi:product_id (nama, stok_saat_ini, harga_jual)
        `)
        .ilike('keterangan', '%MINGGUAN%') // Filter weekly records by keterangan field
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match expected structure
      return data?.map(item => ({
        id: item.id,
        minggu_mulai: item.created_at.split('T')[0], // Use created_at as start date
        minggu_selesai: item.updated_at ? item.updated_at.split('T')[0] : item.created_at.split('T')[0], // Use updated_at as end date
        supplier_name: item.supplier?.nama || '',
        product_name: item.barang_konsinyasi?.nama || '',
        jumlah_titipan: item.jumlah_titipan,
        jumlah_terjual_sistem: item.jumlah_terjual_sistem,
        jumlah_real_terjual: item.jumlah_real_terjual || 0,
        sisa_stok: item.sisa_stok || 0,
        selisih_stok: item.selisih_stok || 0,
        total_pembayaran: item.total_pembayaran || 0,
        status: item.status || 'pending',
        harga_satuan: item.barang_konsinyasi?.harga_jual || 0
      })) || [];
    },
  });
};

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
      
      return suppliersWithProducts.filter(supplier => 
        supplier.barang_konsinyasi && supplier.barang_konsinyasi.length > 0
      );
    },
  });
};

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

export const usePOSSalesForProduct = (productId: string, startDate?: string) => {
  return useQuery({
    queryKey: ['pos_sales_mingguan', productId, startDate],
    queryFn: async () => {
      if (!productId || !startDate) return { totalSold: 0 };
      
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
      
      // Use konsinyasi_harian table with weekly identifier in keterangan
      const weeklyData = {
        supplier_id: data.supplier_id,
        product_id: data.product_id,
        supplier_name: data.supplier_name,
        product_name: data.product_name,
        jumlah_titipan: data.jumlah_titipan,
        jumlah_terjual_sistem: data.jumlah_terjual_sistem,
        jumlah_real_terjual: data.jumlah_real_terjual,
        sisa_stok: data.sisa_stok,
        selisih_stok: data.selisih_stok,
        total_pembayaran: data.total_pembayaran,
        status: data.status,
        keterangan: `MINGGUAN - ${data.supplier_name} - ${data.product_name} - Periode: ${data.minggu_mulai} s/d ${data.minggu_selesai}`,
        kasir_id: 'system',
        kasir_name: 'System',
        harga_beli: 0
      };
      
      const { data: result, error } = await supabase
        .from('konsinyasi_harian')
        .insert(weeklyData)
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
        .from('konsinyasi_harian')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['konsinyasi_mingguan'] });
    },
  });
};
