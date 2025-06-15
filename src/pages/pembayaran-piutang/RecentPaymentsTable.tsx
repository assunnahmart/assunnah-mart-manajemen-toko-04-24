
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';

type Props = {
  payments: any[];
  loading: boolean;
  filterCustomer: string;
  setFilterCustomer: (s: string) => void;
  filterDate: string;
  setFilterDate: (s: string) => void;
};

// Fungsi untuk memastikan nama pelanggan konsisten di semua tampilan
function formatPelangganName(name: string): string {
  if (!name) return '';
  // Hilangkan prefix "Pelanggan:" dan trim spasi
  if (name.startsWith('Pelanggan:')) {
    return name.replace(/^Pelanggan:/, '').trim();
  }
  // Hilangkan prefix "Pelanggan " (tanpa titik dua)
  if (name.startsWith('Pelanggan ')) {
    return name.replace(/^Pelanggan /, '').trim();
  }
  // Jika ada ":", ambil bagian setelah titik dua
  if (name.includes(':')) {
    return name.split(':').slice(1).join(':').trim();
  }
  return name.trim();
}

export function RecentPaymentsTable({
  payments,
  loading,
  filterCustomer,
  setFilterCustomer,
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
            <Label>Filter Pelanggan</Label>
            <Input
              placeholder="Nama pelanggan..."
              value={filterCustomer}
              onChange={e => setFilterCustomer(e.target.value)}
            />
          </div>
          <div>
            <Label>Filter Tanggal</Label>
            <Input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
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
                  <TableHead>Pelanggan</TableHead>
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
                    <TableCell className="font-medium">{formatPelangganName(payment.pelanggan_name)}</TableCell>
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

