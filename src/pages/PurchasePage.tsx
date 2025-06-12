
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, FileText } from 'lucide-react';
import PurchaseForm from '@/components/purchase/PurchaseForm';
import PurchaseHistory from '@/components/purchase/PurchaseHistory';

const PurchasePage = () => {
  return (
    <NewProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <NewNavbar />
            
            <div className="container mx-auto p-4">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Pembelian</h1>
                <p className="text-gray-600">
                  Kelola transaksi pembelian barang dan supplier
                </p>
              </div>
              
              <Tabs defaultValue="purchase-form" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="purchase-form" className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Input Pembelian
                  </TabsTrigger>
                  <TabsTrigger value="purchase-history" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Riwayat Pembelian
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="purchase-form">
                  <PurchaseForm />
                </TabsContent>

                <TabsContent value="purchase-history">
                  <PurchaseHistory />
                </TabsContent>
              </Tabs>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </NewProtectedRoute>
  );
};

export default PurchasePage;
