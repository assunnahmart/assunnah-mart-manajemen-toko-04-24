
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';

type CustomerSummary = {
  pelanggan_name: string;
  total_receivables: number;
  total_transactions: number;
};

type Props = {
  summary: CustomerSummary[];
  summaryLoading: boolean;
  selectedCustomers: string[];
  onSelectAll: () => void;
  onSelectRow: (name: string) => void;
  onClickPay: (customerName: string, currentBalance: number) => void;
  allSelected: boolean;
  onOpenMassPayment: () => void;
};

export function OutstandingReceivablesTable({
  summary,
  summaryLoading,
  selectedCustomers,
  onSelectAll,
  onSelectRow,
  onClickPay,
  allSelected,
  onOpenMassPayment,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Daftar Piutang Outstanding</CardTitle>
        <div className="flex gap-2">
          <Button
            variant={allSelected ? "secondary" : "outline"}
            onClick={onSelectAll}
            size="sm"
          >
            {allSelected ? "Batalkan Semua" : "Pilih Semua"}
          </Button>
          <Button
            variant="default"
            disabled={selectedCustomers.length === 0}
            onClick={onOpenMassPayment}
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
                      onCheckedChange={onSelectAll}
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
                        onCheckedChange={() => onSelectRow(customer.pelanggan_name)}
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
                        onClick={() => onClickPay(customer.pelanggan_name, customer.total_receivables)}
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
  );
}
