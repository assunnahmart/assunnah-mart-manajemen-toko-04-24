
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePiutangPelanggan = () => {
  return useQuery({
    queryKey: ['piutang_pelanggan'],
    queryFn: async () => {
      const { data: pelangganData, error } = await supabase
        .from('pelanggan')
        .select('*')
        .eq('status', 'aktif');
      
      if (error) {
        console.error('Error fetching pelanggan:', error);
        throw error;
      }
      
      // Separate unit and individual customers
      const pelangganUnit = pelangganData?.filter(p => p.nama_unit && p.nama_unit.trim() !== '') || [];
      const pelangganPerorangan = pelangganData?.filter(p => !p.nama_unit || p.nama_unit.trim() === '') || [];
      
      const totalPiutangUnit = pelangganUnit.reduce((sum, p) => sum + (p.total_tagihan || 0), 0);
      const totalPiutangPerorangan = pelangganPerorangan.reduce((sum, p) => sum + (p.sisa_piutang || 0), 0);
      
      return {
        totalPiutang: totalPiutangUnit + totalPiutangPerorangan,
        totalPiutangUnit,
        totalPiutangPerorangan,
        totalCreditCustomers: pelangganData?.length || 0,
        pelangganUnit: pelangganUnit.sort((a, b) => (b.total_tagihan || 0) - (a.total_tagihan || 0)),
        pelangganPerorangan: pelangganPerorangan.sort((a, b) => (b.sisa_piutang || 0) - (a.sisa_piutang || 0))
      };
    },
  });
};

export const useTodayCreditSales = () => {
  return useQuery({
    queryKey: ['today_credit_sales'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('pos_transactions')
        .select('*')
        .eq('payment_method', 'credit')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);
      
      if (error) {
        console.error('Error fetching credit sales:', error);
        throw error;
      }
      
      const totalCreditTransactions = data?.length || 0;
      const totalCreditSales = data?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
      
      return {
        totalCreditTransactions,
        totalCreditSales
      };
    },
  });
};
