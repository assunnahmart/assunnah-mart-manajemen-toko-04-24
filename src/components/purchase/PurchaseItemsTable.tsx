
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface PurchaseItem {
  barang_id: string;
  nama_barang: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
}

interface PurchaseItemsTableProps {
  items: PurchaseItem[];
  onRemoveItem: (index: number) => void;
}

const PurchaseItemsTable = ({ items, onRemoveItem }: PurchaseItemsTableProps) => {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Daftar Produk</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produk</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Harga Satuan</TableHead>
            <TableHead>Subtotal</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.nama_barang}</TableCell>
              <TableCell>{item.jumlah}</TableCell>
              <TableCell>Rp {item.harga_satuan.toLocaleString('id-ID')}</TableCell>
              <TableCell>Rp {item.subtotal.toLocaleString('id-ID')}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemoveItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PurchaseItemsTable;
