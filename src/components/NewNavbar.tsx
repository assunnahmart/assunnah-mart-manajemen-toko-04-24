
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
  List
} from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

const NewNavbar = () => {
  const { user, signOut } = useSimpleAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

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
    <nav className="bg-gradient-to-r from-red-500 to-pink-600 shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              {/* Assunnah Mart Logo */}
              <div className="bg-white p-2 rounded-lg shadow-md">
                <img 
                  src="/lovable-uploads/163a7d14-7869-47b2-b33b-40be703e48e1.png" 
                  alt="Assunnah Mart Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="text-white">
                <span className="text-xl font-bold">Assunnah</span>
                <span className="text-lg font-medium ml-1 text-pink-100">Mart</span>
              </div>
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
                      ? 'bg-red-700 text-white'
                      : 'text-pink-100 hover:bg-red-600 hover:text-white'
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
              <Badge variant="outline" className="bg-white text-red-700 border-pink-200">
                {user?.full_name}
              </Badge>
              <Badge variant="secondary" className="bg-red-700 text-pink-100">
                {user?.role === 'admin' ? 'Admin' : 'Kasir'}
              </Badge>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 border-pink-200 text-pink-100 hover:bg-red-700 hover:text-white"
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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-red-600"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
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
                        ? 'bg-red-700 text-white'
                        : 'text-pink-100 hover:bg-red-600 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile User Info */}
              <div className="border-t border-red-600 pt-4 mt-4">
                <div className="flex items-center px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-white text-red-700 border-pink-200">
                      {user?.full_name}
                    </Badge>
                    <Badge variant="secondary" className="bg-red-700 text-pink-100">
                      {user?.role === 'admin' ? 'Admin' : 'Kasir'}
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full mx-3 mt-2 flex items-center justify-center space-x-1 border-pink-200 text-pink-100 hover:bg-red-700 hover:text-white"
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
