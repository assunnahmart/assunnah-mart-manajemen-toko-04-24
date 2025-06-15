
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PaymentEntry = {
  id: string;
  supplier_name: string;
  transaction_date: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  running_balance: number;
  transaction_type: string;
  kasir_name: string;
  reference_number?: string;
};

type Supplier = {
  id: string;
  nama: string;
};

type Props = {
  payments: PaymentEntry[];
  loading: boolean;
  suppliers: Supplier[];
  filterSupplier: string;
  setFilterSupplier: (value: string) => void;
  filterDate: string;
  setFilterDate: (value: string) => void;
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
        <CardTitle>Riwayat Pembayaran Hutang</CardTitle>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <Label>Filter Supplier</Label>
            <Select value={filterSupplier} onValueChange={setFilterSupplier}>
              <SelectTrigger>
                <SelectValue placeholder="Semua supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Supplier</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.nama}>
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
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterSupplier('');
                setFilterDate('');
              }}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat riwayat pembayaran...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada riwayat pembayaran hutang
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Referensi</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Jumlah Bayar</TableHead>
                  <TableHead className="text-right">Sisa Hutang</TableHead>
                  <TableHead>Kasir</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.transaction_date).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.supplier_name}
                    </TableCell>
                    <TableCell>
                      {payment.reference_number || '-'}
                    </TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {payment.debit_amount > 0 ? `Rp ${payment.debit_amount.toLocaleString('id-ID')}` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rp {Math.abs(payment.running_balance).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>{payment.kasir_name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={payment.transaction_type === 'pembayaran' ? 'default' : 'secondary'}>
                        {payment.transaction_type === 'pembayaran' ? 'Pembayaran' : 'Pembelian'}
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
  );
}
