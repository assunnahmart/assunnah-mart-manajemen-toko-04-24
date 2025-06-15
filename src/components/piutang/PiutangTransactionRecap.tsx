
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Send, Filter, RefreshCw } from 'lucide-react';
import { usePiutangTransactionRecap } from '@/hooks/usePiutangTransactionRecap';
import { useCustomerReceivablesSummary } from '@/hooks/useLedgers';
import { useToast } from '@/hooks/use-toast';

const PiutangTransactionRecap = () => {
  const [customerName, setCustomerName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');

  const { data: transactionData, isLoading, refetch } = usePiutangTransactionRecap(
    customerName || undefined,
    startDate || undefined, 
    endDate || undefined,
    referenceNumber || undefined
  );
  
  const { data: customerSummary } = useCustomerReceivablesSummary();
  const { toast } = useToast();

  const handleExportPDF = () => {
    toast({
      title: "Export PDF",
      description: "Fitur export PDF akan segera tersedia",
    });
  };

  const handleSendWhatsApp = () => {
    if (!transactionData?.length) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada transaksi untuk dikirim",
        variant: "destructive"
      });
      return;
    }

    const message = `*REKAP TRANSAKSI PIUTANG*\n\n${transactionData.map(t => 
      `${t.transaction_date} - ${t.pelanggan_name}\n${t.jenis_transaksi}: Rp ${t.debit_amount || t.credit_amount}\nSaldo: Rp ${t.running_balance}`
    ).join('\n\n')}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const clearFilters = () => {
    setCustomerName('');
    setStartDate('');
    setEndDate('');
    setReferenceNumber('');
  };

  const formatRupiah = (amount: number) => {
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
          <h2 className="text-2xl font-bold text-gray-900">Rekap Transaksi Piutang</h2>
          <p className="text-gray-600">Filter dan export data transaksi piutang pelanggan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleSendWhatsApp}>
            <Send className="h-4 w-4 mr-2" />
            Kirim WA
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Nama Pelanggan</Label>
              <Select value={customerName} onValueChange={setCustomerName}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pelanggan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Pelanggan</SelectItem>
                  {customerSummary?.map((customer) => (
                    <SelectItem key={customer.pelanggan_name} value={customer.pelanggan_name}>
                      {customer.pelanggan_name}
                    </SelectItem>
                  ))}
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
            <div>
              <Label>Nomor Referensi</Label>
              <Input
                placeholder="Cari nomor nota..."
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Daftar Transaksi Piutang
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Memuat data transaksi...</p>
            </div>
          ) : transactionData?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data transaksi ditemukan
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>No. Referensi</TableHead>
                    <TableHead>Jenis Transaksi</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Piutang (+)</TableHead>
                    <TableHead className="text-right">Pembayaran (-)</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead>Kasir</TableHead>
                    <TableHead>No. Kas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionData?.map((transaction) => (
                    <TableRow key={transaction.id || `${transaction.pelanggan_name}-${transaction.created_at}`}>
                      <TableCell>
                        {new Date(transaction.transaction_date).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.pelanggan_name}
                      </TableCell>
                      <TableCell>
                        {transaction.reference_number || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.transaction_type === 'penjualan_kredit' ? 'destructive' : 'default'
                        }>
                          {transaction.jenis_transaksi}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.piutang_bertambah > 0 ? (
                          <span className="text-red-600 font-medium">
                            {formatRupiah(transaction.piutang_bertambah)}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.piutang_berkurang > 0 ? (
                          <span className="text-green-600 font-medium">
                            {formatRupiah(transaction.piutang_berkurang)}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${
                        transaction.running_balance >= 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatRupiah(Math.abs(transaction.running_balance))}
                      </TableCell>
                      <TableCell>{transaction.kasir_name || '-'}</TableCell>
                      <TableCell>
                        {transaction.kas_transaction_number ? (
                          <Badge variant="outline">{transaction.kas_transaction_number}</Badge>
                        ) : '-'}
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

export default PiutangTransactionRecap;
