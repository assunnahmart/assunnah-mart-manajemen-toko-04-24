
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Menu } from 'lucide-react';
import { useState } from 'react';

const NewNavbar = () => {
  const { user, signOut } = useSimpleAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo dan Brand */}
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/a2af9547-58f3-45de-b565-8283573a9b0e.png" 
              alt="Assunnah Mart Logo" 
              className="h-10 w-auto sm:h-12 md:h-14"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Assunnah Mart</h1>
              {user && (
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                  {user.role === 'admin' ? 'Admin' : 'Kasir'}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="sm:hidden">
            {user && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Desktop menu */}
          {user && (
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="max-w-32 truncate">{user.full_name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </div>
          )}
        </div>

        {/* Mobile dropdown menu */}
        {isMenuOpen && user && (
          <div className="sm:hidden mt-3 pt-3 border-t border-gray-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.full_name}</span>
                </div>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                  {user.role === 'admin' ? 'Admin' : 'Kasir'}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NewNavbar;
