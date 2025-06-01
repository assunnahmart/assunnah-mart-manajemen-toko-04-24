
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface POSTransactionSyncProps {
  onTransactionComplete: (transactionData: any, items: any[]) => void;
  children: React.ReactNode;
}

const POSTransactionSync = ({ onTransactionComplete, children }: POSTransactionSyncProps) => {
  const { toast } = useToast();

  useEffect(() => {
    // Listen for POS transaction completion events
    const handleTransactionComplete = (event: CustomEvent) => {
      const { transaction, items } = event.detail;
      
      console.log('POS Transaction completed, syncing data:', { transaction, items });
      
      // Trigger data synchronization
      onTransactionComplete(transaction, items);
      
      toast({
        title: "Transaksi tersinkronisasi",
        description: `Data transaksi ${transaction.transaction_number} berhasil disimpan dan disinkronkan`,
      });
    };

    window.addEventListener('pos-transaction-complete', handleTransactionComplete as EventListener);
    
    return () => {
      window.removeEventListener('pos-transaction-complete', handleTransactionComplete as EventListener);
    };
  }, [onTransactionComplete, toast]);

  return <>{children}</>;
};

export default POSTransactionSync;
