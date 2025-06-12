import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Package, ShoppingCart, X, Scan, Wallet, History, ClipboardList, FileText, LogOut, Camera, Save, CreditCard } from 'lucide-react';
import POSSidebar from '@/components/pos/POSSidebar';
import POSProductSearch from '@/components/pos/POSProductSearch';
import POSCart from '@/components/pos/POSCart';
import POSPayment from '@/components/pos/POSPayment';
import POSBarcodeScanner from '@/components/pos/POSBarcodeScanner';
import POSTransactionHistory from '@/components/pos/POSTransactionHistory';
import POSKasirTransactionHistory from '@/components/pos/POSKasirTransactionHistory';
import POSDailyReport from '@/components/pos/POSDailyReport';
import POSCustomerSelect from '@/components/pos/POSCustomerSelect';
import POSPaymentMethod from '@/components/pos/POSPaymentMethod';
import CameraBarcodeScanner from '@/components/stock/CameraBarcodeScanner';
import KonsinyasiHarianForm from '@/components/konsinyasi/KonsinyasiHarianForm';
import KonsinyasiHarianHistory from '@/components/konsinyasi/KonsinyasiHarianHistory';
import StockOpname from '@/components/stock/StockOpname';
import KasirKasForm from '@/components/kas/KasirKasForm';
import KasirKasHistory from '@/components/kas/KasirKasHistory';
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
  const {
    user,
    signOut
  } = useSimpleAuth();
  const {
    toast
  } = useToast();
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
  const createTransaction = useCreatePOSTransaction();
  const {
    syncStock,
    syncCustomerDebt,
    isSyncingStock,
    isSyncingDebt
  } = usePOSTransactionSync();

  // Check if user is authorized to see Dashboard button
  const showDashboardAccess = user?.username === 'Jamhur' || user?.username === 'Ginanjar';

  // Handle transaction synchronization
  const handleTransactionSync = async (transactionData: any, items: any[]) => {
    try {
      console.log('Starting transaction synchronization:', {
        transactionData,
        items
      });
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
      console.log('Saving transaction data:', {
        transactionData,
        itemsData
      });
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
  const handleQuickScanBarcodeScanned = (barcode: string) => {
    console.log('Quick scan barcode:', barcode);
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
  return <NewProtectedRoute>
      <POSTransactionSync onTransactionComplete={handleTransactionSync}>
        <div className="min-h-screen bg-gray-50 flex">
          {/* Sidebar - Always show */}
          <POSSidebar onQuickScan={() => setShowQuickScanner(true)} onTransactionHistory={() => setShowTransactionHistory(true)} onKonsinyasi={() => setShowKonsinyasi(true)} onStockOpname={() => setShowStockOpname(true)} onKasirKas={() => setShowKasirKas(true)} onDailyReport={() => setShowDailyReport(true)} />

          {/* Main Content */}
          <div className="flex-1 transition-all duration-300 ml-16">
            {/* Fixed Total Shopping Display */}
            <div className="sticky top-0 z-40 bg-gray-50 pb-4">
              <div className="container mx-auto p-4 max-w-7xl">
                <div className="bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-800 rounded-xl p-6 shadow-lg border-2 border-yellow-500">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-yellow-100 text-xl font-bold mb-2">Assunnah Mart</p>
                        <p className="font-bold text-white drop-shadow-md text-6xl">
                          Rp {getTotalAmount().toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-lg px-4 py-2 bg-red-500 text-white border-red-400 shadow-lg">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {cartItems.length} Item{cartItems.length !== 1 ? 's' : ''}
                      </Badge>
                      
                      <div className="text-yellow-100 text-xs mt-1">
                        <Badge variant="outline" className="border-yellow-300 text-yellow-200 bg-transparent mr-2">
                          Kasir: {user?.full_name}
                        </Badge>
                        <Badge variant="outline" className="border-yellow-300 text-yellow-200 bg-transparent">
                          {new Date().toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        </Badge>
                        {showDashboardAccess && <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm" className="ml-2 border-yellow-300 hover:bg-yellow-200 text-cyan-950">
                            Dashboard
                          </Button>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content Layout - Product Search and Cart */}
            <div className="container mx-auto p-4 max-w-7xl">
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
                        <Input placeholder="Cari nama produk atau scan barcode..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 border-red-200 focus:border-red-400" />
                      </div>
                      <Button variant="outline" onClick={() => setShowScanner(true)} className="shrink-0 border-red-300 text-red-700 hover:bg-red-50">
                        <Camera className="h-4 w-4 mr-2" />
                        Scan
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-120px)] overflow-hidden">
                    <POSProductSearch searchQuery={searchQuery} onAddToCart={addToCart} onProductAutoAdded={handleProductAutoAdded} enableEnterToAdd={true} />
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
                      <Button variant="outline" size="sm" onClick={clearCart} disabled={cartItems.length === 0} className="border-red-300 text-red-700 hover:bg-red-50">
                        Clear
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-80px)] overflow-hidden">
                    <POSCart items={cartItems} onUpdateQuantity={updateCartQuantity} />
                  </CardContent>
                </Card>
              </div>

              {/* Customer and Payment Method below Cart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Customer Selection */}
                <div>
                  <POSCustomerSelect selectedCustomer={selectedCustomer} onCustomerSelect={setSelectedCustomer} />
                </div>

                {/* Payment Method */}
                <div>
                  <POSPaymentMethod selectedMethod={selectedPaymentMethod} onMethodSelect={setSelectedPaymentMethod} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mb-6">
                <Card className="border-blue-200">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button onClick={handleQuickSave} disabled={cartItems.length === 0 || createTransaction.isPending} className="bg-green-600 hover:bg-green-700 shadow-lg" size="lg">
                        <Save className="h-4 w-4 mr-2" />
                        {createTransaction.isPending ? 'Menyimpan...' : 'Simpan ke Database (F2)'}
                      </Button>

                      <Button onClick={handleRegularPayment} disabled={cartItems.length === 0 || selectedPaymentMethod === 'credit' && !selectedCustomer} size="lg" className="bg-red-500 hover:bg-red-600 shadow-lg">
                        <CreditCard className="h-4 w-4 mr-2" />
                        {selectedPaymentMethod === 'credit' ? 'Proses Kredit' : 'Bayar & Cetak'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Warning messages */}
              {selectedPaymentMethod === 'credit' && !selectedCustomer && <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg mb-4">
                  <p className="text-orange-700 text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Pembayaran kredit memerlukan pemilihan pelanggan
                  </p>
                </div>}

              {(isSyncingStock || isSyncingDebt) && <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                  <p className="text-blue-700 text-sm flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                    Menyinkronisasi data transaksi dengan database...
                  </p>
                </div>}
            </div>
          </div>

          {/* Transaction History Modal */}
          {showTransactionHistory && user?.full_name && <POSKasirTransactionHistory isOpen={showTransactionHistory} onClose={() => setShowTransactionHistory(false)} kasirName={user.full_name} />}

          {/* Konsinyasi Harian Modal */}
          {showKonsinyasi && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Konsinyasi Harian
                  </h2>
                  <Button variant="ghost" onClick={() => setShowKonsinyasi(false)} className="h-8 w-8 p-0">
                    ×
                  </Button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  <div className="space-y-6">
                    <KonsinyasiHarianForm />
                    <KonsinyasiHarianHistory />
                  </div>
                </div>
              </div>
            </div>}

          {/* Stock Opname Modal */}
          {showStockOpname && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Scan className="h-5 w-4" />
                    Stok Opname dengan Scanner Barcode
                  </h2>
                  <Button variant="ghost" onClick={() => setShowStockOpname(false)} className="h-8 w-8 p-0">
                    ×
                  </Button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  <StockOpname />
                </div>
              </div>
            </div>}

          {/* Kas Kasir Modal */}
          {showKasirKas && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Kas Kasir
                  </h2>
                  <Button variant="ghost" onClick={() => setShowKasirKas(false)} className="h-8 w-8 p-0">
                    ×
                  </Button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  <div className="space-y-6">
                    <KasirKasForm />
                    <KasirKasHistory />
                  </div>
                </div>
              </div>
            </div>}

          {/* Daily Report Modal */}
          {showDailyReport && user?.full_name && <POSDailyReport isOpen={showDailyReport} onClose={() => setShowDailyReport(false)} kasirName={user.full_name} />}

          {/* Payment Modal */}
          {showPayment && <POSPayment cartItems={cartItems} totalAmount={getTotalAmount()} selectedCustomer={selectedCustomer} selectedPaymentMethod={selectedPaymentMethod} onClose={() => setShowPayment(false)} onSuccess={() => {
          setCartItems([]);
          setSelectedCustomer(null);
          setShowPayment(false);
        }} />}

          {/* Regular Barcode Scanner Modal */}
          <POSBarcodeScanner isOpen={showScanner} onScan={handleBarcodeScanned} onClose={() => setShowScanner(false)} />

          {/* Quick Scanner Modal - Direct Camera Access */}
          <CameraBarcodeScanner isOpen={showQuickScanner} onScan={handleQuickScanBarcodeScanned} onClose={() => setShowQuickScanner(false)} />
        </div>
      </POSTransactionSync>
    </NewProtectedRoute>;
};
export default POSSystem;