
import { useState } from 'react';
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, ShoppingCart, Save, CreditCard, Printer } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useCreatePOSTransaction, usePOSTransactionsToday } from '@/hooks/usePOSTransactions';
import { useToast } from '@/hooks/use-toast';
import POSCart from '@/components/pos/POSCart';
import POSProductSearch from '@/components/pos/POSProductSearch';
import POSPayment from '@/components/pos/POSPayment';
import POSExportImport from '@/components/pos/POSExportImport';
import POSReceiptPrint from '@/components/pos/POSReceiptPrint';

const POSSystem = () => {
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const createTransaction = useCreatePOSTransaction();
  const { data: todayStats } = usePOSTransactionsToday();

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
      toast({
        title: "Keranjang kosong",
        description: "Tambahkan produk terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    try {
      const transactionData = {
        kasir_username: user?.username || 'unknown',
        kasir_name: user?.full_name || 'Unknown',
        total_amount: getTotalAmount(),
        payment_method: 'quick_save',
        amount_paid: 0,
        change_amount: 0,
        items_count: cartItems.length,
        status: 'saved' as const,
        notes: 'Quick save - tidak ada pembayaran'
      };

      const itemsData = cartItems.map(item => ({
        product_id: item.id,
        product_name: item.nama,
        unit_price: item.harga_jual,
        quantity: item.quantity,
        subtotal: item.harga_jual * item.quantity,
        unit: item.satuan || 'pcs'
      }));

      await createTransaction.mutateAsync({
        transaction: transactionData,
        items: itemsData
      });

      setCartItems([]);
      toast({
        title: "Transaksi berhasil disimpan",
        description: "Transaksi telah disimpan tanpa pembayaran"
      });
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Gagal menyimpan",
        description: "Terjadi kesalahan saat menyimpan transaksi",
        variant: "destructive"
      });
    }
  };

  const handleRegularPayment = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Keranjang kosong",
        description: "Tambahkan produk terlebih dahulu",
        variant: "destructive"
      });
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
            <div className="flex items-center justify-between mb-4">
              <div>
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
              <POSExportImport />
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
                    <div className="flex gap-2">
                      <POSReceiptPrint 
                        cartItems={cartItems}
                        totalAmount={getTotalAmount()}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearCart}
                        disabled={cartItems.length === 0}
                      >
                        Clear
                      </Button>
                    </div>
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
                        disabled={cartItems.length === 0 || createTransaction.isPending}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {createTransaction.isPending ? 'Menyimpan...' : 'Simpan Cepat'}
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

              {/* Today's Statistics - Moved below payment buttons */}
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {todayStats?.totalTransactions || 0}
                      </p>
                      <p className="text-sm text-gray-600">Transaksi Hari Ini</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        Rp {(todayStats?.totalAmount || 0).toLocaleString('id-ID')}
                      </p>
                      <p className="text-sm text-gray-600">Total Penjualan Hari Ini</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        Rp {getTotalAmount().toLocaleString('id-ID')}
                      </p>
                      <p className="text-sm text-gray-600">Total Keranjang Saat Ini</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
