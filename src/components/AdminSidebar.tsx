
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
  Users 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
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

  return (
    <div className={`bg-white shadow-lg border-r transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-full`}>
      {/* Toggle Button Only */}
      <div className="p-2 border-b flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;
