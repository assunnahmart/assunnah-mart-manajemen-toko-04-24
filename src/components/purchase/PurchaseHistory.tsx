
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Calendar, CreditCard } from 'lucide-react';
import { usePurchaseTransactions } from '@/hooks/usePurchaseTransactions';
import PurchasePaymentDialog from './PurchasePaymentDialog';

const PurchaseHistory = () => {
  const { data: transactions, isLoading } = usePurchaseTransactions();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handlePayment = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsPaymentDialogOpen(true);
  };

  const closePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setSelectedTransaction(null);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <>
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
                    <TableHead>Sisa Hutang</TableHead>
                    <TableHead>Pembayaran</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Kasir</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map((transaction) => {
                    const sisaHutang = transaction.sisa_hutang || (transaction.jenis_pembayaran === 'kredit' ? transaction.total : 0);
                    const isHutangLunas = sisaHutang <= 0;
                    
                    return (
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
                          <span className={sisaHutang > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                            Rp {sisaHutang.toLocaleString('id-ID')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.jenis_pembayaran === 'cash' ? 'default' : 'secondary'}>
                            {transaction.jenis_pembayaran === 'cash' ? 'Tunai' : 'Kredit'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isHutangLunas ? 'default' : 'destructive'}>
                            {isHutangLunas ? 'Lunas' : 'Belum Lunas'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.kasir?.nama || '-'}
                        </TableCell>
                        <TableCell>
                          {transaction.jenis_pembayaran === 'kredit' && sisaHutang > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePayment(transaction)}
                              className="flex items-center gap-1"
                            >
                              <CreditCard className="h-3 w-3" />
                              Bayar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTransaction && (
        <PurchasePaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={closePaymentDialog}
          transaction={selectedTransaction}
        />
      )}
    </>
  );
};

export default PurchaseHistory;
