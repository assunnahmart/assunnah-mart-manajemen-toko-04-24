
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CreditCard, Building2, DollarSign, TrendingUp, Database } from 'lucide-react';
import PelangganManagement from './PelangganManagement';
import KartuHutang from './KartuHutang';
import SupplierManagement from './SupplierManagement';
import KasUmum from './KasUmum';
import LabaRugi from './LabaRugi';
import DataManagement from './DataManagement';

const AdminDashboard = () => {
  return (
    <Tabs defaultValue="pelanggan" className="space-y-4">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="pelanggan" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Pelanggan
        </TabsTrigger>
        <TabsTrigger value="piutang" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Piutang
        </TabsTrigger>
        <TabsTrigger value="supplier" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Supplier
        </TabsTrigger>
        <TabsTrigger value="kas-umum" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Kas Umum
        </TabsTrigger>
        <TabsTrigger value="laba-rugi" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Laba Rugi
        </TabsTrigger>
        <TabsTrigger value="data-management" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Data Management
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pelanggan">
        <PelangganManagement />
      </TabsContent>

      <TabsContent value="piutang">
        <KartuHutang />
      </TabsContent>

      <TabsContent value="supplier">
        <SupplierManagement />
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
    </Tabs>
  );
};

export default AdminDashboard;
