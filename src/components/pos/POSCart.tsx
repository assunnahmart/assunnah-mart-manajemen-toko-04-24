
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2 } from 'lucide-react';

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

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{item.nama}</h4>
            <p className="text-xs text-gray-600">
              Rp {item.harga_jual.toLocaleString('id-ID')} / {item.satuan}
            </p>
          </div>
          
          <div className="flex items-center gap-1">
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
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateQuantity(item.id, 0)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="text-right min-w-0">
            <p className="font-medium text-sm">
              Rp {(item.harga_jual * item.quantity).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default POSCart;
