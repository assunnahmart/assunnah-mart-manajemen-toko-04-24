
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, FileText, Calendar, DollarSign, Building2, TrendingUp, CreditCard } from 'lucide-react';
import { useSupplier } from '@/hooks/useSupplier';
import { useSupplierPayablesLedger, useSupplierPayablesSummary, useRecordSupplierPayment } from '@/hooks/useLedgers';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

const KartuHutangSupplier = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    reference_number: '',
    keterangan: ''
  });

  const { user } = useSimpleAuth();
  const { data: suppliers } = useSupplier();
  const { data: supplierSummary } = useSupplierPayablesSummary();
  const { data: ledgerEntries } = useSupplierPayablesLedger(
    selectedSupplier?.id,
    undefined,
    undefined
  );
  const recordPayment = useRecordSupplierPayment();
  const { toast } = useToast();

  const filteredSuppliers = suppliers?.filter(supplier =>
    supplier.nama.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const currentBalance = ledgerEntries?.[0]?.running_balance || 0;
  const totalPayables = supplierSummary?.reduce((sum, item) => sum + Number(item.total_payables), 0) || 0;

  const handleRecordPayment = async () => {
    if (!selectedSupplier || !paymentForm.amount || !paymentForm.reference_number) {
      toast({
        title: "Error",
        description: "Lengkapi semua field yang diperlukan",
        variant: "destructive"
      });
      return;
    }

    try {
      await recordPayment.mutateAsync({
        supplier_id: selectedSupplier.id,
        amount: paymentForm.amount,
        payment_date: new Date().toISOString().split('T')[0],
        reference_number: paymentForm.reference_number,
        kasir_name: user?.full_name || 'Unknown',
        keterangan: paymentForm.keterangan
      });

      toast({
        title: "Berhasil",
        description: "Pembayaran hutang berhasil dicatat"
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
          <h1 className="text-3xl font-bold">Kartu Hutang Supplier</h1>
          <p className="text-gray-600">Kelola hutang supplier secara terintegrasi</p>
        </div>
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedSupplier}>
              <Plus className="h-4 w-4 mr-2" />
              Bayar Hutang
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bayar Hutang Supplier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Supplier</Label>
                <Input value={selectedSupplier?.nama || ''} disabled />
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
                {recordPayment.isPending ? 'Menyimpan...' : 'Bayar Hutang'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hutang</CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatRupiah(totalPayables)}</div>
            <p className="text-xs text-gray-500 mt-1">Dari {supplierSummary?.length || 0} supplier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supplier Aktif</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{suppliers?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Total supplier terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hutang Dipilih</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatRupiah(Math.abs(currentBalance))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedSupplier ? selectedSupplier.nama : 'Pilih supplier'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daftar Supplier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Daftar Supplier
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {filteredSuppliers.map((supplier) => {
                const supplierDebt = supplierSummary?.find(s => s.supplier_name === supplier.nama);
                return (
                  <div
                    key={supplier.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSupplier?.id === supplier.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedSupplier(supplier)}
                  >
                    <div className="font-medium">{supplier.nama}</div>
                    <div className="text-sm text-gray-500">{supplier.telepon || 'No phone'}</div>
                    <div className="flex justify-between items-center mt-1">
                      <Badge variant={supplierDebt?.total_payables > 0 ? 'destructive' : 'default'}>
                        {formatRupiah(Number(supplierDebt?.total_payables || 0))}
                      </Badge>
                      <Badge variant="outline">
                        {supplierDebt?.total_transactions || 0} transaksi
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detail Kartu Hutang */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Kartu Hutang - {selectedSupplier ? selectedSupplier.nama : 'Pilih Supplier'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSupplier ? (
              <div className="space-y-6">
                {/* Info Supplier */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Nama Supplier</Label>
                    <div className="font-medium">{selectedSupplier.nama}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Telepon</Label>
                    <div className="font-medium">{selectedSupplier.telepon || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <div className="font-medium">{selectedSupplier.email || '-'}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Saldo Hutang</Label>
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
                <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Pilih supplier dari daftar untuk melihat kartu hutang</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KartuHutangSupplier;
