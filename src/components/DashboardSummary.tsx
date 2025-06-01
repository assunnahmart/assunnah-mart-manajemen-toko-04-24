
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart } from 'lucide-react';
import { usePOSTransactionsToday } from '@/hooks/usePOSTransactions';
import { useKasUmumSummary } from '@/hooks/useKasUmum';
import { useBarang } from '@/hooks/useBarang';
import { useSupplier } from '@/hooks/useSupplier';

const DashboardSummary = () => {
  const { data: todayPOS, isLoading: posLoading } = usePOSTransactionsToday();
  const { data: kasSummary, isLoading: kasLoading } = useKasUmumSummary();
  const { data: barangList, isLoading: barangLoading } = useBarang();
  const { data: suppliers, isLoading: supplierLoading } = useSupplier();

  const isLoading = posLoading || kasLoading || barangLoading || supplierLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const lowStockItems = barangList?.filter(item => 
    (item.stok_saat_ini || 0) <= (item.stok_minimal || 0)
  ).length || 0;

  const summaryCards = [
    {
      title: 'Penjualan Hari Ini',
      value: `Rp ${(todayPOS?.totalAmount || 0).toLocaleString('id-ID')}`,
      subtitle: `${todayPOS?.totalTransactions || 0} transaksi`,
      icon: ShoppingCart,
      trend: 'up',
      color: 'text-green-600'
    },
    {
      title: 'Saldo Kas',
      value: `Rp ${(kasSummary?.saldo || 0).toLocaleString('id-ID')}`,
      subtitle: `Masuk: Rp ${(kasSummary?.totalMasuk || 0).toLocaleString('id-ID')}`,
      icon: DollarSign,
      trend: kasSummary?.saldo && kasSummary.saldo > 0 ? 'up' : 'down',
      color: kasSummary?.saldo && kasSummary.saldo > 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Total Produk',
      value: barangList?.length || 0,
      subtitle: lowStockItems > 0 ? `${lowStockItems} stok rendah` : 'Stok normal',
      icon: Package,
      trend: lowStockItems > 0 ? 'down' : 'up',
      color: lowStockItems > 0 ? 'text-orange-600' : 'text-green-600'
    },
    {
      title: 'Total Supplier',
      value: suppliers?.length || 0,
      subtitle: 'Supplier aktif',
      icon: Users,
      trend: 'up',
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {summaryCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {card.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {card.subtitle}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {lowStockItems > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Peringatan Stok Rendah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{lowStockItems}</Badge>
              <span className="text-sm text-gray-600">
                produk memiliki stok di bawah batas minimal
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Silakan lakukan restok atau pembelian untuk produk dengan stok rendah
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardSummary;
