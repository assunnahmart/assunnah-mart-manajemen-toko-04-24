
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
    const nama = (customerName || '').replace(/\s+/g, '-').slice(0, 8);
    return `PAY-${ymd}-${hms}-${nama}`;
  }

  const handleSelectCustomer = (customerName: string, currentBalance: number) => {
    setSelectedCustomer(customerName);
    setPaymentForm({
      amount: currentBalance,
      keterangan: '',
      payment_date: new Date().toISOString().split('T')[0]
    });
    setIsPaymentDialogOpen(true);
  };

  const handleRecordPayment = async () => {
    if (!selectedCustomer || !paymentForm.amount) {
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
      // Generate reference number automatically
      const referenceNumber = generateReferenceNumber(selectedCustomer);
      
      await recordPayment.mutateAsync({
        pelanggan_name: selectedCustomer,
        amount: paymentForm.amount,
        payment_date: paymentForm.payment_date,
        reference_number: referenceNumber,
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

  // Select all/mass payment logic
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
    keterangan: ''
  });

  const [isMassPaymentDialogOpen, setIsMassPaymentDialogOpen] = useState(false);
  const [isProcessingMassPayment, setIsProcessingMassPayment] = useState(false);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['customer-receivables-summary'] });
    queryClient.invalidateQueries({ queryKey: ['customer-receivables-ledger'] });
  };
  
  const handleMassPayment = async () => {
    if (selectedCustomers.length === 0) {
      toast({
        title: "Error",
        description: "Pilih minimal satu pelanggan untuk pembayaran massal",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingMassPayment(true);

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Process each selected customer
      for (const customerName of selectedCustomers) {
        try {
          // Find customer balance
          const customer = outstandingCustomers.find(c => c.pelanggan_name === customerName);
          if (!customer || customer.total_receivables <= 0) {
            errors.push(`${customerName}: Tidak ada piutang yang perlu dibayar`);
            errorCount++;
            continue;
          }

          // Generate unique reference number for each customer
          const referenceNumber = generateReferenceNumber(customerName);
          
          // Record payment for full balance
          await recordPayment.mutateAsync({
            pelanggan_name: customerName,
            amount: Number(customer.total_receivables),
            payment_date: massPaymentForm.payment_date,
            reference_number: referenceNumber,
            kasir_name: user?.full_name || 'Unknown',
            keterangan: `Pembayaran massal - ${massPaymentForm.keterangan || 'Pelunasan piutang'}`
          });

          successCount++;
        } catch (error: any) {
          errorCount++;
          errors.push(`${customerName}: ${error.message}`);
        }
      }

      // Show results
      if (successCount > 0) {
        toast({
          title: "Pembayaran Massal Selesai",
          description: `Berhasil: ${successCount} pelanggan, Gagal: ${errorCount} pelanggan`,
          variant: successCount > errorCount ? "default" : "destructive"
        });
      }

      if (errors.length > 0 && errors.length <= 3) {
        // Show first few errors
        toast({
          title: "Detail Error",
          description: errors.slice(0, 3).join('; '),
          variant: "destructive"
        });
      }

      // Refresh data and close dialog
      if (successCount > 0) {
        refetchSummary();
        setSelectedCustomers([]);
        setIsMassPaymentDialogOpen(false);
        setMassPaymentForm({
          payment_date: new Date().toISOString().split('T')[0],
          keterangan: ''
        });
      }

    } catch (error: any) {
      toast({
        title: "Error Pembayaran Massal",
        description: error.message || "Terjadi kesalahan dalam proses pembayaran massal",
        variant: "destructive"
      });
    } finally {
      setIsProcessingMassPayment(false);
    }
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
    },
    recordPayment,
  };
}
