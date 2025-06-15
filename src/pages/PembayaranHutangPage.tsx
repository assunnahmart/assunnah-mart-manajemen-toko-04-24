import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, RefreshCw } from 'lucide-react';
import { useSupplierPayablesSummary, useRecordSupplierPayment, useSupplierPayablesLedger } from '@/hooks/useLedgers';
import { useSupplier } from '@/hooks/useSupplier';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

import { SupplierPayablesSummary } from './pembayaran-hutang/SupplierPayablesSummary';
import { OutstandingPayablesTable } from './pembayaran-hutang/OutstandingPayablesTable';
import { SupplierPaymentDialog } from './pembayaran-hutang/SupplierPaymentDialog';
import { SupplierPaymentsHistoryTable } from './pembayaran-hutang/SupplierPaymentsHistoryTable';

const PembayaranHutangPage = () => {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    reference_number: '',
    keterangan: '',
    payment_date: new Date().toISOString().split('T')[0]
  });
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const { user } = useSimpleAuth();
  const { data: summary, isLoading: summaryLoading } = useSupplierPayablesSummary();
  const { data: suppliers } = useSupplier();
  const { data: recentPayments, isLoading: paymentsLoading } = useSupplierPayablesLedger(
    filterSupplier || undefined,
    filterDate || undefined,
    undefined
  );
  const recordPayment = useRecordSupplierPayment();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fungsi untuk manual refresh data summary dan ledgers
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['supplier-payables-summary'] });
    queryClient.invalidateQueries({ queryKey: ['supplier-payables-ledger'] });
  };

  // Perbaiki handleSelectSupplier untuk handling "supplier not found"
  const handleSelectSupplier = (supplierName: string, currentBalance: number) => {
    const supplier = suppliers?.find(s => s.nama === supplierName);
    if (!supplier) {
      toast({
        title: "Error",
        description: "Data supplier tidak ditemukan.",
        variant: "destructive"
      });
      return;
    }
    setSelectedSupplier(supplierName);
    setSelectedSupplierId(supplier.id);
    setPaymentForm(prev => ({
      ...prev,
      amount: currentBalance
    }));
    setIsPaymentDialogOpen(true);
  };

  // Perbaiki logic pembayaran hutang supplier
  const handleRecordPayment = async () => {
    if (!selectedSupplier || !paymentForm.amount || !paymentForm.reference_number) {
      toast({
        title: "Error",
        description: "Lengkapi semua field yang diperlukan",
        variant: "destructive"
      });
      return;
    }
    try {
      const supplier = suppliers?.find(s => s.nama === selectedSupplier);
      if (!supplier) {
        toast({
          title: "Error",
          description: "Supplier tidak valid",
          variant: "destructive"
        });
        return;
      }
      await recordPayment.mutateAsync({
        supplier_id: selectedSupplier, // logic sudah benar
        amount: paymentForm.amount,
        payment_date: paymentForm.payment_date,
        reference_number: paymentForm.reference_number,
        kasir_name: user?.full_name || 'Unknown',
        keterangan: paymentForm.keterangan
      });
      toast({
        title: "Berhasil",
        description: "Pembayaran hutang berhasil dicatat"
      });
      setIsPaymentDialogOpen(false);
      setSelectedSupplier('');
      setSelectedSupplierId('');
      setPaymentForm({
        amount: 0,
        reference_number: '',
        keterangan: '',
        payment_date: new Date().toISOString().split('T')[0]
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error && error.message ? error.message : "Terjadi kesalahan saat menyimpan pembayaran.",
        variant: "destructive"
      });
    }
  };

  const totalPayables = summary?.reduce((sum, item) => sum + item.total_payables, 0) || 0;
  const totalSuppliers = summary?.length || 0;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Pembayaran Hutang</h1>
                <p className="text-gray-600">Kelola pembayaran hutang supplier</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <SupplierPayablesSummary
              totalPayables={totalPayables}
              totalSuppliers={totalSuppliers}
            />

            {/* Outstanding Payables */}
            <OutstandingPayablesTable
              summary={summary}
              loading={summaryLoading}
              onSelectSupplier={handleSelectSupplier}
            />

            {/* Payment Dialog */}
            <SupplierPaymentDialog
              open={isPaymentDialogOpen}
              onOpenChange={setIsPaymentDialogOpen}
              selectedSupplier={selectedSupplier}
              paymentForm={paymentForm}
              setPaymentForm={setPaymentForm}
              onSave={handleRecordPayment}
              isPending={recordPayment.isPending}
            />

            {/* Recent Payments */}
            <SupplierPaymentsHistoryTable
              payments={recentPayments || []}
              loading={paymentsLoading}
              suppliers={suppliers || []}
              filterSupplier={filterSupplier}
              setFilterSupplier={setFilterSupplier}
              filterDate={filterDate}
              setFilterDate={setFilterDate}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PembayaranHutangPage;
