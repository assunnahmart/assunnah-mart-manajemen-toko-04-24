import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, TrendingUp, Calculator, Package, Store, ShoppingCart, CreditCard, Settings, Users, LogOut, Scan, History, ClipboardList, Wallet, FileText } from 'lucide-react';
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
  const {
    user,
    signOut
  } = useSimpleAuth();
  const {
    toast
  } = useToast();
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
  const managementMenuItems = [{
    path: '/dashboard',
    label: 'Dashboard',
    icon: TrendingUp,
    color: 'bg-blue-500'
  }, {
    path: '/pos',
    label: 'POS System',
    icon: Calculator,
    color: 'bg-green-500'
  }, {
    path: '/data-produk',
    label: 'Data Produk',
    icon: Package,
    color: 'bg-purple-500'
  }, {
    path: '/stock-management',
    label: 'Stok Management',
    icon: Store,
    color: 'bg-orange-500'
  }, {
    path: '/konsinyasi',
    label: 'Konsinyasi',
    icon: ShoppingCart,
    color: 'bg-indigo-500'
  }, {
    path: '/konsinyasi-harian',
    label: 'Konsinyasi Harian',
    icon: Package,
    color: 'bg-pink-500'
  }, {
    path: '/purchase',
    label: 'Pembelian',
    icon: ShoppingCart,
    color: 'bg-red-500'
  }, {
    path: '/penjualan-kredit',
    label: 'Penjualan Kredit',
    icon: CreditCard,
    color: 'bg-yellow-500'
  }, {
    path: '/kasir-kas',
    label: 'Kasir Kas',
    icon: CreditCard,
    color: 'bg-teal-500'
  }, {
    path: '/kas-umum',
    label: 'Kas Umum',
    icon: CreditCard,
    color: 'bg-cyan-500'
  }, {
    path: '/admin',
    label: 'Admin Panel',
    icon: Settings,
    color: 'bg-gray-500'
  }, {
    path: '/kasir-management',
    label: 'Kasir Management',
    icon: Users,
    color: 'bg-emerald-500'
  }];

  // Menu items khusus untuk halaman POS
  const posMenuItems = [{
    label: 'Quick Scan',
    onClick: onQuickScan,
    icon: Scan,
    color: 'bg-green-600',
    description: 'Scan barcode cepat'
  }, {
    label: 'Riwayat Transaksi',
    onClick: onTransactionHistory,
    icon: History,
    color: 'bg-blue-600',
    description: 'Riwayat transaksi'
  }, {
    label: 'Konsinyasi Harian',
    onClick: onKonsinyasi,
    icon: Package,
    color: 'bg-purple-600',
    description: 'Konsinyasi harian'
  }, {
    label: 'Stok Opname Scanner',
    onClick: onStockOpname,
    icon: ClipboardList,
    color: 'bg-orange-600',
    description: 'Stok opname scanner'
  }, {
    label: 'Kas Kasir',
    onClick: onKasirKas,
    icon: Wallet,
    color: 'bg-indigo-600',
    description: 'Kas kasir'
  }, {
    label: 'Laporan Harian',
    onClick: onDailyReport,
    icon: FileText,
    color: 'bg-teal-600',
    description: 'Laporan harian'
  }];
  return;
};
export default SlideCardMenu;