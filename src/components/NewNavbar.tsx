
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  LogOut,
  Home,
  DollarSign,
  ShoppingBag,
  ClipboardList,
  PackageCheck,
  Wallet
} from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

const NewNavbar = () => {
  const { user, logout } = useSimpleAuth();

  const handleLogout = () => {
    logout();
  };

  // Hide navigation menu for kasir role
  if (user?.role === 'kasir') {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-xl font-bold text-gray-900">
                Kasir Pro
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.full_name} ({user?.role})
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-xl font-bold text-gray-900">
              Kasir Pro
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link to="/pos" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ShoppingCart className="h-4 w-4" />
              <span>POS</span>
            </Link>
            
            <Link to="/products" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <Package className="h-4 w-4" />
              <span>Produk</span>
            </Link>
            
            <Link to="/purchase" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ShoppingBag className="h-4 w-4" />
              <span>Pembelian</span>
            </Link>
            
            <Link to="/stock" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ClipboardList className="h-4 w-4" />
              <span>Stok</span>
            </Link>
            
            <Link to="/kas-umum" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <DollarSign className="h-4 w-4" />
              <span>Kas Umum</span>
            </Link>
            
            <Link to="/admin" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <BarChart3 className="h-4 w-4" />
              <span>Laporan</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.full_name} ({user?.role})
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NewNavbar;
