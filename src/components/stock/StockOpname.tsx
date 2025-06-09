
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Plus, Search, Scan, FileSpreadsheet } from 'lucide-react';
import { useStockData, useStockOpname, useCreateStockOpname } from '@/hooks/useStockManagement';
import { useKasir } from '@/hooks/useKasir';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import CameraBarcodeScanner from './CameraBarcodeScanner';
import StockOpnameExportImport from './StockOpnameExportImport';

const StockOpname = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [stokFisik, setStokFisik] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  
  const { data: stockData, isLoading: isLoadingStock } = useStockData();
  const { data: opnameHistory } = useStockOpname();
  const { data: kasirData } = useKasir();
  const { user } = useSimpleAuth();
  const createStockOpname = useCreateStockOpname();
  const { toast } = useToast();

  const filteredProducts = stockData?.filter(item =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const selectedProductData = stockData?.find(p => p.id === selectedProduct);
  
  // Find kasir by matching username or full_name
  const userKasir = kasirData?.find(k => 
    k.nama === user?.full_name || 
    k.nama === user?.username ||
    k.nama?.toLowerCase() === user?.full_name?.toLowerCase() ||
    k.nama?.toLowerCase() === user?.username?.toLowerCase()
  );

  console.log('Debug info:', {
    user: user,
    kasirData: kasirData,
    userKasir: userKasir,
    selectedProduct: selectedProduct,
    stokFisik: stokFisik
  });

  const handleBarcodeScanned = (barcode: string) => {
    console.log('Barcode scanned:', barcode);
    
    const product = stockData?.find(p => p.barcode === barcode);
    if (product) {
      setSelectedProduct(product.id);
      setSearchQuery(barcode);
      setShowScanner(false);
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
      setShowScanner(false);
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

      // Reset form
      setSelectedProduct('');
      setStokFisik('');
      setKeterangan('');
      setSearchQuery('');
      setShowDialog(false);
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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stok Opname</h2>
          <p className="text-gray-600">Input dan monitoring stok fisik produk dengan scanner barcode</p>
          {user && (
            <p className="text-sm text-blue-600 mt-1">
              Login sebagai: {user.full_name} ({user.username})
            </p>
          )}
          {userKasir && (
            <p className="text-sm text-green-600">
              Data kasir: {userKasir.nama} (ID: {userKasir.id})
            </p>
          )}
          {!userKasir && kasirData?.length && (
            <p className="text-sm text-red-600">
              Peringatan: User tidak ditemukan dalam data kasir. Kasir tersedia: {kasirData.map(k => k.nama).join(', ')}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showDialog} onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Input Manual
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Input Stok Opname Manual</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
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
                      onClick={() => setShowScanner(true)}
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
                
                {selectedProductData && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium">Stok Sistem Saat Ini</p>
                    <p className="text-lg font-bold text-blue-600">
                      {selectedProductData.stok_saat_ini} {selectedProductData.satuan}
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
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleSubmitOpname}
                    disabled={!selectedProduct || stokFisik === '' || createStockOpname.isPending}
                    className="flex-1"
                  >
                    {createStockOpname.isPending ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs for different input methods */}
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
          <Card>
            <CardHeader>
              <CardTitle>Input Manual Stok Opname</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Gunakan tombol "Input Manual" di atas untuk melakukan stok opname satu per satu produk.
                Anda dapat menggunakan scanner barcode untuk mempercepat proses.
              </p>
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

      {/* Opname History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Riwayat Stok Opname
          </CardTitle>
        </CardHeader>
        <CardContent>
          {opnameHistory?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Belum ada riwayat stok opname
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Stok Sistem</TableHead>
                    <TableHead>Stok Fisik</TableHead>
                    <TableHead>Selisih</TableHead>
                    <TableHead>PIC</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opnameHistory?.map((opname) => (
                    <TableRow key={opname.id}>
                      <TableCell>
                        {new Date(opname.tanggal_opname).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {opname.barang_konsinyasi?.nama}
                      </TableCell>
                      <TableCell>
                        {opname.stok_sistem} {opname.barang_konsinyasi?.satuan}
                      </TableCell>
                      <TableCell>
                        {opname.stok_fisik} {opname.barang_konsinyasi?.satuan}
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          opname.selisih > 0 ? 'text-green-600' : 
                          opname.selisih < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {opname.selisih > 0 ? '+' : ''}{opname.selisih} {opname.barang_konsinyasi?.satuan}
                        </span>
                      </TableCell>
                      <TableCell>{opname.kasir?.nama}</TableCell>
                      <TableCell>
                        <Badge variant={opname.status === 'approved' ? 'default' : 'secondary'}>
                          {opname.status === 'approved' ? 'Approved' : opname.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{opname.keterangan || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Camera Barcode Scanner */}
      <CameraBarcodeScanner
        isOpen={showScanner}
        onScan={handleBarcodeScanned}
        onClose={() => setShowScanner(false)}
      />
    </div>
  );
};

export default StockOpname;
