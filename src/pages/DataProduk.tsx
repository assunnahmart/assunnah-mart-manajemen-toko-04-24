
import { useState } from 'react';
import NewProtectedRoute from '@/components/NewProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Package, Plus, RefreshCw, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAllBarangKonsinyasi } from '@/hooks/useBarang';
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import ProductForm from '@/components/products/ProductForm';
import ProductExportImport from '@/components/products/ProductExportImport';
import ProductDataManagement from '@/components/admin/ProductDataManagement';

const ITEMS_PER_PAGE = 50; // Show 50 items per page for better performance

const DataProduk = () => {
  const { data: productsResult, isLoading, refetch, error } = useAllBarangKonsinyasi();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  console.log('DataProduk state:', { productsResult, isLoading, error });

  const products = productsResult?.data || [];
  const totalCount = productsResult?.count || 0;

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.supplier?.nama?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Calculate comprehensive statistics for all POS products
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'aktif').length;
  const inactiveProducts = products.filter(p => p.status === 'nonaktif').length;
  const lowStockProducts = products.filter(p => p.stok_saat_ini <= (p.stok_minimal || 0)).length;
  const outOfStockProducts = products.filter(p => p.stok_saat_ini === 0).length;

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Data berhasil diperbarui",
        description: `Berhasil memuat ${totalCount.toLocaleString('id-ID')} produk dari database`
      });
    } catch (error) {
      console.error('Refresh error:', error);
      toast({
        title: "Gagal memperbarui data",
        description: error.message || "Terjadi kesalahan saat mengambil data produk",
        variant: "destructive"
      });
    }
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

  const getStockBadge = (stokSaatIni, stokMinimal) => {
    if (stokSaatIni === 0) {
      return <Badge variant="destructive">Habis</Badge>;
    } else if (stokSaatIni <= (stokMinimal || 0)) {
      return <Badge variant="outline" className="text-orange-600 border-orange-300">Stok Rendah</Badge>;
    } else {
      return <Badge variant="outline" className="text-green-600 border-green-300">Tersedia</Badge>;
    }
  };

  const getJenisDisplay = (jenis) => {
    switch (jenis) {
      case 'harian':
        return 'Harian';
      case 'mingguan':
        return 'Mingguan';
      case 'pembelian':
        return 'Pembelian';
      case 'lainnya':
        return 'Lainnya';
      default:
        return jenis || 'Tidak Diketahui';
    }
  };

  // Show error message if there's an error
  if (error) {
    console.error('DataProduk error:', error);
  }

  return (
    <NewProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-lg font-semibold">Data Produk POS System</h1>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDataManagement(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Data Produk
                </Button>
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
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">Semua Data Produk POS System</h1>
                      <p className="text-gray-600">
                        Kelola semua data produk yang tersedia di POS System (Aktif & Nonaktif) - 
                        Total: {totalCount.toLocaleString('id-ID')} produk
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddNew} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Produk Baru
                      </Button>
                    </div>
                  </div>

                  {/* Enhanced Product Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Produk</p>
                            <p className="text-2xl font-bold text-blue-600">{totalProducts.toLocaleString('id-ID')}</p>
                          </div>
                          <Package className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Produk Aktif</p>
                            <p className="text-2xl font-bold text-green-600">{activeProducts.toLocaleString('id-ID')}</p>
                          </div>
                          <Badge className="bg-green-500 text-white px-2 py-1">Aktif</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Produk Nonaktif</p>
                            <p className="text-2xl font-bold text-gray-600">{inactiveProducts.toLocaleString('id-ID')}</p>
                          </div>
                          <Badge variant="secondary">Nonaktif</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Stok Rendah</p>
                            <p className="text-2xl font-bold text-orange-600">{lowStockProducts.toLocaleString('id-ID')}</p>
                          </div>
                          <Badge variant="outline" className="text-orange-600 border-orange-300">Alert</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Stok Habis</p>
                            <p className="text-2xl font-bold text-red-600">{outOfStockProducts.toLocaleString('id-ID')}</p>
                          </div>
                          <Badge variant="destructive">Habis</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Integration Status */}
                  <Card className="bg-blue-50 border-blue-200 mb-4">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-blue-900">Sinkronisasi POS System Aktif</h3>
                          <p className="text-sm text-blue-600">
                            Menampilkan semua {totalCount.toLocaleString('id-ID')} data produk dari POS System secara real-time. 
                            Menggunakan pagination untuk performa optimal.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Show error message if there's an error */}
                  {error && (
                    <Card className="bg-red-50 border-red-200 mb-4">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-red-600" />
                          <div>
                            <h3 className="font-medium text-red-900">Error Loading Data</h3>
                            <p className="text-sm text-red-600">
                              {error.message || 'Terjadi kesalahan saat mengambil data produk'}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleRefresh}
                              className="mt-2"
                            >
                              Coba Lagi
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Export/Import Controls */}
                  <div className="mb-4">
                    <ProductExportImport 
                      products={products} 
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
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Semua Data Produk POS System</span>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">
                          Menampilkan: {currentProducts.length.toLocaleString('id-ID')} dari {filteredProducts.length.toLocaleString('id-ID')} produk
                          {searchQuery && ` (total tersedia: ${totalProducts.toLocaleString('id-ID')})`}
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          <Package className="h-3 w-3 mr-1" />
                          Halaman {currentPage} dari {totalPages}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Memuat semua data produk dari POS System...</p>
                      </div>
                    ) : currentProducts.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          {searchQuery ? `Tidak ditemukan produk dengan pencarian "${searchQuery}"` : 'Belum ada produk di POS System'}
                        </p>
                        {!searchQuery && (
                          <Button onClick={handleAddNew} className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Produk Pertama
                          </Button>
                        )}
                      </div>
                    ) : (
                      <>
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
                                <TableHead>Stok Minimal</TableHead>
                                <TableHead>Status Stok</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Aksi</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentProducts.map((product) => (
                                <TableRow key={product.id} className={product.status === 'nonaktif' ? 'opacity-60' : ''}>
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
                                  <TableCell>
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                      {product.kategori_pembelian || 'retail'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{product.satuan}</TableCell>
                                  <TableCell>{formatCurrency(product.harga_beli || 0)}</TableCell>
                                  <TableCell className="font-medium text-green-600">
                                    {formatCurrency(product.harga_jual || 0)}
                                  </TableCell>
                                  <TableCell>
                                    <span className={`font-medium ${
                                      product.stok_saat_ini === 0
                                        ? 'text-red-600' 
                                        : product.stok_saat_ini <= (product.stok_minimal || 0)
                                        ? 'text-orange-600'
                                        : 'text-green-600'
                                    }`}>
                                      {product.stok_saat_ini}
                                    </span>
                                  </TableCell>
                                  <TableCell>{product.stok_minimal}</TableCell>
                                  <TableCell>
                                    {getStockBadge(product.stok_saat_ini, product.stok_minimal)}
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="mt-6">
                            <Pagination>
                              <PaginationContent>
                                <PaginationItem>
                                  <PaginationPrevious 
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                  />
                                </PaginationItem>
                                
                                {/* Page numbers */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                  if (pageNum <= totalPages) {
                                    return (
                                      <PaginationItem key={pageNum}>
                                        <PaginationLink
                                          onClick={() => setCurrentPage(pageNum)}
                                          isActive={currentPage === pageNum}
                                          className="cursor-pointer"
                                        >
                                          {pageNum}
                                        </PaginationLink>
                                      </PaginationItem>
                                    );
                                  }
                                  return null;
                                })}
                                
                                {totalPages > 5 && currentPage < totalPages - 2 && (
                                  <PaginationItem>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                )}
                                
                                <PaginationItem>
                                  <PaginationNext 
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                            
                            <div className="text-center mt-2 text-sm text-gray-500">
                              Halaman {currentPage} dari {totalPages} 
                              ({filteredProducts.length.toLocaleString('id-ID')} produk{searchQuery ? ' yang cocok' : ''})
                            </div>
                          </div>
                        )}
                      </>
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

        {showDataManagement && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Manajemen Data Produk</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDataManagement(false)}
                >
                  Tutup
                </Button>
              </div>
              <ProductDataManagement />
            </div>
          </div>
        )}
      </SidebarProvider>
    </NewProtectedRoute>
  );
};

export default DataProduk;
