
import { useState } from 'react';
import NewProtectedRoute from '@/components/NewProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Package, Plus, RefreshCw } from 'lucide-react';
import { useBarangWithSupplier } from '@/hooks/useSupplier';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ProductForm from '@/components/products/ProductForm';
import ProductExportImport from '@/components/products/ProductExportImport';

const DataProduk = () => {
  const { data: products, isLoading, refetch } = useBarangWithSupplier();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const filteredProducts = products?.filter(product =>
    product.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.supplier?.nama?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Data berhasil diperbarui",
      description: "Data produk telah disinkronkan dengan POS system"
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    return status === 'aktif' ? (
      <Badge variant="default" className="bg-green-500">Aktif</Badge>
    ) : (
      <Badge variant="secondary">Nonaktif</Badge>
    );
  };

  const getJenisDisplay = (jenis) => {
    switch (jenis) {
      case 'harian':
        return 'Harian';
      case 'mingguan':
        return 'Mingguan';
      case 'pembelian':
        return 'Pembelian';
      default:
        return jenis;
    }
  };

  return (
    <NewProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-lg font-semibold">Data Produk</h1>
              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
              </div>
            </div>
            
            <div className="flex-1 p-6">
              <div className="container mx-auto space-y-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Produk</h1>
                      <p className="text-gray-600">Kelola data produk dan inventori (Terintegrasi dengan POS System)</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddNew} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Produk
                      </Button>
                    </div>
                  </div>

                  {/* Integration Status */}
                  <Card className="bg-blue-50 border-blue-200 mb-4">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-blue-900">Integrasi POS System Aktif</h3>
                          <p className="text-sm text-blue-600">
                            Data produk tersinkronisasi real-time dengan POS System. Stok otomatis terupdate saat ada transaksi penjualan.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Export/Import Controls */}
                  <div className="mb-4">
                    <ProductExportImport 
                      products={products || []} 
                      onImportSuccess={() => {
                        refetch();
                        toast({
                          title: "Import berhasil",
                          description: "Data produk berhasil diimpor dan tersinkronisasi dengan POS"
                        });
                      }}
                    />
                  </div>

                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari nama produk, barcode, supplier..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Data Produk POS System ({filteredProducts.length})</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <Package className="h-3 w-3 mr-1" />
                          Tersinkronisasi dengan POS
                        </Badge>
                        <div className="text-sm text-gray-500">
                          Total: {products?.length || 0} produk
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Memuat data produk dari POS system...</p>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          {searchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk'}
                        </p>
                        {!searchQuery && (
                          <Button onClick={handleAddNew} className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Produk Pertama
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nama Produk</TableHead>
                              <TableHead>Supplier</TableHead>
                              <TableHead>Barcode</TableHead>
                              <TableHead>Jenis Barang</TableHead>
                              <TableHead>Satuan</TableHead>
                              <TableHead>Harga Beli</TableHead>
                              <TableHead>Harga Jual</TableHead>
                              <TableHead>Stok Saat Ini</TableHead>
                              <TableHead>Stok Minimal</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredProducts.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.nama}</TableCell>
                                <TableCell>
                                  {product.supplier?.nama ? (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                      {product.supplier.nama}
                                    </Badge>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                    {product.barcode || '-'}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {getJenisDisplay(product.jenis_konsinyasi)}
                                  </Badge>
                                </TableCell>
                                <TableCell>{product.satuan}</TableCell>
                                <TableCell>{formatCurrency(product.harga_beli || 0)}</TableCell>
                                <TableCell className="font-medium text-green-600">
                                  {formatCurrency(product.harga_jual || 0)}
                                </TableCell>
                                <TableCell>
                                  <span className={`font-medium ${
                                    product.stok_saat_ini <= product.stok_minimal 
                                      ? 'text-red-600' 
                                      : 'text-green-600'
                                  }`}>
                                    {product.stok_saat_ini}
                                  </span>
                                  {product.stok_saat_ini <= product.stok_minimal && (
                                    <Badge variant="destructive" className="ml-2 text-xs">
                                      Stok Rendah
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>{product.stok_minimal}</TableCell>
                                <TableCell>{getStatusBadge(product.status)}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEdit(product)}
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
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </SidebarInset>
        </div>

        {showForm && (
          <ProductForm
            product={editingProduct}
            onClose={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
            onSuccess={() => {
              setShowForm(false);
              setEditingProduct(null);
              refetch();
              toast({
                title: "Berhasil",
                description: editingProduct ? "Produk berhasil diperbarui dan tersinkronisasi dengan POS" : "Produk berhasil ditambahkan ke POS system"
              });
            }}
          />
        )}
      </SidebarProvider>
    </NewProtectedRoute>
  );
};

export default DataProduk;
