
import { ReactNode } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Calculator, Package, Store, ShoppingCart, CreditCard, Settings, Users, LogOut, User, Scan, History, ClipboardList, Wallet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LayoutProps {
  children: ReactNode;
  onQuickScan?: () => void;
  onTransactionHistory?: () => void;
  onKonsinyasi?: () => void;
  onStockOpname?: () => void;
  onKasirKas?: () => void;
  onDailyReport?: () => void;
}

const Layout = ({ 
  children,
  onQuickScan,
  onTransactionHistory,
  onKonsinyasi,
  onStockOpname,
  onKasirKas,
  onDailyReport
}: LayoutProps) => {
  const { user, signOut } = useSimpleAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Don't show menu on login page or index page
  const hideMenuPaths = ['/login', '/'];
  const shouldHideMenu = hideMenuPaths.includes(location.pathname);

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
    { path: '/dashboard', label: 'Dashboard', icon: TrendingUp },
    { path: '/pos', label: 'POS System', icon: Calculator },
    { path: '/data-produk', label: 'Data Produk', icon: Package },
    { path: '/stock-management', label: 'Stok Management', icon: Store },
    { path: '/konsinyasi', label: 'Konsinyasi', icon: ShoppingCart },
    { path: '/konsinyasi-harian', label: 'Konsinyasi Harian', icon: Package },
    { path: '/purchase', label: 'Pembelian', icon: ShoppingCart },
    { path: '/penjualan-kredit', label: 'Penjualan Kredit', icon: CreditCard },
    { path: '/kasir-kas', label: 'Kasir Kas', icon: CreditCard },
    { path: '/kas-umum', label: 'Kas Umum', icon: CreditCard },
    { path: '/admin', label: 'Admin Panel', icon: Settings },
    { path: '/kasir-management', label: 'Kasir Management', icon: Users },
  ];

  // Menu items khusus untuk kasir di halaman POS
  const posMenuItems = [
    { label: 'Quick Scan', onClick: onQuickScan, icon: Scan },
    { label: 'Riwayat Transaksi', onClick: onTransactionHistory, icon: History },
    { label: 'Konsinyasi Harian', onClick: onKonsinyasi, icon: Package },
    { label: 'Stok Opname Scanner', onClick: onStockOpname, icon: ClipboardList },
    { label: 'Kas Kasir', onClick: onKasirKas, icon: Wallet },
    { label: 'Laporan Harian', onClick: onDailyReport, icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with menu */}
      {!shouldHideMenu && (
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AM</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Assunnah Mart</span>
            </div>

            {/* Menu items based on user role and page */}
            <div className="flex items-center space-x-1 flex-1 justify-center">
              {user?.role === 'admin' ? (
                // Show management menu for admin
                managementMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                ))
              ) : (
                // Show POS menu for kasir
                isPOSPage && posMenuItems.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={item.onClick}
                    className="flex items-center px-3 py-2 text-sm font-medium"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                ))
              )}
            </div>

            {/* User info and logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">{user?.full_name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
      )}
      
      {/* Main Content */}
      <main className="flex-1">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
