
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Scan, Plus, Package, Info } from 'lucide-react';
import { useStockData } from '@/hooks/useStockManagement';
import { useCreateNewStokOpname } from '@/hooks/useCreateNewStokOpname';
import { useKasir } from '@/hooks/useKasir';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

const NewStokOpnameInput = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [stokFisik, setStokFisik] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: stockData, isLoading: isLoadingStock } = useStockData();
  const { data: kasirData } = useKasir();
  const { user } = useSimpleAuth();
  const createStockOpname = useCreateNewStokOpname();
  const { toast } = useToast();

  const filteredProducts = stockData?.filter(item =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const selectedProductData = stockData?.find(p => p.id === selectedProduct);

  // Get kasir ID from authenticated user
  const getKasirId = () => {
    if (user?.role === 'kasir' && user?.kasir_id) {
      return user.kasir_id;
    }
    // For admin users, try to find their kasir record
    const adminKasir = kasirData?.find(k => k.nama === user?.full_name || k.email === user?.username);
    return adminKasir?.id;
  };

  const handleSubmit = async () => {
    const kasirId = getKasirId();
    
    console.log('Form validation:', {
      selectedProduct,
      stokFisik,
      kasirId,
      user: user?.full_name,
      kasirData: kasirData?.length
    });
    
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Mohon pilih produk terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    if (!stokFisik || stokFisik === '') {
      toast({
        title: "Error", 
        description: "Mohon masukkan stok fisik",
        variant: "destructive"
      });
      return;
    }

    if (!kasirId) {
      toast({
        title: "Error",
        description: "Data kasir tidak ditemukan. Mohon login ulang atau hubungi admin.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createStockOpname.mutateAsync({
        barang_id: selectedProduct,
        stok_fisik: parseInt(stokFisik),
        kasir_id: kasirId,
        keterangan
      });

      toast({
        title: "Berhasil",
        description: "Data stok opname berhasil disimpan"
      });

      // Reset form
      setSelectedProduct('');
      setStokFisik('');
      setKeterangan('');
      setSearchQuery('');
    } catch (error) {
      console.error('Error saving stock opname:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data stok opname: " + (error as Error).message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>New Stok Input:</strong> Sistem akan menghitung selisih berdasarkan stok sistem tetap dikurangi total semua input real stok dari semua pengguna untuk barang yang sama.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Input Stok Opname Baru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <Button variant="outline" size="sm">
                  <Scan className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="product">Pilih Produk *</Label>
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

            {selectedProductData && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="font-medium text-blue-900">{selectedProductData.nama}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Stok Sistem Saat Ini:</span>
                      <Badge variant="outline" className="text-blue-800 border-blue-300">
                        {selectedProductData.stok_saat_ini} {selectedProductData.satuan}
                      </Badge>
                    </div>
                    {selectedProductData.barcode && (
                      <p className="text-xs text-blue-600">Barcode: {selectedProductData.barcode}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div>
              <Label htmlFor="stokFisik">Stok Real/Fisik *</Label>
              <Input
                id="stokFisik"
                type="number"
                value={stokFisik}
                onChange={(e) => setStokFisik(e.target.value)}
                min="0"
                placeholder="Masukkan jumlah stok fisik..."
              />
            </div>

            {selectedProductData && stokFisik !== '' && !isNaN(Number(stokFisik)) && (
              <Card className={`${
                Number(stokFisik) === selectedProductData.stok_saat_ini 
                  ? 'bg-green-50 border-green-200' 
                  : Number(stokFisik) > selectedProductData.stok_saat_ini
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-red-50 border-red-200'
              }`}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Preview Selisih:</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Stok Fisik - Stok Sistem:</span>
                      <Badge variant={
                        Number(stokFisik) === selectedProductData.stok_saat_ini 
                          ? "default" 
                          : "secondary"
                      }>
                        {Number(stokFisik) - selectedProductData.stok_saat_ini} {selectedProductData.satuan}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      {Number(stokFisik) === selectedProductData.stok_saat_ini 
                        ? 'Stok seimbang - tidak ada selisih'
                        : Number(stokFisik) > selectedProductData.stok_saat_ini
                          ? 'Stok real lebih banyak dari sistem'
                          : 'Stok real kurang dari sistem'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div>
              <Label htmlFor="keterangan">Keterangan/Catatan</Label>
              <Textarea
                id="keterangan"
                placeholder="Catatan tambahan untuk stok opname ini..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!selectedProduct || stokFisik === '' || createStockOpname.isPending}
              className="w-full"
            >
              {createStockOpname.isPending ? 'Menyimpan...' : 'Simpan Stok Opname'}
            </Button>
            
            {/* Debug info untuk development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-100 rounded">
                <p>Debug Info:</p>
                <p>User: {user?.full_name} ({user?.role})</p>
                <p>Kasir ID: {getKasirId() || 'Not found'}</p>
                <p>Selected Product: {selectedProduct || 'None'}</p>
                <p>Stok Fisik: {stokFisik || 'Empty'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informasi Sistem New Stok
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Cara Kerja Sistem:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Stok sistem tetap tidak berubah meski ada multiple input</li>
                  <li>Total real stok = jumlah semua input dari semua pengguna</li>
                  <li>Selisih = Stok fisik - Stok sistem</li>
                  <li>Sistem mendukung multiple user input untuk barang yang sama</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-1">Keunggulan Sistem:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Akurasi perhitungan tinggi</li>
                  <li>• Support multi-user input</li>
                  <li>• Real-time calculation</li>
                  <li>• Audit trail lengkap</li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1">Contoh Perhitungan:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>Stok Sistem: 100 pcs</p>
                  <p>User A input: 30 pcs</p>
                  <p>User B input: 40 pcs</p>
                  <p>Total Real: 70 pcs</p>
                  <p className="font-medium">Selisih: 70 - 100 = -30 pcs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewStokOpnameInput;
