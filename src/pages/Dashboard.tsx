
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  CreditCard, 
  BarChart3,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ShoppingBag,
  ClipboardList,
  Wallet
} from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { usePOSTransactionsToday } from '@/hooks/usePOSTransactions';
import { useBarangStokRendah } from '@/hooks/useBarangKonsinyasi';
import { useKasUmumSummary } from '@/hooks/useKasUmum';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSimpleAuth();
  const { data: todayTransactions } = usePOSTransactionsToday();
  const { data: stockAlerts } = useBarangStokRendah();
  const { data: kasSummary } = useKasUmumSummary();

  // Quick actions for kasir only include POS, Konsinyasi Harian, and Kas
  const kasirQuickActions = [
    { 
      title: 'POS System', 
      description: 'Kasir dan penjualan', 
      icon: ShoppingCart, 
      color: 'bg-blue-500', 
      path: '/pos' 
    },
    { 
      title: 'Konsinyasi Harian', 
      description: 'Input konsinyasi harian', 
      icon: Package, 
      color: 'bg-green-500', 
      path: '/konsinyasi-harian' 
    },
    { 
      title: 'Kas Kasir', 
      description: 'Kelola kas harian kasir', 
      icon: Wallet, 
      color: 'bg-orange-500', 
      path: '/kasir-kas' 
    }
  ];

  const quickActions = [
    { 
      title: 'POS System', 
      description: 'Kasir dan penjualan', 
      icon: ShoppingCart, 
      color: 'bg-blue-500', 
      path: '/pos' 
    },
    { 
      title: 'Data Produk', 
      description: 'Kelola produk konsinyasi & lainnya', 
      icon: Package, 
      color: 'bg-green-500', 
      path: '/products' 
    },
    { 
      title: 'Pembelian', 
      description: 'Transaksi pembelian barang', 
      icon: ShoppingBag, 
      color: 'bg-purple-500', 
      path: '/purchase' 
    },
    { 
      title: 'Stok Management', 
      description: 'Monitoring dan opname stok', 
      icon: ClipboardList, 
      color: 'bg-orange-500', 
      path: '/stock' 
    },
    { 
      title: 'Kas Umum', 
      description: 'Manajemen kas harian', 
      icon: DollarSign, 
      color: 'bg-yellow-500', 
      path: '/kas-umum' 
    },
    { 
      title: 'Laporan', 
      description: 'Analisis dan rekap', 
      icon: BarChart3, 
      color: 'bg-indigo-500', 
      path: '/admin' 
    }
  ];

  // Filter quick actions for kasir - show kasir specific menu
  const filteredQuickActions = user?.role === 'kasir' 
    ? kasirQuickActions
    : quickActions;

  return (
    <NewProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <NewNavbar />
          
          <div className="container mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.role === 'kasir' ? 'Dashboard Kasir' : 'Dashboard Kasir Pro'}
              </h1>
              <p className="text-gray-600">
                Selamat datang, {user?.full_name}! 
                {user?.role === 'kasir' 
                  ? ' Anda dapat mengakses sistem POS, konsinyasi harian, dan kas kasir.'
                  : ' Kelola toko Anda dengan mudah.'
                }
              </p>
            </div>

            {/* Stats Cards - Show basic stats for kasir */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Penjualan Hari Ini</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {(todayTransactions?.totalAmount || 0).toLocaleString('id-ID')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {todayTransactions?.totalTransactions || 0} transaksi
                  </p>
                </CardContent>
              </Card>

              {user?.role !== 'kasir' && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Saldo Kas</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        Rp {(kasSummary?.saldo || 0).toLocaleString('id-ID')}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Kas umum saat ini
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {stockAlerts?.length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Produk perlu restock
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status Sistem</CardTitle>
                  <Badge variant="default" className="bg-green-500">Online</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">Semua Berjalan Normal</div>
                  <p className="text-xs text-muted-foreground">
                    Sistem operasional
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions - Show appropriate menu for kasir */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {user?.role === 'kasir' ? 'Menu Kasir' : 'Aksi Cepat'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredQuickActions.map((action) => (
                    <Button
                      key={action.title}
                      variant="outline"
                      className="h-auto p-6 flex flex-col items-start space-y-2"
                      onClick={() => navigate(action.path)}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">{action.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {action.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stock Alerts - Hide for kasir */}
            {user?.role !== 'kasir' && stockAlerts && stockAlerts.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Peringatan Stok Rendah
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stockAlerts.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div>
                          <div className="font-medium">{item.nama}</div>
                          <div className="text-sm text-muted-foreground">
                            Stok: {item.stok_saat_ini} {item.satuan} (Min: {item.stok_minimal})
                          </div>
                        </div>
                        <Badge variant="destructive">Stok Rendah</Badge>
                      </div>
                    ))}
                  </div>
                  {stockAlerts.length > 5 && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => navigate('/stock')}
                    >
                      Lihat Semua ({stockAlerts.length} produk)
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Additional message for kasir */}
            {user?.role === 'kasir' && (
              <Card className="mt-6 bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <ShoppingCart className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Sistem Kasir Siap Digunakan
                    </h3>
                    <p className="text-blue-700 mb-4">
                      Akses POS system untuk transaksi, konsinyasi harian untuk pencatatan titipan, dan kas kasir untuk kelola keuangan harian.
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button 
                        onClick={() => navigate('/pos')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        POS System
                      </Button>
                      <Button 
                        onClick={() => navigate('/konsinyasi-harian')}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Konsinyasi
                      </Button>
                      <Button 
                        onClick={() => navigate('/kasir-kas')}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Kas Kasir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Layout>
    </NewProtectedRoute>
  );
};

export default Dashboard;
