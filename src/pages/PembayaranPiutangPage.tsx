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
import { DollarSign, Users, TrendingUp, Plus, Search, Download } from 'lucide-react';
import { useCustomerReceivablesSummary, useRecordCustomerPayment, useCustomerReceivablesLedger } from '@/hooks/useLedgers';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const PembayaranPiutangPage = () => {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    reference_number: '',
    keterangan: '',
    payment_date: new Date().toISOString().split('T')[0]
  });
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const { user } = useSimpleAuth();
  const { data: summary, isLoading: summaryLoading } = useCustomerReceivablesSummary();
  const { data: recentPayments, isLoading: paymentsLoading } = useCustomerReceivablesLedger(
    filterCustomer || undefined,
    filterDate || undefined,
    undefined
  );
  const recordPayment = useRecordCustomerPayment();
  const { toast } = useToast();

  const totalReceivables = summary?.reduce((sum, item) => sum + item.total_receivables, 0) || 0;
  const totalCustomers = summary?.length || 0;
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isMassPaymentDialogOpen, setIsMassPaymentDialogOpen] = useState(false);

  // Ambil nama pelanggan outstanding (total_receivables > 0)
  const outstandingCustomers = summary?.filter(c => c.total_receivables > 0) || [];
  const allCustomerNames = outstandingCustomers.map(c => c.pelanggan_name);
  const allSelected = selectedCustomers.length === allCustomerNames.length && allCustomerNames.length > 0;
  const isIndeterminate = selectedCustomers.length > 0 && !allSelected;

  const handleSelectCustomer = (customerName: string, currentBalance: number) => {
    setSelectedCustomer(customerName);
    setPaymentForm(prev => ({
      ...prev,
      amount: currentBalance
    }));
    setIsPaymentDialogOpen(true);
  };

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
        pelanggan_name: selectedCustomer,
        amount: paymentForm.amount,
        payment_date: paymentForm.payment_date,
        reference_number: paymentForm.reference_number,
        kasir_name: user?.full_name || 'Unknown',
        keterangan: paymentForm.keterangan
      });

      toast({
        title: "Berhasil",
        description: "Pembayaran piutang berhasil dicatat"
      });

      setIsPaymentDialogOpen(false);
      setSelectedCustomer('');
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

  // Checkbox logic
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers([...allCustomerNames]);
    }
  };
  const handleSelectRow = (name: string) => {
    if (selectedCustomers.includes(name)) {
      setSelectedCustomers(selectedCustomers.filter(c => c !== name));
    } else {
      setSelectedCustomers([...selectedCustomers, name]);
    }
  };

  // Handle pembayaran massal
  const [massPaymentForm, setMassPaymentForm] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    keterangan: '',
  });
  const [isProcessingMassPayment, setIsProcessingMassPayment] = useState(false);

  const handleMassPayment = async () => {
    if (!massPaymentForm.reference_number || selectedCustomers.length === 0) {
      toast({
        title: "Error",
        description: "Pilih pelanggan dan isi nomor referensi",
        variant: "destructive",
      });
      return;
    }
    setIsProcessingMassPayment(true);
    let successCount = 0;
    let failCount = 0;
    for (const pelanggan_name of selectedCustomers) {
      const customerObj = outstandingCustomers.find(c => c.pelanggan_name === pelanggan_name);
      const amount = customerObj?.total_receivables || 0;
      try {
        await recordPayment.mutateAsync({
          pelanggan_name,
          amount,
          payment_date: massPaymentForm.payment_date,
          reference_number: massPaymentForm.reference_number,
          kasir_name: user?.full_name || 'Unknown',
          keterangan: massPaymentForm.keterangan,
        });
        successCount++;
      } catch (error: any) {
        failCount++;
        toast({
          title: "Gagal mencatat pembayaran",
          description: `${pelanggan_name}: ${error?.message || "Error"}`,
          variant: "destructive"
        });
      }
    }
    toast({
      title: "Proses pembayaran massal selesai",
      description: `${successCount} pembayaran berhasil, ${failCount} gagal.`,
      variant: failCount > 0 ? "destructive" : "default"
    });
    setIsProcessingMassPayment(false);
    setIsMassPaymentDialogOpen(false);
    setSelectedCustomers([]);
    setMassPaymentForm({
      payment_date: new Date().toISOString().split('T')[0],
      reference_number: '',
      keterangan: '',
    });
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
                <h1 className="text-3xl font-bold">Pembayaran Piutang</h1>
                <p className="text-gray-600">Kelola pembayaran piutang pelanggan</p>
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
                  <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {totalReceivables.toLocaleString('id-ID')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Outstanding receivables
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pelanggan Kredit</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCustomers}</div>
                  <p className="text-xs text-muted-foreground">
                    Customers with outstanding balance
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rata-rata Piutang</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {totalCustomers > 0 ? Math.round(totalReceivables / totalCustomers).toLocaleString('id-ID') : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average per customer
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Outstanding Receivables */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Daftar Piutang Outstanding</CardTitle>
                <div className='flex gap-2'>
                  <Button
                    variant={allSelected ? "secondary" : "outline"}
                    onClick={handleSelectAll}
                    size="sm"
                  >
                    {allSelected ? "Batalkan Semua" : "Pilih Semua"}
                  </Button>
                  <Button
                    variant="default"
                    disabled={selectedCustomers.length === 0}
                    onClick={() => setIsMassPaymentDialogOpen(true)}
                    size="sm"
                  >
                    Bayar Semua
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12 text-center">
                            <Checkbox
                              checked={allSelected}
                              indeterminate={isIndeterminate}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Nama Pelanggan</TableHead>
                          <TableHead className="text-right">Total Piutang</TableHead>
                          <TableHead className="text-center">Total Transaksi</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary?.map((customer) => (
                          <TableRow key={customer.pelanggan_name}>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={selectedCustomers.includes(customer.pelanggan_name)}
                                disabled={customer.total_receivables <= 0}
                                onCheckedChange={() => handleSelectRow(customer.pelanggan_name)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{customer.pelanggan_name}</TableCell>
                            <TableCell className="text-right font-bold text-red-600">
                              Rp {customer.total_receivables.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="text-center">{customer.total_transactions}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={customer.total_receivables > 0 ? 'destructive' : 'default'}>
                                {customer.total_receivables > 0 ? 'Outstanding' : 'Lunas'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                onClick={() => handleSelectCustomer(customer.pelanggan_name, customer.total_receivables)}
                                disabled={customer.total_receivables <= 0}
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
                    <Label>Filter Pelanggan</Label>
                    <Input
                      placeholder="Nama pelanggan..."
                      value={filterCustomer}
                      onChange={(e) => setFilterCustomer(e.target.value)}
                    />
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
                          <TableHead>Pelanggan</TableHead>
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
                            <TableCell className="font-medium">{payment.pelanggan_name}</TableCell>
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
                  <DialogTitle>Catat Pembayaran Piutang</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Pelanggan</Label>
                    <Input value={selectedCustomer} disabled />
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

            {/* MASS PAYMENT DIALOG */}
            <Dialog open={isMassPaymentDialogOpen} onOpenChange={setIsMassPaymentDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Catat Pembayaran Massal ({selectedCustomers.length} pelanggan)</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Pelanggan Terpilih</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomers.map(name => (
                        <Badge variant="outline" key={name}>{name}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Tanggal Pembayaran</Label>
                    <Input
                      type="date"
                      value={massPaymentForm.payment_date}
                      onChange={e => setMassPaymentForm(prev => ({ ...prev, payment_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Nomor Referensi</Label>
                    <Input
                      value={massPaymentForm.reference_number}
                      onChange={e => setMassPaymentForm(prev => ({ ...prev, reference_number: e.target.value }))}
                      placeholder="Nomor bukti pembayaran"
                    />
                  </div>
                  <div>
                    <Label>Keterangan</Label>
                    <Input
                      value={massPaymentForm.keterangan}
                      onChange={e => setMassPaymentForm(prev => ({ ...prev, keterangan: e.target.value }))}
                      placeholder="Keterangan pembayaran"
                    />
                  </div>
                  <Button
                    onClick={handleMassPayment}
                    disabled={isProcessingMassPayment || selectedCustomers.length === 0}
                    className="w-full"
                  >
                    {isProcessingMassPayment ? 'Menyimpan...' : `Simpan Pembayaran (${selectedCustomers.length})`}
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

export default PembayaranPiutangPage;
