
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type FinancialPeriod = Tables<'financial_periods'>;
type GeneralLedger = Tables<'general_ledger'>;
type TrialBalance = Tables<'trial_balance'>;
type BalanceSheet = Tables<'balance_sheet'>;
type IncomeStatement = Tables<'income_statement'>;
type FinancialNotes = Tables<'financial_notes'>;

export const useFinancialPeriods = () => {
  return useQuery({
    queryKey: ['financial_periods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_periods')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateFinancialPeriod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (period: TablesInsert<'financial_periods'>) => {
      const { data, error } = await supabase
        .from('financial_periods')
        .insert(period)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_periods'] });
    },
  });
};

export const useGeneralLedger = (periodId?: string) => {
  return useQuery({
    queryKey: ['general_ledger', periodId],
    queryFn: async () => {
      let query = supabase
        .from('general_ledger')
        .select(`
          *,
          chart_of_accounts (kode_akun, nama_akun, jenis_akun)
        `)
        .order('transaction_date', { ascending: false });
      
      if (periodId) {
        query = query.eq('financial_period_id', periodId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: true,
  });
};

export const useTrialBalance = (periodId: string) => {
  return useQuery({
    queryKey: ['trial_balance', periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trial_balance')
        .select(`
          *,
          chart_of_accounts (kode_akun, nama_akun, jenis_akun)
        `)
        .eq('financial_period_id', periodId)
        .order('chart_of_accounts.kode_akun', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!periodId,
  });
};

export const useBalanceSheet = (periodId: string) => {
  return useQuery({
    queryKey: ['balance_sheet', periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('balance_sheet')
        .select(`
          *,
          chart_of_accounts (kode_akun, nama_akun)
        `)
        .eq('financial_period_id', periodId)
        .order('chart_of_accounts.kode_akun', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!periodId,
  });
};

export const useIncomeStatement = (periodId: string) => {
  return useQuery({
    queryKey: ['income_statement', periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income_statement')
        .select(`
          *,
          chart_of_accounts (kode_akun, nama_akun)
        `)
        .eq('financial_period_id', periodId)
        .order('chart_of_accounts.kode_akun', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!periodId,
  });
};

export const useGenerateFinancialReports = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (periodId: string) => {
      const { error } = await supabase.rpc('auto_generate_financial_reports', {
        p_period_id: periodId
      });
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, periodId) => {
      queryClient.invalidateQueries({ queryKey: ['trial_balance', periodId] });
      queryClient.invalidateQueries({ queryKey: ['balance_sheet', periodId] });
      queryClient.invalidateQueries({ queryKey: ['income_statement', periodId] });
    },
  });
};

export const useCurrentPeriod = () => {
  return useQuery({
    queryKey: ['current_financial_period'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('financial_periods')
        .select('*')
        .lte('start_date', today)
        .gte('end_date', today)
        .eq('status', 'active')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });
};

export const useFinancialSummary = (periodId?: string) => {
  return useQuery({
    queryKey: ['financial_summary', periodId],
    queryFn: async () => {
      if (!periodId) return null;
      
      // Get trial balance data
      const { data: trialBalance, error: tbError } = await supabase
        .from('trial_balance')
        .select(`
          *,
          chart_of_accounts (jenis_akun)
        `)
        .eq('financial_period_id', periodId);
      
      if (tbError) throw tbError;
      
      // Calculate summary
      const assets = trialBalance?.filter(tb => tb.chart_of_accounts?.jenis_akun === 'aset') || [];
      const liabilities = trialBalance?.filter(tb => tb.chart_of_accounts?.jenis_akun === 'kewajiban') || [];
      const equity = trialBalance?.filter(tb => tb.chart_of_accounts?.jenis_akun === 'modal') || [];
      const revenue = trialBalance?.filter(tb => tb.chart_of_accounts?.jenis_akun === 'pendapatan') || [];
      const expenses = trialBalance?.filter(tb => tb.chart_of_accounts?.jenis_akun === 'beban') || [];
      const cogs = trialBalance?.filter(tb => tb.chart_of_accounts?.jenis_akun === 'hpp') || [];
      
      const totalAssets = assets.reduce((sum, item) => sum + (item.ending_balance || 0), 0);
      const totalLiabilities = liabilities.reduce((sum, item) => sum + (item.ending_balance || 0), 0);
      const totalEquity = equity.reduce((sum, item) => sum + (item.ending_balance || 0), 0);
      const totalRevenue = revenue.reduce((sum, item) => sum + (item.ending_balance || 0), 0);
      const totalExpenses = expenses.reduce((sum, item) => sum + (item.ending_balance || 0), 0);
      const totalCOGS = cogs.reduce((sum, item) => sum + (item.ending_balance || 0), 0);
      
      const grossProfit = totalRevenue - totalCOGS;
      const netIncome = grossProfit - totalExpenses;
      
      return {
        totalAssets,
        totalLiabilities,
        totalEquity,
        totalRevenue,
        totalExpenses,
        totalCOGS,
        grossProfit,
        netIncome,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity + netIncome)) < 0.01
      };
    },
    enabled: !!periodId,
  });
};
