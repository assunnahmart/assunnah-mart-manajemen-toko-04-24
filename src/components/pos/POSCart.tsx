
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CartItem {
  id: string;
  nama: string;
  harga_jual: number;
  quantity: number;
  satuan: string;
}

interface POSCartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const POSCart = ({ items, onUpdateQuantity }: POSCartProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Keranjang kosong</p>
        <p className="text-sm">Tambahkan produk untuk memulai transaksi</p>
      </div>
    );
  }

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + (item.harga_jual * item.quantity), 0);
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Produk</TableHead>
              <TableHead className="font-semibold text-center">Quantity</TableHead>
              <TableHead className="font-semibold text-right">Subtotal</TableHead>
              <TableHead className="font-semibold text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{item.nama}</span>
                    <span className="text-sm text-gray-600">
                      Rp {item.harga_jual.toLocaleString('id-ID')} / {item.satuan}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                      className="w-16 h-8 text-center text-sm"
                      min="0"
                    />
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-gray-900">
                    Rp {(item.harga_jual * item.quantity).toLocaleString('id-ID')}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateQuantity(item.id, 0)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Total Summary */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-700">Total Belanja:</span>
          <span className="text-2xl font-bold text-red-600">
            Rp {getTotalAmount().toLocaleString('id-ID')}
          </span>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {items.length} item{items.length !== 1 ? 's' : ''} dalam keranjang
        </div>
      </div>
    </div>
  );
};

export default POSCart;
