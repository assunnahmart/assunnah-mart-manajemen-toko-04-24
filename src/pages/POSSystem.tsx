import { useState, useEffect } from 'react';
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Save, CreditCard, History, Receipt, Camera, DollarSign } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useCreatePOSTransaction } from '@/hooks/usePOSTransactions';
import { usePOSTransactionSync } from '@/hooks/usePOSTransactionSync';
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
import POSTransactionSync from '@/components/pos/POSTransactionSync';

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  
  const createTransaction = useCreatePOSTransaction();
  const { syncStock, syncCustomerDebt, isSyncingStock, isSyncingDebt } = usePOSTransactionSync();

  // Handle transaction synchronization
  const handleTransactionSync = async (transactionData: any, items: any[]) => {
    try {
      console.log('Starting transaction synchronization:', { transactionData, items });
      
      // Sync stock updates for all items
      if (items && items.length > 0) {
        await syncStock(items);
        console.log('Stock synchronized successfully');
      }
      
      // Sync customer debt if credit payment
      if (transactionData.payment_method === 'credit' && selectedCustomer && selectedCustomer.type !== 'guest') {
        await syncCustomerDebt({
          customer: selectedCustomer,
          amount: transactionData.total_amount
        });
        console.log('Customer debt synchronized successfully');
      }
      
      toast({
        title: "Sinkronisasi berhasil",
        description: "Data transaksi, stok, dan piutang telah disinkronkan dengan database",
      });
      
    } catch (error) {
      console.error('Transaction sync failed:', error);
      toast({
        title: "Gagal sinkronisasi",
        description: `Terjadi kesalahan: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Add keyboard shortcut for F2 to save to database
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F2') {
        event.preventDefault();
        handleQuickSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cartItems, selectedPaymentMethod, selectedCustomer, user, createTransaction]);

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
        amount_paid: getTotalAmount(),
        change_amount: 0,
        items_count: cartItems.length,
        status: 'completed' as const,
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
    
    // Set search query to trigger search in POSProductSearch
    setSearchQuery(barcode);
    
    toast({
      title: "Mencari produk",
      description: `Mencari produk dengan barcode: ${barcode}`
    });
  };

  const handleProductAutoAdded = () => {
    // Clear search query after product is auto-added from barcode
    setTimeout(() => {
      setSearchQuery('');
    }, 1500); // Give time for the toast to show
  };

  return (
    <NewProtectedRoute>
      <POSTransactionSync onTransactionComplete={handleTransactionSync}>
        <div className="min-h-screen bg-gray-50">
          <NewNavbar />
          
          <div className="container mx-auto p-4 max-w-7xl">
            {/* Enhanced Header with Assunnah Mart Logo and Total Shopping Amount */}
            <div className="mb-6">
              {/* Logo Banner with Assunnah Mart Theme */}
              <div className="bg-gradient-to-r from-red-500 via-red-600 to-pink-500 rounded-xl p-6 mb-4 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-blue-400/10"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <img 
                      src="/lovable-uploads/892dcb20-d89a-4b78-a9b8-f0f632fd9ac7.png" 
                      alt="Assunnah Mart Logo" 
                      className="h-16 w-auto bg-white rounded-lg p-2 shadow-md"
                    />
                    <div className="text-white">
                      <h1 className="text-2xl font-bold mb-1">ASSUNNAH MART</h1>
                      <p className="text-red-100 text-sm italic">belanja hemat, berkah, nikmat</p>
                    </div>
                  </div>
                  <div className="text-right text-white">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm px-3 py-1">
                      POS System
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Total Shopping Display - Changed to dark yellow */}
              <div className="bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-800 rounded-xl p-6 mb-6 shadow-lg border-2 border-yellow-500">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-500 p-3 rounded-lg shadow-lg">
                      <DollarSign className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-yellow-100 text-sm font-medium mb-1">Total Belanja Saat Ini</p>
                      <p className="text-3xl font-bold text-white drop-shadow-md">
                        Rp {getTotalAmount().toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-lg px-4 py-2 bg-red-500 text-white border-red-400 shadow-lg">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {cartItems.length} Item{cartItems.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Sync Status Indicator */}
              {(isSyncingStock || isSyncingDebt) && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                  <p className="text-blue-700 text-sm flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                    Menyinkronisasi data transaksi dengan database...
                  </p>
                </div>
              )}

              {/* Header Info */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Point of Sale System</h2>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge variant="outline" className="border-red-300 text-red-700">
                      Kasir: {user?.full_name}
                    </Badge>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {new Date().toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      F2: Simpan ke Database
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Auto-Sync: Aktif
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowHistory(!showHistory)}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <History className="h-4 w-4 mr-2" />
                    Riwayat
                  </Button>
                  <POSExportImport />
                </div>
              </div>
            </div>

            {/* Landscape Layout - Optimized for Desktop */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Left Section - Product Search (60% width on desktop) */}
              <div className="xl:col-span-2">
                {showHistory ? (
                  <POSTransactionHistory />
                ) : (
                  <Card className="h-[calc(100vh-450px)] border-red-200">
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
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                      />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Section - Cart & Controls (40% width on desktop) */}
              <div className="xl:col-span-2 space-y-4">
                {/* Cart - Moved to Top */}
                <Card className="h-[350px] border-yellow-200">
                  <CardHeader className="pb-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg">
                    <CardTitle className="flex items-center justify-between text-yellow-800">
                      <span className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Keranjang Belanja
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
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Clear
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-80px)] overflow-hidden">
                    <POSCart 
                      items={cartItems}
                      onUpdateQuantity={updateCartQuantity}
                    />
                  </CardContent>
                </Card>

                {/* Customer & Payment Method Row - Moved Below Cart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <POSCustomerSelect
                    selectedCustomer={selectedCustomer}
                    onCustomerSelect={setSelectedCustomer}
                  />
                  <POSPaymentMethod
                    selectedMethod={selectedPaymentMethod}
                    onMethodSelect={setSelectedPaymentMethod}
                  />
                </div>

                {/* Credit Payment Warning */}
                {selectedPaymentMethod === 'credit' && !selectedCustomer && (
                  <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                    <p className="text-orange-700 text-sm flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Pembayaran kredit memerlukan pemilihan pelanggan
                    </p>
                  </div>
                )}

                {/* Actions */}
                <Card className="border-blue-200">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Quick Save Button with F2 indicator */}
                      <Button
                        onClick={handleQuickSave}
                        disabled={cartItems.length === 0 || createTransaction.isPending}
                        className="bg-green-600 hover:bg-green-700 shadow-lg"
                        size="lg"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {createTransaction.isPending ? 'Menyimpan...' : 'Simpan ke Database (F2)'}
                      </Button>

                      {/* Regular Payment Button */}
                      <Button
                        onClick={handleRegularPayment}
                        disabled={cartItems.length === 0 || (selectedPaymentMethod === 'credit' && !selectedCustomer)}
                        size="lg"
                        className="bg-red-500 hover:bg-red-600 shadow-lg"
                      >
                        {selectedPaymentMethod === 'credit' ? <Receipt className="h-4 w-4 mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                        {selectedPaymentMethod === 'credit' ? 'Proses Kredit' : 'Bayar & Cetak'}
                      </Button>
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
      </POSTransactionSync>
    </NewProtectedRoute>
  );
};

export default POSSystem;
