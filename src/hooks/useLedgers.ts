
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerReceivablesEntry {
  id: string;
  pelanggan_id?: string;
  pelanggan_name: string;
  transaction_date: string;
  reference_type: string;
  reference_id?: string;
  reference_number?: string;
  description?: string;
  debit_amount: number;
  credit_amount: number;
  running_balance: number;
  transaction_type?: string;
  kasir_name?: string;
  created_at: string;
}

export interface SupplierPayablesEntry {
  id: string;
  supplier_id?: string;
  supplier_name: string;
  transaction_date: string;
  reference_type: string;
  reference_id?: string;
  reference_number?: string;
  description?: string;
  debit_amount: number;
  credit_amount: number;
  running_balance: number;
  transaction_type?: string;
  kasir_name?: string;
  created_at: string;
}

export const useCustomerReceivablesLedger = (pelangganName?: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['customer_receivables_ledger', pelangganName, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('customer_receivables_ledger')
        .select('*')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (pelangganName) {
        query = query.eq('pelanggan_name', pelangganName);
      }

      if (startDate) {
        query = query.gte('transaction_date', startDate);
      }

      if (endDate) {
        query = query.lte('transaction_date', endDate);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as CustomerReceivablesEntry[];
    },
  });
};

export const useSupplierPayablesLedger = (supplierId?: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['supplier_payables_ledger', supplierId, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('supplier_payables_ledger')
        .select('*')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }

      if (startDate) {
        query = query.gte('transaction_date', startDate);
      }

      if (endDate) {
        query = query.lte('transaction_date', endDate);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as SupplierPayablesEntry[];
    },
  });
};

export const useCustomerReceivablesSummary = () => {
  return useQuery({
    queryKey: ['customer_receivables_summary'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_customer_receivables_summary');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useSupplierPayablesSummary = () => {
  return useQuery({
    queryKey: ['supplier_payables_summary'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_supplier_payables_summary');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useRecordCustomerPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData: {
      pelanggan_name: string;
      amount: number;
      payment_date: string;
      reference_number: string;
      kasir_name: string;
      keterangan?: string;
    }) => {
      console.log('Recording integrated customer payment:', paymentData);
      
      const { data, error } = await supabase.rpc('record_customer_payment_integrated', {
        p_pelanggan_name: paymentData.pelanggan_name,
        p_amount: paymentData.amount,
        p_payment_date: paymentData.payment_date,
        p_reference_number: paymentData.reference_number,
        p_kasir_name: paymentData.kasir_name,
        p_keterangan: paymentData.keterangan
      });

      if (error) {
        console.error('Payment recording error:', error);
        throw error;
      }

      // Check if the result indicates an error
      if (data && !data.success) {
        throw new Error(data.message || 'Payment recording failed');
      }

      console.log('Payment recorded successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Payment success, invalidating queries:', data);
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['customer_receivables_ledger'] });
      queryClient.invalidateQueries({ queryKey: ['customer_receivables_summary'] });
      queryClient.invalidateQueries({ queryKey: ['kas_umum_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['kas_umum_summary'] });
      queryClient.invalidateQueries({ queryKey: ['piutang_pelanggan'] });
      queryClient.invalidateQueries({ queryKey: ['today_credit_sales'] });
      
      // Also invalidate pelanggan queries to refresh debt status
      queryClient.invalidateQueries({ queryKey: ['pelanggan_unit'] });
      queryClient.invalidateQueries({ queryKey: ['pelanggan_perorangan'] });
      queryClient.invalidateQueries({ queryKey: ['pelanggan_kredit'] });
    },
    onError: (error) => {
      console.error('Payment recording failed:', error);
    }
  });
};

// New hook for syncing POS transactions with receivables
export const useSyncPOSReceivables = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('sync_pos_credit_to_receivables');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer_receivables_ledger'] });
      queryClient.invalidateQueries({ queryKey: ['customer_receivables_summary'] });
    },
  });
};

export const useRecordSupplierPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData: {
      supplier_id: string;
      amount: number;
      payment_date: string;
      reference_number: string;
      kasir_name: string;
      keterangan?: string;
    }) => {
      const { error } = await supabase.rpc('record_supplier_payment', {
        p_supplier_id: paymentData.supplier_id,
        p_amount: paymentData.amount,
        p_payment_date: paymentData.payment_date,
        p_reference_number: paymentData.reference_number,
        p_kasir_name: paymentData.kasir_name,
        p_keterangan: paymentData.keterangan
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier_payables_ledger'] });
      queryClient.invalidateQueries({ queryKey: ['supplier_payables_summary'] });
    },
  });
};
