
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

const NewNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useSimpleAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    signOut();
    toast({
      title: "Logout berhasil",
      description: "Anda telah keluar dari sistem"
    });
    navigate('/login');
  };

  // Don't show navbar for kasir users
  if (user?.role === 'kasir') {
    return null;
  }

  // Check if user is authorized to see Management System menu
  const showManagementMenu = user?.username === 'Jamhur' || user?.username === 'Ginanjar';

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 bg-amber-300">
        <div className="flex justify-between h-16">
          {/* Left side - Sidebar trigger and logo */}
          <div className="flex items-center space-x-4">
            {showManagementMenu && <SidebarTrigger />}
            
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <img 
                src="/lovable-uploads/163a7d14-7869-47b2-b33b-40be703e48e1.png" 
                alt="Assunnah Mart Logo" 
                className="h-8 w-8 object-contain animate-flip-horizontal" 
              />
              <span className="ml-2 text-xl font-bold text-gray-900">Assunnah Mart</span>
            </Link>
          </div>

          {/* Right side - User info and logout (desktop only) */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">{user?.full_name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout} 
              className="text-gray-600 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center px-3 py-2">
                <User className="h-5 w-5 text-gray-600 mr-3" />
                <span className="text-base text-gray-600">{user?.full_name}</span>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NewNavbar;
