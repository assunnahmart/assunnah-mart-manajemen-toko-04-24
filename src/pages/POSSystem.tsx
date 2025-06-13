import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Camera, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import POSSidebar from '@/components/pos/POSSidebar';
import POSProductSearch from '@/components/pos/POSProductSearch';
import POSCart from '@/components/pos/POSCart';
import POSPayment from '@/components/pos/POSPayment';
import POSBarcodeScanner from '@/components/pos/POSBarcodeScanner';
import POSCustomerSelect from '@/components/pos/POSCustomerSelect';
import POSPaymentMethod from '@/components/pos/POSPaymentMethod';
import CameraBarcodeScanner from '@/components/stock/CameraBarcodeScanner';
import POSHeader from '@/components/pos/POSHeader';
import POSMainActions from '@/components/pos/POSMainActions';
import POSModals from '@/components/pos/POSModals';
import { useCreatePOSTransaction } from '@/hooks/usePOSTransactions';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import NewProtectedRoute from '@/components/NewProtectedRoute';
import POSTransactionSync from '@/components/pos/POSTransactionSync';
import { usePOSTransactionSync } from '@/hooks/usePOSTransactionSync';

interface Customer {
  id: string;
  name: string;
  type: 'unit' | 'perorangan' | 'guest';
  phone?: string;
}

const POSSystem = () => {
  const { user, signOut } = useSimpleAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showQuickScanner, setShowQuickScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [showKonsinyasi, setShowKonsinyasi] = useState(false);
  const [showKasirKas, setShowKasirKas] = useState(false);
  const [showStockOpname, setShowStockOpname] = useState(false);
  const [showKasUmum, setShowKasUmum] = useState(false);
  const createTransaction = useCreatePOSTransaction();
  const { syncStock, syncCustomerDebt, isSyncingStock, isSyncingDebt } = usePOSTransactionSync();

  const showDashboardAccess = user?.username === 'Jamhur' || user?.username === 'Ginanjar';

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
        description: "Data transaksi, stok, dan piutang telah disinkronkan dengan database"
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

  // Add logout function
  const handleLogout = () => {
    signOut();
    toast({
      title: "Logout berhasil",
      description: "Anda telah keluar dari sistem"
    });
    navigate('/login');
  };

  const addToCart = product => {
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

  const updateCartQuantity = (id, quantity) => {
    if (quantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item => item.id === id ? {
        ...item,
        quantity
      } : item));
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + item.harga_jual * item.quantity, 0);
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
      for (const item of cartItems) {
        if (item.stok_saat_ini < item.quantity) {
          toast({
            title: "Stok tidak mencukupi",
            description: `Stok ${item.nama} hanya tersisa ${item.stok_saat_ini}`,
            variant: "destructive"
          });
          return;
        }
      }
    } catch (error) {
      console.error('Pre-transaction validation error:', error);
      toast({
        title: "Error validasi",
        description: "Gagal memvalidasi stok produk",
        variant: "destructive"
      });
      return;
    }

    try {
      const totalAmount = getTotalAmount();
      
      const transactionData = {
        kasir_username: user?.username || 'unknown',
        kasir_name: user?.full_name || 'Unknown',
        total_amount: totalAmount,
        payment_method: selectedPaymentMethod,
        amount_paid: totalAmount,
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

      const result = await createTransaction.mutateAsync({
        transaction: transactionData,
        items: itemsData
      });

      setCartItems([]);
      setSelectedCustomer(null);
      setSelectedPaymentMethod('cash');

      toast({
        title: "Transaksi berhasil diselesaikan",
        description: `Transaksi ${result.transaction.transaction_number} berhasil disimpan`
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

    for (const item of cartItems) {
      if (item.stok_saat_ini < item.quantity) {
        toast({
          title: "Stok tidak mencukupi",
          description: `Stok ${item.nama} hanya tersisa ${item.stok_saat_ini}`,
          variant: "destructive"
        });
        return;
      }
    }

    setShowPayment(true);
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedCustomer(null);
    setSelectedPaymentMethod('cash');
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
    <NewProtectedRoute>
      <POSTransactionSync onTransactionComplete={handleTransactionSync}>
        <div className="min-h-screen bg-gray-50 flex">
          <POSSidebar 
            onQuickScan={() => setShowQuickScanner(true)} 
            onTransactionHistory={() => setShowTransactionHistory(true)} 
            onKonsinyasi={() => setShowKonsinyasi(true)} 
            onStockOpname={() => setShowStockOpname(true)} 
            onKasirKas={() => setShowKasirKas(true)} 
            onDailyReport={() => setShowDailyReport(true)}
            onKasUmum={() => setShowKasUmum(true)}
          />

          <div className="flex-1 transition-all duration-300 ml-16">
            <POSHeader
              totalAmount={getTotalAmount()}
              cartItemsCount={cartItems.length}
              userName={user?.username}
              userFullName={user?.full_name}
              showDashboardAccess={showDashboardAccess}
            />
            
            <div className="container mx-auto p-4 max-w-7xl">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <POSCustomerSelect 
                  selectedCustomer={selectedCustomer} 
                  onCustomerSelect={setSelectedCustomer} 
                />
                <POSPaymentMethod 
                  selectedMethod={selectedPaymentMethod} 
                  onMethodSelect={setSelectedPaymentMethod} 
                />
              </div>

              <POSMainActions
                onQuickSave={handleQuickSave}
                onRegularPayment={handleRegularPayment}
                cartItemsLength={cartItems.length}
                selectedPaymentMethod={selectedPaymentMethod}
                selectedCustomer={selectedCustomer}
                isProcessing={createTransaction.isPending}
              />

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
          </div>

          <POSModals
            showTransactionHistory={showTransactionHistory}
            setShowTransactionHistory={setShowTransactionHistory}
            showKonsinyasi={showKonsinyasi}
            setShowKonsinyasi={setShowKonsinyasi}
            showStockOpname={showStockOpname}
            setShowStockOpname={setShowStockOpname}
            showKasirKas={showKasirKas}
            setShowKasirKas={setShowKasirKas}
            showKasUmum={showKasUmum}
            setShowKasUmum={setShowKasUmum}
            showDailyReport={showDailyReport}
            setShowDailyReport={setShowDailyReport}
            userFullName={user?.full_name}
          />

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
                setSelectedPaymentMethod('cash');
                setShowPayment(false);
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }}
            />
          )}

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
        </div>
      </POSTransactionSync>
    </NewProtectedRoute>
  );
};

export default POSSystem;
