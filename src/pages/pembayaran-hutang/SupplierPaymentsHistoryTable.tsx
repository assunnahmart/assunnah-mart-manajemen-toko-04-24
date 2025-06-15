
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Props = {
  payments: any[];
  loading: boolean;
  suppliers: any[];
  filterSupplier: string;
  setFilterSupplier: (s: string) => void;
  filterDate: string;
  setFilterDate: (s: string) => void;
};

export function SupplierPaymentsHistoryTable({
  payments,
  loading,
  suppliers,
  filterSupplier,
  setFilterSupplier,
  filterDate,
  setFilterDate
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Riwayat Pembayaran
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Filter Supplier</Label>
            <Select value={filterSupplier} onValueChange={setFilterSupplier}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Supplier</SelectItem>
                {suppliers?.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Filter Tanggal</Label>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Referensi</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Kredit</TableHead>
                  <TableHead>Kasir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.slice(0, 10).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.transaction_date).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="font-medium">{payment.supplier_name}</TableCell>
                    <TableCell>{payment.reference_number || '-'}</TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell className="text-right text-red-600">
                      {payment.debit_amount > 0 ? `Rp ${payment.debit_amount.toLocaleString('id-ID')}` : '-'}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {payment.credit_amount > 0 ? `Rp ${payment.credit_amount.toLocaleString('id-ID')}` : '-'}
                    </TableCell>
                    <TableCell>{payment.kasir_name || '-'}</TableCell>
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
