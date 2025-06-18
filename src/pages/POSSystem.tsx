
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import POSSidebar from '@/components/pos/POSSidebar';
import POSHeader from '@/components/pos/POSHeader';
import POSCartManager from '@/components/pos/POSCartManager';
import POSPaymentManager from '@/components/pos/POSPaymentManager';
import POSModalManager from '@/components/pos/POSModalManager';
import POSReceiptPrint from '@/components/pos/POSReceiptPrint';
import { useCreatePOSTransaction } from '@/hooks/usePOSTransactions';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import NewProtectedRoute from '@/components/NewProtectedRoute';
import POSTransactionSync from '@/components/pos/POSTransactionSync';
import { usePOSTransactionSync } from '@/hooks/usePOSTransactionSync';
import POSProductList from '@/components/pos/POSProductList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [showKonsinyasi, setShowKonsinyasi] = useState(false);
  const [showKasirKas, setShowKasirKas] = useState(false);
  const [showStockOpname, setShowStockOpname] = useState(false);
  const [showKasUmum, setShowKasUmum] = useState(false);
  const [showQuickScanner, setShowQuickScanner] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
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

  const handlePaymentSuccess = () => {
    setCartItems([]);
    setSelectedCustomer(null);
    setSelectedPaymentMethod('cash');
  };

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
    setShowProductList(false); // Close product list after adding
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
            onShowProductList={() => setShowProductList(true)}
          />

          <div className="flex-1 transition-all duration-300 ml-64">
            <POSHeader
              totalAmount={getTotalAmount()}
              cartItemsCount={cartItems.length}
              userName={user?.username}
              userFullName={user?.full_name}
              showDashboardAccess={showDashboardAccess}
            />
            
            <div className="container mx-auto p-4 max-w-7xl">
              <POSCartManager
                cartItems={cartItems}
                setCartItems={setCartItems}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />

              <POSPaymentManager
                cartItems={cartItems}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                selectedPaymentMethod={selectedPaymentMethod}
                setSelectedPaymentMethod={setSelectedPaymentMethod}
                onQuickSave={handleQuickSave}
                isProcessing={createTransaction.isPending}
                getTotalAmount={getTotalAmount}
                onPaymentSuccess={handlePaymentSuccess}
              />

              {/* Print Preview & Receipt Section */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    Print Preview & Struk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <POSReceiptPrint
                      cartItems={cartItems}
                      totalAmount={getTotalAmount()}
                      transactionNumber={`TRX-${Date.now()}`}
                      amountPaid={selectedPaymentMethod === 'cash' ? getTotalAmount() : undefined}
                      changeAmount={selectedPaymentMethod === 'cash' ? 0 : undefined}
                    />
                  </div>
                  {cartItems.length === 0 && (
                    <p className="text-center text-gray-500 text-sm mt-2">
                      Tambahkan produk ke keranjang untuk melihat preview struk
                    </p>
                  )}
                </CardContent>
              </Card>

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

          <POSModalManager
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
            showQuickScanner={showQuickScanner}
            setShowQuickScanner={setShowQuickScanner}
            setSearchQuery={setSearchQuery}
            userFullName={user?.full_name}
          />

          {/* Product List Modal */}
          {showProductList && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold">Daftar Produk - POS System</h2>
                  <button
                    onClick={() => setShowProductList(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 p-4">
                  <POSProductList 
                    onAddToCart={addToCart}
                    showAddToCart={true}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </POSTransactionSync>
    </NewProtectedRoute>
  );
};

export default POSSystem;
