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
  const {
    user,
    signOut
  } = useSimpleAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

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
  const managementMenuItems = [{
    path: '/dashboard',
    label: 'Dashboard',
    icon: TrendingUp
  }, {
    path: '/pos',
    label: 'POS System',
    icon: Calculator
  }, {
    path: '/data-produk',
    label: 'Data Produk',
    icon: Package
  }, {
    path: '/stock-management',
    label: 'Stok Management',
    icon: Store
  }, {
    path: '/konsinyasi',
    label: 'Konsinyasi',
    icon: ShoppingCart
  }, {
    path: '/konsinyasi-harian',
    label: 'Konsinyasi Harian',
    icon: Package
  }, {
    path: '/purchase',
    label: 'Pembelian',
    icon: ShoppingCart
  }, {
    path: '/penjualan-kredit',
    label: 'Penjualan Kredit',
    icon: CreditCard
  }, {
    path: '/kasir-kas',
    label: 'Kasir Kas',
    icon: CreditCard
  }, {
    path: '/kas-umum',
    label: 'Kas Umum',
    icon: CreditCard
  }, {
    path: '/admin',
    label: 'Admin Panel',
    icon: Settings
  }, {
    path: '/kasir-management',
    label: 'Kasir Management',
    icon: Users
  }];

  // Menu items khusus untuk kasir di halaman POS
  const posMenuItems = [{
    label: 'Quick Scan',
    onClick: onQuickScan,
    icon: Scan
  }, {
    label: 'Riwayat Transaksi',
    onClick: onTransactionHistory,
    icon: History
  }, {
    label: 'Konsinyasi Harian',
    onClick: onKonsinyasi,
    icon: Package
  }, {
    label: 'Stok Opname Scanner',
    onClick: onStockOpname,
    icon: ClipboardList
  }, {
    label: 'Kas Kasir',
    onClick: onKasirKas,
    icon: Wallet
  }, {
    label: 'Laporan Harian',
    onClick: onDailyReport,
    icon: FileText
  }];
  return <div className="min-h-screen flex flex-col">
      {/* Header with menu */}
      {!shouldHideMenu}
      
      {/* Main Content */}
      <main className="flex-1">
        <div className="p-6 bg-slate-50">
          {children}
        </div>
      </main>
    </div>;
};
export default Layout;