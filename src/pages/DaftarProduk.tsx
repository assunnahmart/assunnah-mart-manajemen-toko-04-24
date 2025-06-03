import { useState } from 'react';
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Package } from 'lucide-react';
import { useBarangKonsinyasi } from '@/hooks/useBarangKonsinyasi';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ProductExportImport from '@/components/products/ProductExportImport';
import ProductForm from '@/components/products/ProductForm';

const DaftarProduk = () => {
  const { data: products, isLoading, refetch } = useBarangKonsinyasi();
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

  const handleImportSuccess = () => {
    refetch();
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

  const getStockBadge = (current, minimal) => {
    if (current <= minimal) {
      return <Badge variant="destructive">Stok Rendah</Badge>;
    } else if (current <= minimal * 2) {
      return <Badge variant="outline" className="border-orange-500 text-orange-500">Perlu Restock</Badge>;
    }
    return <Badge variant="default" className="bg-green-500">Stok Aman</Badge>;
  };

  return (
    <NewProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <NewNavbar />
        
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Produk</h1>
                <p className="text-gray-600">Kelola data produk konsinyasi</p>
              </div>
              <div className="flex gap-2">
                <ProductExportImport 
                  products={filteredProducts} 
                  onImportSuccess={handleImportSuccess}
                />
                <Button onClick={handleAddNew} className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Tambah Produk
                </Button>
              </div>
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
                <span>Data Produk ({filteredProducts.length})</span>
                <div className="text-sm text-gray-500">
                  Total: {products?.length || 0} produk
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Memuat data produk...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk'}
                  </p>
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
                        <TableHead>Kategori</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead>Harga Beli</TableHead>
                        <TableHead>Harga Jual</TableHead>
                        <TableHead>Stok</TableHead>
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
                          <TableCell>{product.barcode || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {product.jenis_konsinyasi === 'harian' ? 'Harian' : 'Mingguan'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              {product.kategori_pembelian || 'retail'}
                            </Badge>
                          </TableCell>
                          <TableCell>{product.satuan}</TableCell>
                          <TableCell>{formatCurrency(product.harga_beli || 0)}</TableCell>
                          <TableCell>{formatCurrency(product.harga_jual || 0)}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                {product.stok_saat_ini} / {product.stok_minimal}
                              </div>
                              {getStockBadge(product.stok_saat_ini, product.stok_minimal)}
                            </div>
                          </TableCell>
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
                description: editingProduct ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan"
              });
            }}
          />
        )}
      </div>
    </NewProtectedRoute>
  );
};

export default DaftarProduk;
