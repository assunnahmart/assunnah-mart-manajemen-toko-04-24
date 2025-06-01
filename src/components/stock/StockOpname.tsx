
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
import { ClipboardList, Plus, Search, CheckCircle, Scan } from 'lucide-react';
import { useStockData, useStockOpname, useCreateStockOpname } from '@/hooks/useStockManagement';
import { useKasir } from '@/hooks/useKasir';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import POSBarcodeScanner from '@/components/pos/POSBarcodeScanner';

const StockOpname = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [stokFisik, setStokFisik] = useState(0);
  const [keterangan, setKeterangan] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: stockData } = useStockData();
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
  const userKasir = kasirData?.find(k => k.nama === user?.full_name);

  const handleBarcodeScanned = (barcode: string) => {
    const product = stockData?.find(p => p.barcode === barcode);
    if (product) {
      setSelectedProduct(product.id);
      setSearchQuery(barcode);
      toast({
        title: "Produk ditemukan",
        description: `${product.nama} berhasil dipilih`
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
    if (!selectedProduct || !userKasir) {
      toast({
        title: "Data tidak lengkap",
        description: "Pilih produk dan pastikan data kasir tersedia",
        variant: "destructive"
      });
      return;
    }

    try {
      await createStockOpname.mutateAsync({
        barang_id: selectedProduct,
        stok_fisik: stokFisik,
        kasir_id: userKasir.id,
        keterangan
      });

      toast({
        title: "Stok Opname berhasil",
        description: `Stok ${selectedProductData?.nama} telah diperbarui`
      });

      // Reset form
      setSelectedProduct('');
      setStokFisik(0);
      setKeterangan('');
      setShowDialog(false);
    } catch (error) {
      toast({
        title: "Gagal melakukan stok opname",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stok Opname</h2>
          <p className="text-gray-600">Input dan monitoring stok fisik produk</p>
        </div>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Input Stok Opname
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Input Stok Opname</DialogTitle>
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
                  <POSBarcodeScanner onScan={handleBarcodeScanned}>
                    <Button variant="outline" size="sm">
                      <Scan className="h-4 w-4" />
                    </Button>
                  </POSBarcodeScanner>
                </div>
              </div>
              
              <div>
                <Label htmlFor="product">Pilih Produk</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih produk..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.nama} - Stok: {product.stok_saat_ini} {product.satuan}
                        {product.barcode && ` (${product.barcode})`}
                      </SelectItem>
                    ))}
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
                  onChange={(e) => setStokFisik(Number(e.target.value))}
                  min="0"
                  placeholder="Masukkan stok fisik..."
                />
              </div>
              
              {selectedProductData && stokFisik !== selectedProductData.stok_saat_ini && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">Selisih Stok</p>
                  <p className={`text-lg font-bold ${
                    stokFisik > selectedProductData.stok_saat_ini ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stokFisik > selectedProductData.stok_saat_ini ? '+' : ''}
                    {stokFisik - selectedProductData.stok_saat_ini} {selectedProductData.satuan}
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
                  disabled={!selectedProduct || createStockOpname.isPending}
                  className="flex-1"
                >
                  {createStockOpname.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
    </div>
  );
};

export default StockOpname;
