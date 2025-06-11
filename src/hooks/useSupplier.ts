
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSupplier = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      // Get unique suppliers from barang_konsinyasi table
      const { data, error } = await supabase
        .from('barang_konsinyasi')
        .select('supplier')
        .not('supplier', 'is', null);
      
      if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
      }
      
      // Extract unique suppliers
      const uniqueSuppliers = [...new Set(data?.map(item => item.supplier).filter(Boolean))];
      return uniqueSuppliers.map((supplier, index) => ({
        id: `supplier-${index}`,
        nama: supplier
      }));
    },
  });
};
