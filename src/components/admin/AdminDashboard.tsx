
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CreditCard, Building, DollarSign, TrendingUp } from 'lucide-react';
import PelangganManagement from './PelangganManagement';
import KartuHutang from './KartuHutang';
import SupplierManagement from './SupplierManagement';
import KasUmum from './KasUmum';
import LabaRugi from './LabaRugi';
import { usePelangganKredit } from '@/hooks/usePelanggan';
import { useKasUmum, useLabaRugi, useSupplierData } from '@/hooks/useAdminReports';

const AdminDashboard = () => {
  const { data: pelangganKredit } = usePelangganKredit();
  const { data: kasData } = useKasUmum();
  const { data: labaRugiData } = useLabaRugi();
  const { data: supplierData } = useSupplierData();

  const totalPelanggan = (pelangganKredit?.unit?.length || 0) + (pelangganKredit?.perorangan?.length || 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pelanggan</p>
                <p className="text-2xl font-bold">
                  {totalPelanggan}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {pelangganKredit?.unit?.length || 0} Unit, {pelangganKredit?.perorangan?.length || 0} Perorangan
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kas Hari Ini</p>
                <p className="text-2xl font-bold text-green-600">
                  Rp {(kasData?.todayKasMasuk || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {kasData?.todayTransaksiKas || 0} transaksi
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Laba Hari Ini</p>
                <p className="text-2xl font-bold text-purple-600">
                  Rp {(labaRugiData?.todayPendapatan || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {labaRugiData?.todayTransaksi || 0} transaksi
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Supplier</p>
                <p className="text-2xl font-bold text-orange-600">
                  {supplierData?.totalSuppliers || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {supplierData?.totalProducts || 0} produk
                </p>
              </div>
              <Building className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pelanggan" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pelanggan" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Pelanggan
          </TabsTrigger>
          <TabsTrigger value="piutang" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Kartu Hutang
          </TabsTrigger>
          <TabsTrigger value="supplier" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Supplier
          </TabsTrigger>
          <TabsTrigger value="kas" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Kas Umum
          </TabsTrigger>
          <TabsTrigger value="laba-rugi" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Laba Rugi
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

        <TabsContent value="kas">
          <KasUmum />
        </TabsContent>

        <TabsContent value="laba-rugi">
          <LabaRugi />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
