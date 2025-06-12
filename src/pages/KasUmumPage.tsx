
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, FileText } from 'lucide-react';
import KasUmumForm from '@/components/kas/KasUmumForm';
import KasUmumHistory from '@/components/kas/KasUmumHistory';

const KasUmumPage = () => {
  return (
    <NewProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <NewNavbar />
            
            <div className="container mx-auto p-4">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Kas Umum</h1>
                <p className="text-gray-600">
                  Kelola transaksi kas masuk dan keluar, eksport import data
                </p>
              </div>
              
              <Tabs defaultValue="transaction-form" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="transaction-form" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Input Transaksi
                  </TabsTrigger>
                  <TabsTrigger value="transaction-history" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Riwayat & Laporan
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="transaction-form">
                  <KasUmumForm />
                </TabsContent>

                <TabsContent value="transaction-history">
                  <KasUmumHistory />
                </TabsContent>
              </Tabs>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </NewProtectedRoute>
  );
};

export default KasUmumPage;
