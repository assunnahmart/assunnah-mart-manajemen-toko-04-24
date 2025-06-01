
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  Home, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Users, 
  LogOut,
  Store,
  List
} from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

const NewNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useSimpleAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/pos', label: 'POS System', icon: ShoppingCart },
    { path: '/daftar-produk', label: 'Daftar Produk', icon: List },
    { path: '/konsinyasi', label: 'Konsinyasi', icon: Package },
    { path: '/penjualan-kredit', label: 'Penjualan Kredit', icon: CreditCard },
    { path: '/kasir-management', label: 'Manajemen Kasir', icon: Users }
  ];

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Assunnah Mart</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Info & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {user?.full_name}
              </Badge>
              <Badge variant="secondary">
                {user?.role === 'admin' ? 'Admin' : 'Kasir'}
              </Badge>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile User Info */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{user?.full_name}</Badge>
                    <Badge variant="secondary">
                      {user?.role === 'admin' ? 'Admin' : 'Kasir'}
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full mx-3 mt-2 flex items-center justify-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NewNavbar;
