
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';
import { useCustomerReceivablesLedger } from '@/hooks/useLedgers';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface PiutangTransaction {
  id: string;
  pelanggan_name: string;
  transaction_date: string;
  reference_number: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  running_balance: number;
  kasir_name: string;
  transaction_type: string;
  reference_type: string;
}

const PiutangTransactionRecap = () => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const { toast } = useToast();

  const { data: transactionData, isLoading, error, refetch } = useCustomerReceivablesLedger(
    selectedCustomer || undefined,
    startDate || undefined,
    endDate || undefined
  );

  const exportToWhatsApp = () => {
    if (!transactionData || transactionData.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data untuk diekspor",
        variant: "destructive"
      });
      return;
    }

    const summary = transactionData.reduce((acc, item) => ({
      totalDebit: acc.totalDebit + (item.debit_amount || 0),
      totalCredit: acc.totalCredit + (item.credit_amount || 0),
      finalBalance: item.running_balance
    }), { totalDebit: 0, totalCredit: 0, finalBalance: 0 });

    const message = `*REKAP TRANSAKSI PIUTANG*\n\n` +
      `Periode: ${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}\n` +
      `Pelanggan: ${selectedCustomer || 'Semua Pelanggan'}\n\n` +
      `*RINGKASAN:*\n` +
      `Total Piutang Bertambah: Rp ${summary.totalDebit.toLocaleString('id-ID')}\n` +
      `Total Pembayaran: Rp ${summary.totalCredit.toLocaleString('id-ID')}\n` +
      `Saldo Akhir: Rp ${summary.finalBalance.toLocaleString('id-ID')}\n\n` +
      `*DETAIL TRANSAKSI:*\n` +
      transactionData.map((item, index) => 
        `${index + 1}. ${format(new Date(item.transaction_date), 'dd/MM/yyyy')}\n` +
        `   Pelanggan: ${item.pelanggan_name}\n` +
        `   Ref: ${item.reference_number}\n` +
        `   Jenis: ${item.transaction_type}\n` +
        `   Keterangan: ${item.description}\n` +
        `   Debit: Rp ${(item.debit_amount || 0).toLocaleString('id-ID')}\n` +
        `   Kredit: Rp ${(item.credit_amount || 0).toLocaleString('id-ID')}\n`
      ).join('\n');

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Memuat data piutang...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Error: {error.message}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Coba Lagi
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rekap Transaksi Piutang</h2>
          <p className="text-gray-600">
            Rekap transaksi piutang pelanggan
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToWhatsApp}
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Export ke WhatsApp
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label htmlFor="customer">Nama Pelanggan</Label>
              <Input
                id="customer"
                type="text"
                placeholder="Cari nama pelanggan..."
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Tanggal Selesai</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="referenceNumber">Nomor Referensi</Label>
              <Input
                id="referenceNumber"
                type="text"
                placeholder="Cari nomor referensi..."
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {transactionData && transactionData.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Referensi</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-red-600">Piutang Bertambah</TableHead>
                <TableHead className="text-green-600">Piutang Berkurang</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Kasir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{format(new Date(item.transaction_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="font-medium">{item.pelanggan_name}</TableCell>
                  <TableCell>{item.reference_number}</TableCell>
                  <TableCell>
                    <Badge variant={
                      item.transaction_type === 'penjualan_kredit' ? 'destructive' : 'default'
                    }>
                      {item.transaction_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <span className="text-red-600 font-medium">
                      Rp {(item.debit_amount || 0).toLocaleString('id-ID')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-green-600 font-medium">
                      Rp {(item.credit_amount || 0).toLocaleString('id-ID')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${item.running_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Rp {item.running_balance.toLocaleString('id-ID')}
                    </span>
                  </TableCell>
                  <TableCell>{item.kasir_name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Tidak ada data transaksi piutang untuk periode ini</p>
        </div>
      )}
    </div>
  );
};

export default PiutangTransactionRecap;
