
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, FileText } from 'lucide-react';
import KonsinyasiForm from '@/components/konsinyasi/KonsinyasiForm';
import KonsinyasiHistory from '@/components/konsinyasi/KonsinyasiHistory';

const Konsinyasi = () => {
  return (
    <NewProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <NewNavbar />
            
            <div className="container mx-auto p-4">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Konsinyasi</h1>
                <p className="text-gray-600">
                  Kelola laporan konsinyasi dan cetak tanda terima untuk supplier
                </p>
              </div>
              
              <Tabs defaultValue="konsinyasi-form" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="konsinyasi-form" className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Buat Laporan
                  </TabsTrigger>
                  <TabsTrigger value="konsinyasi-history" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Riwayat Laporan
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="konsinyasi-form">
                  <KonsinyasiForm />
                </TabsContent>

                <TabsContent value="konsinyasi-history">
                  <KonsinyasiHistory />
                </TabsContent>
              </Tabs>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </NewProtectedRoute>
  );
};

export default Konsinyasi;
