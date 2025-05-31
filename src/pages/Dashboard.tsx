
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ShoppingCart, Users, Package, CreditCard, FileText, Calculator, BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useSimpleAuth();

  return (
    <NewProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <NewNavbar />
        
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Selamat Datang, {user?.full_name}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Dashboard Assunnah Mart - {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                {user?.role === 'admin' ? 'Administrator' : 'Kasir'}
              </Badge>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Penjualan Hari Ini"
              value="Rp 2.450.000"
              icon={DollarSign}
              trend={{ value: 12, isPositive: true }}
              color="bg-green-500"
            />
            <StatsCard
              title="Transaksi"
              value="156"
              icon={ShoppingCart}
              trend={{ value: 8, isPositive: true }}
              color="bg-blue-500"
            />
            <StatsCard
              title="Produk Aktif"
              value="1,234"
              icon={Package}
              trend={{ value: 3, isPositive: false }}
              color="bg-purple-500"
            />
            <StatsCard
              title="Pelanggan"
              value="89"
              icon={Users}
              trend={{ value: 15, isPositive: true }}
              color="bg-orange-500"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Aksi Cepat
                </CardTitle>
                <CardDescription>
                  Akses fitur utama dengan cepat
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button asChild className="h-auto p-4 flex-col gap-2">
                  <Link to="/pos">
                    <Calculator className="h-6 w-6" />
                    <span className="text-sm">POS System</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
                  <Link to="/konsinyasi">
                    <Package className="h-6 w-6" />
                    <span className="text-sm">Konsinyasi</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
                  <Link to="/kredit">
                    <CreditCard className="h-6 w-6" />
                    <span className="text-sm">Penjualan Kredit</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
                  <Link to="/laporan">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Laporan</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Management Actions (Admin Only) */}
            {user?.role === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Manajemen
                  </CardTitle>
                  <CardDescription>
                    Kelola data dan pengaturan sistem
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Link to="/kasir">
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Kelola Kasir</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Link to="/stok-opname">
                      <BarChart3 className="h-6 w-6" />
                      <span className="text-sm">Stok Opname</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity (if not admin) */}
            {user?.role !== 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Aktivitas Terkini
                  </CardTitle>
                  <CardDescription>
                    Ringkasan aktivitas hari ini
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Transaksi terakhir</span>
                    <span className="text-sm font-medium">09:45</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Total penjualan</span>
                    <span className="text-sm font-medium">Rp 450.000</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Transaksi Terkini
              </CardTitle>
              <CardDescription>
                5 transaksi terakhir hari ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: "TRX-001", time: "09:45", amount: "Rp 125.000", items: "5 items" },
                  { id: "TRX-002", time: "09:32", amount: "Rp 89.500", items: "3 items" },
                  { id: "TRX-003", time: "09:18", amount: "Rp 256.000", items: "8 items" },
                  { id: "TRX-004", time: "08:55", amount: "Rp 45.000", items: "2 items" },
                  { id: "TRX-005", time: "08:42", amount: "Rp 178.500", items: "6 items" },
                ].map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.id}</p>
                        <p className="text-xs text-gray-600">{transaction.items}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{transaction.amount}</p>
                      <p className="text-xs text-gray-600">{transaction.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </NewProtectedRoute>
  );
};

export default Dashboard;
