
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut, 
  User,
  Menu,
  X,
  Home,
  ClipboardList,
  DollarSign,
  ShoppingBag,
  Truck
} from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

const NewNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useSimpleAuth();

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  const menuItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/pos', icon: ShoppingCart, label: 'POS System' },
    { to: '/products', icon: Package, label: 'Daftar Produk' },
    { to: '/purchase', icon: ShoppingBag, label: 'Pembelian' },
    { to: '/stock', icon: ClipboardList, label: 'Stok Management' },
    { to: '/kas-umum', icon: DollarSign, label: 'Kas Umum' },
    { to: '/konsinyasi', icon: Truck, label: 'Konsinyasi' },
    { to: '/penjualan-kredit', icon: CreditCard, label: 'Penjualan Kredit' },
    { to: '/kasir', icon: Users, label: 'Kasir Management' },
    { to: '/admin', icon: Settings, label: 'Admin Panel', adminOnly: true },
  ];

  const visibleMenuItems = menuItems.filter(item => 
    !item.adminOnly || (item.adminOnly && user?.role === 'admin')
  );

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">Assunnah Mart</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {visibleMenuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.to
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Info */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-500" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-gray-500">{user?.role}</p>
              </div>
              <Badge variant="secondary">{user?.role}</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <Card className="m-4 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {visibleMenuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === item.to
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center px-3 py-2">
                  <User className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{user?.full_name}</p>
                    <p className="text-sm text-gray-500">{user?.role}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full mt-2 text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </nav>
  );
};

export default NewNavbar;
