
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, FileText, Calendar, DollarSign, User, Building2, TrendingUp, CreditCard } from 'lucide-react';
import { usePelangganKredit } from '@/hooks/usePelanggan';
import { usePiutangPelanggan, useTodayCreditSales, useKasUmumSummary } from '@/hooks/usePiutang';
import { useCustomerReceivablesLedger, useRecordCustomerPayment } from '@/hooks/useLedgers';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

const KartuHutang = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    reference_number: '',
    keterangan: ''
  });

  const { user } = useSimpleAuth();
  const { data: pelangganKredit } = usePelangganKredit();
  const { data: piutangData } = usePiutangPelanggan();
  const { data: creditSales } = useTodayCreditSales();
  const { data: kasUmumData } = useKasUmumSummary();
  const { data: ledgerEntries } = useCustomerReceivablesLedger(
    selectedCustomer?.nama,
    undefined,
    undefined
  );
  const recordPayment = useRecordCustomerPayment();
  const { toast } = useToast();

  // Combine both unit and perorangan customers
  const allCustomers = [
    ...(pelangganKredit?.unit || []),
    ...(pelangganKredit?.perorangan || [])
  ];

  const filteredCustomers = allCustomers.filter(customer =>
    customer.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.nama_unit && customer.nama_unit.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const currentBalance = ledgerEntries?.[0]?.running_balance || 0;

  const handleRecordPayment = async () => {
    if (!selectedCustomer || !paymentForm.amount || !paymentForm.reference_number) {
      toast({
        title: "Error",
        description: "Lengkapi semua field yang diperlukan",
        variant: "destructive"
      });
      return;
    }

    if (paymentForm.amount > Math.abs(currentBalance)) {
      toast({
        title: "Error",
        description: "Jumlah pembayaran melebihi saldo piutang yang tersisa",
        variant: "destructive"
      });
      return;
    }

    try {
      await recordPayment.mutateAsync({
        pelanggan_name: selectedCustomer.nama,
        amount: paymentForm.amount,
        payment_date: new Date().toISOString().split('T')[0],
        reference_number: paymentForm.reference_number,
        kasir_name: user?.full_name || 'Unknown',
        keterangan: paymentForm.keterangan
      });

      toast({
        title: "Berhasil",
        description: "Pembayaran piutang berhasil dicatat"
      });

      setIsPaymentDialogOpen(false);
      setPaymentForm({ amount: 0, reference_number: '', keterangan: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Kartu Piutang Pelanggan</h1>
          <p className="text-gray-600">Kelola piutang pelanggan terintegrasi dengan POS dan Kas Umum</p>
        </div>
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedCustomer || currentBalance <= 0}>
              <Plus className="h-4 w-4 mr-2" />
              Terima Pembayaran
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Terima Pembayaran Piutang</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Pelanggan</Label>
                <Input value={selectedCustomer?.nama || ''} disabled />
              </div>
              <div>
                <Label>Saldo Piutang Saat Ini</Label>
                <Input value={formatRupiah(Math.abs(currentBalance))} disabled />
              </div>
              <div>
                <Label>Jumlah Pembayaran *</Label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  placeholder="Masukkan jumlah pembayaran"
                  max={Math.abs(currentBalance)}
                />
              </div>
              <div>
                <Label>Nomor Referensi *</Label>
                <Input
                  value={paymentForm.reference_number}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, reference_number: e.target.value }))}
                  placeholder="Nomor bukti pembayaran"
                />
              </div>
              <div>
                <Label>Keterangan</Label>
                <Input
                  value={paymentForm.keterangan}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, keterangan: e.target.value }))}
                  placeholder="Keterangan pembayaran"
                />
              </div>
              <Button 
                onClick={handleRecordPayment} 
                disabled={recordPayment.isPending}
                className="w-full"
              >
                {recordPayment.isPending ? 'Menyimpan...' : 'Terima Pembayaran'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards - Sync with POS and Kas Umum */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatRupiah(piutangData?.totalPiutang || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {piutangData?.totalCreditCustomers || 0} pelanggan kredit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kredit Hari Ini</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatRupiah(creditSales?.totalCreditSales || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {creditSales?.totalCreditTransactions || 0} transaksi kredit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kas Masuk Hari Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatRupiah(kasUmumData?.kasMasuk || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Saldo: {formatRupiah(kasUmumData?.saldoKas || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unit vs Perorangan</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">
              {(piutangData?.pelangganUnit?.length || 0)} : {(piutangData?.pelangganPerorangan?.length || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Unit : Perorangan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daftar Pelanggan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Daftar Pelanggan
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari pelanggan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCustomer?.id === customer.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="font-medium">{customer.nama}</div>
                  {customer.nama_unit && (
                    <div className="text-sm text-gray-600">{customer.nama_unit}</div>
                  )}
                  <div className="text-sm text-gray-500">{customer.telepon || 'No phone'}</div>
                  <div className="flex justify-between items-center mt-1">
                    <Badge variant={(customer.total_tagihan || customer.sisa_piutang) > 0 ? 'destructive' : 'default'}>
                      {formatRupiah((customer.total_tagihan || 0) + (customer.sisa_piutang || 0))}
                    </Badge>
                    <Badge variant="outline">
                      Limit: {formatRupiah(customer.limit_kredit || 0)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {filteredCustomers.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                {searchTerm ? 'Tidak ada pelanggan yang ditemukan' : 'Belum ada data pelanggan'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Kartu Piutang */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Kartu Piutang - {selectedCustomer ? selectedCustomer.nama : 'Pilih Pelanggan'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCustomer ? (
              <div className="space-y-6">
                {/* Info Pelanggan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Nama Lengkap</Label>
                    <div className="font-medium">{selectedCustomer.nama}</div>
                  </div>
                  {selectedCustomer.nama_unit && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Unit/Perusahaan</Label>
                      <div className="font-medium">{selectedCustomer.nama_unit}</div>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Jabatan</Label>
                    <div className="font-medium">{selectedCustomer.jabatan || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Telepon</Label>
                    <div className="font-medium">{selectedCustomer.telepon || '-'}</div>
                  </div>
                </div>

                {/* Info Keuangan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="text-sm text-gray-600">Saldo Piutang</div>
                          <div className="font-bold text-red-600">
                            {formatRupiah(Math.abs(currentBalance))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="text-sm text-gray-600">Limit Kredit</div>
                          <div className="font-bold text-blue-600">
                            {formatRupiah(selectedCustomer.limit_kredit || 0)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="text-sm text-gray-600">Status</div>
                          <Badge variant={selectedCustomer.status === 'aktif' ? 'default' : 'destructive'}>
                            {selectedCustomer.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Info Tambahan */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Alamat</Label>
                  <div className="font-medium">{selectedCustomer.alamat || '-'}</div>
                </div>

                {/* Sync Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Sinkronisasi Data</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• Data tersinkron dengan sistem POS real-time</p>
                    <p>• Transaksi kredit otomatis masuk ke kas umum</p>
                    <p>• Update otomatis setiap 30 detik</p>
                  </div>
                </div>

                {/* Aksi */}
                <div className="flex gap-2">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Cetak Kartu
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Riwayat Transaksi
                  </Button>
                  <Button 
                    onClick={() => setIsPaymentDialogOpen(true)}
                    disabled={currentBalance <= 0}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Terima Pembayaran
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Pilih pelanggan dari daftar untuk melihat kartu piutang</p>
                <p className="text-sm mt-2">Data akan tersinkron otomatis dengan POS dan Kas Umum</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KartuHutang;
