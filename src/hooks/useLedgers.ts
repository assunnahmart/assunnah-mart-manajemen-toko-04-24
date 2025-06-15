
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
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });
      
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
      console.log('Recording customer payment:', data);
      
      // Insert payment directly into customer_receivables_ledger
      const { data: ledgerData, error: ledgerError } = await supabase
        .from('customer_receivables_ledger')
        .insert({
          pelanggan_name: data.pelanggan_name,
          transaction_date: data.payment_date,
          description: `Pembayaran piutang - ${data.reference_number}`,
          credit_amount: data.amount,
          debit_amount: 0,
          reference_number: data.reference_number,
          kasir_name: data.kasir_name,
          reference_type: 'payment'
        })
        .select()
        .single();
      
      if (ledgerError) {
        console.error('Ledger payment error:', ledgerError);
        throw ledgerError;
      }
      
      // Generate kas transaction number
      const generateKasNumber = () => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
        return `KAS-${dateStr}-${timeStr}`;
      };
      
      // Insert into kas_umum_transactions (penerimaan) - use ledger record ID as reference
      const { error: kasError } = await supabase
        .from('kas_umum_transactions')
        .insert({
          tanggal_transaksi: data.payment_date,
          jenis_transaksi: 'masuk',
          jumlah: data.amount,
          referensi_id: ledgerData.id, // Use the ledger record ID instead of reference_number
          kasir_name: data.kasir_name,
          keterangan: `Penerimaan pembayaran piutang dari ${data.pelanggan_name} - ${data.keterangan || ''}`,
          transaction_number: generateKasNumber(),
          referensi_tipe: 'customer_payment'
        });
      
      if (kasError) {
        console.error('Kas payment error:', kasError);
        throw kasError;
      }
      
      return { success: true, message: 'Payment recorded successfully' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-receivables-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['customer-receivables-summary'] });
      queryClient.invalidateQueries({ queryKey: ['kas_umum_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['general_ledger'] });
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
      // Find the actual supplier ID from supplier name
      const { data: supplierData, error: supplierError } = await supabase
        .from('supplier')
        .select('id, nama')
        .eq('nama', data.supplier_id)
        .single();
      
      if (supplierError) {
        console.error('Supplier lookup error:', supplierError);
        throw supplierError;
      }
      
      const { error } = await supabase
        .rpc('record_supplier_payment', {
          p_supplier_id: supplierData.id,
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
      queryClient.invalidateQueries({ queryKey: ['kas_umum_transactions'] });
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
