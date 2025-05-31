
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Calculator, 
  FileText,
  Scan
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Manajemen Kasir',
      description: 'Kelola jadwal shift 4 kasir',
      icon: Users,
      path: '/kasir',
      color: 'bg-blue-500'
    },
    {
      title: 'Konsinyasi',
      description: 'Konsinyasi harian & mingguan',
      icon: Package,
      path: '/konsinyasi',
      color: 'bg-green-500'
    },
    {
      title: 'Penjualan Kredit',
      description: 'Unit, cash, kredit & potong gaji',
      icon: CreditCard,
      path: '/kredit',
      color: 'bg-purple-500'
    },
    {
      title: 'Kasir/POS',
      description: 'Transaksi penjualan',
      icon: Calculator,
      path: '/pos',
      color: 'bg-red-500'
    },
    {
      title: 'Laporan Keuangan',
      description: 'Kas, hutang, piutang, L/R, neraca',
      icon: FileText,
      path: '/laporan',
      color: 'bg-yellow-500'
    },
    {
      title: 'Stok Opname',
      description: 'Scan barcode untuk stok akhir',
      icon: Scan,
      path: '/stok-opname',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/aa462b6e-0c4c-44bf-95db-9fba0991ee3b.png" 
                alt="Assunnah Mart" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Assunnah Mart</h1>
                <p className="text-sm text-gray-600">Jl. Kalitanjung No 52B</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Manajemen Toko</p>
              <p className="text-xs text-gray-500">Belanja Hemat, Berkah, Nikmat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Utama</h2>
          <p className="text-gray-600">Pilih menu untuk mengelola operasional toko Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${item.color} text-white group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-sm">{item.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={() => navigate(item.path)}
                  className="w-full"
                  variant="outline"
                >
                  Buka Menu
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Kasir Aktif Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">2 Orang</div>
              <p className="text-xs text-gray-500 mt-1">Shift Pagi & Siang</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Transaksi Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">156</div>
              <p className="text-xs text-gray-500 mt-1">+12% dari kemarin</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Stok Konsinyasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">842</div>
              <p className="text-xs text-gray-500 mt-1">Items tersedia</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Piutang Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">Rp 2.4M</div>
              <p className="text-xs text-gray-500 mt-1">32 pelanggan</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
