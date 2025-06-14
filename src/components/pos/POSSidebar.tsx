import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, History, Package, ClipboardList, Wallet, FileText, LogOut, Scan, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
interface POSSidebarProps {
  onQuickScan: () => void;
  onTransactionHistory: () => void;
  onKonsinyasi: () => void;
  onStockOpname: () => void;
  onKasirKas: () => void;
  onDailyReport: () => void;
  onKasUmum: () => void;
}
const POSSidebar = ({
  onQuickScan,
  onTransactionHistory,
  onKonsinyasi,
  onStockOpname,
  onKasirKas,
  onDailyReport,
  onKasUmum
}: POSSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
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
  const menuItems = [{
    icon: Scan,
    label: 'Quick Scan',
    onClick: onQuickScan,
    color: 'bg-green-600 hover:bg-green-700',
    description: 'Scan barcode cepat'
  }, {
    icon: History,
    label: 'Riwayat',
    onClick: onTransactionHistory,
    color: 'bg-blue-600 hover:bg-blue-700',
    description: 'Riwayat transaksi'
  }, {
    icon: Package,
    label: 'Konsinyasi',
    onClick: onKonsinyasi,
    color: 'bg-purple-600 hover:bg-purple-700',
    description: 'Konsinyasi harian'
  }, {
    icon: ClipboardList,
    label: 'Stok Opname',
    onClick: onStockOpname,
    color: 'bg-orange-600 hover:bg-orange-700',
    description: 'Stok opname scanner'
  }, {
    icon: Wallet,
    label: 'Kas',
    onClick: onKasirKas,
    color: 'bg-indigo-600 hover:bg-indigo-700',
    description: 'Kas kasir'
  }, {
    icon: DollarSign,
    label: 'Kas Umum',
    onClick: onKasUmum,
    color: 'bg-yellow-600 hover:bg-yellow-700',
    description: 'Kas umum & tunai'
  }, {
    icon: FileText,
    label: 'Laporan',
    onClick: onDailyReport,
    color: 'bg-teal-600 hover:bg-teal-700',
    description: 'Laporan harian'
  }];
  return;
};
export default POSSidebar;