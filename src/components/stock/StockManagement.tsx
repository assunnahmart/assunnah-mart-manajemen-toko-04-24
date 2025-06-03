
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Package, AlertTriangle, Search, Edit, RefreshCw } from 'lucide-react';
import { useStockData, useLowStockProducts, useUpdateStock } from '@/hooks/useStockManagement';
import { useToast } from '@/hooks/use-toast';

const StockManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newStock, setNewStock] = useState(0);
  const [keterangan, setKeterangan] = useState('');
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  
  const { data: stockData, isLoading } = useStockData();
  const { data: lowStockProducts } = useLowStockProducts();
  const updateStock = useUpdateStock();
  const { toast } = useToast();

  const filteredStock = stockData?.filter(item =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;
    
    try {
      await updateStock.mutateAsync({
        barang_id: selectedProduct.id,
        stok_baru: newStock,
        keterangan
      });
      
      toast({
        title: "Stok berhasil diperbarui",
        description: `Stok ${selectedProduct.nama} telah diperbarui`
      });
      
      setShowUpdateDialog(false);
      setSelectedProduct(null);
      setNewStock(0);
      setKeterangan('');
    } catch (error) {
      toast({
        title: "Gagal memperbarui stok",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openUpdateDialog = (product) => {
    setSelectedProduct(product);
    setNewStock(product.stok_saat_ini);
    setShowUpdateDialog(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all-stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-stock" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Semua Stok
          </TabsTrigger>
          <TabsTrigger value="low-stock" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Stok Rendah ({lowStockProducts?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-stock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Manajemen Stok Produk</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Tersinkronisasi dengan POS & Pembelian
                </Badge>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari produk atau barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Produk</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Stok Saat Ini</TableHead>
                      <TableHead>Stok Minimal</TableHead>
                      <TableHead>Harga Beli</TableHead>
                      <TableHead>Harga Jual</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStock.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.nama}</TableCell>
                        <TableCell>{item.barcode || '-'}</TableCell>
                        <TableCell>{item.supplier?.nama || '-'}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            item.stok_saat_ini <= item.stok_minimal 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {item.stok_saat_ini} {item.satuan}
                          </span>
                        </TableCell>
                        <TableCell>{item.stok_minimal} {item.satuan}</TableCell>
                        <TableCell>Rp {item.harga_beli?.toLocaleString('id-ID') || 0}</TableCell>
                        <TableCell>Rp {item.harga_jual?.toLocaleString('id-ID') || 0}</TableCell>
                        <TableCell>
                          <Badge variant={
                            item.stok_saat_ini <= item.stok_minimal ? 'destructive' : 'default'
                          }>
                            {item.stok_saat_ini <= item.stok_minimal ? 'Stok Rendah' : 'Normal'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUpdateDialog(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Produk dengan Stok Rendah
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockProducts?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Tidak ada produk dengan stok rendah
                </p>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                      <div>
                        <h3 className="font-medium">{item.nama}</h3>
                        <p className="text-sm text-gray-600">
                          Supplier: {item.supplier?.nama || '-'}
                        </p>
                        <p className="text-sm">
                          <span className="text-red-600 font-medium">
                            Stok: {item.stok_saat_ini} {item.satuan}
                          </span>
                          <span className="text-gray-500 ml-2">
                            (Minimal: {item.stok_minimal} {item.satuan})
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Stok Rendah</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUpdateDialog(item)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Update Stok
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Update Stock Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stok Produk</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <Label>Nama Produk</Label>
                <Input value={selectedProduct.nama} disabled />
              </div>
              
              <div>
                <Label>Stok Saat Ini</Label>
                <Input value={`${selectedProduct.stok_saat_ini} ${selectedProduct.satuan}`} disabled />
              </div>
              
              <div>
                <Label htmlFor="newStock">Stok Baru</Label>
                <Input
                  id="newStock"
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  placeholder="Alasan perubahan stok..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUpdateDialog(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleUpdateStock}
                  disabled={updateStock.isPending}
                  className="flex-1"
                >
                  {updateStock.isPending ? 'Menyimpan...' : 'Update Stok'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockManagement;
