
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PurchaseItemFormProps {
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;
  quantity: number;
  setQuantity: (value: number) => void;
  unitPrice: number;
  setUnitPrice: (value: number) => void;
  filteredProducts: any[];
  supplierId: string;
  onAddItem: () => void;
}

const PurchaseItemForm = ({
  selectedProduct,
  setSelectedProduct,
  quantity,
  setQuantity,
  unitPrice,
  setUnitPrice,
  filteredProducts,
  supplierId,
  onAddItem
}: PurchaseItemFormProps) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Tambah Produk</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <Label>Produk</Label>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger>
              <SelectValue placeholder={supplierId ? "Pilih produk..." : "Pilih supplier dulu..."} />
            </SelectTrigger>
            <SelectContent>
              {filteredProducts?.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Jumlah</Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
          />
        </div>
        <div>
          <Label>Harga Satuan</Label>
          <Input
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            min="0"
            placeholder="Harga akan terisi otomatis"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={onAddItem} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Tambah
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseItemForm;
