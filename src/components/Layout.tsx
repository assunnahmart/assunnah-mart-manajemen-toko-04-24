
import { ReactNode } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import SlideCardMenu from './SlideCardMenu';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useSimpleAuth();
  const location = useLocation();

  // Don't show menu on login page or index page
  const hideMenuPaths = ['/login', '/'];
  const shouldHideMenu = hideMenuPaths.includes(location.pathname);

  return (
    <div className="min-h-screen flex">
      {/* Slide Card Menu */}
      {!shouldHideMenu && <SlideCardMenu />}
      
      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${
        shouldHideMenu ? 'ml-0' : 'ml-80'
      }`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
