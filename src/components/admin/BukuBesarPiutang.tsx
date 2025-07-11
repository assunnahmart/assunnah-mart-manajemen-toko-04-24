import { useState, useEffect } from 'react';
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

interface BukuBesarPiutangProps {
  autoOpenPaymentDialog?: boolean;
}

const BukuBesarHutang = ({ autoOpenPaymentDialog = false }: BukuBesarPiutangProps) => {
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

  const { data: ledgerData, isLoading: ledgerLoading, error: ledgerError } = useSupplierPayablesLedger(selectedSupplier, startDate, endDate);
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useSupplierPayablesSummary();
  const { data: suppliers, isLoading: suppliersLoading, error: suppliersError } = useSupplier();
  const recordPayment = useRecordSupplierPayment();
  const { toast } = useToast();

  // Otomatis buka dialog pembayaran jika autoOpenPaymentDialog = true saat mount 
  useEffect(() => {
    if (autoOpenPaymentDialog) {
      setShowPaymentDialog(true);
    }
  }, [autoOpenPaymentDialog]);

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

  // Get suppliers with outstanding payables for the payment dialog
  const suppliersWithPayables = summaryData?.filter(supplier => supplier.total_payables > 0) || [];

  console.log('BukuBesarHutang suppliers data:', suppliers);
  console.log('Valid suppliers count:', validSuppliers.length);
  console.log('Valid suppliers:', validSuppliers);
  console.log('Suppliers loading state:', suppliersLoading);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSupplierSelect = (supplierId: string) => {
    setPaymentData(prev => ({
      ...prev,
      supplier_id: supplierId
    }));
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

  // Tambah pengecekan loading/error
  if (suppliersLoading || summaryLoading || ledgerLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span>Memuat data supplier/hutang...</span>
      </div>
    );
  }
  if (suppliersError || summaryError || ledgerError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-red-700">
        <div>Gagal memuat data supplier atau hutang.</div>
        <div className="text-xs">{suppliersError?.message || summaryError?.message || ledgerError?.message}</div>
      </div>
    );
  }

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
                {suppliersWithPayables.length > 0 ? (
                  <Select value={paymentData.supplier_id || ""} onValueChange={handleSupplierSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih supplier dengan hutang" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliersWithPayables.map((supplier) => (
                        <SelectItem key={supplier.supplier_name} value={supplier.supplier_name}>
                          <div className="flex flex-col">
                            <span className="font-medium">{supplier.supplier_name}</span>
                            <span className="text-sm text-red-600">
                              Hutang: {formatRupiah(supplier.total_payables)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 text-sm text-gray-500 border rounded-md bg-gray-50">
                    Tidak ada supplier dengan hutang
                  </div>
                )}
                {paymentData.supplier_id && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <span className="text-sm text-blue-800">
                      Saldo Hutang: {formatRupiah(suppliersWithPayables.find(s => s.supplier_name === paymentData.supplier_id)?.total_payables || 0)}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="amount">Jumlah Pembayaran</Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  max={suppliersWithPayables.find(s => s.supplier_name === paymentData.supplier_id)?.total_payables || 0}
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
                <Button 
                  onClick={handlePayment} 
                  className="flex-1" 
                  disabled={!paymentData.supplier_id || !paymentData.amount || recordPayment.isPending}
                >
                  {recordPayment.isPending ? 'Memproses...' : 'Simpan'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
              {validSuppliers.length > 0 ? (
                <Select value={selectedSupplier || ""} onValueChange={setSelectedSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Supplier</SelectItem>
                    {validSuppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 text-sm text-gray-500 border rounded-md bg-gray-50">
                  Tidak ada supplier tersedia
                </div>
              )}
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
          {ledgerLoading ? (
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
