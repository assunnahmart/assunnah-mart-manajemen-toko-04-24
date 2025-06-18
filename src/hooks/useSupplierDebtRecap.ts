
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MonthlyData {
  bulan: number;
  hutang_masuk: number;
  pembayaran_keluar: number;
  saldo_akhir: number;
}

interface SupplierDebtRecap {
  supplier_id: string;
  supplier_name: string;
  saldo_awal: number;
  monthly_data: MonthlyData[];
}

export const useSupplierDebtRecap = (year: number) => {
  return useQuery({
    queryKey: ['supplier-debt-recap', year],
    queryFn: async (): Promise<SupplierDebtRecap[]> => {
      // Get all suppliers
      const { data: suppliers, error: suppliersError } = await supabase
        .from('supplier')
        .select('id, nama')
        .order('nama');

      if (suppliersError) throw suppliersError;

      const recap: SupplierDebtRecap[] = [];

      for (const supplier of suppliers) {
        // Get supplier debt transactions for the year
        const { data: ledgerData, error: ledgerError } = await supabase
          .from('supplier_payables_ledger')
          .select('*')
          .eq('supplier_id', supplier.id)
          .gte('transaction_date', `${year}-01-01`)
          .lte('transaction_date', `${year}-12-31`)
          .order('transaction_date');

        if (ledgerError) throw ledgerError;

        // Calculate saldo awal (balance at the beginning of the year)
        const { data: prevYearData, error: prevYearError } = await supabase
          .from('supplier_payables_ledger')
          .select('running_balance')
          .eq('supplier_id', supplier.id)
          .lt('transaction_date', `${year}-01-01`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (prevYearError) throw prevYearError;

        const saldoAwal = prevYearData?.[0]?.running_balance || 0;

        // Group data by month
        const monthlyData: MonthlyData[] = [];
        let currentBalance = saldoAwal;

        for (let month = 1; month <= 12; month++) {
          const monthTransactions = ledgerData.filter(
            transaction => new Date(transaction.transaction_date).getMonth() + 1 === month
          );

          const hutangMasuk = monthTransactions
            .filter(t => t.credit_amount > 0)
            .reduce((sum, t) => sum + (t.credit_amount || 0), 0);

          const pembayaranKeluar = monthTransactions
            .filter(t => t.debit_amount > 0)
            .reduce((sum, t) => sum + (t.debit_amount || 0), 0);

          currentBalance = currentBalance + hutangMasuk - pembayaranKeluar;

          monthlyData.push({
            bulan: month,
            hutang_masuk: hutangMasuk,
            pembayaran_keluar: pembayaranKeluar,
            saldo_akhir: currentBalance
          });
        }

        // Only include suppliers with transactions or non-zero balance
        if (ledgerData.length > 0 || saldoAwal !== 0) {
          recap.push({
            supplier_id: supplier.id,
            supplier_name: supplier.nama,
            saldo_awal: saldoAwal,
            monthly_data: monthlyData
          });
        }
      }

      return recap;
    },
    enabled: !!year,
  });
};
