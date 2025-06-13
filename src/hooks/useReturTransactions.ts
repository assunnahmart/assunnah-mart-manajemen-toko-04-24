
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type ReturPembelian = Tables<'retur_pembelian'>;
type ReturPenjualan = Tables<'retur_penjualan'>;
type DetailReturPembelian = Tables<'detail_retur_pembelian'>;
type DetailReturPenjualan = Tables<'detail_retur_penjualan'>;

export interface CreatePurchaseReturnData {
  retur: Omit<TablesInsert<'retur_pembelian'>, 'id' | 'nomor_retur' | 'created_at' | 'updated_at'>;
  items: Omit<TablesInsert<'detail_retur_pembelian'>, 'id' | 'retur_id' | 'created_at'>[];
}

export interface CreateSalesReturnData {
  retur: Omit<TablesInsert<'retur_penjualan'>, 'id' | 'nomor_retur' | 'created_at' | 'updated_at'>;
  items: Omit<TablesInsert<'detail_retur_penjualan'>, 'id' | 'retur_id' | 'created_at'>[];
}

export const usePurchaseReturns = () => {
  return useQuery({
    queryKey: ['purchase_returns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retur_pembelian')
        .select(`
          *,
          supplier:supplier_id(nama),
          kasir:kasir_id(nama),
          transaksi_pembelian:transaksi_pembelian_id(nomor_transaksi),
          detail_retur_pembelian(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useSalesReturns = () => {
  return useQuery({
    queryKey: ['sales_returns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retur_penjualan')
        .select(`
          *,
          kasir:kasir_id(nama),
          pos_transactions:pos_transaction_id(transaction_number),
          detail_retur_penjualan(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreatePurchaseReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePurchaseReturnData) => {
      // Generate return number
      const { data: returnNumber, error: numberError } = await supabase
        .rpc('generate_retur_pembelian_number');
      
      if (numberError) throw numberError;

      // Insert return header
      const { data: returnData, error: returnError } = await supabase
        .from('retur_pembelian')
        .insert({
          ...data.retur,
          nomor_retur: returnNumber
        })
        .select()
        .single();

      if (returnError) throw returnError;

      // Insert return items
      const itemsWithReturId = data.items.map(item => ({
        ...item,
        retur_id: returnData.id
      }));

      const { error: itemsError } = await supabase
        .from('detail_retur_pembelian')
        .insert(itemsWithReturId);

      if (itemsError) throw itemsError;

      // Process stock updates if approved
      if (data.retur.status === 'approved') {
        const { error: processError } = await supabase
          .rpc('process_purchase_return', { p_retur_id: returnData.id });
        
        if (processError) throw processError;
      }

      return returnData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_returns'] });
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['general_ledger'] });
    },
  });
};

export const useCreateSalesReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSalesReturnData) => {
      // Generate return number
      const { data: returnNumber, error: numberError } = await supabase
        .rpc('generate_retur_penjualan_number');
      
      if (numberError) throw numberError;

      // Insert return header
      const { data: returnData, error: returnError } = await supabase
        .from('retur_penjualan')
        .insert({
          ...data.retur,
          nomor_retur: returnNumber
        })
        .select()
        .single();

      if (returnError) throw returnError;

      // Insert return items
      const itemsWithReturId = data.items.map(item => ({
        ...item,
        retur_id: returnData.id
      }));

      const { error: itemsError } = await supabase
        .from('detail_retur_penjualan')
        .insert(itemsWithReturId);

      if (itemsError) throw itemsError;

      // Process stock updates if approved
      if (data.retur.status === 'approved') {
        const { error: processError } = await supabase
          .rpc('process_sales_return', { p_retur_id: returnData.id });
        
        if (processError) throw processError;
      }

      return returnData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales_returns'] });
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['general_ledger'] });
    },
  });
};

export const useApproveReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'purchase' | 'sales' }) => {
      const table = type === 'purchase' ? 'retur_pembelian' : 'retur_penjualan';
      
      const { data, error } = await supabase
        .from(table)
        .update({ status: 'approved' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Process stock updates
      if (type === 'purchase') {
        const { error: processError } = await supabase
          .rpc('process_purchase_return', { p_retur_id: id });
        if (processError) throw processError;
      } else {
        const { error: processError } = await supabase
          .rpc('process_sales_return', { p_retur_id: id });
        if (processError) throw processError;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.type === 'purchase') {
        queryClient.invalidateQueries({ queryKey: ['purchase_returns'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['sales_returns'] });
      }
      queryClient.invalidateQueries({ queryKey: ['stock_data'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['general_ledger'] });
    },
  });
};
