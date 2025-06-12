
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Supplier = Tables<'supplier'>;
type SupplierInsert = TablesInsert<'supplier'>;
type SupplierUpdate = TablesUpdate<'supplier'>;

export const useSupplier = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier')
        .select('*')
        .order('nama');
      
      if (error) throw error;
      return data as Supplier[];
    },
  });
};

export const useBarangWithSupplier = () => {
  return useQuery({
    queryKey: ['barang_with_supplier'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barang_konsinyasi')
        .select(`
          *,
          supplier!supplier_id(
            id,
            nama
          )
        `)
        .order('nama');
      
      if (error) throw error;
      return data;
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
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['barang_with_supplier'] });
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
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['barang_with_supplier'] });
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
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['barang_with_supplier'] });
    },
  });
};
