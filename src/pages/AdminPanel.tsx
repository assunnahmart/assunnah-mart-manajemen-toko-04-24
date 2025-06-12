
import NewProtectedRoute from '@/components/NewProtectedRoute';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const AdminPanel = () => {
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
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel Administrator</h1>
                  <p className="text-gray-600">
                    Dashboard khusus admin untuk mengelola data pelanggan, piutang, supplier, kas umum, dan laporan laba rugi
                  </p>
                </div>
                
                <AdminDashboard />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </NewProtectedRoute>
  );
};

export default AdminPanel;
