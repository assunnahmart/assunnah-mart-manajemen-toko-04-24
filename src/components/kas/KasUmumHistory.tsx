
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { useKasUmumTransactions, useKasUmumSummary } from '@/hooks/useKasUmum';

const KasUmumHistory = () => {
  const { data: transactions, isLoading } = useKasUmumTransactions();
  const { data: summary } = useKasUmumSummary();

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Kas Masuk</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600">
                Rp {summary?.totalMasuk.toLocaleString('id-ID') || '0'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Kas Keluar</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-600">
                Rp {summary?.totalKeluar.toLocaleString('id-ID') || '0'}
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
              <span className={`text-2xl font-bold ${(summary?.saldo || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                Rp {summary?.saldo.toLocaleString('id-ID') || '0'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Riwayat Transaksi Kas
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
                    <TableHead>Akun</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Kasir</TableHead>
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
                      <TableCell>
                        {transaction.chart_of_accounts ? 
                          `${transaction.chart_of_accounts.kode_akun} - ${transaction.chart_of_accounts.nama_akun}` : 
                          '-'
                        }
                      </TableCell>
                      <TableCell className={transaction.jenis_transaksi === 'masuk' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.jenis_transaksi === 'masuk' ? '+' : '-'}Rp {transaction.jumlah.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>{transaction.keterangan || '-'}</TableCell>
                      <TableCell>{transaction.kasir_name || '-'}</TableCell>
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

export default KasUmumHistory;
