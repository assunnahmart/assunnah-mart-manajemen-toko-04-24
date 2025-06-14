
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

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-50 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-lg text-gray-800">POS Menu</h2>
              <p className="text-sm text-gray-600">Quick Actions</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="text-sm">
            <p className="font-medium text-gray-800">{user.full_name}</p>
            <p className="text-gray-600">@{user.username}</p>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="p-2 space-y-2">
        {menuItems.map((item, index) => (
          <Button
            key={index}
            onClick={item.onClick}
            variant="ghost"
            className={`w-full justify-start ${item.color} text-white hover:opacity-90 ${
              isCollapsed ? 'px-2' : 'px-4'
            }`}
          >
            <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && (
              <div className="text-left">
                <p className="font-medium">{item.label}</p>
                <p className="text-xs opacity-90">{item.description}</p>
              </div>
            )}
          </Button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="absolute bottom-4 left-0 right-0 p-2">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={`w-full justify-start bg-red-600 hover:bg-red-700 text-white ${
            isCollapsed ? 'px-2' : 'px-4'
          }`}
        >
          <LogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default POSSidebar;
