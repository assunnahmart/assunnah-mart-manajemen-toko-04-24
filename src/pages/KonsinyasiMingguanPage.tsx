
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KonsinyasiMingguanForm from '@/components/konsinyasi/KonsinyasiMingguanForm';
import KonsinyasiMingguanHistory from '@/components/konsinyasi/KonsinyasiMingguanHistory';

const KonsinyasiMingguanPage = () => {
  return (
    <NewProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="min-h-screen bg-gray-50">
              <NewNavbar />
              
              <div className="container mx-auto p-6">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Konsinyasi Mingguan
                  </h1>
                  <p className="text-gray-600">
                    Kelola data konsinyasi mingguan untuk setiap supplier dan produk
                  </p>
                </div>

                <Tabs defaultValue="form" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="form">Input Konsinyasi</TabsTrigger>
                    <TabsTrigger value="history">Riwayat</TabsTrigger>
                  </TabsList>

                  <TabsContent value="form">
                    <KonsinyasiMingguanForm />
                  </TabsContent>

                  <TabsContent value="history">
                    <KonsinyasiMingguanHistory />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </NewProtectedRoute>
  );
};

export default KonsinyasiMingguanPage;
