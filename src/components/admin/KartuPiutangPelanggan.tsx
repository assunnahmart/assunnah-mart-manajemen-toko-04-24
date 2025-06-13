
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, FileText, Calendar, DollarSign, User, Building2, TrendingUp } from 'lucide-react';
import { usePelangganKredit } from '@/hooks/usePelanggan';
import { useCustomerReceivablesLedger, useCustomerReceivablesSummary, useRecordCustomerPayment } from '@/hooks/useLedgers';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

const KartuPiutangPelanggan = () => {
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
  const { data: customerSummary } = useCustomerReceivablesSummary();
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
  const totalReceivables = customerSummary?.reduce((sum, item) => sum + Number(item.total_receivables), 0) || 0;

  const handleRecordPayment = async () => {
    if (!selectedCustomer || !paymentForm.amount || !paymentForm.reference_number) {
      toast({
        title: "Error",
        description: "Lengkapi semua field yang diperlukan",
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
          <p className="text-gray-600">Kelola piutang pelanggan secara terintegrasi</p>
        </div>
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedCustomer}>
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
                <Label>Jumlah Pembayaran</Label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  placeholder="Masukkan jumlah pembayaran"
                />
              </div>
              <div>
                <Label>Nomor Referensi</Label>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatRupiah(totalReceivables)}</div>
            <p className="text-xs text-gray-500 mt-1">Dari {customerSummary?.length || 0} pelanggan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelanggan Aktif</CardTitle>
            <User className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{allCustomers.length}</div>
            <p className="text-xs text-gray-500 mt-1">Total pelanggan terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Piutang Dipilih</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatRupiah(Math.abs(currentBalance))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedCustomer ? selectedCustomer.nama : 'Pilih pelanggan'}
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
              {filteredCustomers.map((customer) => {
                const customerReceivables = customerSummary?.find(c => c.pelanggan_name === customer.nama);
                return (
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
                      <Badge variant={customerReceivables?.total_receivables > 0 ? 'destructive' : 'default'}>
                        {formatRupiah(Number(customerReceivables?.total_receivables || 0))}
                      </Badge>
                      <Badge variant="outline">
                        {customerReceivables?.total_transactions || 0} transaksi
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
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
                    <Label className="text-sm font-medium text-gray-600">Nama Pelanggan</Label>
                    <div className="font-medium">{selectedCustomer.nama}</div>
                  </div>
                  {selectedCustomer.nama_unit && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Unit/Perusahaan</Label>
                      <div className="font-medium">{selectedCustomer.nama_unit}</div>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Telepon</Label>
                    <div className="font-medium">{selectedCustomer.telepon || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Saldo Piutang</Label>
                    <div className={`font-bold ${currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatRupiah(Math.abs(currentBalance))}
                    </div>
                  </div>
                </div>

                {/* Riwayat Transaksi */}
                {ledgerEntries && ledgerEntries.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Riwayat Transaksi Terbaru</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead>Debit</TableHead>
                            <TableHead>Kredit</TableHead>
                            <TableHead>Saldo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ledgerEntries.slice(0, 5).map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell>
                                {new Date(entry.transaction_date).toLocaleDateString('id-ID')}
                              </TableCell>
                              <TableCell>{entry.description}</TableCell>
                              <TableCell className="text-red-600">
                                {entry.debit_amount > 0 ? formatRupiah(entry.debit_amount) : '-'}
                              </TableCell>
                              <TableCell className="text-green-600">
                                {entry.credit_amount > 0 ? formatRupiah(entry.credit_amount) : '-'}
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatRupiah(Math.abs(entry.running_balance))}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Pilih pelanggan dari daftar untuk melihat kartu piutang</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KartuPiutangPelanggan;
