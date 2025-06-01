
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ClipboardList, TrendingUp } from 'lucide-react';
import StockManagement from '@/components/stock/StockManagement';
import StockOpname from '@/components/stock/StockOpname';

const StockManagementPage = () => {
  return (
    <NewProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <NewNavbar />
        
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Stok</h1>
            <p className="text-gray-600">
              Kelola stok produk, input stok opname, dan monitoring pergerakan stok
            </p>
          </div>
          
          <Tabs defaultValue="stock-management" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stock-management" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Manajemen Stok
              </TabsTrigger>
              <TabsTrigger value="stock-opname" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Stok Opname
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stock-management">
              <StockManagement />
            </TabsContent>

            <TabsContent value="stock-opname">
              <StockOpname />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </NewProtectedRoute>
  );
};

export default StockManagementPage;
