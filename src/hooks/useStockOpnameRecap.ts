
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStockOpnameRecap = (dateFrom?: string, dateTo?: string) => {
  return useQuery({
    queryKey: ['stock-opname-recap', dateFrom, dateTo],
    queryFn: async () => {
      console.log('Fetching stock opname recap with dates:', { dateFrom, dateTo });
      
      let query = supabase
        .from('stock_opname_recap')
        .select('*');
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching stock opname recap:', error);
        throw error;
      }
      
      console.log('Stock opname recap data:', data);
      return data;
    },
  });
};
