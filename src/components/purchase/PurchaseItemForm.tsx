
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PurchaseProductSelect from './PurchaseProductSelect';

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
  const isAddDisabled = !selectedProduct || quantity <= 0 || unitPrice <= 0;

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Tambah Produk</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <PurchaseProductSelect
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          filteredProducts={filteredProducts}
          supplierId={supplierId}
        />
        
        <div>
          <Label>Jumlah</Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            placeholder="Masukkan jumlah"
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
          <Button 
            onClick={onAddItem} 
            className="w-full"
            disabled={isAddDisabled}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah
          </Button>
        </div>
      </div>
      
      {isAddDisabled && (
        <p className="text-sm text-gray-500 mt-2">
          {!supplierId ? 'Pilih supplier terlebih dahulu' : 
           !selectedProduct ? 'Pilih produk terlebih dahulu' :
           'Lengkapi jumlah dan harga satuan'}
        </p>
      )}
    </div>
  );
};

export default PurchaseItemForm;
