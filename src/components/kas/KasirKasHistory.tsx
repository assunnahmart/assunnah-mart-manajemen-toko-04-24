
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useKasirKasTransactions, useKasirKasBalance } from '@/hooks/useKasirKas';

const KasirKasHistory = () => {
  const { data: transactions, isLoading } = useKasirKasTransactions();
  const { data: balance } = useKasirKasBalance();

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Kas Masuk Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600">
                Rp {(balance?.masuk || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Kas Keluar Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-600">
                Rp {(balance?.keluar || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Saldo Kas</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${(balance?.saldo || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                Rp {(balance?.saldo || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Riwayat Transaksi Kas Kasir
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Belum ada transaksi kas
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor Transaksi</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Sync Kas Umum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.transaction_number}
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.tanggal_transaksi).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.jenis_transaksi === 'masuk' ? 'default' : 'destructive'}>
                          {transaction.jenis_transaksi === 'masuk' ? 'Masuk' : 'Keluar'}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.kategori}</TableCell>
                      <TableCell className={transaction.jenis_transaksi === 'masuk' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.jenis_transaksi === 'masuk' ? '+' : '-'}Rp {transaction.jumlah.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>{transaction.keterangan || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.sync_to_kas_umum ? 'default' : 'secondary'}>
                          {transaction.sync_to_kas_umum ? 'Ya' : 'Tidak'}
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

export default KasirKasHistory;
