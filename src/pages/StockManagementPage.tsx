
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ClipboardList, TrendingUp, Activity, BarChart3, AlertTriangle } from 'lucide-react';
import StockManagement from '@/components/stock/StockManagement';
import StockOpname from '@/components/stock/StockOpname';
import StockDashboard from '@/components/stock/StockDashboard';
import StockMovements from '@/components/stock/StockMovements';
import StockOpnameRecap from '@/components/stock/StockOpnameRecap';
import SelisihStokOpname from '@/components/stock/SelisihStokOpname';
import StockOpnameRealTimeSync from '@/components/stock/StockOpnameRealTimeSync';
import { useStockSync } from '@/hooks/useStockSync';

const StockManagementPage = () => {
  // Initialize real-time stock sync
  useStockSync();

  return (
    <NewProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <NewNavbar />
        
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Stok Terintegrasi</h1>
            <p className="text-gray-600">
              Kelola stok produk dengan integrasi real-time data POS, pembelian, dan stock opname
            </p>
          </div>
          
          {/* Real-time Sync Status */}
          <StockOpnameRealTimeSync />
          
          <Tabs defaultValue="dashboard" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
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
              <TabsTrigger value="selisih-opname" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Selisih Opname
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

            <TabsContent value="selisih-opname">
              <SelisihStokOpname />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </NewProtectedRoute>
  );
};

export default StockManagementPage;
