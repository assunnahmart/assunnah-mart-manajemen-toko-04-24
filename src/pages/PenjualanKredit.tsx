
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Building2, User, AlertCircle } from "lucide-react";
import { usePelangganKredit } from "@/hooks/usePelanggan";
import NewProtectedRoute from "@/components/NewProtectedRoute";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const PenjualanKredit = () => {
  const { data: pelangganKredit } = usePelangganKredit();

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktif':
        return 'default';
      case 'menunggak':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const PelangganUnitCard = ({ unit }: { unit: any }) => (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-gray-500" />
              <h3 className="font-semibold">{unit.nama_unit || unit.nama}</h3>
            </div>
            <p className="text-sm text-gray-500">{unit.alamat}</p>
            <p className="text-sm text-gray-600">
              PIC: {unit.nama} • {unit.telepon}
            </p>
          </div>
          <Badge variant={getStatusColor(unit.status) as any}>
            {unit.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Total Tagihan:</span>
            <p className="font-medium text-red-600">{formatRupiah(Number(unit.total_tagihan))}</p>
          </div>
          <div>
            <span className="text-gray-500">Limit Kredit:</span>
            <p className="font-medium">{formatRupiah(Number(unit.limit_kredit))}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            Bayar
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Detail
          </Button>
        </div>
      </div>
    </Card>
  );

  const PelangganPeroranganCard = ({ pelanggan }: { pelanggan: any }) => (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-gray-500" />
              <h3 className="font-semibold">{pelanggan.nama}</h3>
            </div>
            <p className="text-sm text-gray-500">
              {pelanggan.jabatan}
            </p>
            <p className="text-sm text-gray-600">{pelanggan.telepon}</p>
          </div>
          <Badge variant={getStatusColor(pelanggan.status) as any}>
            {pelanggan.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Sisa Piutang:</span>
            <p className="font-medium text-red-600">{formatRupiah(Number(pelanggan.sisa_piutang))}</p>
          </div>
          <div>
            <span className="text-gray-500">Limit Kredit:</span>
            <p className="font-medium">{formatRupiah(Number(pelanggan.limit_kredit))}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            Bayar
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Detail
          </Button>
        </div>
      </div>
    </Card>
  );

  const totalTagihanUnit = pelangganKredit?.unit?.reduce((sum, u) => sum + Number(u.total_tagihan), 0) || 0;
  const totalPiutangPerorangan = pelangganKredit?.perorangan?.reduce((sum, p) => sum + Number(p.sisa_piutang), 0) || 0;

  return (
    <NewProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-lg font-semibold">Penjualan Kredit</h1>
            </div>
            <div className="flex-1 p-6">
              <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Penjualan Kredit</h1>
                  <p className="text-gray-600">Kelola penjualan kredit unit dan piutang pelanggan</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Unit Bertagihan</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{pelangganKredit?.unit?.length || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pelanggan Piutang</CardTitle>
                      <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{pelangganKredit?.perorangan?.length || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Tagihan Unit</CardTitle>
                      <CreditCard className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{formatRupiah(totalTagihanUnit)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Piutang Perorangan</CardTitle>
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">{formatRupiah(totalPiutangPerorangan)}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="unit" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="unit">Kredit Unit</TabsTrigger>
                    <TabsTrigger value="perorangan">Piutang Perorangan</TabsTrigger>
                  </TabsList>

                  <TabsContent value="unit">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tagihan Unit</CardTitle>
                        <CardDescription>
                          Unit dengan tagihan kredit yang perlu dibayar
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {pelangganKredit?.unit?.map((unit) => (
                            <PelangganUnitCard key={unit.id} unit={unit} />
                          ))}
                        </div>
                        {(!pelangganKredit?.unit || pelangganKredit.unit.length === 0) && (
                          <div className="text-center py-8">
                            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">Tidak ada tagihan unit</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Semua tagihan unit sudah lunas.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="perorangan">
                    <Card>
                      <CardHeader>
                        <CardTitle>Piutang Perorangan</CardTitle>
                        <CardDescription>
                          Pelanggan dengan piutang yang perlu dibayar
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {pelangganKredit?.perorangan?.map((pelanggan) => (
                            <PelangganPeroranganCard key={pelanggan.id} pelanggan={pelanggan} />
                          ))}
                        </div>
                        {(!pelangganKredit?.perorangan || pelangganKredit.perorangan.length === 0) && (
                          <div className="text-center py-8">
                            <User className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">Tidak ada piutang perorangan</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Semua piutang perorangan sudah lunas.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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

export default PenjualanKredit;
