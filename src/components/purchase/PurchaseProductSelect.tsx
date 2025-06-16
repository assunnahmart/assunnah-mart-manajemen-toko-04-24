
import { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface PurchaseProductSelectProps {
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;
  filteredProducts: any[];
  supplierId: string;
}

const PurchaseProductSelect = ({
  selectedProduct,
  setSelectedProduct,
  filteredProducts,
  supplierId
}: PurchaseProductSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products based on search term and ensure valid IDs
  const validFilteredProducts = useMemo(() => {
    const validProducts = filteredProducts?.filter(product => 
      product && 
      product.id && 
      typeof product.id === 'string' && 
      product.id.trim() !== '' &&
      product.nama &&
      product.nama.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
    
    // Limit to 5000 products for performance
    return validProducts.slice(0, 5000);
  }, [filteredProducts, searchTerm]);

  return (
    <div>
      <Label>Produk ({validFilteredProducts.length} tersedia)</Label>
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedProduct || ""} onValueChange={setSelectedProduct}>
          <SelectTrigger>
            <SelectValue placeholder={supplierId ? "Pilih produk..." : "Pilih supplier dulu..."} />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {validFilteredProducts.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                <div className="flex flex-col">
                  <span>{product.nama}</span>
                  <span className="text-xs text-gray-500">
                    Stok: {product.stok_saat_ini || 0} | Harga: Rp {(product.harga_jual || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PurchaseProductSelect;
