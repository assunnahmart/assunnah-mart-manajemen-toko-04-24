
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

export const useDataBackup = () => {
  const queryClient = useQueryClient();

  const exportAllData = useMutation({
    mutationFn: async () => {
      // Fetch all data from different tables
      const [
        barangResult,
        supplierResult,
        pelangganResult,
        posTransactionsResult,
        purchaseTransactionsResult,
        stockOpnameResult,
        mutasiStokResult,
        kasUmumResult,
        customerLedgerResult,
        supplierLedgerResult
      ] = await Promise.all([
        supabase.from('barang_konsinyasi').select('*'),
        supabase.from('supplier').select('*'),
        supabase.from('pelanggan_unit').select('*'),
        supabase.from('pos_transactions').select('*'),
        supabase.from('transaksi_pembelian').select('*'),
        supabase.from('stok_opname').select('*'),
        supabase.from('mutasi_stok').select('*'),
        supabase.from('kas_umum_transactions').select('*'),
        supabase.from('customer_receivables_ledger').select('*'),
        supabase.from('supplier_payables_ledger').select('*')
      ]);

      // Check for errors
      const results = [
        { name: 'barang', data: barangResult },
        { name: 'supplier', data: supplierResult },
        { name: 'pelanggan', data: pelangganResult },
        { name: 'pos_transactions', data: posTransactionsResult },
        { name: 'purchase_transactions', data: purchaseTransactionsResult },
        { name: 'stock_opname', data: stockOpnameResult },
        { name: 'mutasi_stok', data: mutasiStokResult },
        { name: 'kas_umum', data: kasUmumResult },
        { name: 'customer_ledger', data: customerLedgerResult },
        { name: 'supplier_ledger', data: supplierLedgerResult }
      ];

      for (const result of results) {
        if (result.data.error) {
          throw new Error(`Error fetching ${result.name}: ${result.data.error.message}`);
        }
      }

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Add worksheets for each data type
      results.forEach(result => {
        if (result.data.data && result.data.data.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(result.data.data);
          XLSX.utils.book_append_sheet(workbook, worksheet, result.name);
        }
      });

      // Generate file
      const fileName = `backup_data_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      return { success: true, fileName };
    }
  });

  return { exportAllData };
};

export const useDeleteLedgerHistory = () => {
  const queryClient = useQueryClient();

  const deleteCustomerLedgerHistory = useMutation({
    mutationFn: async (customerName?: string) => {
      let query = supabase.from('customer_receivables_ledger').delete();
      
      if (customerName) {
        query = query.eq('pelanggan_name', customerName);
      } else {
        query = query.neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      }

      const { error } = await query;
      if (error) throw error;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-receivables-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['customer-receivables-summary'] });
    }
  });

  const deleteSupplierLedgerHistory = useMutation({
    mutationFn: async (supplierId?: string) => {
      let query = supabase.from('supplier_payables_ledger').delete();
      
      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      } else {
        query = query.neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      }

      const { error } = await query;
      if (error) throw error;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-payables-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-payables-summary'] });
    }
  });

  return {
    deleteCustomerLedgerHistory,
    deleteSupplierLedgerHistory
  };
};
