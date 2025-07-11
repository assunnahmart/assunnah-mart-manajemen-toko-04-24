import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
const NewNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    user,
    signOut
  } = useSimpleAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
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
  return <nav className="bg-white shadow-lg border-b">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 bg-amber-300">
        
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center px-3 py-2">
                <User className="h-5 w-5 text-gray-600 mr-3" />
                <span className="text-base text-gray-600">{user?.full_name}</span>
              </div>
              <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </div>}
    </nav>;
};
export default NewNavbar;