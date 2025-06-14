
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import POSProductSearch from '@/components/pos/POSProductSearch';
import POSCart from '@/components/pos/POSCart';
import POSBarcodeScanner from '@/components/pos/POSBarcodeScanner';
import CameraBarcodeScanner from '@/components/stock/CameraBarcodeScanner';
import { useToast } from '@/hooks/use-toast';

interface POSCartManagerProps {
  cartItems: any[];
  setCartItems: (items: any[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const POSCartManager = ({ cartItems, setCartItems, searchQuery, setSearchQuery }: POSCartManagerProps) => {
  const [showScanner, setShowScanner] = useState(false);
  const [showQuickScanner, setShowQuickScanner] = useState(false);
  const { toast } = useToast();

  const addToCart = (product: any) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item => item.id === product.id ? {
        ...item,
        quantity: item.quantity + 1
      } : item));
    } else {
      setCartItems([...cartItems, {
        ...product,
        quantity: 1
      }]);
    }
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item => item.id === id ? {
        ...item,
        quantity
      } : item));
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleBarcodeScanned = (barcode: string) => {
    setSearchQuery(barcode);
    toast({
      title: "Mencari produk",
      description: `Mencari produk dengan barcode: ${barcode}`
    });
  };

  const handleQuickScanBarcodeScanned = (barcode: string) => {
    setSearchQuery(barcode);
    setShowQuickScanner(false);
    toast({
      title: "Produk ditemukan",
      description: `Barcode ${barcode} berhasil di-scan`
    });
  };

  const handleProductAutoAdded = () => {
    setTimeout(() => {
      setSearchQuery('');
    }, 1500);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="h-[700px] border-red-200">
          <CardHeader className="pb-4 bg-gradient-to-r from-red-50 to-yellow-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Search className="h-5 w-5" />
              Cari Produk
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Cari nama produk atau scan barcode..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  className="pl-10 border-red-200 focus:border-red-400" 
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowScanner(true)} 
                className="shrink-0 border-red-300 text-red-700 hover:bg-red-50"
              >
                <Camera className="h-4 w-4 mr-2" />
                Scan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-120px)] overflow-hidden">
            <POSProductSearch 
              searchQuery={searchQuery} 
              onAddToCart={addToCart} 
              onProductAutoAdded={handleProductAutoAdded} 
              enableEnterToAdd={true} 
            />
          </CardContent>
        </Card>

        <Card className="h-[700px] border-yellow-200">
          <CardHeader className="pb-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg">
            <CardTitle className="flex items-center justify-between text-yellow-800">
              <span className="flex items-center gap-2">
                Keranjang Belanja
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCart} 
                disabled={cartItems.length === 0} 
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-80px)] overflow-hidden">
            <POSCart items={cartItems} onUpdateQuantity={updateCartQuantity} />
          </CardContent>
        </Card>
      </div>

      <POSBarcodeScanner 
        isOpen={showScanner} 
        onScan={handleBarcodeScanned} 
        onClose={() => setShowScanner(false)} 
      />

      <CameraBarcodeScanner 
        isOpen={showQuickScanner} 
        onScan={handleQuickScanBarcodeScanned} 
        onClose={() => setShowQuickScanner(false)} 
      />
    </>
  );
};

export default POSCartManager;
