
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClipboardList } from 'lucide-react';
import { useStockOpname } from '@/hooks/useStockManagement';

const StockOpnameHistory = () => {
  const { data: opnameHistory } = useStockOpname();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Riwayat Stok Opname
        </CardTitle>
      </CardHeader>
      <CardContent>
        {opnameHistory?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Belum ada riwayat stok opname
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Stok Sistem</TableHead>
                  <TableHead>Stok Fisik</TableHead>
                  <TableHead>Selisih</TableHead>
                  <TableHead>PIC</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opnameHistory?.map((opname) => (
                  <TableRow key={opname.id}>
                    <TableCell>
                      {new Date(opname.tanggal_opname).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {opname.barang_konsinyasi?.nama}
                    </TableCell>
                    <TableCell>
                      {opname.stok_sistem} {opname.barang_konsinyasi?.satuan}
                    </TableCell>
                    <TableCell>
                      {opname.stok_fisik} {opname.barang_konsinyasi?.satuan}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        opname.selisih > 0 ? 'text-green-600' : 
                        opname.selisih < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {opname.selisih > 0 ? '+' : ''}{opname.selisih} {opname.barang_konsinyasi?.satuan}
                      </span>
                    </TableCell>
                    <TableCell>{opname.kasir?.nama}</TableCell>
                    <TableCell>
                      <Badge variant={opname.status === 'approved' ? 'default' : 'secondary'}>
                        {opname.status === 'approved' ? 'Approved' : opname.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{opname.keterangan || '-'}</TableCell>
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

export default StockOpnameHistory;
