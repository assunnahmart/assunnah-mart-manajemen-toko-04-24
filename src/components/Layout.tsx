
import { ReactNode } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import NewNavbar from './NewNavbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useSimpleAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Only show navbar if user is not kasir */}
      {user?.role !== 'kasir' && <NewNavbar />}
      
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
