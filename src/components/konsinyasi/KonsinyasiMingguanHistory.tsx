
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Edit, Calendar } from 'lucide-react';
import { useKonsinyasiMingguan } from '@/hooks/useKonsinyasiMingguan';
import KonsinyasiMingguanEditDialog from './KonsinyasiMingguanEditDialog';

const KonsinyasiMingguanHistory = () => {
  const { data: konsinyasiData, isLoading } = useKonsinyasiMingguan();
  const [editingItem, setEditingItem] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('id-ID');
    const end = new Date(endDate).toLocaleDateString('id-ID');
    return `${start} - ${end}`;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Riwayat Konsinyasi Mingguan
            <Badge variant="outline" className="ml-auto">
              {konsinyasiData?.length || 0} data
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {konsinyasiData?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Belum ada data konsinyasi mingguan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode Minggu</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Jumlah Titipan</TableHead>
                    <TableHead>Terjual Sistem</TableHead>
                    <TableHead>Real Terjual</TableHead>
                    <TableHead>Sisa Stok</TableHead>
                    <TableHead>Selisih</TableHead>
                    <TableHead>Total Bayar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {konsinyasiData?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {formatDateRange(item.minggu_mulai, item.minggu_selesai)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {item.supplier_name}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.jumlah_titipan}</TableCell>
                      <TableCell>{item.jumlah_terjual_sistem}</TableCell>
                      <TableCell>{item.jumlah_real_terjual}</TableCell>
                      <TableCell>{item.sisa_stok}</TableCell>
                      <TableCell className={item.selisih_stok !== 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                        {item.selisih_stok}
                      </TableCell>
                      <TableCell className="font-medium">
                        Rp {item.total_pembayaran.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                          {item.status === 'completed' ? 'Selesai' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
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

      <KonsinyasiMingguanEditDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseDialog}
        konsinyasiData={editingItem}
      />
    </>
  );
};

export default KonsinyasiMingguanHistory;
