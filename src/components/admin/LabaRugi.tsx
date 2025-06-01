
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLabaRugi } from '@/hooks/useAdminReports';
import { TrendingUp, TrendingDown, DollarSign, Download, BarChart } from 'lucide-react';

const LabaRugi = () => {
  const { data: labaRugiData, isLoading } = useLabaRugi();

  const exportLabaRugi = () => {
    if (!labaRugiData) return;
    
    const data = {
      tanggal_cetak: new Date().toLocaleDateString('id-ID'),
      periode: 'Total Keseluruhan',
      pendapatan: labaRugiData.totalPendapatan,
      hpp: labaRugiData.totalHPP,
      laba_kotor: labaRugiData.labaKotor,
      margin_keuntungan: labaRugiData.marginKeuntungan,
      pendapatan_hari_ini: labaRugiData.todayPendapatan,
      total_transaksi: labaRugiData.totalTransaksi,
      transaksi_hari_ini: labaRugiData.todayTransaksi
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laba-rugi-${new Date().toISOString().split('T')[0]}.json`;
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
          <h2 className="text-2xl font-bold">Laporan Laba Rugi</h2>
          <p className="text-gray-600">Analisis profitabilitas dan performa keuangan</p>
        </div>
        <Button onClick={exportLabaRugi} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Laporan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                <p className="text-2xl font-bold text-green-600">
                  Rp {(labaRugiData?.totalPendapatan || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {labaRugiData?.totalTransaksi || 0} transaksi
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
                <p className="text-sm font-medium text-gray-600">HPP (Harga Pokok Penjualan)</p>
                <p className="text-2xl font-bold text-red-600">
                  Rp {(labaRugiData?.totalHPP || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Cost of goods sold
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Laba Kotor</p>
                <p className="text-2xl font-bold text-blue-600">
                  Rp {(labaRugiData?.labaKotor || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Pendapatan - HPP
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Margin Keuntungan</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(labaRugiData?.marginKeuntungan || 0).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Profit margin
                </p>
              </div>
              <BarChart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-orange-600">Performa Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                Rp {(labaRugiData?.todayPendapatan || 0).toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-gray-600">Pendapatan Hari Ini</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {labaRugiData?.todayTransaksi || 0}
              </p>
              <p className="text-sm text-gray-600">Transaksi Hari Ini</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                Rp {labaRugiData?.todayTransaksi ? Math.round((labaRugiData.todayPendapatan || 0) / labaRugiData.todayTransaksi).toLocaleString('id-ID') : '0'}
              </p>
              <p className="text-sm text-gray-600">Rata-rata per Transaksi</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Rincian Laba Rugi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="font-medium">Pendapatan Penjualan</span>
              <span className="font-bold text-green-600">
                Rp {(labaRugiData?.totalPendapatan || 0).toLocaleString('id-ID')}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b">
              <span className="font-medium">Harga Pokok Penjualan (HPP)</span>
              <span className="font-bold text-red-600">
                (Rp {(labaRugiData?.totalHPP || 0).toLocaleString('id-ID')})
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-400">
              <span className="font-bold text-lg">Laba Kotor</span>
              <span className="font-bold text-lg text-blue-600">
                Rp {(labaRugiData?.labaKotor || 0).toLocaleString('id-ID')}
              </span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Margin Keuntungan</span>
                <span className="font-bold text-purple-600">
                  {(labaRugiData?.marginKeuntungan || 0).toFixed(2)}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Dari setiap Rp 100 penjualan, keuntungan kotor adalah Rp {(labaRugiData?.marginKeuntungan || 0).toFixed(0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabaRugi;
