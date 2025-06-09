
import { ReactNode } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import NewNavbar from './NewNavbar';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
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

  // Check if user is admin (Ginanjar or Jamhur)
  const isAdmin = user?.username === 'Jamhur' || user?.username === 'Ginanjar';

  return (
    <div className="min-h-screen flex flex-col">
      {!shouldHideNavbar && (
        <>
          {isAdmin ? (
            // Admin layout with sidebar
            <div className="flex h-screen">
              <AdminSidebar />
              <div className="flex-1 flex flex-col">
                <AdminNavbar />
                <main className="flex-1 overflow-auto p-6">
                  {children}
                </main>
              </div>
            </div>
          ) : (
            // Regular layout for other users
            <>
              {user?.role !== 'kasir' && <NewNavbar />}
              <main className="flex-1">
                {children}
              </main>
            </>
          )}
        </>
      )}
      
      {shouldHideNavbar && (
        <main className="flex-1">
          {children}
        </main>
      )}
      
      {!isAdmin && (
        <footer className="bg-gray-800 text-white py-4 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">
              Assunnah Mart - Sistem Manajemen Toko
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
