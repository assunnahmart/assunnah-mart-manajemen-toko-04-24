
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CreditCard, Truck, TrendingUp, Database, Package, Calculator, BookOpen, FileText } from 'lucide-react';
import PelangganManagement from './PelangganManagement';
import SupplierManagement from './SupplierManagement';
import KasUmum from './KasUmum';
import LabaRugi from './LabaRugi';
import DataManagement from './DataManagement';
import ProductDataManagement from './ProductDataManagement';
import FinancialReports from './FinancialReports';
import BukuBesarPiutang from './BukuBesarPiutang';
import BukuBesarHutang from './BukuBesarHutang';

const AdminDashboard = () => {
  return (
    <Tabs defaultValue="pelanggan" className="space-y-4">
      <TabsList className="grid w-full grid-cols-9">
        <TabsTrigger value="pelanggan" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Pelanggan
        </TabsTrigger>
        <TabsTrigger value="supplier" className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Supplier
        </TabsTrigger>
        <TabsTrigger value="buku-besar-piutang" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Buku Besar Piutang
        </TabsTrigger>
        <TabsTrigger value="buku-besar-hutang" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Buku Besar Hutang
        </TabsTrigger>
        <TabsTrigger value="kas-umum" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Kas Umum
        </TabsTrigger>
        <TabsTrigger value="laba-rugi" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Laba Rugi
        </TabsTrigger>
        <TabsTrigger value="financial-reports" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Laporan Keuangan
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

      <TabsContent value="buku-besar-piutang">
        <BukuBesarPiutang />
      </TabsContent>

      <TabsContent value="buku-besar-hutang">
        <BukuBesarHutang />
      </TabsContent>

      <TabsContent value="kas-umum">
        <KasUmum />
      </TabsContent>

      <TabsContent value="laba-rugi">
        <LabaRugi />
      </TabsContent>

      <TabsContent value="financial-reports">
        <FinancialReports />
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
