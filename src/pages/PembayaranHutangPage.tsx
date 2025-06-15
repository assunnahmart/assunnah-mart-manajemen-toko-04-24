
import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DollarSign, Building, TrendingUp, Plus, Search, Download } from 'lucide-react';
import { useSupplierPayablesSummary, useRecordSupplierPayment, useSupplierPayablesLedger } from '@/hooks/useLedgers';
import { useSupplier } from '@/hooks/useSupplier';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

const PembayaranHutangPage = () => {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    reference_number: '',
    keterangan: '',
    payment_date: new Date().toISOString().split('T')[0]
  });
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const { user } = useSimpleAuth();
  const { data: summary, isLoading: summaryLoading } = useSupplierPayablesSummary();
  const { data: suppliers } = useSupplier();
  const { data: recentPayments, isLoading: paymentsLoading } = useSupplierPayablesLedger(
    filterSupplier || undefined,
    filterDate || undefined,
    undefined
  );
  const recordPayment = useRecordSupplierPayment();
  const { toast } = useToast();

  const totalPayables = summary?.reduce((sum, item) => sum + item.total_payables, 0) || 0;
  const totalSuppliers = summary?.length || 0;

  const handleSelectSupplier = (supplierName: string, currentBalance: number) => {
    // Find supplier by name
    const supplier = suppliers?.find(s => s.nama === supplierName);
    if (supplier) {
      setSelectedSupplier(supplierName);
      setSelectedSupplierId(supplier.id);
      setPaymentForm(prev => ({
        ...prev,
        amount: currentBalance
      }));
      setIsPaymentDialogOpen(true);
    }
  };

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
        supplier_id: selectedSupplier, // Hook expects supplier name
        amount: paymentForm.amount,
        payment_date: paymentForm.payment_date,
        reference_number: paymentForm.reference_number,
        kasir_name: user?.full_name || 'Unknown',
        keterangan: paymentForm.keterangan
      });

      toast({
        title: "Berhasil",
        description: "Pembayaran hutang berhasil dicatat"
      });

      setIsPaymentDialogOpen(false);
      setSelectedSupplier('');
      setSelectedSupplierId('');
      setPaymentForm({
        amount: 0,
        reference_number: '',
        keterangan: '',
        payment_date: new Date().toISOString().split('T')[0]
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Pembayaran Hutang</h1>
                <p className="text-gray-600">Kelola pembayaran hutang supplier</p>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Hutang</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {totalPayables.toLocaleString('id-ID')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Outstanding payables
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Supplier Aktif</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSuppliers}</div>
                  <p className="text-xs text-muted-foreground">
                    Suppliers with outstanding balance
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rata-rata Hutang</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {totalSuppliers > 0 ? Math.round(totalPayables / totalSuppliers).toLocaleString('id-ID') : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average per supplier
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Outstanding Payables */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Hutang Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Supplier</TableHead>
                          <TableHead className="text-right">Total Hutang</TableHead>
                          <TableHead className="text-center">Total Transaksi</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary?.map((supplier) => (
                          <TableRow key={supplier.supplier_name}>
                            <TableCell className="font-medium">{supplier.supplier_name}</TableCell>
                            <TableCell className="text-right font-bold text-red-600">
                              Rp {supplier.total_payables.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="text-center">{supplier.total_transactions}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={supplier.total_payables > 0 ? 'destructive' : 'default'}>
                                {supplier.total_payables > 0 ? 'Outstanding' : 'Lunas'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                onClick={() => handleSelectSupplier(supplier.supplier_name, supplier.total_payables)}
                                disabled={supplier.total_payables <= 0}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Bayar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Riwayat Pembayaran
                </CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Filter Supplier</Label>
                    <Select value={filterSupplier} onValueChange={setFilterSupplier}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Semua Supplier</SelectItem>
                        {suppliers?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Filter Tanggal</Label>
                    <Input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Referensi</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead className="text-right">Debit</TableHead>
                          <TableHead className="text-right">Kredit</TableHead>
                          <TableHead>Kasir</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentPayments?.slice(0, 10).map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              {new Date(payment.transaction_date).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell className="font-medium">{payment.supplier_name}</TableCell>
                            <TableCell>{payment.reference_number || '-'}</TableCell>
                            <TableCell>{payment.description}</TableCell>
                            <TableCell className="text-right text-red-600">
                              {payment.debit_amount > 0 ? `Rp ${payment.debit_amount.toLocaleString('id-ID')}` : '-'}
                            </TableCell>
                            <TableCell className="text-right text-green-600">
                              {payment.credit_amount > 0 ? `Rp ${payment.credit_amount.toLocaleString('id-ID')}` : '-'}
                            </TableCell>
                            <TableCell>{payment.kasir_name || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Catat Pembayaran Hutang</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Supplier</Label>
                    <Input value={selectedSupplier} disabled />
                  </div>
                  <div>
                    <Label>Tanggal Pembayaran</Label>
                    <Input
                      type="date"
                      value={paymentForm.payment_date}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_date: e.target.value }))}
                    />
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
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PembayaranHutangPage;
