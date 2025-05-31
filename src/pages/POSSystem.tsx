
import { useState } from 'react';
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, ShoppingCart, Save, CreditCard, Printer } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import POSCart from '@/components/pos/POSCart';
import POSProductSearch from '@/components/pos/POSProductSearch';
import POSPayment from '@/components/pos/POSPayment';

const POSSystem = () => {
  const { user } = useSimpleAuth();
  const [cartItems, setCartItems] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (id, quantity) => {
    if (quantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.harga_jual * item.quantity), 0);
  };

  const handleQuickSave = async () => {
    if (cartItems.length === 0) {
      alert('Keranjang kosong!');
      return;
    }

    // Logic for quick save without payment input
    console.log('Quick save transaction:', cartItems);
    // Here you would typically call an API to save the transaction
    
    // Reset cart after save
    setCartItems([]);
    alert('Transaksi berhasil disimpan!');
  };

  const handleRegularPayment = () => {
    if (cartItems.length === 0) {
      alert('Keranjang kosong!');
      return;
    }
    setShowPayment(true);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <NewProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <NewNavbar />
        
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">POS System</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Kasir: {user?.full_name}</Badge>
              <Badge variant="secondary">
                {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Search & List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Cari Produk
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari nama produk atau scan barcode..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <POSProductSearch 
                    searchQuery={searchQuery}
                    onAddToCart={addToCart}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Cart & Actions */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Keranjang ({cartItems.length})
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearCart}
                      disabled={cartItems.length === 0}
                    >
                      Clear
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <POSCart 
                    items={cartItems}
                    onUpdateQuantity={updateCartQuantity}
                  />
                </CardContent>
              </Card>

              {/* Total & Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold">
                        Rp {getTotalAmount().toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {/* Quick Save Button */}
                      <Button
                        onClick={handleQuickSave}
                        disabled={cartItems.length === 0}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        NEW - Simpan Cepat
                      </Button>

                      {/* Regular Payment Button */}
                      <Button
                        onClick={handleRegularPayment}
                        disabled={cartItems.length === 0}
                        className="w-full"
                        size="lg"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Bayar & Cetak
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPayment && (
          <POSPayment
            cartItems={cartItems}
            totalAmount={getTotalAmount()}
            onClose={() => setShowPayment(false)}
            onSuccess={() => {
              setCartItems([]);
              setShowPayment(false);
            }}
          />
        )}
      </div>
    </NewProtectedRoute>
  );
};

export default POSSystem;
