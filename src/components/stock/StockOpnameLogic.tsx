
import { useState } from 'react';
import { useStockData, useCreateStockOpname } from '@/hooks/useStockManagement';
import { useKasir } from '@/hooks/useKasir';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

export const useStockOpnameLogic = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [stokFisik, setStokFisik] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [quickScanMode, setQuickScanMode] = useState(false);
  
  const { data: stockData } = useStockData();
  const { data: kasirData } = useKasir();
  const { user } = useSimpleAuth();
  const createStockOpname = useCreateStockOpname();
  const { toast } = useToast();

  const selectedProductData = stockData?.find(p => p.id === selectedProduct);
  
  const userKasir = kasirData?.find(k => 
    k.nama === user?.full_name || 
    k.nama === user?.username ||
    k.nama?.toLowerCase() === user?.full_name?.toLowerCase() ||
    k.nama?.toLowerCase() === user?.username?.toLowerCase()
  );

  const handleBarcodeScanned = (barcode: string) => {
    console.log('Barcode scanned:', barcode);
    
    const product = stockData?.find(p => p.barcode === barcode);
    if (product) {
      setSelectedProduct(product.id);
      setSearchQuery(barcode);
      setStokFisik(product.stok_saat_ini.toString());
      setShowScanner(false);
      setShowDialog(true);
      setQuickScanMode(true);
      toast({
        title: "Produk ditemukan",
        description: `${product.nama} berhasil dipilih dari barcode scan`
      });
    } else {
      toast({
        title: "Produk tidak ditemukan",
        description: `Barcode ${barcode} tidak ditemukan di database`,
        variant: "destructive"
      });
    }
  };

  const handleSubmitOpname = async () => {
    console.log('Submitting opname with data:', {
      selectedProduct,
      stokFisik,
      user,
      userKasir,
      kasirData
    });

    if (!selectedProduct) {
      toast({
        title: "Produk belum dipilih",
        description: "Silakan pilih produk terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    if (!userKasir && !kasirData?.length) {
      toast({
        title: "Data kasir tidak tersedia",
        description: "Tidak ada data kasir di sistem. Hubungi administrator.",
        variant: "destructive"
      });
      return;
    }

    if (!userKasir) {
      toast({
        title: "Kasir tidak ditemukan",
        description: `User ${user?.full_name || user?.username} tidak ditemukan dalam data kasir. Hubungi administrator untuk menambahkan data kasir.`,
        variant: "destructive"
      });
      return;
    }

    if (stokFisik === '' || isNaN(Number(stokFisik))) {
      toast({
        title: "Stok fisik tidak valid",
        description: "Masukkan angka yang valid untuk stok fisik",
        variant: "destructive"
      });
      return;
    }

    try {
      await createStockOpname.mutateAsync({
        barang_id: selectedProduct,
        stok_fisik: Number(stokFisik),
        kasir_id: userKasir.id,
        keterangan
      });

      toast({
        title: "Stok Opname berhasil",
        description: `Stok ${selectedProductData?.nama} telah diperbarui ke ${stokFisik} ${selectedProductData?.satuan}`
      });

      resetForm();
      
      if (quickScanMode) {
        setTimeout(() => {
          setShowScanner(true);
        }, 500);
      }
    } catch (error) {
      console.error('Error creating stock opname:', error);
      toast({
        title: "Gagal melakukan stok opname",
        description: error.message || "Terjadi kesalahan saat menyimpan data",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setSelectedProduct('');
    setStokFisik('');
    setKeterangan('');
    setSearchQuery('');
    setQuickScanMode(false);
    setShowDialog(false);
  };

  const startQuickScan = () => {
    setQuickScanMode(true);
    setShowScanner(true);
  };

  const startManualInput = () => {
    setShowDialog(true);
  };

  return {
    // State
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
    selectedProductData,
    userKasir,
    
    // Actions
    handleBarcodeScanned,
    handleSubmitOpname,
    resetForm,
    startQuickScan,
    startManualInput
  };
};
