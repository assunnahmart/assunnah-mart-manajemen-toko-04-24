import { useState } from 'react';
import { useCustomerReceivablesSummary, useRecordCustomerPayment, useCustomerReceivablesLedger, useRecordCustomerPaymentIntegrated } from '@/hooks/useLedgers';
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
  const recordPayment = useRecordCustomerPaymentIntegrated(); // GANTI pemakaian hook
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Gantilogic summary dan recalculasi totalReceivables/totalCustomers sesuai summary bersih
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useCustomerReceivablesSummary();

  // Total piutang = sum all total_receivables
  const totalReceivables = summary?.reduce((sum, item) => sum + (Number(item.total_receivables) || 0), 0) || 0;
  const totalCustomers = summary?.length || 0;

  // Outstanding Customers = semua dengan saldo > 0 dari summary
  const outstandingCustomers = summary || [];

  // Multi select logic
  const allCustomerNames = outstandingCustomers.map(c => c.pelanggan_name);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const allSelected = selectedCustomers.length === allCustomerNames.length && allCustomerNames.length > 0;

  const { data: recentPayments, isLoading: paymentsLoading } = useCustomerReceivablesLedger(
    filterCustomer || undefined,
    filterDate || undefined,
    undefined
  );

  // Fungsi untuk generate nomor referensi otomatis jika tidak ditemukan di ledger
  function generateReferenceNumber(customerName: string) {
    const now = new Date();
    const ymd = now.toISOString().split('T')[0].replace(/-/g, '');
    const hms = now.toTimeString().slice(0, 8).replace(/:/g, '');
    // Format: REF-YYYYMMDD-HHmmss-nama
    const nama = (customerName || '').replace(/\s+/g, '-').slice(0, 8);
    return `REF-${ymd}-${hms}-${nama}`;
  }

  // Mengambil transaksi kredit terbaru pelanggan (dari ledger, ref_type 'pos_transaction')
  function getLatestCreditReference(customerName: string) {
    // Cari latest ledger entry dengan ref_type 'pos_transaction' untuk customer
    // ledger diurutkan desc created_at, jadi ambil yang pertama saja
    const allLedgers = recentPayments || [];
    const forCust = allLedgers.filter(
      l => 
        l.pelanggan_name === customerName &&
        l.reference_type === 'pos_transaction' &&
        l.reference_number // harus ada
    );
    if (forCust.length > 0) {
      // Return the latest one
      return forCust[0]?.reference_number;
    }
    return null;
  }

  // Ubah logic handleSelectCustomer agar reference_number otomatis (prefer data, fallback generator)
  const handleSelectCustomer = (customerName: string, currentBalance: number) => {
    setSelectedCustomer(customerName);

    // Cari nomor referensi transaksi kredit pelanggan, fallback otomatis
    const refNumber =
      getLatestCreditReference(customerName) ||
      generateReferenceNumber(customerName);

    setPaymentForm(prev => ({
      ...prev,
      amount: currentBalance,
      reference_number: refNumber
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

  // Mass payment juga isi otomatis reference number
  const [massPaymentForm, setMassPaymentForm] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    keterangan: '',
  });

  const [prevMassPaymentDialogOpen, setPrevMassPaymentDialogOpen] = useState(false);

  // Add missing mass payment dialog state
  const [isMassPaymentDialogOpen, setIsMassPaymentDialogOpen] = useState(false);

  // Add missing processing mass payment state
  const [isProcessingMassPayment, setIsProcessingMassPayment] = useState(false);

  // Otomatis isi pada open mass payment dialog
  const handleOpenMassPaymentDialog = (open: boolean) => {
    setIsMassPaymentDialogOpen(open);
    // Only set on open (prevent overwrite when typing)
    if (open && !prevMassPaymentDialogOpen) {
      // Ambil semua unique ref number dari selected, fallback generator
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

  // Manual refresh
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['customer-receivables-summary'] });
    queryClient.invalidateQueries({ queryKey: ['customer-receivables-ledger'] });
  };
  
  // Mass payment logic (add handler to fix error)
  const handleMassPayment = async () => {
    setIsProcessingMassPayment(true);
    // Placeholder: implement logic as needed
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
      onOpenMassPayment: handleOpenMassPaymentDialog, // pakai di halaman
    },
    recordPayment,
  };
}
