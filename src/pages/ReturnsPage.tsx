
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCcw, Package, ShoppingCart } from 'lucide-react';
import PurchaseReturnForm from '@/components/returns/PurchaseReturnForm';
import SalesReturnForm from '@/components/returns/SalesReturnForm';
import ReturnsHistory from '@/components/returns/ReturnsHistory';

const ReturnsPage = () => {
  return (
    <NewProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <NewNavbar />
            
            <div className="container mx-auto p-4">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <RotateCcw className="h-8 w-8" />
                  Retur Barang
                </h1>
                <p className="text-gray-600">
                  Kelola retur pembelian dan penjualan dengan otomasi jurnal dan stok
                </p>
              </div>
              
              <Tabs defaultValue="purchase-return" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="purchase-return" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Retur Pembelian
                  </TabsTrigger>
                  <TabsTrigger value="sales-return" className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Retur Penjualan
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Riwayat Retur
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="purchase-return">
                  <PurchaseReturnForm />
                </TabsContent>

                <TabsContent value="sales-return">
                  <SalesReturnForm />
                </TabsContent>

                <TabsContent value="history">
                  <ReturnsHistory />
                </TabsContent>
              </Tabs>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </NewProtectedRoute>
  );
};

export default ReturnsPage;
