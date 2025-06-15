
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
      let query = supabase
        .from('customer_receivables_ledger')
        .select('*')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (customerName) {
        query = query.ilike('pelanggan_name', `%${customerName}%`);
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
      
      if (error) throw error;
      return data;
    },
  });
};
