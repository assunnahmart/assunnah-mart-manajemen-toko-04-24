
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Loader2 } from 'lucide-react';
import { useBarang } from '@/hooks/useBarang';

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
  const [autoAddProcessed, setAutoAddProcessed] = useState<string>('');
  const { data: products = [], isLoading, error } = useBarang(searchQuery);

  useEffect(() => {
    // Auto-add if exact barcode match is found and not already processed
    if (searchQuery.length > 5 && searchQuery !== autoAddProcessed) {
      const exactMatch = products.find(product => 
        product.barcode === searchQuery
      );
      
      if (exactMatch && products.length === 1) {
        console.log('Auto-adding product from barcode scan:', exactMatch);
        onAddToCart({
          id: exactMatch.id,
          nama: exactMatch.nama,
          harga_jual: Number(exactMatch.harga_jual),
          stok_saat_ini: exactMatch.stok_saat_ini,
          satuan: exactMatch.satuan || 'pcs',
          barcode: exactMatch.barcode || undefined
        });
        setAutoAddProcessed(searchQuery);
      }
    }
  }, [searchQuery, products, onAddToCart, autoAddProcessed]);

  // Reset auto-add tracking when search query changes significantly
  useEffect(() => {
    if (searchQuery.length <= 5) {
      setAutoAddProcessed('');
    }
  }, [searchQuery]);

  if (isLoading) {
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

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <Package className="h-12 w-12 mx-auto mb-4 text-red-300" />
        <p>Gagal memuat data produk</p>
        <p className="text-sm">Periksa koneksi database</p>
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
                onClick={() => onAddToCart({
                  id: product.id,
                  nama: product.nama,
                  harga_jual: Number(product.harga_jual),
                  stok_saat_ini: product.stok_saat_ini,
                  satuan: product.satuan || 'pcs',
                  barcode: product.barcode || undefined
                })}
                disabled={product.stok_saat_ini === 0}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-1">
              <p className="text-lg font-bold text-blue-600">
                Rp {Number(product.harga_jual).toLocaleString('id-ID')}
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
