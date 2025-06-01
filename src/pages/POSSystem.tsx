import { useState } from 'react';
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Save, CreditCard, History, Receipt, Camera } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useCreatePOSTransaction } from '@/hooks/usePOSTransactions';
import { useToast } from '@/hooks/use-toast';
import POSCart from '@/components/pos/POSCart';
import POSProductSearch from '@/components/pos/POSProductSearch';
import POSPayment from '@/components/pos/POSPayment';
import POSExportImport from '@/components/pos/POSExportImport';
import POSReceiptPrint from '@/components/pos/POSReceiptPrint';
import POSTransactionHistory from '@/components/pos/POSTransactionHistory';
import POSCustomerSelect from '@/components/pos/POSCustomerSelect';
import POSPaymentMethod from '@/components/pos/POSPaymentMethod';
import POSBarcodeScanner from '@/components/pos/POSBarcodeScanner';

interface Customer {
  id: string;
  name: string;
  type: 'unit' | 'perorangan' | 'guest';
  phone?: string;
}

const POSSystem = () => {
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash'); // Default to cash
  
  const createTransaction = useCreatePOSTransaction();

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
        payment_method: selectedPaymentMethod,
        amount_paid: getTotalAmount(), // Set amount paid to total amount for completed transaction
        change_amount: 0, // No change for quick save
        items_count: cartItems.length,
        status: 'completed' as const, // Changed from 'saved' to 'completed'
        notes: `Quick save - ${selectedCustomer ? `Pelanggan: ${selectedCustomer.name}` : 'Tanpa pelanggan'} - Metode: ${selectedPaymentMethod === 'cash' ? 'Tunai' : 'Kredit'} - Transaksi selesai otomatis`
      };

      const itemsData = cartItems.map(item => ({
        product_id: item.id.toString(),
        product_name: item.nama,
        unit_price: item.harga_jual,
        quantity: item.quantity,
        subtotal: item.harga_jual * item.quantity,
        unit: item.satuan || 'pcs'
      }));

      console.log('Saving transaction data:', { transactionData, itemsData });

      await createTransaction.mutateAsync({
        transaction: transactionData,
        items: itemsData
      });

      setCartItems([]);
      setSelectedCustomer(null);
      toast({
        title: "Transaksi berhasil diselesaikan",
        description: "Transaksi telah disimpan dengan status selesai dan terintegrasi dengan laporan rekap penjualan kasir"
      });
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Gagal menyimpan",
        description: `Terjadi kesalahan: ${error.message || 'Unknown error'}`,
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

    // For credit payment, require customer selection
    if (selectedPaymentMethod === 'credit' && !selectedCustomer) {
      toast({
        title: "Pilih pelanggan",
        description: "Pembayaran kredit memerlukan pemilihan pelanggan",
        variant: "destructive"
      });
      return;
    }

    setShowPayment(true);
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedCustomer(null);
  };

  const handleBarcodeScanned = (barcode: string) => {
    console.log('Barcode scanned in POS:', barcode);
    
    // Set search query to the scanned barcode
    setSearchQuery(barcode);
    
    // Try to find product by barcode and add to cart automatically
    // This will be handled by POSProductSearch component
    toast({
      title: "Mencari produk",
      description: `Mencari produk dengan barcode: ${barcode}`
    });
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History className="h-4 w-4 mr-2" />
                  Riwayat
                </Button>
                <POSExportImport />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Search & List */}
            <div className="lg:col-span-2">
              {showHistory ? (
                <POSTransactionHistory />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Cari Produk
                    </CardTitle>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Cari nama produk atau scan barcode..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowScanner(true)}
                        className="shrink-0"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Scan
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <POSProductSearch 
                      searchQuery={searchQuery}
                      onAddToCart={addToCart}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              {/* Customer Selection */}
              <POSCustomerSelect
                selectedCustomer={selectedCustomer}
                onCustomerSelect={setSelectedCustomer}
              />

              {/* Payment Method */}
              <POSPaymentMethod
                selectedMethod={selectedPaymentMethod}
                onMethodSelect={setSelectedPaymentMethod}
              />

              {/* Credit Payment Warning */}
              {selectedPaymentMethod === 'credit' && !selectedCustomer && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                  <p className="text-orange-700 text-sm flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Pembayaran kredit memerlukan pemilihan pelanggan
                  </p>
                </div>
              )}

              {/* Cart */}
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
                        {createTransaction.isPending ? 'Menyimpan...' : 'Simpan ke Database'}
                      </Button>

                      {/* Regular Payment Button */}
                      <Button
                        onClick={handleRegularPayment}
                        disabled={cartItems.length === 0 || (selectedPaymentMethod === 'credit' && !selectedCustomer)}
                        className="w-full"
                        size="lg"
                      >
                        {selectedPaymentMethod === 'credit' ? <Receipt className="h-4 w-4 mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                        {selectedPaymentMethod === 'credit' ? 'Proses Kredit' : 'Bayar & Cetak'}
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
            selectedCustomer={selectedCustomer}
            selectedPaymentMethod={selectedPaymentMethod}
            onClose={() => setShowPayment(false)}
            onSuccess={() => {
              setCartItems([]);
              setSelectedCustomer(null);
              setShowPayment(false);
            }}
          />
        )}

        {/* Barcode Scanner Modal */}
        <POSBarcodeScanner
          isOpen={showScanner}
          onScan={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      </div>
    </NewProtectedRoute>
  );
};

export default POSSystem;
