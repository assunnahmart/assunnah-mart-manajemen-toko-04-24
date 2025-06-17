
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Plus, ShoppingCart, AlertTriangle } from 'lucide-react';
import { usePOSBarangKonsinyasi } from '@/hooks/useBarang';
import { useToast } from '@/hooks/use-toast';

interface POSProductSearchProps {
  searchQuery: string;
  onAddToCart: (product: any) => void;
  onProductAutoAdded?: () => void;
  enableEnterToAdd?: boolean;
}

const POSProductSearch = ({ 
  searchQuery, 
  onAddToCart, 
  onProductAutoAdded,
  enableEnterToAdd = false 
}: POSProductSearchProps) => {
  const { data: products, isLoading } = usePOSBarangKonsinyasi();
  const { toast } = useToast();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoAddProcessedRef = useRef<Set<string>>(new Set());
  const lastProcessedQueryRef = useRef<string>('');

  const filteredProducts = products?.filter(product =>
    product.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.supplier?.nama?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Auto-add product if exact barcode match and enableEnterToAdd is true
  useEffect(() => {
    if (enableEnterToAdd && searchQuery && filteredProducts.length === 1) {
      const exactMatch = filteredProducts.find(p => 
        p.barcode?.toLowerCase() === searchQuery.toLowerCase()
      );
      
      if (exactMatch) {
        // Create unique key for this scan
        const scanKey = `${exactMatch.id}-${searchQuery}-${Date.now()}`;
        
        // Prevent duplicate processing of the same query
        if (lastProcessedQueryRef.current === searchQuery) {
          return;
        }
        
        // Prevent processing if we've already handled this exact barcode recently
        if (autoAddProcessedRef.current.has(exactMatch.barcode || '')) {
          return;
        }
        
        lastProcessedQueryRef.current = searchQuery;
        autoAddProcessedRef.current.add(exactMatch.barcode || '');
        
        const timeoutId = setTimeout(() => {
          onAddToCart(exactMatch);
          toast({
            title: "Produk ditambahkan",
            description: `${exactMatch.nama} berhasil ditambahkan ke keranjang`,
            duration: 2000
          });
          onProductAutoAdded?.();
          
          // Clean up the processed barcode after a delay to allow for new scans
          setTimeout(() => {
            autoAddProcessedRef.current.delete(exactMatch.barcode || '');
          }, 2000);
        }, 500);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [searchQuery, filteredProducts, enableEnterToAdd, onAddToCart, onProductAutoAdded, toast]);

  // Clear processed queries when search query changes significantly
  useEffect(() => {
    if (!searchQuery) {
      lastProcessedQueryRef.current = '';
      autoAddProcessedRef.current.clear();
    }
  }, [searchQuery]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enableEnterToAdd) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredProducts.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredProducts[selectedIndex]) {
        e.preventDefault();
        
        // Prevent duplicate Enter key processing
        const selectedProduct = filteredProducts[selectedIndex];
        const enterKey = `enter-${selectedProduct.id}-${Date.now()}`;
        
        if (autoAddProcessedRef.current.has(enterKey)) {
          return;
        }
        
        autoAddProcessedRef.current.add(enterKey);
        
        onAddToCart(selectedProduct);
        toast({
          title: "Produk ditambahkan",
          description: `${selectedProduct.nama} berhasil ditambahkan`,
          duration: 2000
        });
        
        // Clean up after a short delay
        setTimeout(() => {
          autoAddProcessedRef.current.delete(enterKey);
        }, 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredProducts, selectedIndex, enableEnterToAdd, onAddToCart, toast]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStockBadge = (stok: number, minimal: number) => {
    if (stok === 0) {
      return <Badge variant="destructive" className="text-xs">Habis</Badge>;
    } else if (stok <= minimal) {
      return <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">Stok Rendah</Badge>;
    } else {
      return <Badge variant="outline" className="text-green-600 border-green-300 text-xs">Tersedia</Badge>;
    }
  };

  const handleManualAddToCart = (product: any) => {
    if (product.stok_saat_ini > 0) {
      // Create unique key for manual add
      const manualKey = `manual-${product.id}-${Date.now()}`;
      
      if (autoAddProcessedRef.current.has(manualKey)) {
        return;
      }
      
      autoAddProcessedRef.current.add(manualKey);
      
      onAddToCart(product);
      toast({
        title: "Produk ditambahkan",
        description: `${product.nama} berhasil ditambahkan ke keranjang`,
        duration: 2000
      });
      
      // Clean up after a short delay
      setTimeout(() => {
        autoAddProcessedRef.current.delete(manualKey);
      }, 1000);
    } else {
      toast({
        title: "Stok habis",
        description: `${product.nama} tidak tersedia`,
        variant: "destructive",
        duration: 2000
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Memuat data produk...</p>
      </div>
    );
  }

  if (!searchQuery) {
    return (
      <div className="text-center py-8">
        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Mulai mengetik untuk mencari produk...</p>
        <p className="text-sm text-gray-500 mt-2">
          Cari berdasarkan nama produk, barcode, atau supplier
        </p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Produk tidak ditemukan</p>
        <p className="text-sm text-gray-500 mt-2">
          Tidak ada produk dengan kata kunci "{searchQuery}"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 h-full overflow-y-auto">
      <div className="sticky top-0 bg-white pb-2 border-b">
        <p className="text-sm text-gray-600">
          Ditemukan {filteredProducts.length} produk
          {enableEnterToAdd && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
              Gunakan ↑↓ dan Enter untuk navigasi cepat
            </span>
          )}
        </p>
      </div>
      
      {filteredProducts.map((product, index) => (
        <div
          key={product.id}
          className={`p-3 border rounded-lg transition-all duration-200 ${
            enableEnterToAdd && index === selectedIndex
              ? 'border-red-300 bg-red-50 shadow-md'
              : 'border-gray-200 hover:border-red-200 hover:bg-red-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 truncate">{product.nama}</h3>
                {getStockBadge(product.stok_saat_ini, product.stok_minimal)}
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                {product.barcode && (
                  <p className="flex items-center gap-1">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {product.barcode}
                    </span>
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <span>Stok: <span className="font-medium">{product.stok_saat_ini} {product.satuan}</span></span>
                  <span className="font-bold text-green-600">{formatCurrency(product.harga_jual || 0)}</span>
                </div>
                
                {product.supplier?.nama && (
                  <p className="text-xs text-blue-600">Supplier: {product.supplier.nama}</p>
                )}
              </div>
            </div>
            
            <div className="ml-4 flex flex-col gap-2">
              <Button
                size="sm"
                onClick={() => handleManualAddToCart(product)}
                disabled={product.stok_saat_ini === 0}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {product.stok_saat_ini === 0 ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah
                  </>
                )}
              </Button>
              
              {enableEnterToAdd && index === selectedIndex && (
                <Badge variant="secondary" className="text-xs justify-center">
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Enter
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default POSProductSearch;
