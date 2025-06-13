
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  History, 
  Package, 
  ClipboardList, 
  Wallet, 
  FileText, 
  LogOut,
  Scan,
  ChevronLeft,
  ChevronRight,
  DollarSign
} from 'lucide-react';
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

  const menuItems = [
    {
      icon: Scan,
      label: 'Quick Scan',
      onClick: onQuickScan,
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Scan barcode cepat'
    },
    {
      icon: History,
      label: 'Riwayat',
      onClick: onTransactionHistory,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Riwayat transaksi'
    },
    {
      icon: Package,
      label: 'Konsinyasi',
      onClick: onKonsinyasi,
      color: 'bg-purple-600 hover:bg-purple-700',
      description: 'Konsinyasi harian'
    },
    {
      icon: ClipboardList,
      label: 'Stok Opname',
      onClick: onStockOpname,
      color: 'bg-orange-600 hover:bg-orange-700',
      description: 'Stok opname scanner'
    },
    {
      icon: Wallet,
      label: 'Kas',
      onClick: onKasirKas,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      description: 'Kas kasir'
    },
    {
      icon: DollarSign,
      label: 'Kas Umum',
      onClick: onKasUmum,
      color: 'bg-yellow-600 hover:bg-yellow-700',
      description: 'Kas umum & tunai'
    },
    {
      icon: FileText,
      label: 'Laporan',
      onClick: onDailyReport,
      color: 'bg-teal-600 hover:bg-teal-700',
      description: 'Laporan harian'
    }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-200 transition-all duration-300 z-50 ${
      isCollapsed ? 'w-16' : 'w-72'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <img 
              src="/lovable-uploads/163a7d14-7869-47b2-b33b-40be703e48e1.png" 
              alt="Assunnah Mart Logo" 
              className="h-8 w-8 object-contain"
            />
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-gray-900">Assunnah Mart</h2>
                <p className="text-xs text-gray-600">POS System</p>
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
            <Badge variant="outline" className="text-xs">
              {user?.full_name}
            </Badge>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-2">
        {menuItems.map((item, index) => (
          <Button
            key={index}
            onClick={item.onClick}
            className={`w-full ${item.color} text-white shadow-sm hover:shadow-md transition-all duration-200 ${
              isCollapsed ? 'h-12 px-0' : 'h-14 justify-start px-4'
            }`}
          >
            <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && (
              <div className="flex flex-col items-start">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs opacity-90">{item.description}</span>
              </div>
            )}
          </Button>
        ))}
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
        
        {!isCollapsed && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">Program by</p>
            <p className="text-xs font-medium text-gray-700">Abu Mughiroh Junaedi</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSSidebar;
