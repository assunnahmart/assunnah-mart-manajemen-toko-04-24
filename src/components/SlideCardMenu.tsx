
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Calculator, 
  Package, 
  Store, 
  ShoppingCart, 
  CreditCard, 
  Settings, 
  Users,
  LogOut,
  Scan,
  History,
  ClipboardList,
  Wallet,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SlideCardMenuProps {
  onQuickScan?: () => void;
  onTransactionHistory?: () => void;
  onKonsinyasi?: () => void;
  onStockOpname?: () => void;
  onKasirKas?: () => void;
  onDailyReport?: () => void;
}

const SlideCardMenu = ({
  onQuickScan,
  onTransactionHistory,
  onKonsinyasi,
  onStockOpname,
  onKasirKas,
  onDailyReport
}: SlideCardMenuProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, signOut } = useSimpleAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    toast({
      title: "Logout berhasil",
      description: "Anda telah keluar dari sistem"
    });
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  const isPOSPage = location.pathname === '/pos';

  // Menu items untuk sistem management
  const managementMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: TrendingUp, color: 'bg-blue-500' },
    { path: '/pos', label: 'POS System', icon: Calculator, color: 'bg-green-500' },
    { path: '/data-produk', label: 'Data Produk', icon: Package, color: 'bg-purple-500' },
    { path: '/stock-management', label: 'Stok Management', icon: Store, color: 'bg-orange-500' },
    { path: '/konsinyasi', label: 'Konsinyasi', icon: ShoppingCart, color: 'bg-indigo-500' },
    { path: '/konsinyasi-harian', label: 'Konsinyasi Harian', icon: Package, color: 'bg-pink-500' },
    { path: '/purchase', label: 'Pembelian', icon: ShoppingCart, color: 'bg-red-500' },
    { path: '/penjualan-kredit', label: 'Penjualan Kredit', icon: CreditCard, color: 'bg-yellow-500' },
    { path: '/kasir-kas', label: 'Kasir Kas', icon: CreditCard, color: 'bg-teal-500' },
    { path: '/kas-umum', label: 'Kas Umum', icon: CreditCard, color: 'bg-cyan-500' },
    { path: '/admin', label: 'Admin Panel', icon: Settings, color: 'bg-gray-500' },
    { path: '/kasir-management', label: 'Kasir Management', icon: Users, color: 'bg-emerald-500' },
  ];

  // Menu items khusus untuk halaman POS
  const posMenuItems = [
    {
      label: 'Quick Scan',
      onClick: onQuickScan,
      icon: Scan,
      color: 'bg-green-600',
      description: 'Scan barcode cepat'
    },
    {
      label: 'Riwayat Transaksi',
      onClick: onTransactionHistory,
      icon: History,
      color: 'bg-blue-600',
      description: 'Riwayat transaksi'
    },
    {
      label: 'Konsinyasi Harian',
      onClick: onKonsinyasi,
      icon: Package,
      color: 'bg-purple-600',
      description: 'Konsinyasi harian'
    },
    {
      label: 'Stok Opname Scanner',
      onClick: onStockOpname,
      icon: ClipboardList,
      color: 'bg-orange-600',
      description: 'Stok opname scanner'
    },
    {
      label: 'Kas Kasir',
      onClick: onKasirKas,
      icon: Wallet,
      color: 'bg-indigo-600',
      description: 'Kas kasir'
    },
    {
      label: 'Laporan Harian',
      onClick: onDailyReport,
      icon: FileText,
      color: 'bg-teal-600',
      description: 'Laporan harian'
    }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-200 transition-all duration-300 z-50 ${
      isCollapsed ? 'w-16' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <img 
              src="/lovable-uploads/b19ae95c-b38c-40ee-893f-aa5a2366191d.png" 
              alt="Assunnah Mart Logo" 
              className="h-8 w-8 object-contain"
            />
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-gray-900">Assunnah Mart</h2>
                <p className="text-xs text-gray-600">
                  {isPOSPage ? 'POS System' : 'Sistem Management'}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        {!isCollapsed && (
          <div className="mt-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{user?.full_name}</span>
              <span className="block text-xs text-gray-500">{user?.role}</span>
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="p-4 overflow-y-auto h-full pb-20">
        {isPOSPage ? (
          // POS Menu Layout
          isCollapsed ? (
            <div className="space-y-2">
              {posMenuItems.map((item, index) => (
                <Button
                  key={index}
                  onClick={item.onClick}
                  className={`w-full ${item.color} hover:${item.color.replace('bg-', 'bg-').replace('-600', '-700')} text-white shadow-sm hover:shadow-md transition-all duration-200 h-12 px-0`}
                  title={item.label}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {posMenuItems.map((item, index) => (
                <Button
                  key={index}
                  onClick={item.onClick}
                  className={`w-full ${item.color} hover:${item.color.replace('bg-', 'bg-').replace('-600', '-700')} text-white shadow-sm hover:shadow-md transition-all duration-200 h-14 justify-start px-4`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs opacity-90">{item.description}</span>
                  </div>
                </Button>
              ))}
            </div>
          )
        ) : (
          // Management Menu Layout
          isCollapsed ? (
            <div className="space-y-2">
              {managementMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block w-full transition-all duration-200 ${
                    isActive(item.path) ? 'scale-110' : 'hover:scale-105'
                  }`}
                  title={item.label}
                >
                  <Card className={`${item.color} text-white shadow-md hover:shadow-lg`}>
                    <CardContent className="p-3 flex items-center justify-center">
                      <item.icon className="h-5 w-5" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {managementMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block transition-all duration-200 ${
                    isActive(item.path) ? 'scale-105 ring-2 ring-blue-400' : 'hover:scale-105'
                  }`}
                >
                  <Card className={`${item.color} text-white shadow-md hover:shadow-lg h-24`}>
                    <CardContent className="p-3 flex flex-col items-center justify-center h-full">
                      <item.icon className="h-6 w-6 mb-2" />
                      <span className="text-xs font-medium text-center leading-tight">
                        {item.label}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <Button
          onClick={handleLogout}
          variant="outline"
          className={`w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 ${
            isCollapsed ? 'h-12 px-0' : 'h-12 justify-start px-4'
          }`}
        >
          <LogOut className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'Keluar'}
        </Button>
        
        {!isCollapsed && !isPOSPage && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">Program by</p>
            <p className="text-xs font-medium text-gray-700">Abu Mughiroh Junaedi</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlideCardMenu;
