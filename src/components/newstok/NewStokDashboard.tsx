
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Users, Calculator, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useStockOpnameRealTime } from '@/hooks/useStockOpnameRecap';
import { useStockData } from '@/hooks/useStockManagement';

const NewStokDashboard = () => {
  const { data: realtimeData, isLoading } = useStockOpnameRealTime();
  const { data: stockData } = useStockData();

  const stats = [
    {
      title: 'Total Produk Sistem',
      value: stockData?.length || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Produk Sudah Diinput Hari Ini',
      value: realtimeData?.summary?.totalItems || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Selisih Stok',
      value: realtimeData?.summary?.totalVariance || 0,
      icon: Calculator,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Tingkat Akurasi',
      value: `${realtimeData?.summary?.accuracyRate || '100'}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const accuracyRate = parseFloat(realtimeData?.summary?.accuracyRate || '100');

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistem New Stok:</strong> Perhitungan selisih berdasarkan stok sistem tetap vs total real stok dari semua pengguna untuk barang yang sama.
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Accuracy Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tingkat Akurasi Stok Opname Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Akurasi Perhitungan</span>
            <Badge variant={accuracyRate >= 90 ? "default" : accuracyRate >= 75 ? "secondary" : "destructive"}>
              {accuracyRate}%
            </Badge>
          </div>
          <Progress value={accuracyRate} className="h-2" />
          <div className="text-xs text-gray-500">
            {accuracyRate >= 90 ? 'Excellent - Akurasi sangat tinggi' : 
             accuracyRate >= 75 ? 'Good - Akurasi baik' : 
             'Needs Attention - Perlu perhatian khusus'}
          </div>
        </CardContent>
      </Card>

      {/* Recent Input Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ringkasan Input Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Memuat data...</div>
          ) : realtimeData?.todayOpname?.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada input stok opname hari ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {realtimeData?.todayOpname?.slice(0, 5).map((opname, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{opname.barang_konsinyasi?.nama}</p>
                    <p className="text-sm text-gray-600">
                      Kasir: {opname.kasir?.nama} | Stok Real: {opname.stok_fisik}
                    </p>
                  </div>
                  <Badge variant={opname.stok_fisik === opname.stok_sistem ? "default" : "secondary"}>
                    {opname.stok_fisik === opname.stok_sistem ? 'Sesuai' : 'Selisih'}
                  </Badge>
                </div>
              ))}
              {(realtimeData?.todayOpname?.length || 0) > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  Dan {(realtimeData?.todayOpname?.length || 0) - 5} input lainnya...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewStokDashboard;
