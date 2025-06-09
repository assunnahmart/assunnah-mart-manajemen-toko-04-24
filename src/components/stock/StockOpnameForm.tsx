
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Scan } from 'lucide-react';
import { useStockData, useCreateStockOpname } from '@/hooks/useStockManagement';
import { useKasir } from '@/hooks/useKasir';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

interface StockOpnameFormProps {
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;
  stokFisik: string;
  setStokFisik: (value: string) => void;
  keterangan: string;
  setKeterangan: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onScanClick: () => void;
  onSubmit: () => void;
  quickScanMode: boolean;
}

const StockOpnameForm = ({
  selectedProduct,
  setSelectedProduct,
  stokFisik,
  setStokFisik,
  keterangan,
  setKeterangan,
  searchQuery,
  setSearchQuery,
  onScanClick,
  onSubmit,
  quickScanMode
}: StockOpnameFormProps) => {
  const { data: stockData, isLoading: isLoadingStock } = useStockData();
  const createStockOpname = useCreateStockOpname();

  const filteredProducts = stockData?.filter(item =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const selectedProductData = stockData?.find(p => p.id === selectedProduct);

  return (
    <div className="space-y-4">
      {!quickScanMode && (
        <>
          <div>
            <Label>Cari Produk</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama produk atau barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onScanClick}
                className="gap-1"
              >
                <Scan className="h-4 w-4" />
                Scan
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="product">Pilih Produk</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih produk..." />
              </SelectTrigger>
              <SelectContent>
                {isLoadingStock ? (
                  <SelectItem value="loading" disabled>
                    Memuat produk...
                  </SelectItem>
                ) : filteredProducts.length === 0 ? (
                  <SelectItem value="no-data" disabled>
                    {searchQuery ? 'Tidak ada produk ditemukan' : 'Tidak ada produk'}
                  </SelectItem>
                ) : (
                  filteredProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.nama} - Stok: {product.stok_saat_ini} {product.satuan}
                      {product.barcode && ` (${product.barcode})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      
      {selectedProductData && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm font-medium">
            {quickScanMode ? 'Produk dari Scan:' : 'Stok Sistem Saat Ini'}
          </p>
          <p className="text-lg font-bold text-blue-600">
            {selectedProductData.nama}
          </p>
          <p className="text-md text-blue-600">
            Stok: {selectedProductData.stok_saat_ini} {selectedProductData.satuan}
          </p>
          {selectedProductData.barcode && (
            <p className="text-xs text-gray-500">Barcode: {selectedProductData.barcode}</p>
          )}
        </div>
      )}
      
      <div>
        <Label htmlFor="stokFisik">Stok Fisik Aktual</Label>
        <Input
          id="stokFisik"
          type="number"
          value={stokFisik}
          onChange={(e) => setStokFisik(e.target.value)}
          min="0"
          placeholder="Masukkan stok fisik..."
          autoFocus={quickScanMode}
        />
      </div>
      
      {selectedProductData && stokFisik !== '' && !isNaN(Number(stokFisik)) && Number(stokFisik) !== selectedProductData.stok_saat_ini && (
        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-sm font-medium">Selisih Stok</p>
          <p className={`text-lg font-bold ${
            Number(stokFisik) > selectedProductData.stok_saat_ini ? 'text-green-600' : 'text-red-600'
          }`}>
            {Number(stokFisik) > selectedProductData.stok_saat_ini ? '+' : ''}
            {Number(stokFisik) - selectedProductData.stok_saat_ini} {selectedProductData.satuan}
          </p>
        </div>
      )}
      
      <div>
        <Label htmlFor="keterangan">Keterangan</Label>
        <Textarea
          id="keterangan"
          placeholder="Catatan stok opname..."
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
        />
      </div>
      
      <Button
        onClick={onSubmit}
        disabled={!selectedProduct || stokFisik === '' || createStockOpname.isPending}
        className="w-full"
      >
        {createStockOpname.isPending ? 'Menyimpan...' : 'Simpan'}
      </Button>
      
      {quickScanMode && (
        <div className="text-center">
          <p className="text-xs text-blue-600">
            Mode Quick Scan: Setelah simpan akan kembali ke scanner
          </p>
        </div>
      )}
    </div>
  );
};

export default StockOpnameForm;
