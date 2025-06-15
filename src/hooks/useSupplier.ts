
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Supplier = Tables<'supplier'>;
type SupplierInsert = TablesInsert<'supplier'>;
type SupplierUpdate = TablesUpdate<'supplier'>;

export const useSupplier = () => {
  return useQuery({
    queryKey: ['supplier'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier')
        .select('*')
        .order('nama');
      
      if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
      }
      
      console.log('Fetched suppliers:', data);
      return data || [];
    },
  });
};

export const useBarangWithSupplier = () => {
  return useQuery({
    queryKey: ['barang-with-supplier'],
    queryFn: async () => {
      // Fix: Use specific relationship name to avoid ambiguity
      const { data, error } = await supabase
        .from('barang_konsinyasi')
        .select(`
          *,
          supplier!barang_konsinyasi_supplier_id_fkey (
            id,
            nama
          )
        `)
        .order('nama');
      
      if (error) {
        console.error('Error fetching barang with supplier:', error);
        throw error;
      }
      
      console.log('Fetched barang with supplier:', data);
      return data || [];
    },
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (supplier: SupplierInsert) => {
      const { data, error } = await supabase
        .from('supplier')
        .insert(supplier)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier'] });
      queryClient.invalidateQueries({ queryKey: ['barang-with-supplier'] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: SupplierUpdate }) => {
      const { data, error } = await supabase
        .from('supplier')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier'] });
      queryClient.invalidateQueries({ queryKey: ['barang-with-supplier'] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('supplier')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier'] });
      queryClient.invalidateQueries({ queryKey: ['barang-with-supplier'] });
    },
  });
};
