
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Users,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useBarangKonsinyasi } from '@/hooks/useBarangKonsinyasi';
import { useStockOpnameRecap } from '@/hooks/useStockOpnameRecap';
import NewStokOpnameInput from './NewStokOpnameInput';
import NewStokSelisihAnalysis from './NewStokSelisihAnalysis';

const NewStokDashboard = () => {
  const [dateFrom] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dateTo] = useState(new Date().toISOString().split('T')[0]);

  const { data: barangData } = useBarangKonsinyasi();
  const { data: stockOpnameData } = useStockOpnameRecap(dateFrom, dateTo);

  // Filter products with low stock
  const lowStockProducts = barangData?.filter(item => 
    item.stok_saat_ini <= (item.stok_minimal || 0)
  ) || [];

  // Stock opname statistics
  const stockOpnameStats = {
    total: stockOpnameData?.length || 0,
    lebihSistem: stockOpnameData?.filter(item => item.selisih_stok > 0).length || 0,
    lebihReal: stockOpnameData?.filter(item => item.selisih_stok < 0).length || 0,
    seimbang: stockOpnameData?.filter(item => item.selisih_stok === 0).length || 0,
    totalPengguna: stockOpnameData?.reduce((acc, item) => acc + item.jumlah_pengguna_input, 0) || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Stok Terbaru</h1>
        <p className="text-gray-600">
          Kelola stok opname dan analisis dengan sistem terbaru
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {barangData?.length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Produk aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {lowStockProducts.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Perlu restock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opname Hari Ini</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stockOpnameStats.total}
            </div>
            <p className="text-xs text-gray-500 mt-1">Produk diinput</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stockOpnameStats.totalPengguna}
            </div>
            <p className="text-xs text-gray-500 mt-1">Input aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Opname Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Lebih Sistem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stockOpnameStats.lebihSistem}
            </div>
            <p className="text-xs text-orange-600 mt-1">Stok sistem > real</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Lebih Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stockOpnameStats.lebihReal}
            </div>
            <p className="text-xs text-red-600 mt-1">Stok real > sistem</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Seimbang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stockOpnameStats.seimbang}
            </div>
            <p className="text-xs text-green-600 mt-1">Stok sama persis</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Produk Stok Rendah ({lowStockProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.slice(0, 5).map((item) => (
                <Badge key={item.id} variant="outline" className="text-orange-700 border-orange-300">
                  {item.nama} ({item.stok_saat_ini} {item.satuan})
                </Badge>
              ))}
              {lowStockProducts.length > 5 && (
                <Badge variant="outline" className="text-orange-700 border-orange-300">
                  +{lowStockProducts.length - 5} lainnya
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="input" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">Input Stok Opname</TabsTrigger>
          <TabsTrigger value="analysis">Analisis Selisih</TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <NewStokOpnameInput />
        </TabsContent>

        <TabsContent value="analysis">
          <NewStokSelisihAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewStokDashboard;
