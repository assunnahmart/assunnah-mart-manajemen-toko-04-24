
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, ShoppingCart, RefreshCw } from 'lucide-react';
import { useBarangKonsinyasi } from '@/hooks/useBarang';
import { useToast } from '@/hooks/use-toast';

interface POSProductListProps {
  onAddToCart?: (product: any) => void;
  showAddToCart?: boolean;
}

const POSProductList = ({ onAddToCart, showAddToCart = false }: POSProductListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: products, isLoading, refetch, error } = useBarangKonsinyasi();
  const { toast } = useToast();

  // Filter products based on search query and only show active products
  const filteredProducts = products?.filter(product =>
    product.status === 'aktif' && (
      product.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.supplier?.nama?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || [];

  const handleAddToCart = (product: any) => {
    if (product.stok_saat_ini <= 0) {
      toast({
        title: "Stok habis",
        description: `${product.nama} tidak tersedia`,
        variant: "destructive"
      });
      return;
    }

    if (onAddToCart) {
      onAddToCart({
        id: product.id,
        nama: product.nama,
        harga_jual: Number(product.harga_jual),
        stok_saat_ini: product.stok_saat_ini,
        satuan: product.satuan || 'pcs',
        barcode: product.barcode || undefined
      });
      toast({
        title: "Produk ditambahkan",
        description: `${product.nama} berhasil ditambahkan ke keranjang`
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Data diperbarui",
        description: "Data produk telah disinkronkan"
      });
    } catch (error) {
      toast({
        title: "Gagal memperbarui",
        description: "Terjadi kesalahan saat mengambil data",
        variant: "destructive"
      });
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Gagal memuat data produk</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Daftar Produk POS
          <Badge variant="outline" className="ml-auto bg-green-50 text-green-700">
            {filteredProducts.length} aktif
          </Badge>
        </CardTitle>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama produk, barcode, atau supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Memuat data produk...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>
              {searchQuery ? 'Tidak ada produk yang ditemukan' : 'Belum ada produk aktif'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Harga Jual</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Status</TableHead>
                  {showAddToCart && <TableHead>Aksi</TableHead>}
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
                    <TableCell className="font-semibold text-green-600">
                      {formatRupiah(product.harga_jual)}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        product.stok_saat_ini <= 0 
                          ? 'text-red-600' 
                          : product.stok_saat_ini <= (product.stok_minimal || 0)
                          ? 'text-orange-600'
                          : 'text-blue-600'
                      }`}>
                        {product.stok_saat_ini} {product.satuan || 'pcs'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        product.stok_saat_ini <= 0 
                          ? 'destructive' 
                          : product.stok_saat_ini <= (product.stok_minimal || 0)
                          ? 'secondary'
                          : 'default'
                      }>
                        {product.stok_saat_ini <= 0 
                          ? 'Habis' 
                          : product.stok_saat_ini <= (product.stok_minimal || 0)
                          ? 'Stok Rendah'
                          : 'Tersedia'
                        }
                      </Badge>
                    </TableCell>
                    {showAddToCart && (
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stok_saat_ini <= 0}
                          className="flex items-center gap-1"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          Tambah
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default POSProductList;
