
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Package, ShoppingCart, Truck, AlertTriangle, ClipboardList } from 'lucide-react';
import { useStockData, useLowStockProducts, useStockOpname } from '@/hooks/useStockManagement';
import { usePOSTransactionsToday } from '@/hooks/usePOSTransactions';
import { usePurchaseTransactions } from '@/hooks/usePurchaseTransactions';
import { useStockOpnameRecap } from '@/hooks/useStockOpnameRecap';

const StockDashboard = () => {
  const { data: stockData } = useStockData();
  const { data: lowStockProducts } = useLowStockProducts();
  const { data: todayPOS } = usePOSTransactionsToday();
  const { data: purchaseTransactions } = usePurchaseTransactions();
  const { data: stockOpnameData } = useStockOpname();
  const { data: stockOpnameRecap } = useStockOpnameRecap();

  // Calculate metrics
  const totalProducts = stockData?.length || 0;
  const lowStockCount = lowStockProducts?.length || 0;
  const totalStockValue = stockData?.reduce((sum, item) => 
    sum + (item.harga_beli * item.stok_saat_ini), 0
  ) || 0;
  
  const todayPurchases = purchaseTransactions?.filter(purchase => 
    new Date(purchase.created_at).toDateString() === new Date().toDateString()
  )?.length || 0;

  const todayStockOpname = stockOpnameData?.filter(opname => 
    opname.tanggal_opname === new Date().toISOString().split('T')[0]
  )?.length || 0;

  const totalStockOpnameToday = stockOpnameRecap?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Produk</p>
              <p className="text-2xl font-bold text-blue-600">{totalProducts}</p>
              <p className="text-xs text-gray-500 mt-1">Produk aktif</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stok Rendah</p>
              <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
              <p className="text-xs text-gray-500 mt-1">Perlu restock</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nilai Stok</p>
              <p className="text-2xl font-bold text-green-600">
                Rp {totalStockValue.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total investasi</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktivitas Hari Ini</p>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{todayPOS?.totalTransactions || 0}</p>
                  <p className="text-xs text-gray-500">POS</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-600">{todayPurchases}</p>
                  <p className="text-xs text-gray-500">Beli</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{todayStockOpname}</p>
                  <p className="text-xs text-gray-500">Opname</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <ShoppingCart className="h-4 w-4 text-blue-600 mb-1" />
              <Truck className="h-4 w-4 text-purple-600 mb-1" />
              <ClipboardList className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Opname Summary Card */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Ringkasan Stok Opname Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalStockOpnameToday}</p>
              <p className="text-sm text-gray-600">Total Produk di-Opname</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {stockOpnameRecap?.filter(item => item.selisih_stok === 0).length || 0}
              </p>
              <p className="text-sm text-gray-600">Stok Seimbang</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {stockOpnameRecap?.filter(item => item.selisih_stok !== 0).length || 0}
              </p>
              <p className="text-sm text-gray-600">Ada Selisih</p>
            </div>
          </div>
          
          {stockOpnameRecap && stockOpnameRecap.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Status Sinkronisasi:</p>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Data stok telah tersinkronisasi dengan opname hari ini
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockDashboard;
