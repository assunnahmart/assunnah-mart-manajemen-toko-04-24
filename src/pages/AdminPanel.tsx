
import NewProtectedRoute from '@/components/NewProtectedRoute';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useLocation } from 'react-router-dom';
import PelangganManagement from '@/components/admin/PelangganManagement';
import SupplierManagement from '@/components/admin/SupplierManagement';
import BukuBesarPiutang from '@/components/admin/BukuBesarPiutang';
import BukuBesarHutang from '@/components/admin/BukuBesarHutang';
import KasUmum from '@/components/admin/KasUmum';
import LabaRugi from '@/components/admin/LabaRugi';
import FinancialReports from '@/components/admin/FinancialReports';
import DataManagement from '@/components/admin/DataManagement';
import ProductDataManagement from '@/components/admin/ProductDataManagement';

const AdminPanel = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const renderContent = () => {
    switch (currentPath) {
      case '/admin/pelanggan':
        return <PelangganManagement />;
      case '/admin/supplier':
        return <SupplierManagement />;
      case '/admin/buku-besar-piutang':
        return <BukuBesarPiutang />;
      case '/admin/buku-besar-hutang':
        return <BukuBesarHutang />;
      case '/admin/kas-umum':
        return <KasUmum />;
      case '/admin/laba-rugi':
        return <LabaRugi />;
      case '/admin/financial-reports':
        return <FinancialReports />;
      case '/admin/data-management':
        return <DataManagement />;
      case '/admin/product-management':
        return <ProductDataManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <NewProtectedRoute requiredRole="admin">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-lg font-semibold">Panel Administrator</h1>
            </div>
            <div className="flex-1 p-6">
              <div className="container mx-auto">
                {renderContent()}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </NewProtectedRoute>
  );
};

export default AdminPanel;
