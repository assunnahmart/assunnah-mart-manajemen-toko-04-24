import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NewProtectedRoute from '@/components/NewProtectedRoute';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import AdminDashboard from '@/components/admin/AdminDashboard';
import PelangganManagement from '@/components/admin/PelangganManagement';
import SupplierManagement from '@/components/admin/SupplierManagement';
import BukuBesarPiutang from '@/components/admin/BukuBesarPiutang';
import BukuBesarHutang from '@/components/admin/BukuBesarHutang';
import KasUmum from '@/components/admin/KasUmum';
import LabaRugi from '@/components/admin/LabaRugi';
import FinancialReports from '@/components/admin/FinancialReports';
import DataManagement from '@/components/admin/DataManagement';
import ProductDataManagement from '@/components/admin/ProductDataManagement';
import DataBackupManager from '@/components/admin/DataBackupManager';
import KartuHutangSupplier from '@/components/admin/KartuHutangSupplier';
import KartuPiutangPelanggan from '@/components/admin/KartuPiutangPelanggan';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <NewProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            {/* Header (dihilangkan) */}
            {/* <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-lg font-semibold">Admin Panel</h1>
            </div> */}
            
            {/* Langsung render konten admin */}
            <div className="flex-1 p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 lg:grid-cols-12">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="pelanggan">Pelanggan</TabsTrigger>
                  <TabsTrigger value="supplier">Supplier</TabsTrigger>
                  <TabsTrigger value="buku-besar-piutang">Piutang</TabsTrigger>
                  <TabsTrigger value="buku-besar-hutang">Hutang</TabsTrigger>
                  <TabsTrigger value="kas-umum">Kas</TabsTrigger>
                  <TabsTrigger value="laba-rugi">Laba Rugi</TabsTrigger>
                  <TabsTrigger value="financial-reports">Laporan</TabsTrigger>
                  <TabsTrigger value="data-management">Data</TabsTrigger>
                  <TabsTrigger value="backup-manager">Backup</TabsTrigger>
                  <TabsTrigger value="kartu-hutang">Kartu Hutang</TabsTrigger>
                  <TabsTrigger value="kartu-piutang">Kartu Piutang</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                  <AdminDashboard />
                </TabsContent>
                
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

                <TabsContent value="backup-manager">
                  <DataBackupManager />
                </TabsContent>
                
                <TabsContent value="kartu-hutang">
                  <KartuHutangSupplier />
                </TabsContent>
                <TabsContent value="kartu-piutang">
                  <KartuPiutangPelanggan />
                </TabsContent>
              </Tabs>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </NewProtectedRoute>
  );
};

export default AdminPanel;
