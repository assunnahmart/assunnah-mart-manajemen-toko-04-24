
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePiutangPelanggan = () => {
  return useQuery({
    queryKey: ['piutang_pelanggan'],
    queryFn: async () => {
      console.log('Fetching piutang pelanggan data...');
      
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
      
      // Get credit sales from POS system for today
      const today = new Date().toISOString().split('T')[0];
      const { data: creditSales, error: creditError } = await supabase
        .from('pos_transactions')
        .select('*')
        .eq('payment_method', 'credit')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);
      
      if (creditError) {
        console.error('Error fetching credit sales:', creditError);
      }
      
      const totalCreditSalesToday = creditSales?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
      const totalCreditTransactions = creditSales?.length || 0;
      
      const totalPiutangUnit = pelangganUnit.reduce((sum, p) => sum + (p.total_tagihan || 0), 0);
      const totalPiutangPerorangan = pelangganPerorangan.reduce((sum, p) => sum + (p.sisa_piutang || 0), 0);
      
      console.log('Piutang data calculated:', {
        totalPiutangUnit,
        totalPiutangPerorangan,
        totalCreditSalesToday,
        totalCreditTransactions
      });
      
      return {
        totalPiutang: totalPiutangUnit + totalPiutangPerorangan,
        totalPiutangUnit,
        totalPiutangPerorangan,
        totalCreditCustomers: pelangganData?.length || 0,
        totalCreditSalesToday,
        totalCreditTransactions,
        pelangganUnit: pelangganUnit.sort((a, b) => (b.total_tagihan || 0) - (a.total_tagihan || 0)),
        pelangganPerorangan: pelangganPerorangan.sort((a, b) => (b.sisa_piutang || 0) - (a.sisa_piutang || 0))
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds to sync with POS
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
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useKasUmumSummary = () => {
  return useQuery({
    queryKey: ['kas_umum_summary'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: kasTransactions, error } = await supabase
        .from('kas_umum_transactions')
        .select('*')
        .eq('tanggal_transaksi', today);
      
      if (error) {
        console.error('Error fetching kas umum data:', error);
        throw error;
      }
      
      const kasMasuk = kasTransactions?.filter(t => t.jenis_transaksi === 'masuk').reduce((sum, t) => sum + (t.jumlah || 0), 0) || 0;
      const kasKeluar = kasTransactions?.filter(t => t.jenis_transaksi === 'keluar').reduce((sum, t) => sum + (t.jumlah || 0), 0) || 0;
      const saldoKas = kasMasuk - kasKeluar;
      
      return {
        kasMasuk,
        kasKeluar,
        saldoKas,
        totalTransaksi: kasTransactions?.length || 0
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
