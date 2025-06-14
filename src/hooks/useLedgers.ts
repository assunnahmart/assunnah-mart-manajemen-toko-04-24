
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCustomerReceivablesLedger = () => {
  return useQuery({
    queryKey: ['customer-receivables-ledger'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_receivables_ledger')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useSupplierPayablesLedger = () => {
  return useQuery({
    queryKey: ['supplier-payables-ledger'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_payables_ledger')
        .select('*')
        .order('created_at', { ascending: false });
      
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
      const { error } = await supabase
        .rpc('sync_pos_credit_to_receivables');
      
      if (error) throw error;
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
