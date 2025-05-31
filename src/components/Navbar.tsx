
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Menu } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { profile, signOut } = useAuth();
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
              src="/lovable-uploads/aa462b6e-0c4c-44bf-95db-9fba0991ee3b.png" 
              alt="Assunnah Mart Logo" 
              className="h-10 w-auto sm:h-12 md:h-14"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Assunnah Mart</h1>
              {profile && (
                <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                  {profile.role === 'admin' ? 'Admin' : 'Kasir'}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="sm:hidden">
            {profile && (
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
          {profile && (
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="max-w-32 truncate">{profile.full_name}</span>
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
        {isMenuOpen && profile && (
          <div className="sm:hidden mt-3 pt-3 border-t border-gray-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{profile.full_name}</span>
                </div>
                <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                  {profile.role === 'admin' ? 'Admin' : 'Kasir'}
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

export default Navbar;
