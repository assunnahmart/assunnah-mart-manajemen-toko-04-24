import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Building, CreditCard, Plus, Filter } from 'lucide-react';
import { useSupplierPayablesLedger, useSupplierPayablesSummary, useRecordSupplierPayment } from '@/hooks/useLedgers';
import { useSupplier } from '@/hooks/useSupplier';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BukuBesarHutang = () => {
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState({
    supplier_id: '',
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    kasir_name: 'Admin',
    keterangan: ''
  });

  const { data: ledgerData, isLoading } = useSupplierPayablesLedger(selectedSupplier, startDate, endDate);
  const { data: summaryData } = useSupplierPayablesSummary();
  const { data: suppliers } = useSupplier();
  const recordPayment = useRecordSupplierPayment();
  const { toast } = useToast();

  // Enhanced validation with better null checking
  const validSuppliers = (suppliers || []).filter(supplier => {
    // Comprehensive validation
    if (!supplier) return false;
    if (!supplier.id || typeof supplier.id !== 'string') return false;
    if (supplier.id.trim() === '') return false;
    if (!supplier.nama || typeof supplier.nama !== 'string') return false;
    if (supplier.nama.trim() === '') return false;
    
    return true;
  });

  console.log('BukuBesarHutang suppliers data:', suppliers);
  console.log('Valid suppliers count:', validSuppliers.length);
  console.log('Valid suppliers:', validSuppliers);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePayment = async () => {
    try {
      await recordPayment.mutateAsync(paymentData);
      toast({
        title: "Pembayaran berhasil dicatat",
        description: `Pembayaran ${formatRupiah(paymentData.amount)} telah dicatat`
      });
      setShowPaymentDialog(false);
      setPaymentData({
        supplier_id: '',
        amount: 0,
        payment_date: new Date().toISOString().split('T')[0],
        reference_number: '',
        kasir_name: 'Admin',
        keterangan: ''
      });
    } catch (error) {
      toast({
        title: "Gagal mencatat pembayaran",
        description: "Terjadi kesalahan saat mencatat pembayaran",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Buku Besar Hutang</h2>
          <p className="text-gray-600">Kelola dan pantau hutang supplier</p>
        </div>
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Catat Pembayaran
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Catat Pembayaran Hutang</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Select value={paymentData.supplier_id || ""} onValueChange={(value) => setPaymentData(prev => ({ ...prev, supplier_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {validSuppliers.length > 0 ? (
                      validSuppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.nama}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-suppliers" disabled>
                        Tidak ada supplier tersedia
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Jumlah Pembayaran</Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="date">Tanggal Pembayaran</Label>
                <Input
                  id="date"
                  type="date"
                  value={paymentData.payment_date}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, payment_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="reference">Nomor Referensi</Label>
                <Input
                  id="reference"
                  value={paymentData.reference_number}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, reference_number: e.target.value }))}
                  placeholder="Nomor bukti pembayaran"
                />
              </div>
              <div>
                <Label htmlFor="notes">Keterangan</Label>
                <Input
                  id="notes"
                  value={paymentData.keterangan}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, keterangan: e.target.value }))}
                  placeholder="Keterangan tambahan"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowPaymentDialog(false)} variant="outline" className="flex-1">
                  Batal
                </Button>
                <Button onClick={handlePayment} className="flex-1" disabled={!paymentData.supplier_id || !paymentData.amount}>
                  Simpan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hutang</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatRupiah(summaryData?.reduce((sum, item) => sum + (item.total_payables || 0), 0) || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {summaryData?.length || 0} supplier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
            <Building className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {ledgerData?.filter(item => item.transaction_date === new Date().toISOString().split('T')[0]).length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Pembayaran & pembelian</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supplier Aktif</CardTitle>
            <Building className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {summaryData?.filter(item => (item.total_payables || 0) > 0).length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Memiliki hutang</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="supplier-filter">Supplier</Label>
              <Select value={selectedSupplier || ""} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Supplier</SelectItem>
                  {validSuppliers.length > 0 ? (
                    validSuppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.nama}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-suppliers" disabled>
                      Tidak ada supplier tersedia
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="start-date">Tanggal Mulai</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Tanggal Akhir</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi Hutang</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Debit</TableHead>
                    <TableHead>Kredit</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Jenis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerData?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.transaction_date).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="font-medium">{transaction.supplier_name}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="text-red-600">
                        {transaction.debit_amount ? formatRupiah(transaction.debit_amount) : '-'}
                      </TableCell>
                      <TableCell className="text-green-600">
                        {transaction.credit_amount ? formatRupiah(transaction.credit_amount) : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatRupiah(transaction.running_balance || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.transaction_type === 'pembelian_kredit' ? 'destructive' : 'default'}>
                          {transaction.transaction_type === 'pembelian_kredit' ? 'Pembelian' : 'Pembayaran'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BukuBesarHutang;
