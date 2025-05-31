
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Package } from 'lucide-react';

interface Product {
  id: string;
  nama: string;
  harga_jual: number;
  stok_saat_ini: number;
  satuan: string;
  barcode?: string;
}

interface POSProductSearchProps {
  searchQuery: string;
  onAddToCart: (product: Product) => void;
}

const POSProductSearch = ({ searchQuery, onAddToCart }: POSProductSearchProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API call
  const mockProducts: Product[] = [
    {
      id: '1',
      nama: 'Beras Premium 5kg',
      harga_jual: 75000,
      stok_saat_ini: 50,
      satuan: 'karung',
      barcode: '123456789'
    },
    {
      id: '2',
      nama: 'Minyak Goreng 1L',
      harga_jual: 15000,
      stok_saat_ini: 30,
      satuan: 'botol',
      barcode: '987654321'
    },
    {
      id: '3',
      nama: 'Gula Pasir 1kg',
      harga_jual: 14000,
      stok_saat_ini: 25,
      satuan: 'kg',
      barcode: '456789123'
    },
    {
      id: '4',
      nama: 'Tepung Terigu 1kg',
      harga_jual: 12000,
      stok_saat_ini: 40,
      satuan: 'kg',
      barcode: '789123456'
    },
    {
      id: '5',
      nama: 'Kopi Bubuk 200g',
      harga_jual: 25000,
      stok_saat_ini: 15,
      satuan: 'pack',
      barcode: '321654987'
    }
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        const filtered = mockProducts.filter(product =>
          product.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.barcode?.includes(searchQuery)
        );
        setProducts(filtered);
      } else {
        setProducts(mockProducts);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Tidak ada produk ditemukan</p>
        <p className="text-sm">Coba kata kunci lain atau scan barcode</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
      {products.map((product) => (
        <Card key={product.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-sm flex-1 mr-2">{product.nama}</h3>
              <Button
                size="sm"
                onClick={() => onAddToCart(product)}
                disabled={product.stok_saat_ini === 0}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-1">
              <p className="text-lg font-bold text-blue-600">
                Rp {product.harga_jual.toLocaleString('id-ID')}
              </p>
              
              <div className="flex items-center justify-between">
                <Badge variant={product.stok_saat_ini > 10 ? "secondary" : "destructive"}>
                  Stok: {product.stok_saat_ini} {product.satuan}
                </Badge>
                
                {product.barcode && (
                  <span className="text-xs text-gray-500">
                    {product.barcode}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default POSProductSearch;
