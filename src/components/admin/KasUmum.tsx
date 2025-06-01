
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useKasUmum } from '@/hooks/useAdminReports';
import { DollarSign, TrendingUp, Download, Banknote } from 'lucide-react';

const KasUmum = () => {
  const { data: kasData, isLoading } = useKasUmum();

  const exportKasData = () => {
    if (!kasData) return;
    
    const data = {
      tanggal_cetak: new Date().toLocaleDateString('id-ID'),
      total_kas_masuk: kasData.totalKasMasuk,
      kas_hari_ini: kasData.todayKasMasuk,
      total_transaksi: kasData.totalTransaksiKas,
      transaksi_hari_ini: kasData.todayTransaksiKas,
      detail_transaksi: kasData.detailTransaksi
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kas-umum-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kas Umum</h2>
          <p className="text-gray-600">Monitoring arus kas masuk dari penjualan tunai</p>
        </div>
        <Button onClick={exportKasData} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Kas
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Kas Masuk</p>
                <p className="text-2xl font-bold text-green-600">
                  Rp {(kasData?.totalKasMasuk || 0).toLocaleString('id-ID')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kas Hari Ini</p>
                <p className="text-2xl font-bold text-blue-600">
                  Rp {(kasData?.todayKasMasuk || 0).toLocaleString('id-ID')}
                </p>
              </div>
              <Banknote className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                <p className="text-2xl font-bold text-purple-600">
                  {kasData?.totalTransaksiKas || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transaksi Hari Ini</p>
                <p className="text-2xl font-bold text-orange-600">
                  {kasData?.todayTransaksiKas || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Transaksi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {kasData?.todayTransaksi?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Belum ada transaksi hari ini</p>
              ) : (
                kasData?.todayTransaksi?.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {'transaction_number' in transaction ? transaction.transaction_number : transaction.nomor_transaksi}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleTimeString('id-ID')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {'kasir_name' in transaction ? transaction.kasir_name : 'Manual Entry'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        Rp {(('total_amount' in transaction) ? transaction.total_amount : transaction.total).toLocaleString('id-ID')}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Tunai
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent All Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Transaksi Terbaru (Semua)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {kasData?.detailTransaksi?.slice(0, 10).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {'transaction_number' in transaction ? transaction.transaction_number : transaction.nomor_transaksi}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {'kasir_name' in transaction ? transaction.kasir_name : 'Manual Entry'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      Rp {(('total_amount' in transaction) ? transaction.total_amount : transaction.total).toLocaleString('id-ID')}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Tunai
                    </Badge>
                  </div>
                </div>
              )) || <p className="text-gray-500 text-center py-4">Tidak ada data transaksi</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KasUmum;
