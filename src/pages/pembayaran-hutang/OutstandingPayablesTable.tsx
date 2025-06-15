
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type Props = {
  summary: any[];
  loading: boolean;
  onSelectSupplier: (supplierName: string, currentBalance: number) => void;
};

export function OutstandingPayablesTable({ summary, loading, onSelectSupplier }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Hutang Outstanding</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
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
                        onClick={() => onSelectSupplier(supplier.supplier_name, supplier.total_payables)}
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
  );
}
