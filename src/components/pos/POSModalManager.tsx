
import POSModals from '@/components/pos/POSModals';
import CameraBarcodeScanner from '@/components/stock/CameraBarcodeScanner';
import POSFastTransactionHistory from '@/components/pos/POSFastTransactionHistory';
import { useToast } from '@/hooks/use-toast';

interface POSModalManagerProps {
  showTransactionHistory: boolean;
  setShowTransactionHistory: (show: boolean) => void;
  showKonsinyasi: boolean;
  setShowKonsinyasi: (show: boolean) => void;
  showStockOpname: boolean;
  setShowStockOpname: (show: boolean) => void;
  showKasirKas: boolean;
  setShowKasirKas: (show: boolean) => void;
  showKasUmum: boolean;
  setShowKasUmum: (show: boolean) => void;
  showDailyReport: boolean;
  setShowDailyReport: (show: boolean) => void;
  showQuickScanner: boolean;
  setShowQuickScanner: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  userFullName?: string;
}

const POSModalManager = ({
  showTransactionHistory,
  setShowTransactionHistory,
  showKonsinyasi,
  setShowKonsinyasi,
  showStockOpname,
  setShowStockOpname,
  showKasirKas,
  setShowKasirKas,
  showKasUmum,
  setShowKasUmum,
  showDailyReport,
  setShowDailyReport,
  showQuickScanner,
  setShowQuickScanner,
  setSearchQuery,
  userFullName
}: POSModalManagerProps) => {
  const { toast } = useToast();

  const handleQuickScanBarcodeScanned = (barcode: string) => {
    setSearchQuery(barcode);
    setShowQuickScanner(false);
    toast({
      title: "Produk ditemukan",
      description: `Barcode ${barcode} berhasil di-scan`
    });
  };

  return (
    <>
      <POSModals
        showTransactionHistory={showTransactionHistory}
        setShowTransactionHistory={setShowTransactionHistory}
        showKonsinyasi={showKonsinyasi}
        setShowKonsinyasi={setShowKonsinyasi}
        showStockOpname={showStockOpname}
        setShowStockOpname={setShowStockOpname}
        showKasirKas={showKasirKas}
        setShowKasirKas={setShowKasirKas}
        showKasUmum={showKasUmum}
        setShowKasUmum={setShowKasUmum}
        showDailyReport={showDailyReport}
        setShowDailyReport={setShowDailyReport}
        userFullName={userFullName}
      />

      <POSFastTransactionHistory
        isOpen={showTransactionHistory}
        onClose={() => setShowTransactionHistory(false)}
        kasirName={userFullName}
      />

      <CameraBarcodeScanner 
        isOpen={showQuickScanner} 
        onScan={handleQuickScanBarcodeScanned} 
        onClose={() => setShowQuickScanner(false)} 
      />
    </>
  );
};

export default POSModalManager;
