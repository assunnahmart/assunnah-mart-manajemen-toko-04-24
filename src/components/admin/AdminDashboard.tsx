
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CreditCard, Truck, TrendingUp, Database, Package } from 'lucide-react';
import PelangganManagement from './PelangganManagement';
import SupplierManagement from './SupplierManagement';
import KartuHutang from './KartuHutang';
import KasUmum from './KasUmum';
import LabaRugi from './LabaRugi';
import DataManagement from './DataManagement';
import ProductDataManagement from './ProductDataManagement';

const AdminDashboard = () => {
  return (
    <Tabs defaultValue="pelanggan" className="space-y-4">
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="pelanggan" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Pelanggan
        </TabsTrigger>
        <TabsTrigger value="supplier" className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Supplier
        </TabsTrigger>
        <TabsTrigger value="hutang" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Kartu Hutang
        </TabsTrigger>
        <TabsTrigger value="kas-umum" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Kas Umum
        </TabsTrigger>
        <TabsTrigger value="laba-rugi" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Laba Rugi
        </TabsTrigger>
        <TabsTrigger value="data-management" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Data
        </TabsTrigger>
        <TabsTrigger value="product-management" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Produk
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pelanggan">
        <PelangganManagement />
      </TabsContent>

      <TabsContent value="supplier">
        <SupplierManagement />
      </TabsContent>

      <TabsContent value="hutang">
        <KartuHutang />
      </TabsContent>

      <TabsContent value="kas-umum">
        <KasUmum />
      </TabsContent>

      <TabsContent value="laba-rugi">
        <LabaRugi />
      </TabsContent>

      <TabsContent value="data-management">
        <DataManagement />
      </TabsContent>

      <TabsContent value="product-management">
        <ProductDataManagement />
      </TabsContent>
    </Tabs>
  );
};

export default AdminDashboard;
