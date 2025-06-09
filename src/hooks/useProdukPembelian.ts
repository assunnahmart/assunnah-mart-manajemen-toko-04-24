
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type ProdukPembelian = Tables<'produk_pembelian'>;
type ProdukPembelianInsert = TablesInsert<'produk_pembelian'>;
type ProdukPembelianUpdate = TablesUpdate<'produk_pembelian'>;

export const useProdukPembelian = () => {
  return useQuery({
    queryKey: ['produk_pembelian'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produk_pembelian')
        .select(`
          *,
          supplier (nama)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateProdukPembelian = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (produk: Omit<ProdukPembelianInsert, 'barcode'>) => {
      // Auto-generate barcode if not provided
      const { data: barcode, error: barcodeError } = await supabase
        .rpc('generate_purchase_product_barcode');
      
      if (barcodeError) throw barcodeError;
      
      const { data, error } = await supabase
        .from('produk_pembelian')
        .insert({
          ...produk,
          barcode: barcode as string
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produk_pembelian'] });
    },
  });
};

export const useUpdateProdukPembelian = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ProdukPembelianUpdate }) => {
      const { data, error } = await supabase
        .from('produk_pembelian')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produk_pembelian'] });
    },
  });
};

export const useDeleteProdukPembelian = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('produk_pembelian')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produk_pembelian'] });
    },
  });
};
