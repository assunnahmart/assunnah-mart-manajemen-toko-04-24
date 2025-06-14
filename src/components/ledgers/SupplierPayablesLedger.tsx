import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Search, Plus, FileText, Download, TrendingUp, TrendingDown, Building } from 'lucide-react';
import { useSupplierPayablesLedger, useRecordSupplierPayment } from '@/hooks/useLedgers';
import { useSupplier } from '@/hooks/useSupplier';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

const SupplierPayablesLedger = () => {
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    reference_number: '',
    keterangan: ''
  });

  const { user } = useSimpleAuth();
  const { data: suppliers } = useSupplier();
  const { data: ledgerEntries, isLoading } = useSupplierPayablesLedger(
    selectedSupplier || undefined,
    startDate || undefined,
    endDate || undefined
  );
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

  console.log('SupplierPayablesLedger suppliers data:', suppliers);
  console.log('Valid suppliers count:', validSuppliers.length);

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
        supplier_id: selectedSupplier,
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const currentBalance = ledgerEntries?.[0]?.running_balance || 0;
  const selectedSupplierName = validSuppliers?.find(s => s.id === selectedSupplier)?.nama || '';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Buku Besar Hutang Per Supplier</h1>
          <p className="text-gray-600">Kelola dan pantau hutang supplier secara real-time</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedSupplier}>
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
                  <Label>Supplier</Label>
                  <Input value={selectedSupplierName} disabled />
                </div>
                <div>
                  <Label>Jumlah Pembayaran</Label>
                  <Input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
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
                  {recordPayment.isPending ? 'Menyimpan...' : 'Simpan Pembayaran'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Supplier</Label>
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
              <Label>Tanggal Mulai</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Tanggal Selesai</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => {
                setSelectedSupplier('');
                setStartDate('');
                setEndDate('');
              }}>
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      {selectedSupplier && (
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-900 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Ringkasan Hutang - {selectedSupplierName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {currentBalance >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-red-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-green-500" />
                )}
                <span className="text-lg font-bold">
                  Saldo Hutang: Rp {Math.abs(currentBalance).toLocaleString('id-ID')}
                </span>
                <Badge variant={currentBalance > 0 ? 'destructive' : 'default'}>
                  {currentBalance > 0 ? 'Hutang' : currentBalance < 0 ? 'Lebih Bayar' : 'Lunas'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Buku Besar Hutang
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : ledgerEntries?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data transaksi hutang
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Referensi</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Kredit</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead>Kasir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries?.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {new Date(entry.transaction_date).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.reference_number || '-'}
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>
                        <Badge variant={entry.transaction_type === 'pembelian_kredit' ? 'destructive' : 'default'}>
                          {entry.transaction_type === 'pembelian_kredit' ? 'Pembelian' : 'Pembayaran'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {entry.debit_amount > 0 ? `Rp ${entry.debit_amount.toLocaleString('id-ID')}` : '-'}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {entry.credit_amount > 0 ? `Rp ${entry.credit_amount.toLocaleString('id-ID')}` : '-'}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${entry.running_balance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Rp {Math.abs(entry.running_balance).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>{entry.kasir_name || '-'}</TableCell>
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

export default SupplierPayablesLedger;
