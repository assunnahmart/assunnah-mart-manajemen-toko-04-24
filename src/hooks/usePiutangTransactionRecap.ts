
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePiutangTransactionRecap = (
  customerName?: string,
  startDate?: string,
  endDate?: string,
  referenceNumber?: string
) => {
  return useQuery({
    queryKey: ['piutang-transaction-recap', customerName, startDate, endDate, referenceNumber],
    queryFn: async () => {
      console.log('Fetching piutang transaction recap with filters:', { 
        customerName, startDate, endDate, referenceNumber 
      });
      
      let query = supabase
        .from('piutang_transaction_recap')
        .select('*')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (customerName) {
        query = query.eq('pelanggan_name', customerName);
      }
      
      if (startDate) {
        query = query.gte('transaction_date', startDate);
      }
      
      if (endDate) {
        query = query.lte('transaction_date', endDate);
      }
      
      if (referenceNumber) {
        query = query.ilike('reference_number', `%${referenceNumber}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching piutang transaction recap:', error);
        throw error;
      }
      
      console.log('Piutang transaction recap data:', data);
      return data;
    },
  });
};
