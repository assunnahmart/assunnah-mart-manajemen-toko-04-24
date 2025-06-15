
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, FileSpreadsheet, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CameraBarcodeScanner from './CameraBarcodeScanner';
import StockOpnameExportImport from './StockOpnameExportImport';
import StockOpnameHeader from './StockOpnameHeader';
import StockOpnameForm from './StockOpnameForm';
import StockOpnameHistory from './StockOpnameHistory';
import StockOpnameInstructions from './StockOpnameInstructions';
import StockOpnameAdditionalInput from './StockOpnameAdditionalInput';
import { useStockOpnameLogic } from './StockOpnameLogic';
import { useStockData } from '@/hooks/useStockManagement';
import { useStockOpnameRecap } from '@/hooks/useStockOpnameRecap';
import { useState } from 'react';

const StockOpname = () => {
  const [selectedProductForAdditional, setSelectedProductForAdditional] = useState<string>('');
  const [showAdditionalDialog, setShowAdditionalDialog] = useState(false);
  
  const {
    selectedProduct,
    setSelectedProduct,
    stokFisik,
    setStokFisik,
    keterangan,
    setKeterangan,
    showDialog,
    setShowDialog,
    searchQuery,
    setSearchQuery,
    showScanner,
    setShowScanner,
    quickScanMode,
    handleBarcodeScanned,
    handleSubmitOpname,
    resetForm,
    startQuickScan,
    startManualInput
  } = useStockOpnameLogic();

  const { data: stockData } = useStockData();
  const { data: recapData } = useStockOpnameRecap();

  const handleAdditionalStockSuccess = () => {
    setShowAdditionalDialog(false);
    setSelectedProductForAdditional('');
  };

  const getProductRecapData = (productId: string) => {
    return recapData?.find(item => item.barang_id === productId);
  };

  return (
    <div className="space-y-6">
      <StockOpnameHeader 
        onQuickScan={startQuickScan}
        onManualInput={startManualInput}
      />

      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Input Manual
          </TabsTrigger>
          <TabsTrigger value="additional" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Stok Real
          </TabsTrigger>
          <TabsTrigger value="excel" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Export/Import Excel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <StockOpnameInstructions />
        </TabsContent>

        <TabsContent value="additional">
          <Card>
            <CardHeader>
              <CardTitle>Tambah Stok Real untuk Produk yang Sudah Ada Input</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Pilih produk yang sudah memiliki input stok opname untuk menambah stok real tanpa mengubah stok sistem.
                </p>
                
                {recapData && recapData.length > 0 ? (
                  <div className="grid gap-4">
                    {recapData.map((item) => {
                      const productData = stockData?.find(p => p.id === item.barang_id);
                      return (
                        <Card key={item.barang_id} className="cursor-pointer hover:bg-gray-50" 
                              onClick={() => {
                                setSelectedProductForAdditional(item.barang_id);
                                setShowAdditionalDialog(true);
                              }}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{item.nama_barang}</p>
                                <p className="text-sm text-gray-600">
                                  Stok Sistem: {item.stok_sistem} • Stok Real: {item.real_stok_total} • 
                                  Selisih: {item.selisih_stok} {productData?.satuan}
                                </p>
                              </div>
                              <Plus className="h-5 w-5 text-blue-500" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Belum ada produk dengan input stok opname. Silakan input stok opname terlebih dahulu.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="excel">
          <Card>
            <CardHeader>
              <CardTitle>Export/Import Excel</CardTitle>
            </CardHeader>
            <CardContent>
              <StockOpnameExportImport />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StockOpnameHistory />

      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogTrigger asChild>
          <div style={{ display: 'none' }} />
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {quickScanMode ? 'Stok Opname - Quick Scan' : 'Input Stok Opname Manual'}
            </DialogTitle>
          </DialogHeader>
          
          <StockOpnameForm
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            stokFisik={stokFisik}
            setStokFisik={setStokFisik}
            keterangan={keterangan}
            setKeterangan={setKeterangan}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onScanClick={() => setShowScanner(true)}
            onSubmit={handleSubmitOpname}
            quickScanMode={quickScanMode}
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowDialog(false);
                if (quickScanMode) {
                  resetForm();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Additional Stock Dialog */}
      <Dialog open={showAdditionalDialog} onOpenChange={(open) => {
        setShowAdditionalDialog(open);
        if (!open) {
          setSelectedProductForAdditional('');
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Stok Real</DialogTitle>
          </DialogHeader>
          
          {selectedProductForAdditional && (
            (() => {
              const productRecap = getProductRecapData(selectedProductForAdditional);
              const productData = stockData?.find(p => p.id === selectedProductForAdditional);
              
              if (!productRecap || !productData) return null;
              
              return (
                <StockOpnameAdditionalInput
                  productId={selectedProductForAdditional}
                  productName={productRecap.nama_barang}
                  currentSystemStock={productRecap.stok_sistem}
                  currentRealStock={productRecap.real_stok_total}
                  unit={productData.satuan}
                  onSuccess={handleAdditionalStockSuccess}
                />
              );
            })()
          )}
        </DialogContent>
      </Dialog>

      <CameraBarcodeScanner
        isOpen={showScanner}
        onScan={handleBarcodeScanned}
        onClose={() => {
          setShowScanner(false);
          if (quickScanMode) {
            resetForm();
          }
        }}
      />
    </div>
  );
};

export default StockOpname;
