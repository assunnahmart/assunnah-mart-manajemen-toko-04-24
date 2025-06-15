import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, CreditCard, Plus, Filter, Receipt, Printer } from 'lucide-react';
import { useCustomerReceivablesLedger, useCustomerReceivablesSummary, useRecordCustomerPayment } from '@/hooks/useLedgers';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BukuBesarPiutang = () => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    pelanggan_name: '',
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    kasir_name: 'Admin',
    keterangan: ''
  });

  const { data: ledgerData, isLoading: ledgerLoading, error: ledgerError } = useCustomerReceivablesLedger(selectedCustomer, startDate, endDate);
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useCustomerReceivablesSummary();
  const recordPayment = useRecordCustomerPayment();
  const { toast } = useToast();

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const generateReceiptNumber = () => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const time = now.toTimeString().slice(0, 8).replace(/:/g, '');
    return `KWT-${date}-${time}`;
  };

  const handleCustomerSelect = (customerName: string) => {
    setPaymentData(prev => ({
      ...prev,
      pelanggan_name: customerName
    }));
  };

  const handlePayment = async () => {
    try {
      const receiptNumber = generateReceiptNumber();
      const paymentDataWithReceipt = {
        ...paymentData,
        reference_number: paymentData.reference_number || receiptNumber
      };

      await recordPayment.mutateAsync(paymentDataWithReceipt);
      
      // Create receipt data
      const receipt = {
        receiptNumber: receiptNumber,
        customerName: paymentData.pelanggan_name,
        amount: paymentData.amount,
        paymentDate: paymentData.payment_date,
        kasirName: paymentData.kasir_name,
        keterangan: paymentData.keterangan,
        timestamp: new Date().toLocaleString('id-ID')
      };
      
      setPaymentReceipt(receipt);
      
      toast({
        title: "Pembayaran berhasil dicatat",
        description: `Pembayaran ${formatRupiah(paymentData.amount)} telah dicatat`
      });
      
      setShowPaymentDialog(false);
      setShowReceiptDialog(true);
      
      setPaymentData({
        pelanggan_name: '',
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

  const printReceipt = () => {
    if (!paymentReceipt) return;
    
    const printContent = `
      <div style="width: 300px; font-family: monospace; font-size: 12px; line-height: 1.4;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
          <h2 style="margin: 0; font-size: 16px;">KWITANSI PEMBAYARAN</h2>
          <h3 style="margin: 5px 0; font-size: 14px;">PIUTANG PELANGGAN</h3>
        </div>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 3px 0; width: 120px;">No. Kwitansi</td>
            <td style="padding: 3px 0;">: ${paymentReceipt.receiptNumber}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0;">Tanggal</td>
            <td style="padding: 3px 0;">: ${new Date(paymentReceipt.paymentDate).toLocaleDateString('id-ID')}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0;">Waktu</td>
            <td style="padding: 3px 0;">: ${paymentReceipt.timestamp}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0;">Kasir</td>
            <td style="padding: 3px 0;">: ${paymentReceipt.kasirName}</td>
          </tr>
        </table>
        
        <div style="border-top: 1px solid #000; margin: 15px 0; padding-top: 10px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 3px 0; font-weight: bold;">Nama Pelanggan</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; padding-left: 10px;">${paymentReceipt.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0 3px 0; font-weight: bold;">Keterangan</td>
            </tr>
            <tr>
              <td style="padding: 3px 0; padding-left: 10px;">${paymentReceipt.keterangan || 'Pembayaran Piutang'}</td>
            </tr>
          </table>
        </div>
        
        <div style="border-top: 2px solid #000; padding-top: 10px; margin-top: 15px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; font-weight: bold; font-size: 14px;">JUMLAH BAYAR</td>
              <td style="padding: 5px 0; text-align: right; font-weight: bold; font-size: 14px;">${formatRupiah(paymentReceipt.amount)}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 20px; border-top: 1px solid #000; padding-top: 10px;">
          <p style="margin: 5px 0; font-size: 10px;">Terima kasih atas pembayaran Anda</p>
          <p style="margin: 5px 0; font-size: 10px;">Simpan kwitansi ini sebagai bukti pembayaran</p>
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Kwitansi Pembayaran - ${paymentReceipt.receiptNumber}</title>
            <style>
              body { margin: 0; padding: 20px; }
              @media print {
                body { margin: 0; padding: 0; }
                @page { margin: 0.5in; }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                }
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Get customers with outstanding receivables
  const customersWithReceivables = summaryData?.filter(customer => customer.total_receivables > 0) || [];

  // Tambah: error & loading handler
  if (summaryLoading || ledgerLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span>Memuat data pelanggan/piutang...</span>
      </div>
    );
  }
  if (summaryError || ledgerError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-red-700">
        <div>Gagal memuat data piutang atau pelanggan.</div>
        <div className="text-xs">{summaryError?.message || ledgerError?.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Buku Besar Piutang</h2>
          <p className="text-gray-600">Kelola dan pantau piutang pelanggan</p>
        </div>
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Catat Pembayaran
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Catat Pembayaran Piutang</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer">Nama Pelanggan</Label>
                <Select value={paymentData.pelanggan_name} onValueChange={handleCustomerSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pelanggan dengan piutang" />
                  </SelectTrigger>
                  <SelectContent>
                    {customersWithReceivables.map((customer) => (
                      <SelectItem key={customer.pelanggan_name} value={customer.pelanggan_name}>
                        <div className="flex flex-col">
                          <span className="font-medium">{customer.pelanggan_name}</span>
                          <span className="text-sm text-red-600">
                            Piutang: {formatRupiah(customer.total_receivables)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {paymentData.pelanggan_name && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <span className="text-sm text-blue-800">
                      Saldo Piutang: {formatRupiah(customersWithReceivables.find(c => c.pelanggan_name === paymentData.pelanggan_name)?.total_receivables || 0)}
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
                  max={customersWithReceivables.find(c => c.pelanggan_name === paymentData.pelanggan_name)?.total_receivables || 0}
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
                <Label htmlFor="reference">Nomor Referensi (Opsional)</Label>
                <Input
                  id="reference"
                  value={paymentData.reference_number}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, reference_number: e.target.value }))}
                  placeholder="Akan dibuat otomatis jika kosong"
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
                  disabled={!paymentData.pelanggan_name || !paymentData.amount || recordPayment.isPending}
                >
                  {recordPayment.isPending ? 'Memproses...' : 'Simpan & Cetak Kwitansi'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Kwitansi Pembayaran
            </DialogTitle>
          </DialogHeader>
          
          {paymentReceipt && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="text-center border-b pb-2 mb-3">
                  <h3 className="font-bold text-lg">KWITANSI PEMBAYARAN</h3>
                  <p className="text-sm text-gray-600">PIUTANG PELANGGAN</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>No. Kwitansi:</div>
                  <div className="font-medium">{paymentReceipt.receiptNumber}</div>
                  
                  <div>Tanggal:</div>
                  <div>{new Date(paymentReceipt.paymentDate).toLocaleDateString('id-ID')}</div>
                  
                  <div>Pelanggan:</div>
                  <div className="font-medium">{paymentReceipt.customerName}</div>
                  
                  <div>Kasir:</div>
                  <div>{paymentReceipt.kasirName}</div>
                </div>
                
                <div className="border-t pt-2 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">JUMLAH BAYAR:</span>
                    <span className="font-bold text-lg text-green-600">
                      {formatRupiah(paymentReceipt.amount)}
                    </span>
                  </div>
                </div>
                
                {paymentReceipt.keterangan && (
                  <div className="text-sm">
                    <strong>Keterangan:</strong> {paymentReceipt.keterangan}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowReceiptDialog(false)}
                  className="flex-1"
                >
                  Tutup
                </Button>
                <Button 
                  onClick={printReceipt}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak Kwitansi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatRupiah(summaryData?.reduce((sum, item) => sum + (item.total_receivables || 0), 0) || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {summaryData?.length || 0} pelanggan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {ledgerData?.filter(item => item.transaction_date === new Date().toISOString().split('T')[0]).length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Pembayaran & penjualan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelanggan Aktif</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {summaryData?.filter(item => (item.total_receivables || 0) > 0).length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Memiliki piutang</p>
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
              <Label htmlFor="customer-filter">Nama Pelanggan</Label>
              <Input
                id="customer-filter"
                placeholder="Cari nama pelanggan..."
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              />
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
          <CardTitle>Riwayat Transaksi Piutang</CardTitle>
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
                    <TableHead>Pelanggan</TableHead>
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
                      <TableCell className="font-medium">{transaction.pelanggan_name}</TableCell>
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
                        <Badge variant={transaction.transaction_type === 'penjualan_kredit' ? 'destructive' : 'default'}>
                          {transaction.transaction_type === 'penjualan_kredit' ? 'Penjualan' : 'Pembayaran'}
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

export default BukuBesarPiutang;
