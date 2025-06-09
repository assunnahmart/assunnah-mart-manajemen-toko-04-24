
import { ReactNode } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import NewNavbar from './NewNavbar';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useSimpleAuth();
  const location = useLocation();

  // Don't show navbar on login page or index page
  const hideNavbarPaths = ['/login', '/'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Only show navbar if user is not kasir and not on login/index page */}
      {!shouldHideNavbar && user?.role !== 'kasir' && <NewNavbar />}
      
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-gray-800 text-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            Assunnah Mart - Sistem Manajemen Toko
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
