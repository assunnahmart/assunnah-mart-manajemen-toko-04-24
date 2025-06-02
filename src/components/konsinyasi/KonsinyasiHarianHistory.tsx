
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package } from 'lucide-react';
import { useKonsinyasiHarian } from '@/hooks/useKonsinyasiHarian';

const KonsinyasiHarianHistory = () => {
  const { data: konsinyasiData, isLoading } = useKonsinyasiHarian();

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Riwayat Konsinyasi Harian
        </CardTitle>
      </CardHeader>
      <CardContent>
        {konsinyasiData?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Belum ada data konsinyasi harian
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Jumlah Titipan</TableHead>
                  <TableHead>Terjual Sistem</TableHead>
                  <TableHead>Real Terjual</TableHead>
                  <TableHead>Sisa Stok</TableHead>
                  <TableHead>Selisih</TableHead>
                  <TableHead>Total Bayar</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {konsinyasiData?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {new Date(item.tanggal_konsinyasi).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>{item.supplier_name}</TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.jumlah_titipan}</TableCell>
                    <TableCell>{item.jumlah_terjual_sistem}</TableCell>
                    <TableCell>{item.jumlah_real_terjual}</TableCell>
                    <TableCell>{item.sisa_stok}</TableCell>
                    <TableCell className={item.selisih_stok !== 0 ? 'text-red-600' : ''}>
                      {item.selisih_stok}
                    </TableCell>
                    <TableCell>
                      Rp {item.total_pembayaran.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                        {item.status === 'completed' ? 'Selesai' : 'Pending'}
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
};

export default KonsinyasiHarianHistory;
