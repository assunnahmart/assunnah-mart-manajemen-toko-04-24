
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

interface POSModalsProps {
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
  userFullName?: string;
}

const POSModals = ({
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
  userFullName
}: POSModalsProps) => {
  return (
    <>
      {/* Transaction History Modal */}
      {showTransactionHistory && userFullName && (
        <POSKasirTransactionHistory 
          isOpen={showTransactionHistory} 
          onClose={() => setShowTransactionHistory(false)} 
          kasirName={userFullName} 
        />
      )}

      {/* Konsinyasi Harian Modal */}
      {showKonsinyasi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Konsinyasi Harian
              </h2>
              <Button variant="ghost" onClick={() => setShowKonsinyasi(false)} className="h-8 w-8 p-0">
                ×
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-6">
                <KonsinyasiHarianForm />
                <KonsinyasiHarianHistory />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Opname Modal */}
      {showStockOpname && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Scan className="h-5 w-4" />
                Stok Opname dengan Scanner Barcode
              </h2>
              <Button variant="ghost" onClick={() => setShowStockOpname(false)} className="h-8 w-8 p-0">
                ×
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <StockOpname />
            </div>
          </div>
        </div>
      )}

      {/* Kas Kasir Modal */}
      {showKasirKas && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Kas Kasir
              </h2>
              <Button variant="ghost" onClick={() => setShowKasirKas(false)} className="h-8 w-8 p-0">
                ×
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-6">
                <KasirKasForm />
                <KasirKasHistory />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kas Umum Modal */}
      {showKasUmum && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Kas Umum
              </h2>
              <Button variant="ghost" onClick={() => setShowKasUmum(false)} className="h-8 w-8 p-0">
                ×
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-6">
                <KasUmumForm />
                <KasUmumHistory />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Report Modal */}
      {showDailyReport && userFullName && (
        <POSDailyReport 
          isOpen={showDailyReport} 
          onClose={() => setShowDailyReport(false)} 
          kasirName={userFullName} 
        />
      )}
    </>
  );
};

export default POSModals;
