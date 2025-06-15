
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, Package, Users, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { useStockOpnameRecap } from '@/hooks/useStockOpnameRecap';
import { useStockOpnameRealTime } from '@/hooks/useStockOpnameRealTime';
import { Button } from '@/components/ui/button';

const NewStokDashboard = () => {
  const [dateFrom] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dateTo] = useState(new Date().toISOString().split('T')[0]);

  const { data: recapData, isLoading: isLoadingRecap, refetch: refetchRecap } = useStockOpnameRecap(dateFrom, dateTo);
  const { data: realTimeData, isLoading: isLoadingRealTime } = useStockOpnameRealTime();

  const getVarianceStats = () => {
    if (!recapData) return { positive: 0, negative: 0, zero: 0, totalItems: 0, totalVariance: 0 };
    
    return recapData.reduce(
      (acc, item) => {
        acc.totalItems++;
        acc.totalVariance += Math.abs(item.selisih_stok);
        
        if (item.selisih_stok > 0) acc.positive++;
        else if (item.selisih_stok < 0) acc.negative++;
        else acc.zero++;
        
        return acc;
      },
      { positive: 0, negative: 0, zero: 0, totalItems: 0, totalVariance: 0 }
    );
  };

  const getRealTimeStats = () => {
    if (!realTimeData) return { totalInputs: 0, uniqueProducts: 0, activeUsers: 0 };
    
    const uniqueProducts = new Set(realTimeData.map(item => item.barang_id)).size;
    const activeUsers = new Set(realTimeData.map(item => item.kasir_id)).size;
    
    return {
      totalInputs: realTimeData.length,
      uniqueProducts,
      activeUsers
    };
  };

  const stats = getVarianceStats();
  const realTimeStats = getRealTimeStats();

  if (isLoadingRecap || isLoadingRealTime) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Memuat dashboard...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard New Stok</h2>
          <p className="text-gray-600">
            Overview sistem new stok dengan perhitungan selisih real-time
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetchRecap()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>New Stok System:</strong> Sistem ini memungkinkan multiple user input untuk barang yang sama. 
          Stok sistem tetap tidak berubah, total real stok dihitung dari semua input pengguna.
        </AlertDescription>
      </Alert>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Input Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">{realTimeStats.totalInputs}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Produk Terinput</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{realTimeStats.uniqueProducts}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">User Aktif</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold text-purple-600">{realTimeStats.activeUsers}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Selisih</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{stats.totalVariance}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Variance Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lebih Sistem</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">{stats.positive}</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">produk</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">Stok sistem lebih besar dari real</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lebih Real</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-600">{stats.negative}</span>
              <Badge variant="secondary" className="bg-red-100 text-red-800">produk</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">Stok real lebih besar dari sistem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Seimbang</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{stats.zero}</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">produk</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">Stok sistem sama dengan real</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru (Real-time)</CardTitle>
        </CardHeader>
        <CardContent>
          {realTimeData && realTimeData.length > 0 ? (
            <div className="space-y-3">
              {realTimeData.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.produk_pembelian?.nama_produk}</p>
                    <p className="text-sm text-gray-600">
                      Input oleh: {item.kasir?.nama} • Stok Real: {item.stok_fisik} {item.produk_pembelian?.satuan}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      item.stok_fisik === item.stok_sistem 
                        ? "default" 
                        : item.stok_fisik > item.stok_sistem 
                          ? "secondary" 
                          : "destructive"
                    }>
                      Selisih: {item.stok_fisik - item.stok_sistem}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.created_at).toLocaleTimeString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada aktivitas input stok hari ini</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewStokDashboard;
