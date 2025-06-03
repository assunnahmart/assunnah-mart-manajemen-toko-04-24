
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Package, ShoppingCart, Truck, AlertTriangle } from 'lucide-react';
import { useStockData, useLowStockProducts } from '@/hooks/useStockManagement';
import { usePOSTransactionsToday } from '@/hooks/usePOSTransactions';
import { usePurchaseTransactions } from '@/hooks/usePurchaseTransactions';

const StockDashboard = () => {
  const { data: stockData } = useStockData();
  const { data: lowStockProducts } = useLowStockProducts();
  const { data: todayPOS } = usePOSTransactionsToday();
  const { data: purchaseTransactions } = usePurchaseTransactions();

  // Calculate metrics
  const totalProducts = stockData?.length || 0;
  const lowStockCount = lowStockProducts?.length || 0;
  const totalStockValue = stockData?.reduce((sum, item) => 
    sum + (item.harga_beli * item.stok_saat_ini), 0
  ) || 0;
  
  const todayPurchases = purchaseTransactions?.filter(purchase => 
    new Date(purchase.created_at).toDateString() === new Date().toDateString()
  )?.length || 0;

  const todayPurchaseValue = purchaseTransactions?.filter(purchase => 
    new Date(purchase.created_at).toDateString() === new Date().toDateString()
  )?.reduce((sum, purchase) => sum + purchase.total, 0) || 0;

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
              <p className="text-sm font-medium text-gray-600">Transaksi Hari Ini</p>
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{todayPOS?.totalTransactions || 0}</p>
                  <p className="text-xs text-gray-500">POS</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-600">{todayPurchases}</p>
                  <p className="text-xs text-gray-500">Pembelian</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <ShoppingCart className="h-6 w-6 text-blue-600 mb-1" />
              <Truck className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockDashboard;
