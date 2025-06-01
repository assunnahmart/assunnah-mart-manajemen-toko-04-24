
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePOSReportsToday = () => {
  return useQuery({
    queryKey: ['pos_reports_today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get POS transactions
      const { data: posTransactions, error: posError } = await supabase
        .from('pos_transactions')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .eq('status', 'completed');
      
      if (posError) throw posError;
      
      // Get regular transactions
      const { data: regularTransactions, error: regularError } = await supabase
        .from('transaksi_penjualan')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .eq('status', 'selesai');
      
      if (regularError) throw regularError;
      
      // Separate cash and credit transactions
      const cashTransactions = [
        ...posTransactions.filter(t => t.payment_method === 'cash'),
        ...regularTransactions.filter(t => t.jenis_pembayaran === 'cash')
      ];
      
      const creditTransactions = [
        ...posTransactions.filter(t => t.payment_method === 'credit'),
        ...regularTransactions.filter(t => t.jenis_pembayaran === 'credit')
      ];
      
      // Calculate totals
      const cashTotal = cashTransactions.reduce((sum, t) => {
        return sum + (('total_amount' in t) ? t.total_amount : t.total);
      }, 0);
      
      const creditTotal = creditTransactions.reduce((sum, t) => {
        return sum + (('total_amount' in t) ? t.total_amount : t.total);
      }, 0);
      
      const totalTransactions = cashTransactions.length + creditTransactions.length;
      const grandTotal = cashTotal + creditTotal;
      
      return {
        cashTransactions: cashTransactions.length,
        cashTotal,
        creditTransactions: creditTransactions.length,
        creditTotal,
        totalTransactions,
        grandTotal,
        cashTransactionList: cashTransactions,
        creditTransactionList: creditTransactions
      };
    },
  });
};

export const usePOSReportsByKasir = (kasirName?: string) => {
  return useQuery({
    queryKey: ['pos_reports_kasir', kasirName],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      let posQuery = supabase
        .from('pos_transactions')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .eq('status', 'completed');
      
      if (kasirName) {
        posQuery = posQuery.eq('kasir_name', kasirName);
      }
      
      const { data: posTransactions, error: posError } = await posQuery;
      
      if (posError) throw posError;
      
      // Group by kasir
      const kasirReports = posTransactions.reduce((acc, transaction) => {
        const kasir = transaction.kasir_name;
        if (!acc[kasir]) {
          acc[kasir] = {
            kasirName: kasir,
            cashTransactions: 0,
            cashTotal: 0,
            creditTransactions: 0,
            creditTotal: 0,
            totalTransactions: 0,
            grandTotal: 0
          };
        }
        
        if (transaction.payment_method === 'cash') {
          acc[kasir].cashTransactions++;
          acc[kasir].cashTotal += transaction.total_amount;
        } else if (transaction.payment_method === 'credit') {
          acc[kasir].creditTransactions++;
          acc[kasir].creditTotal += transaction.total_amount;
        }
        
        acc[kasir].totalTransactions++;
        acc[kasir].grandTotal += transaction.total_amount;
        
        return acc;
      }, {} as Record<string, any>);
      
      return Object.values(kasirReports);
    },
  });
};
