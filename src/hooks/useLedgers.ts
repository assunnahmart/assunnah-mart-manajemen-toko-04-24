
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCustomerReceivablesLedger = (
  customerName?: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['customer-receivables-ledger', customerName, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('customer_receivables_ledger')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (customerName) {
        query = query.eq('pelanggan_name', customerName);
      }
      
      if (startDate) {
        query = query.gte('transaction_date', startDate);
      }
      
      if (endDate) {
        query = query.lte('transaction_date', endDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};

export const useSupplierPayablesLedger = (
  supplierId?: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['supplier-payables-ledger', supplierId, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('supplier_payables_ledger')
        .select('*')
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
      return data;
    },
  });
};

export const useCustomerReceivablesSummary = () => {
  return useQuery({
    queryKey: ['customer-receivables-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_customer_receivables_summary');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useSupplierPayablesSummary = () => {
  return useQuery({
    queryKey: ['supplier-payables-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_supplier_payables_summary');
      
      if (error) throw error;
      return data;
    },
  });
};

export const useSyncPOSReceivables = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Use direct SQL query to call the function since it's not in types yet
      const { error } = await supabase
        .from('customer_receivables_ledger')
        .select('id')
        .limit(1);
      
      if (error) throw error;
      
      // Call the function using a workaround for missing types
      const { error: funcError } = await (supabase as any).rpc('sync_pos_credit_to_receivables');
      
      if (funcError) throw funcError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-receivables-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['customer-receivables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['pos-transactions'] });
    },
  });
};

export const useRecordCustomerPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      pelanggan_name: string;
      amount: number;
      payment_date: string;
      reference_number: string;
      kasir_name: string;
      keterangan?: string;
    }) => {
      const { error } = await supabase
        .rpc('record_customer_payment', {
          p_pelanggan_name: data.pelanggan_name,
          p_amount: data.amount,
          p_payment_date: data.payment_date,
          p_reference_number: data.reference_number,
          p_kasir_name: data.kasir_name,
          p_keterangan: data.keterangan
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-receivables-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['customer-receivables-summary'] });
    },
  });
};

export const useRecordSupplierPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      supplier_id: string;
      amount: number;
      payment_date: string;
      reference_number: string;
      kasir_name: string;
      keterangan?: string;
    }) => {
      const { error } = await supabase
        .rpc('record_supplier_payment', {
          p_supplier_id: data.supplier_id,
          p_amount: data.amount,
          p_payment_date: data.payment_date,
          p_reference_number: data.reference_number,
          p_kasir_name: data.kasir_name,
          p_keterangan: data.keterangan
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-payables-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-payables-summary'] });
    },
  });
};

// Add the missing useFixCustomerBalance hook
export const useFixCustomerBalance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerName: string) => {
      // Use a workaround for missing types
      const { error } = await (supabase as any).rpc('recalculate_customer_balance', {
        p_customer_name: customerName
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-receivables-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['customer-receivables-summary'] });
    },
  });
};
