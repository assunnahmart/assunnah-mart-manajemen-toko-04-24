
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface KasirReport {
  kasirName: string;
  cashTransactions: number;
  cashTotal: number;
  creditTransactions: number;
  creditTotal: number;
  totalTransactions: number;
  grandTotal: number;
}

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
      
      // Separate cash and credit transactions for POS
      const cashTransactionsPOS = posTransactions.filter(t => t.payment_method === 'cash');
      const creditTransactionsPOS = posTransactions.filter(t => t.payment_method === 'credit');
      
      // Separate cash and credit transactions for regular
      const cashTransactionsRegular = regularTransactions.filter(t => t.jenis_pembayaran === 'cash');
      const creditTransactionsRegular = regularTransactions.filter(t => t.jenis_pembayaran === 'credit');
      
      // Combine all transactions
      const cashTransactions = [...cashTransactionsPOS, ...cashTransactionsRegular];
      const creditTransactions = [...creditTransactionsPOS, ...creditTransactionsRegular];
      
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
        creditTransactionList: creditTransactions,
        posTransactions,
        regularTransactions
      };
    },
  });
};

export const usePOSReportsByKasir = (kasirName?: string) => {
  return useQuery({
    queryKey: ['pos_reports_kasir', kasirName],
    queryFn: async (): Promise<KasirReport[]> => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get POS transactions
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
      
      // Get regular transactions
      let regularQuery = supabase
        .from('transaksi_penjualan')
        .select('*, kasir(*)')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .eq('status', 'selesai');
      
      const { data: regularTransactions, error: regularError } = await regularQuery;
      
      if (regularError) throw regularError;
      
      // Group by kasir for both POS and regular transactions
      const kasirReports: Record<string, KasirReport> = {};
      
      // Process POS transactions
      posTransactions.forEach(transaction => {
        const kasir = transaction.kasir_name;
        if (!kasirReports[kasir]) {
          kasirReports[kasir] = {
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
          kasirReports[kasir].cashTransactions++;
          kasirReports[kasir].cashTotal += transaction.total_amount;
        } else if (transaction.payment_method === 'credit') {
          kasirReports[kasir].creditTransactions++;
          kasirReports[kasir].creditTotal += transaction.total_amount;
        }
        
        kasirReports[kasir].totalTransactions++;
        kasirReports[kasir].grandTotal += transaction.total_amount;
      });
      
      // Process regular transactions
      regularTransactions.forEach(transaction => {
        const kasir = transaction.kasir?.nama || 'Unknown';
        if (!kasirReports[kasir]) {
          kasirReports[kasir] = {
            kasirName: kasir,
            cashTransactions: 0,
            cashTotal: 0,
            creditTransactions: 0,
            creditTotal: 0,
            totalTransactions: 0,
            grandTotal: 0
          };
        }
        
        if (transaction.jenis_pembayaran === 'cash') {
          kasirReports[kasir].cashTransactions++;
          kasirReports[kasir].cashTotal += transaction.total;
        } else if (transaction.jenis_pembayaran === 'credit') {
          kasirReports[kasir].creditTransactions++;
          kasirReports[kasir].creditTotal += transaction.total;
        }
        
        kasirReports[kasir].totalTransactions++;
        kasirReports[kasir].grandTotal += transaction.total;
      });
      
      return Object.values(kasirReports);
    },
  });
};
