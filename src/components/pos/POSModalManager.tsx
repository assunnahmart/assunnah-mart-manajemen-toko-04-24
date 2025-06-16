import { Package, Scan, Wallet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import POSKasirTransactionHistory from '@/components/pos/POSKasirTransactionHistory';
import POSDailyReport from '@/components/pos/POSDailyReport';
import KonsinyasiHarianForm from '@/components/konsinyasi/KonsinyasiHarianForm';
import KonsinyasiHarianHistory from '@/components/konsinyasi/KonsinyasiHarianHistory';
import StockOpname from '@/components/stock/StockOpname';
import KasirKasForm from '@/components/kas/KasirKasForm';
import KasirKasHistory from '@/components/kas/KasirKasHistory';
import KasUmumForm from '@/components/kas/KasUmumForm';
import KasUmumHistory from '@/components/kas/KasUmumHistory';
import CameraBarcodeScanner from '@/components/stock/CameraBarcodeScanner';
import POSModals from './POSModals';

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
  const handleBarcodeScanned = (barcode: string) => {
    setSearchQuery(barcode);
    setShowQuickScanner(false);
  };

  return (
    <>
      {/* Quick Scanner Modal */}
      <CameraBarcodeScanner 
        isOpen={showQuickScanner} 
        onScan={handleBarcodeScanned} 
        onClose={() => setShowQuickScanner(false)} 
      />

      {/* All other modals */}
      <POSModals
        showTransactionHistory={showTransactionHistory}
        setShowTransactionHistory={setShowTransactionHistory}
        showKonsinyasi={showKonsinyasi}
        setShowStockOpname={showStockOpname}
        setShowStockOpname={setShowStockOpname}
        showKasirKas={showKasirKas}
        setShowKasirKas={setShowKasirKas}
        showKasUmum={showKasUmum}
        setShowKasUmum={setShowKasUmum}
        showDailyReport={showDailyReport}
        setShowDailyReport={setShowDailyReport}
        userFullName={userFullName}
      />
    </>
  );
};

export default POSModalManager;
