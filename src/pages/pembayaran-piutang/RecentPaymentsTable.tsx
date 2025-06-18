
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Search } from 'lucide-react';
import { usePelangganUnit, usePelangganPerorangan } from '@/hooks/usePelanggan';

type RecentPayment = {
  id: string;
  pelanggan_name: string;
  transaction_date: string;
  reference_number: string;
  description: string;
  credit_amount: number;
  debit_amount: number;
  running_balance: number;
  kasir_name: string;
  transaction_type: string;
};

type Props = {
  payments: RecentPayment[];
  loading: boolean;
  filterCustomer: string;
  setFilterCustomer: (value: string) => void;
  filterDate: string;
  setFilterDate: (value: string) => void;
};

export function RecentPaymentsTable({
  payments,
  loading,
  filterCustomer,
  setFilterCustomer,
  filterDate,
  setFilterDate,
}: Props) {
  const { data: pelangganUnit } = usePelangganUnit();
  const { data: pelangganPerorangan } = usePelangganPerorangan();

  // Combine all customers for filter dropdown
  const allCustomers = [
    ...(pelangganUnit?.map(p => p.nama) || []),
    ...(pelangganPerorangan?.map(p => p.nama) || [])
  ];

  // Filter payments based on selected customer and date
  const filteredPayments = payments?.filter(payment => {
    const matchesCustomer = !filterCustomer || payment.pelanggan_name.toLowerCase().includes(filterCustomer.toLowerCase());
    const matchesDate = !filterDate || payment.transaction_date === filterDate;
    return matchesCustomer && matchesDate;
  }) || [];

  const handleClearFilters = () => {
    setFilterCustomer('');
    setFilterDate('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Riwayat Pembayaran Terbaru
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            disabled={!filterCustomer && !filterDate}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Filter
          </Button>
        </CardTitle>
        
        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Filter Pelanggan</Label>
            <Select value={filterCustomer} onValueChange={setFilterCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih pelanggan..." />
              </SelectTrigger>
              <SelectContent>
                {allCustomers.map((customerName) => (
                  <SelectItem key={customerName} value={customerName}>
                    {customerName}
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
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {filterCustomer || filterDate ? 
              'Tidak ada pembayaran sesuai filter' : 
              'Tidak ada riwayat pembayaran'
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Referensi</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead>Kasir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.transaction_date).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="font-medium">{payment.pelanggan_name}</TableCell>
                    <TableCell>{payment.reference_number || '-'}</TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>
                      <Badge variant={payment.transaction_type === 'penjualan_kredit' ? 'destructive' : 'default'}>
                        {payment.transaction_type === 'penjualan_kredit' ? 'Penjualan' : 'Pembayaran'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={payment.credit_amount > 0 ? 'text-green-600' : 'text-red-600'}>
                        Rp {(payment.credit_amount || payment.debit_amount).toLocaleString('id-ID')}
                      </span>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${payment.running_balance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Rp {Math.abs(payment.running_balance).toLocaleString('id-ID')}
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
