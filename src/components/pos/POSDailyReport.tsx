
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer, DollarSign, CreditCard, Wallet, FileText, Calendar } from 'lucide-react';
import { usePOSReportsByKasir } from '@/hooks/usePOSReports';
import { useKasBalanceToday } from '@/hooks/useKasBalance';

interface POSDailyReportProps {
  isOpen: boolean;
  onClose: () => void;
  kasirName: string;
}

const POSDailyReport = ({ isOpen, onClose, kasirName }: POSDailyReportProps) => {
  const { data: kasirReports, isLoading: loadingReports } = usePOSReportsByKasir(kasirName);
  const { data: kasBalance, isLoading: loadingBalance } = useKasBalanceToday(kasirName);

  const kasirData = kasirReports?.[0] || {
    kasirName,
    cashTransactions: 0,
    cashTotal: 0,
    creditTransactions: 0,
    creditTotal: 0,
    totalTransactions: 0,
    grandTotal: 0
  };

  const handlePrint = () => {
    window.print();
  };

  if (loadingReports || loadingBalance) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Laporan Harian Kasir
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 print:space-y-4">
          {/* Header Info */}
          <div className="text-center border-b pb-4 print:pb-2">
            <h2 className="text-xl font-bold">Rekap Penjualan Harian</h2>
            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-600">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Badge>
              <Badge variant="secondary">
                Kasir: {kasirName}
              </Badge>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cash Sales */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-green-700">
                  <DollarSign className="h-4 w-4" />
                  Penjualan Tunai
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  Rp {kasirData.cashTotal.toLocaleString('id-ID')}
                </div>
                <p className="text-sm text-gray-600">
                  {kasirData.cashTransactions} Transaksi
                </p>
              </CardContent>
            </Card>

            {/* Credit Sales */}
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-orange-700">
                  <CreditCard className="h-4 w-4" />
                  Penjualan Kredit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">
                  Rp {kasirData.creditTotal.toLocaleString('id-ID')}
                </div>
                <p className="text-sm text-gray-600">
                  {kasirData.creditTransactions} Transaksi
                </p>
              </CardContent>
            </Card>

            {/* Cash Balance */}
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-blue-700">
                  <Wallet className="h-4 w-4" />
                  Saldo Kas Tunai
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  Rp {(kasBalance?.saldoKas || 0).toLocaleString('id-ID')}
                </div>
                <p className="text-sm text-gray-600">
                  Hari ini
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ringkasan Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Transaksi:</span>
                    <span className="font-medium">{kasirData.totalTransactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaksi Tunai:</span>
                    <span className="font-medium">{kasirData.cashTransactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaksi Kredit:</span>
                    <span className="font-medium">{kasirData.creditTransactions}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Penjualan:</span>
                    <span className="font-bold">Rp {kasirData.grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kas Masuk:</span>
                    <span className="font-medium">Rp {(kasBalance?.masuk || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kas Keluar:</span>
                    <span className="font-medium">Rp {(kasBalance?.keluar || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 print:hidden">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Cetak Laporan
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default POSDailyReport;
