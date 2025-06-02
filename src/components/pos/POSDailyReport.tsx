
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer, DollarSign, CreditCard, Wallet, FileText, Calendar, TrendingDown, Package } from 'lucide-react';
import { usePOSReportsByKasir } from '@/hooks/usePOSReports';
import { useKasBalanceToday } from '@/hooks/useKasBalance';
import { useKonsinyasiHarian } from '@/hooks/useKonsinyasiHarian';

interface POSDailyReportProps {
  isOpen: boolean;
  onClose: () => void;
  kasirName: string;
}

const POSDailyReport = ({ isOpen, onClose, kasirName }: POSDailyReportProps) => {
  const { data: kasirReports, isLoading: loadingReports } = usePOSReportsByKasir(kasirName);
  const { data: kasBalance, isLoading: loadingBalance } = useKasBalanceToday(kasirName);
  const { data: konsinyasiData, isLoading: loadingKonsinyasi } = useKonsinyasiHarian();

  // Filter today's consignment data by kasir
  const todayKonsinyasi = konsinyasiData?.filter(item => {
    const today = new Date().toISOString().split('T')[0];
    const itemDate = new Date(item.created_at).toISOString().split('T')[0];
    return itemDate === today && item.kasir_name === kasirName;
  }) || [];

  const totalKonsinyasiPayment = todayKonsinyasi.reduce((sum, item) => sum + (item.total_pembayaran || 0), 0);

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

  if (loadingReports || loadingBalance || loadingKonsinyasi) {
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Laporan Harian Kasir
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 print:space-y-4">
          {/* Header Info */}
          <div className="text-center border-b pb-4 print:pb-2">
            <h2 className="text-xl font-bold">Rekap Penjualan & Kas Harian</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cash Sales */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-green-700">
                  <DollarSign className="h-4 w-4" />
                  Penjualan Tunai
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-700">
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
                <div className="text-xl font-bold text-orange-700">
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
                  Saldo Kas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-blue-700">
                  Rp {(kasBalance?.saldoKas || 0).toLocaleString('id-ID')}
                </div>
                <p className="text-sm text-gray-600">
                  Kas Kasir
                </p>
              </CardContent>
            </Card>

            {/* Consignment Payments */}
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-red-700">
                  <Package className="h-4 w-4" />
                  Bayar Konsinyasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-700">
                  Rp {totalKonsinyasiPayment.toLocaleString('id-ID')}
                </div>
                <p className="text-sm text-gray-600">
                  {todayKonsinyasi.length} Pembayaran
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ringkasan Penjualan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
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
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total Penjualan:</span>
                    <span className="font-bold text-green-600">Rp {kasirData.grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ringkasan Kas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Kas Masuk:</span>
                    <span className="font-medium text-green-600">Rp {(kasBalance?.masuk || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kas Keluar:</span>
                    <span className="font-medium text-red-600">Rp {(kasBalance?.keluar || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bayar Konsinyasi:</span>
                    <span className="font-medium text-red-600">Rp {totalKonsinyasiPayment.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Saldo Akhir:</span>
                    <span className="font-bold text-blue-600">Rp {(kasBalance?.saldoKas || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Consignment Details */}
          {todayKonsinyasi.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Detail Konsinyasi Harian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayKonsinyasi.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-gray-600">
                          {item.supplier_name} • Real Terjual: {item.jumlah_real_terjual}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">
                          Rp {(item.total_pembayaran || 0).toLocaleString('id-ID')}
                        </div>
                        <div className="text-xs text-gray-500">Pembayaran</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
