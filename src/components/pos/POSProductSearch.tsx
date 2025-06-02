
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Loader2 } from 'lucide-react';
import { useBarang } from '@/hooks/useBarang';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  onProductAutoAdded?: () => void;
  enableEnterToAdd?: boolean;
}

const POSProductSearch = ({ searchQuery, onAddToCart, onProductAutoAdded, enableEnterToAdd = false }: POSProductSearchProps) => {
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
        
        // Notify parent component that product was auto-added
        if (onProductAutoAdded) {
          onProductAutoAdded();
        }
      }
    }
  }, [searchQuery, products, onAddToCart, autoAddProcessed, onProductAutoAdded]);

  // Reset auto-add tracking when search query changes significantly
  useEffect(() => {
    if (searchQuery.length <= 5) {
      setAutoAddProcessed('');
    }
  }, [searchQuery]);

  // Add Enter key functionality to add first product to cart
  useEffect(() => {
    if (enableEnterToAdd) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' && products.length > 0 && products[0].stok_saat_ini > 0) {
          event.preventDefault();
          const firstProduct = products[0];
          onAddToCart({
            id: firstProduct.id,
            nama: firstProduct.nama,
            harga_jual: Number(firstProduct.harga_jual),
            stok_saat_ini: firstProduct.stok_saat_ini,
            satuan: firstProduct.satuan || 'pcs',
            barcode: firstProduct.barcode || undefined
          });
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [enableEnterToAdd, products, onAddToCart]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Memuat produk...</span>
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
    <div className="space-y-2">
      {enableEnterToAdd && products.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-2 rounded text-sm text-blue-700">
          💡 Tekan Enter untuk menambah produk teratas ke keranjang
        </div>
      )}
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Nama Produk</TableHead>
              <TableHead className="font-semibold">Harga</TableHead>
              <TableHead className="font-semibold">Stok</TableHead>
              <TableHead className="font-semibold">Barcode</TableHead>
              <TableHead className="font-semibold text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => (
              <TableRow 
                key={product.id} 
                className={`hover:bg-gray-50 ${index === 0 && enableEnterToAdd ? 'bg-blue-50 border-l-4 border-blue-400' : ''}`}
              >
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                      {product.nama}
                      {index === 0 && enableEnterToAdd && (
                        <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-700">
                          Enter
                        </Badge>
                      )}
                    </span>
                    <span className="text-xs text-gray-500">Per {product.satuan}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-lg font-bold text-blue-600">
                    Rp {Number(product.harga_jual).toLocaleString('id-ID')}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={product.stok_saat_ini > 10 ? "secondary" : "destructive"}>
                    {product.stok_saat_ini} {product.satuan}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {product.barcode || '-'}
                  </span>
                </TableCell>
                <TableCell className="text-center">
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
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default POSProductSearch;
