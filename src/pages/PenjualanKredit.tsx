
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Building2, User, AlertCircle, RefreshCw, DollarSign } from "lucide-react";
import { usePelangganKredit } from "@/hooks/usePelanggan";
import { useCustomerReceivablesSummary, useSyncPOSReceivables, useRecordCustomerPayment } from "@/hooks/useLedgers";
import NewProtectedRoute from "@/components/NewProtectedRoute";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import PaymentDialog from "@/components/penjualan/PaymentDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";

const PenjualanKredit = () => {
  const { data: pelangganKredit } = usePelangganKredit();
  const { data: receivablesSummary } = useCustomerReceivablesSummary();
  const syncPOSReceivables = useSyncPOSReceivables();
  const recordPayment = useRecordCustomerPayment();
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

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

  const getCustomerReceivableBalance = (customerName: string): number => {
    const receivable = receivablesSummary?.find(r => r.pelanggan_name === customerName);
    return Number(receivable?.total_receivables || 0);
  };

  const handleSyncPOSData = async () => {
    try {
      await syncPOSReceivables.mutateAsync();
      toast({
        title: "Sinkronisasi berhasil",
        description: "Data POS credit telah disinkronkan dengan sistem piutang"
      });
    } catch (error) {
      toast({
        title: "Gagal sinkronisasi",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handlePayment = (customer: any) => {
    const receivableBalance = getCustomerReceivableBalance(customer.nama);
    if (receivableBalance <= 0) {
      toast({
        title: "Tidak ada piutang",
        description: "Pelanggan ini tidak memiliki piutang yang perlu dibayar",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedCustomer(customer);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedCustomer || !paymentAmount || !paymentReference) {
      toast({
        title: "Data tidak lengkap",
        description: "Harap lengkapi semua field pembayaran",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    const receivableBalance = getCustomerReceivableBalance(selectedCustomer.nama);

    if (amount <= 0) {
      toast({
        title: "Jumlah tidak valid",
        description: "Masukkan jumlah pembayaran yang valid",
        variant: "destructive"
      });
      return;
    }

    if (amount > receivableBalance) {
      toast({
        title: "Jumlah melebihi piutang",
        description: `Jumlah pembayaran (${formatRupiah(amount)}) melebihi saldo piutang (${formatRupiah(receivableBalance)})`,
        variant: "destructive"
      });
      return;
    }

    try {
      await recordPayment.mutateAsync({
        pelanggan_name: selectedCustomer.nama,
        amount: amount,
        payment_date: new Date().toISOString().split('T')[0],
        reference_number: paymentReference,
        kasir_name: user?.full_name || 'Unknown',
        keterangan: `Pembayaran piutang dari menu Penjualan Kredit`
      });

      toast({
        title: "Pembayaran berhasil",
        description: `Pembayaran sebesar ${formatRupiah(amount)} untuk ${selectedCustomer.nama} berhasil dicatat`
      });

      // Reset form
      setIsPaymentDialogOpen(false);
      setSelectedCustomer(null);
      setPaymentAmount('');
      setPaymentReference('');
    } catch (error) {
      toast({
        title: "Gagal memproses pembayaran",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const PelangganUnitCard = ({ unit }: { unit: any }) => {
    const receivableBalance = getCustomerReceivableBalance(unit.nama);
    const hasReceivables = receivableBalance > 0;
    
    return (
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
              <span className="text-gray-500">Piutang Terintegrasi:</span>
              <p className="font-medium text-red-600">{formatRupiah(receivableBalance)}</p>
            </div>
            <div>
              <span className="text-gray-500">Limit Kredit:</span>
              <p className="font-medium">{formatRupiah(Number(unit.limit_kredit))}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => handlePayment(unit)}
              disabled={!hasReceivables}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Bayar
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              Detail
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const PelangganPeroranganCard = ({ pelanggan }: { pelanggan: any }) => {
    const receivableBalance = getCustomerReceivableBalance(pelanggan.nama);
    const hasReceivables = receivableBalance > 0;
    
    return (
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
              <span className="text-gray-500">Piutang Terintegrasi:</span>
              <p className="font-medium text-red-600">{formatRupiah(receivableBalance)}</p>
            </div>
            <div>
              <span className="text-gray-500">Limit Kredit:</span>
              <p className="font-medium">{formatRupiah(Number(pelanggan.limit_kredit))}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => handlePayment(pelanggan)}
              disabled={!hasReceivables}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Bayar
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              Detail
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // Calculate totals from integrated receivables data
  const totalReceivablesUnit = pelangganKredit?.unit?.reduce((sum, u) => sum + getCustomerReceivableBalance(u.nama), 0) || 0;
  const totalReceivablesPerorangan = pelangganKredit?.perorangan?.reduce((sum, p) => sum + getCustomerReceivableBalance(p.nama), 0) || 0;
  const totalReceivables = receivablesSummary?.reduce((sum, r) => sum + Number(r.total_receivables), 0) || 0;

  return (
    <NewProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-lg font-semibold">Penjualan Kredit</h1>
              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncPOSData}
                  disabled={syncPOSReceivables.isPending}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncPOSReceivables.isPending ? 'animate-spin' : ''}`} />
                  Sync POS Data
                </Button>
              </div>
            </div>
            <div className="flex-1 p-6">
              <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Penjualan Kredit</h1>
                  <p className="text-gray-600">Kelola penjualan kredit unit dan piutang pelanggan terintegrasi dengan POS</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Unit Berpiutang</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{pelangganKredit?.unit?.filter(u => getCustomerReceivableBalance(u.nama) > 0).length || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pelanggan Berpiutang</CardTitle>
                      <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{pelangganKredit?.perorangan?.filter(p => getCustomerReceivableBalance(p.nama) > 0).length || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Piutang Unit</CardTitle>
                      <CreditCard className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{formatRupiah(totalReceivablesUnit)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Piutang Perorangan</CardTitle>
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">{formatRupiah(totalReceivablesPerorangan)}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Integration Status */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-blue-900">Integrasi POS & Piutang Aktif</h3>
                        <p className="text-sm text-blue-600">
                          Data piutang terintegrasi dengan transaksi POS kredit. Total piutang terintegrasi: {formatRupiah(totalReceivables)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="unit" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="unit">Kredit Unit</TabsTrigger>
                    <TabsTrigger value="perorangan">Piutang Perorangan</TabsTrigger>
                  </TabsList>

                  <TabsContent value="unit">
                    <Card>
                      <CardHeader>
                        <CardTitle>Piutang Unit (Terintegrasi POS)</CardTitle>
                        <CardDescription>
                          Unit dengan piutang yang terintegrasi dengan sistem POS
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
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">Tidak ada unit berpiutang</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Semua piutang unit sudah lunas.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="perorangan">
                    <Card>
                      <CardHeader>
                        <CardTitle>Piutang Perorangan (Terintegrasi POS)</CardTitle>
                        <CardDescription>
                          Pelanggan dengan piutang yang terintegrasi dengan sistem POS
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
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">Tidak ada pelanggan berpiutang</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Semua piutang perorangan sudah lunas.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Payment Dialog */}
                {isPaymentDialogOpen && selectedCustomer && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                      <CardHeader>
                        <CardTitle>Terima Pembayaran Piutang</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Pelanggan</label>
                          <input 
                            className="w-full p-2 border rounded bg-gray-50" 
                            value={selectedCustomer.nama} 
                            disabled 
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Saldo Piutang</label>
                          <input 
                            className="w-full p-2 border rounded bg-gray-50 text-red-600 font-semibold" 
                            value={formatRupiah(getCustomerReceivableBalance(selectedCustomer.nama))} 
                            disabled 
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Jumlah Pembayaran *</label>
                          <input 
                            type="number"
                            className="w-full p-2 border rounded" 
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="0"
                            max={getCustomerReceivableBalance(selectedCustomer.nama)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Nomor Referensi *</label>
                          <input 
                            className="w-full p-2 border rounded" 
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            placeholder="No. Bukti/Kwitansi"
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setIsPaymentDialogOpen(false);
                              setSelectedCustomer(null);
                              setPaymentAmount('');
                              setPaymentReference('');
                            }}
                          >
                            Batal
                          </Button>
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={handlePaymentSubmit}
                            disabled={recordPayment.isPending || !paymentAmount || !paymentReference}
                          >
                            {recordPayment.isPending ? 'Memproses...' : 'Terima Pembayaran'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </NewProtectedRoute>
  );
};

export default PenjualanKredit;
