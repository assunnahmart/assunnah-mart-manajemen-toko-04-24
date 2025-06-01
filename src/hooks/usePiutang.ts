
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePiutangPelanggan = () => {
  return useQuery({
    queryKey: ['piutang_pelanggan'],
    queryFn: async () => {
      // Get credit transactions from both POS and regular transactions
      const today = new Date().toISOString().split('T')[0];
      
      // Get POS credit transactions
      const { data: posCredit, error: posError } = await supabase
        .from('pos_transactions')
        .select('*')
        .eq('payment_method', 'credit')
        .eq('status', 'credit');
      
      if (posError) throw posError;
      
      // Get regular credit transactions
      const { data: regularCredit, error: regularError } = await supabase
        .from('transaksi_penjualan')
        .select(`
          *,
          pelanggan_unit(nama_unit, total_tagihan),
          pelanggan_perorangan(nama, sisa_piutang)
        `)
        .eq('jenis_pembayaran', 'credit')
        .eq('status', 'kredit');
      
      if (regularError) throw regularError;
      
      // Get pelanggan unit with outstanding debt
      const { data: pelangganUnit, error: unitError } = await supabase
        .from('pelanggan_unit')
        .select('*')
        .gt('total_tagihan', 0)
        .order('total_tagihan', { ascending: false });
      
      if (unitError) throw unitError;
      
      // Get pelanggan perorangan with outstanding debt
      const { data: pelangganPerorangan, error: peroranganError } = await supabase
        .from('pelanggan_perorangan')
        .select('*')
        .gt('sisa_piutang', 0)
        .order('sisa_piutang', { ascending: false });
      
      if (peroranganError) throw peroranganError;
      
      // Calculate totals
      const totalPiutangUnit = pelangganUnit.reduce((sum, p) => sum + (p.total_tagihan || 0), 0);
      const totalPiutangPerorangan = pelangganPerorangan.reduce((sum, p) => sum + (p.sisa_piutang || 0), 0);
      const totalPiutang = totalPiutangUnit + totalPiutangPerorangan;
      
      // Calculate today's credit sales
      const todayPosCredit = posCredit.filter(t => 
        new Date(t.created_at).toDateString() === new Date().toDateString()
      );
      const todayRegularCredit = regularCredit.filter(t => 
        new Date(t.created_at).toDateString() === new Date().toDateString()
      );
      
      const todayCreditAmount = [
        ...todayPosCredit.map(t => t.total_amount),
        ...todayRegularCredit.map(t => t.total)
      ].reduce((sum, amount) => sum + amount, 0);
      
      return {
        pelangganUnit,
        pelangganPerorangan,
        totalPiutangUnit,
        totalPiutangPerorangan,
        totalPiutang,
        todayCreditAmount,
        totalCreditCustomers: pelangganUnit.length + pelangganPerorangan.length,
        recentCreditTransactions: [...todayPosCredit, ...todayRegularCredit]
      };
    },
  });
};

export const useTodayCreditSales = () => {
  return useQuery({
    queryKey: ['today_credit_sales'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's credit transactions from both sources
      const [posResult, regularResult] = await Promise.all([
        supabase
          .from('pos_transactions')
          .select('*')
          .eq('payment_method', 'credit')
          .gte('created_at', `${today}T00:00:00`)
          .lt('created_at', `${today}T23:59:59`),
        supabase
          .from('transaksi_penjualan')
          .select('*')
          .eq('jenis_pembayaran', 'credit')
          .gte('created_at', `${today}T00:00:00`)
          .lt('created_at', `${today}T23:59:59`)
      ]);
      
      if (posResult.error) throw posResult.error;
      if (regularResult.error) throw regularResult.error;
      
      const posTransactions = posResult.data || [];
      const regularTransactions = regularResult.data || [];
      
      const totalCreditSales = [
        ...posTransactions.map(t => t.total_amount),
        ...regularTransactions.map(t => t.total)
      ].reduce((sum, amount) => sum + amount, 0);
      
      const totalCreditTransactions = posTransactions.length + regularTransactions.length;
      
      return {
        totalCreditSales,
        totalCreditTransactions,
        posTransactions,
        regularTransactions
      };
    },
  });
};
