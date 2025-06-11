
import NewProtectedRoute from '@/components/NewProtectedRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ClipboardList, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import StockManagement from '@/components/stock/StockManagement';
import StockOpname from '@/components/stock/StockOpname';
import StockDashboard from '@/components/stock/StockDashboard';
import StockMovements from '@/components/stock/StockMovements';
import StockOpnameRecap from '@/components/stock/StockOpnameRecap';
import StockSyncNotification from '@/components/stock/StockSyncNotification';

const StockManagementPage = () => {
  return (
    <NewProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Stok Terintegrasi</h1>
          <p className="text-gray-600">
            Kelola stok produk dengan integrasi real-time data POS, pembelian, dan stock opname
          </p>
        </div>
        
        {/* Sync Status Notification */}
        <StockSyncNotification />
        
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="stock-management" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Manajemen Stok
            </TabsTrigger>
            <TabsTrigger value="stock-movements" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Pergerakan Stok
            </TabsTrigger>
            <TabsTrigger value="stock-opname" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Stok Opname
            </TabsTrigger>
            <TabsTrigger value="opname-recap" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Rekap Opname
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="space-y-6">
              <StockDashboard />
              <StockMovements />
            </div>
          </TabsContent>

          <TabsContent value="stock-management">
            <StockManagement />
          </TabsContent>

          <TabsContent value="stock-movements">
            <StockMovements />
          </TabsContent>

          <TabsContent value="stock-opname">
            <StockOpname />
          </TabsContent>

          <TabsContent value="opname-recap">
            <StockOpnameRecap />
          </TabsContent>
        </Tabs>
      </div>
    </NewProtectedRoute>
  );
};

export default StockManagementPage;
