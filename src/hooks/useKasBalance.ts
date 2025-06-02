
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useKasBalanceToday = (kasirName?: string) => {
  return useQuery({
    queryKey: ['kas_balance_today', kasirName],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from('kas_umum_transactions')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);
      
      if (kasirName) {
        query = query.eq('kasir_name', kasirName);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Calculate balance
      const masuk = data
        .filter(t => t.jenis_transaksi === 'masuk')
        .reduce((sum, t) => sum + (t.jumlah || 0), 0);
      
      const keluar = data
        .filter(t => t.jenis_transaksi === 'keluar')
        .reduce((sum, t) => sum + (t.jumlah || 0), 0);
      
      const saldoKas = masuk - keluar;
      
      return {
        masuk,
        keluar,
        saldoKas,
        transactions: data
      };
    },
    enabled: !!kasirName,
  });
};
