
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, AlertTriangle } from 'lucide-react';
import { useSupplierDebts } from '@/hooks/usePurchaseTransactions';

const SupplierDebtCard = () => {
  const { data: debts, isLoading } = useSupplierDebts();

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const totalDebt = debts?.reduce((sum, debt) => sum + debt.sisa_hutang, 0) || 0;
  const overdueDebts = debts?.filter(debt => {
    if (!debt.tanggal_jatuh_tempo) return false;
    return new Date(debt.tanggal_jatuh_tempo) < new Date() && debt.status === 'belum_lunas';
  }) || [];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Hutang</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-600">
                Rp {totalDebt.toLocaleString('id-ID')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Hutang Jatuh Tempo</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">
                {overdueDebts.length}
              </span>
              <span className="text-sm text-gray-500">transaksi</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debt Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kartu Hutang Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          {debts?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Tidak ada hutang supplier
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Nomor Transaksi</TableHead>
                    <TableHead>Jumlah Hutang</TableHead>
                    <TableHead>Sisa Hutang</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debts?.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell className="font-medium">
                        {debt.supplier?.nama}
                      </TableCell>
                      <TableCell>
                        {debt.transaksi_pembelian?.nomor_transaksi}
                      </TableCell>
                      <TableCell>
                        Rp {debt.jumlah_hutang.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        Rp {debt.sisa_hutang.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        {debt.tanggal_jatuh_tempo ? 
                          new Date(debt.tanggal_jatuh_tempo).toLocaleDateString('id-ID') : 
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={debt.status === 'lunas' ? 'default' : 'destructive'}
                        >
                          {debt.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
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

export default SupplierDebtCard;
