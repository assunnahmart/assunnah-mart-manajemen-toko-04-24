
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CameraBarcodeScanner from './CameraBarcodeScanner';
import StockOpnameExportImport from './StockOpnameExportImport';
import StockOpnameHeader from './StockOpnameHeader';
import StockOpnameForm from './StockOpnameForm';
import StockOpnameHistory from './StockOpnameHistory';
import StockOpnameInstructions from './StockOpnameInstructions';
import { useStockOpnameLogic } from './StockOpnameLogic';

const StockOpname = () => {
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

  return (
    <div className="space-y-6">
      <StockOpnameHeader 
        onQuickScan={startQuickScan}
        onManualInput={startManualInput}
      />

      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Input Manual
          </TabsTrigger>
          <TabsTrigger value="excel" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Export/Import Excel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <StockOpnameInstructions />
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
