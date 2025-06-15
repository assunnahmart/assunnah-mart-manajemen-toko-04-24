
import { useState } from 'react';
import { useCustomerReceivablesSummary, useRecordCustomerPaymentIntegrated, useCustomerReceivablesLedger } from '@/hooks/useLedgers';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export function usePembayaranPiutangLogic() {
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
  const recordPayment = useRecordCustomerPaymentIntegrated();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Summary dan total
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useCustomerReceivablesSummary();
  const totalReceivables = summary?.reduce((sum, item) => sum + (Number(item.total_receivables) || 0), 0) || 0;
  const totalCustomers = summary?.length || 0;
  const outstandingCustomers = summary || [];
  const allCustomerNames = outstandingCustomers.map(c => c.pelanggan_name);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const allSelected = selectedCustomers.length === allCustomerNames.length && allCustomerNames.length > 0;

  const { data: recentPayments, isLoading: paymentsLoading } = useCustomerReceivablesLedger(
    filterCustomer || undefined,
    filterDate || undefined,
    undefined
  );

  // Generate nomor referensi otomatis
  function generateReferenceNumber(customerName: string) {
    const now = new Date();
    const ymd = now.toISOString().split('T')[0].replace(/-/g, '');
    const hms = now.toTimeString().slice(0, 8).replace(/:/g, '');
    // Format: REF-YYYYMMDD-HHmmss-nama
    const nama = (customerName || '').replace(/\s+/g, '-').slice(0, 8);
    return `REF-${ymd}-${hms}-${nama}`;
  }

  function getLatestCreditReference(customerName: string) {
    const allLedgers = recentPayments || [];
    const forCust = allLedgers.filter(
      l => 
        l.pelanggan_name === customerName &&
        l.reference_type === 'pos_transaction' &&
        l.reference_number
    );
    if (forCust.length > 0) {
      return forCust[0]?.reference_number;
    }
    return null;
  }

  // Fix: always fill payment_date, amount, reference_number secara default saat pilih customer
  const handleSelectCustomer = (customerName: string, currentBalance: number) => {
    setSelectedCustomer(customerName);
    const refNumber =
      getLatestCreditReference(customerName) ||
      generateReferenceNumber(customerName);

    setPaymentForm({
      amount: currentBalance,
      reference_number: refNumber,
      keterangan: '',
      payment_date: new Date().toISOString().split('T')[0]
    });
    setIsPaymentDialogOpen(true);
  };

  // Memperbaiki logika validasi dan error message
  const handleRecordPayment = async () => {
    if (!selectedCustomer || !paymentForm.amount || !paymentForm.reference_number) {
      toast({
        title: "Error",
        description: "Lengkapi semua field yang diperlukan!",
        variant: "destructive"
      });
      return;
    }

    if (paymentForm.amount <= 0) {
      toast({
        title: "Error",
        description: "Jumlah pembayaran harus lebih dari 0",
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

      refetchSummary();
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
        description: error.message || "Gagal menyimpan pembayaran!",
        variant: "destructive"
      });
    }
  };

  // Select all/mass payment logic (tidak diubah)
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

  const [massPaymentForm, setMassPaymentForm] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    keterangan: ''
  });

  const [prevMassPaymentDialogOpen, setPrevMassPaymentDialogOpen] = useState(false);
  const [isMassPaymentDialogOpen, setIsMassPaymentDialogOpen] = useState(false);
  const [isProcessingMassPayment, setIsProcessingMassPayment] = useState(false);

  const handleOpenMassPaymentDialog = (open: boolean) => {
    setIsMassPaymentDialogOpen(open);
    if (open && !prevMassPaymentDialogOpen) {
      let nomorRef: string | null = null;
      if (selectedCustomers.length === 1) {
        nomorRef = getLatestCreditReference(selectedCustomers[0]) || generateReferenceNumber(selectedCustomers[0]);
      } else if (selectedCustomers.length > 1) {
        nomorRef = 'BATCH-' + generateReferenceNumber(selectedCustomers[0]);
      } else {
        nomorRef = '';
      }
      setMassPaymentForm(prev => ({
        ...prev,
        reference_number: nomorRef
      }));
    }
    setPrevMassPaymentDialogOpen(open);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['customer-receivables-summary'] });
    queryClient.invalidateQueries({ queryKey: ['customer-receivables-ledger'] });
  };
  
  const handleMassPayment = async () => {
    setIsProcessingMassPayment(true);
    setTimeout(() => {
      setIsProcessingMassPayment(false);
    }, 500);
  };

  return {
    state: {
      isPaymentDialogOpen, setIsPaymentDialogOpen, selectedCustomer, setSelectedCustomer, paymentForm, setPaymentForm,
      filterCustomer, setFilterCustomer, filterDate, setFilterDate,
      summary, summaryLoading, recentPayments, paymentsLoading,
      totalReceivables, totalCustomers,
      outstandingCustomers, allCustomerNames, selectedCustomers, setSelectedCustomers, allSelected,
      isProcessingMassPayment, setIsProcessingMassPayment, isMassPaymentDialogOpen, setIsMassPaymentDialogOpen,
      massPaymentForm, setMassPaymentForm
    },
    handlers: {
      handleSelectCustomer,
      handleRecordPayment,
      handleSelectAll,
      handleSelectRow,
      handleMassPayment,
      handleRefresh,
      onOpenMassPayment: handleOpenMassPaymentDialog,
    },
    recordPayment,
  };
}
