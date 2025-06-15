import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { useCustomerReceivablesSummary, useRecordCustomerPayment, useCustomerReceivablesLedger } from '@/hooks/useLedgers';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

import { CustomerReceivablesSummary } from './pembayaran-piutang/CustomerReceivablesSummary';
import { OutstandingReceivablesTable } from './pembayaran-piutang/OutstandingReceivablesTable';
import { RecentPaymentsTable } from './pembayaran-piutang/RecentPaymentsTable';
import { PaymentDialog } from './pembayaran-piutang/PaymentDialog';
import { MassPaymentDialog } from './pembayaran-piutang/MassPaymentDialog';

const PembayaranPiutangPage = () => {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    reference_number: '',
    keterangan: '',
    payment_date: new Date().toISOString().split('T')[0]
  });
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const { user } = useSimpleAuth();
  const { data: summary, isLoading: summaryLoading } = useCustomerReceivablesSummary();
  const { data: recentPayments, isLoading: paymentsLoading } = useCustomerReceivablesLedger(
    filterCustomer || undefined,
    filterDate || undefined,
    undefined
  );
  const recordPayment = useRecordCustomerPayment();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const totalReceivables = summary?.reduce((sum, item) => sum + item.total_receivables, 0) || 0;
  const totalCustomers = summary?.length || 0;

  // Multi select logic
  const outstandingCustomers = summary?.filter(c => c.total_receivables > 0) || [];
  const allCustomerNames = outstandingCustomers.map(c => c.pelanggan_name);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const allSelected = selectedCustomers.length === allCustomerNames.length && allCustomerNames.length > 0;

  const handleSelectCustomer = (customerName: string, currentBalance: number) => {
    setSelectedCustomer(customerName);
    setPaymentForm(prev => ({
      ...prev,
      amount: currentBalance
    }));
    setIsPaymentDialogOpen(true);
  };

  const handleRecordPayment = async () => {
    if (!selectedCustomer || !paymentForm.amount || !paymentForm.reference_number) {
      toast({
        title: "Error",
        description: "Lengkapi semua field yang diperlukan",
        variant: "destructive"
      });
      return;
    }

    try {
      await recordPayment.mutateAsync({
        pelanggan_name: selectedCustomer,
        amount: paymentForm.amount,
        payment_date: paymentForm.payment_date,
        reference_number: paymentForm.reference_number,
        kasir_name: user?.full_name || 'Unknown',
        keterangan: paymentForm.keterangan
      });

      toast({
        title: "Berhasil",
        description: "Pembayaran piutang berhasil dicatat"
      });

      setIsPaymentDialogOpen(false);
      setSelectedCustomer('');
      setPaymentForm({
        amount: 0,
        reference_number: '',
        keterangan: '',
        payment_date: new Date().toISOString().split('T')[0]
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Mass payment logic
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers([...allCustomerNames]);
    }
  };
  const handleSelectRow = (name: string) => {
    if (selectedCustomers.includes(name)) {
      setSelectedCustomers(selectedCustomers.filter(c => c !== name));
    } else {
      setSelectedCustomers([...selectedCustomers, name]);
    }
  };

  // Mass payment form
  const [massPaymentForm, setMassPaymentForm] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    keterangan: '',
  });
  const [isProcessingMassPayment, setIsProcessingMassPayment] = useState(false);
  const [isMassPaymentDialogOpen, setIsMassPaymentDialogOpen] = useState(false);

  const handleMassPayment = async () => {
    if (!massPaymentForm.reference_number || selectedCustomers.length === 0) {
      toast({
        title: "Error",
        description: "Pilih pelanggan dan isi nomor referensi",
        variant: "destructive",
      });
      return;
    }
    setIsProcessingMassPayment(true);
    let successCount = 0;
    let failCount = 0;
    for (const pelanggan_name of selectedCustomers) {
      const customerObj = outstandingCustomers.find(c => c.pelanggan_name === pelanggan_name);
      const amount = customerObj?.total_receivables || 0;
      try {
        await recordPayment.mutateAsync({
          pelanggan_name,
          amount,
          payment_date: massPaymentForm.payment_date,
          reference_number: massPaymentForm.reference_number,
          kasir_name: user?.full_name || 'Unknown',
          keterangan: massPaymentForm.keterangan,
        });
        successCount++;
      } catch (error: any) {
        failCount++;
        toast({
          title: "Gagal mencatat pembayaran",
          description: `${pelanggan_name}: ${error?.message || "Error"}`,
          variant: "destructive"
        });
      }
    }
    toast({
      title: "Proses pembayaran massal selesai",
      description: `${successCount} pembayaran berhasil, ${failCount} gagal.`,
      variant: failCount > 0 ? "destructive" : "default"
    });
    setIsProcessingMassPayment(false);
    setIsMassPaymentDialogOpen(false);
    setSelectedCustomers([]);
    setMassPaymentForm({
      payment_date: new Date().toISOString().split('T')[0],
      reference_number: '',
      keterangan: '',
    });
  };

  // Fungsi untuk manual refresh data summary dan ledgers
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['customer-receivables-summary'] });
    queryClient.invalidateQueries({ queryKey: ['customer-receivables-ledger'] });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Pembayaran Piutang</h1>
                <p className="text-gray-600">Kelola pembayaran piutang pelanggan</p>
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
            <CustomerReceivablesSummary
              totalReceivables={totalReceivables}
              totalCustomers={totalCustomers}
            />

            {/* Outstanding Receivables */}
            <OutstandingReceivablesTable
              summary={summary || []}
              summaryLoading={summaryLoading}
              selectedCustomers={selectedCustomers}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
              onClickPay={handleSelectCustomer}
              allSelected={allSelected}
              onOpenMassPayment={() => setIsMassPaymentDialogOpen(true)}
            />

            {/* Riwayat Pembayaran */}
            <RecentPaymentsTable
              payments={recentPayments || []}
              loading={paymentsLoading}
              filterCustomer={filterCustomer}
              setFilterCustomer={setFilterCustomer}
              filterDate={filterDate}
              setFilterDate={setFilterDate}
            />

            {/* Payment Dialog */}
            <PaymentDialog
              open={isPaymentDialogOpen}
              onOpenChange={setIsPaymentDialogOpen}
              selectedCustomer={selectedCustomer}
              paymentForm={paymentForm}
              setPaymentForm={setPaymentForm}
              onSave={handleRecordPayment}
              isPending={recordPayment.isPending}
            />

            {/* Mass Payment Dialog */}
            <MassPaymentDialog
              open={isMassPaymentDialogOpen}
              onOpenChange={setIsMassPaymentDialogOpen}
              selectedCustomers={selectedCustomers}
              massPaymentForm={massPaymentForm}
              setMassPaymentForm={setMassPaymentForm}
              onSave={handleMassPayment}
              isProcessing={isProcessingMassPayment}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PembayaranPiutangPage;
