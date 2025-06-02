
import { useState, useEffect } from 'react';
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Save, CreditCard, Camera, DollarSign, ChevronUp, ChevronDown } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useCreatePOSTransaction } from '@/hooks/usePOSTransactions';
import { usePOSTransactionSync } from '@/hooks/usePOSTransactionSync';
import { useToast } from '@/hooks/use-toast';
import POSCart from '@/components/pos/POSCart';
import POSProductSearch from '@/components/pos/POSProductSearch';
import POSPayment from '@/components/pos/POSPayment';
import POSBarcodeScanner from '@/components/pos/POSBarcodeScanner';
import POSTransactionSync from '@/components/pos/POSTransactionSync';
import POSCustomerSelect from '@/components/pos/POSCustomerSelect';
import POSPaymentMethod from '@/components/pos/POSPaymentMethod';

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
  const [showScanner, setShowScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  
  const createTransaction = useCreatePOSTransaction();
  const { syncStock, syncCustomerDebt, isSyncingStock, isSyncingDebt } = usePOSTransactionSync();

  // Handle transaction synchronization
  const handleTransactionSync = async (transactionData: any, items: any[]) => {
    try {
      console.log('Starting transaction synchronization:', { transactionData, items });
      
      if (items && items.length > 0) {
        await syncStock(items);
        console.log('Stock synchronized successfully');
      }
      
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
    
    setSearchQuery(barcode);
    
    toast({
      title: "Mencari produk",
      description: `Mencari produk dengan barcode: ${barcode}`
    });
  };

  const handleProductAutoAdded = () => {
    setTimeout(() => {
      setSearchQuery('');
    }, 1500);
  };

  return (
    <NewProtectedRoute>
      <POSTransactionSync onTransactionComplete={handleTransactionSync}>
        <Layout>
          <div className="min-h-screen bg-gray-50">
            {/* Collapsible Navbar */}
            <div className={`transition-all duration-300 ${isMenuCollapsed ? 'h-0 overflow-hidden' : 'h-auto'}`}>
              <NewNavbar />
            </div>
            
            {/* Menu Toggle Button */}
            <div className="bg-white border-b shadow-sm">
              <div className="container mx-auto px-4 max-w-7xl">
                <Button
                  variant="ghost"
                  onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
                  className="w-full py-2 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  {isMenuCollapsed ? (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Tampilkan Menu
                    </>
                  ) : (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Sembunyikan Menu
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Fixed Total Shopping Display at the very top */}
            <div className="sticky top-0 z-40 bg-gray-50 pb-4">
              <div className="container mx-auto p-4 max-w-7xl">
                <div className="bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-800 rounded-xl p-6 shadow-lg border-2 border-yellow-500">
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
                      <p className="text-yellow-100 text-sm mt-2">Program by Abu Mughiroh Junaedi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="container mx-auto p-4 max-w-7xl">
              {/* Kasir Info, Date and Auto-Sync above Product Search */}
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-6 items-center">
                  {/* Left Section - Kasir info */}
                  <div>
                    <Badge variant="outline" className="border-red-300 text-red-700">
                      Kasir: {user?.full_name}
                    </Badge>
                  </div>

                  {/* Center Section - Empty space for better layout */}
                  <div></div>

                  {/* Right Section - Date and Auto-Sync */}
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {new Date().toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Auto-Sync: Aktif
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Main Content Layout - Product Search and Cart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Product Search */}
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

                {/* Shopping Cart */}
                <Card className="h-[700px] border-yellow-200">
                  <CardHeader className="pb-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg">
                    <CardTitle className="flex items-center justify-between text-yellow-800">
                      <span className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
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
                    <POSCart 
                      items={cartItems}
                      onUpdateQuantity={updateCartQuantity}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Customer and Payment Method below Cart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Customer Selection */}
                <div>
                  <POSCustomerSelect
                    selectedCustomer={selectedCustomer}
                    onCustomerSelect={setSelectedCustomer}
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <POSPaymentMethod
                    selectedMethod={selectedPaymentMethod}
                    onMethodSelect={setSelectedPaymentMethod}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mb-6">
                <Card className="border-blue-200">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button
                        onClick={handleQuickSave}
                        disabled={cartItems.length === 0 || createTransaction.isPending}
                        className="bg-green-600 hover:bg-green-700 shadow-lg"
                        size="lg"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {createTransaction.isPending ? 'Menyimpan...' : 'Simpan ke Database (F2)'}
                      </Button>

                      <Button
                        onClick={handleRegularPayment}
                        disabled={cartItems.length === 0 || (selectedPaymentMethod === 'credit' && !selectedCustomer)}
                        size="lg"
                        className="bg-red-500 hover:bg-red-600 shadow-lg"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {selectedPaymentMethod === 'credit' ? 'Proses Kredit' : 'Bayar & Cetak'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Warning messages */}
              {selectedPaymentMethod === 'credit' && !selectedCustomer && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg mb-4">
                  <p className="text-orange-700 text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Pembayaran kredit memerlukan pemilihan pelanggan
                  </p>
                </div>
              )}

              {(isSyncingStock || isSyncingDebt) && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                  <p className="text-blue-700 text-sm flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                    Menyinkronisasi data transaksi dengan database...
                  </p>
                </div>
              )}
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
        </Layout>
      </POSTransactionSync>
    </NewProtectedRoute>
  );
};

export default POSSystem;
