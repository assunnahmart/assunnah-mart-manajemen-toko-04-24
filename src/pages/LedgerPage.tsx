
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building, FileText, TrendingUp, Download, Trash2 } from 'lucide-react';
import BukuBesarPiutang from '@/components/admin/BukuBesarPiutang';
import BukuBesarHutang from '@/components/admin/BukuBesarHutang';
import DataBackupManager from '@/components/admin/DataBackupManager';
import { useCustomerReceivablesSummary, useSupplierPayablesSummary } from '@/hooks/useLedgers';
import { useDataBackup } from '@/hooks/useDataBackup';
import { useToast } from '@/hooks/use-toast';
import NewProtectedRoute from '@/components/NewProtectedRoute';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

const LedgerPage = () => {
  const { data: customerSummary } = useCustomerReceivablesSummary();
  const { data: supplierSummary } = useSupplierPayablesSummary();
  const { exportAllData } = useDataBackup();
  const { toast } = useToast();

  const totalReceivables = customerSummary?.reduce((sum: number, item: any) => sum + Number(item.total_receivables), 0) || 0;
  const totalPayables = supplierSummary?.reduce((sum: number, item: any) => sum + Number(item.total_payables), 0) || 0;
  const netPosition = totalReceivables - totalPayables;
  const todayTransactions = 0; // This would need a separate query for today's transactions

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleQuickBackup = async () => {
    try {
      const result = await exportAllData.mutateAsync();
      toast({
        title: "Berhasil",
        description: `Data berhasil di-backup ke file ${result.fileName}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal membuat backup data",
        variant: "destructive"
      });
    }
  };

  return (
    <NewProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-lg font-semibold">Buku Besar Piutang & Hutang</h1>
            </div>
            
            <div className="flex-1 p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">Buku Besar Piutang & Hutang</h1>
                    <p className="text-gray-600">Kelola piutang pelanggan dan hutang supplier secara terintegrasi</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={handleQuickBackup}
                      disabled={exportAllData.isPending}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {exportAllData.isPending ? 'Backup...' : 'Quick Backup'}
                    </Button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
                      <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{formatRupiah(totalReceivables)}</div>
                      <p className="text-xs text-gray-500 mt-1">Dari {customerSummary?.length || 0} pelanggan</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Hutang</CardTitle>
                      <Building className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">{formatRupiah(totalPayables)}</div>
                      <p className="text-xs text-gray-500 mt-1">Dari {supplierSummary?.length || 0} supplier</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
                      <FileText className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{todayTransactions}</div>
                      <p className="text-xs text-gray-500 mt-1">Pembayaran & penjualan</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Net Position</CardTitle>
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatRupiah(Math.abs(netPosition))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {netPosition >= 0 ? 'Surplus' : 'Defisit'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="receivables" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="receivables" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Piutang Pelanggan
                    </TabsTrigger>
                    <TabsTrigger value="payables" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Hutang Supplier
                    </TabsTrigger>
                    <TabsTrigger value="backup" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Backup & Manage
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="receivables">
                    <BukuBesarPiutang />
                  </TabsContent>
                  
                  <TabsContent value="payables">
                    <BukuBesarHutang />
                  </TabsContent>

                  <TabsContent value="backup">
                    <DataBackupManager />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </NewProtectedRoute>
  );
};

export default LedgerPage;
