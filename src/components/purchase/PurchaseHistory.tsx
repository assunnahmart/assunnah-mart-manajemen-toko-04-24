
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Calendar } from 'lucide-react';
import { usePurchaseTransactions } from '@/hooks/usePurchaseTransactions';

const PurchaseHistory = () => {
  const { data: transactions, isLoading } = usePurchaseTransactions();

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Riwayat Pembelian
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Belum ada transaksi pembelian
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Transaksi</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pembayaran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kasir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.nomor_transaksi}
                    </TableCell>
                    <TableCell>
                      {transaction.supplier?.nama || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(transaction.tanggal_pembelian).toLocaleDateString('id-ID')}
                      </div>
                    </TableCell>
                    <TableCell>
                      Rp {transaction.total.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.jenis_pembayaran === 'cash' ? 'default' : 'secondary'}>
                        {transaction.jenis_pembayaran === 'cash' ? 'Tunai' : 'Kredit'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status === 'completed' ? 'Selesai' : transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {transaction.kasir?.nama || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PurchaseHistory;
