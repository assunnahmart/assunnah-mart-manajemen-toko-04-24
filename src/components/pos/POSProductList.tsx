
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, Edit, Trash2, Plus, ShoppingCart } from 'lucide-react';
import { useBarang } from '@/hooks/useBarang';
import { useToast } from '@/hooks/use-toast';

interface POSProductListProps {
  onAddToCart?: (product: any) => void;
  showAddToCart?: boolean;
}

const POSProductList = ({ onAddToCart, showAddToCart = false }: POSProductListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: products, isLoading } = useBarang();
  const { toast } = useToast();

  // Filter products based on search query
  const filteredProducts = products?.filter(product =>
    product.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.kategori?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleAddToCart = (product: any) => {
    if (onAddToCart) {
      onAddToCart(product);
      toast({
        title: "Produk ditambahkan",
        description: `${product.nama} berhasil ditambahkan ke keranjang`
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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Daftar Produk
          <Badge variant="outline" className="ml-auto">
            {filteredProducts.length} produk
          </Badge>
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari nama produk, barcode, atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8">Loading produk...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'Tidak ada produk yang ditemukan' : 'Belum ada data produk'}
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Kategori</TableHead>
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
                    <TableCell>{product.barcode || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.kategori || 'Umum'}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatRupiah(product.harga_jual)}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        product.stok_saat_ini <= (product.stok_minimum || 0) 
                          ? 'text-red-600' 
                          : 'text-blue-600'
                      }`}>
                        {product.stok_saat_ini} {product.satuan || 'pcs'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        product.stok_saat_ini <= 0 
                          ? 'destructive' 
                          : product.stok_saat_ini <= (product.stok_minimum || 0)
                          ? 'secondary'
                          : 'default'
                      }>
                        {product.stok_saat_ini <= 0 
                          ? 'Habis' 
                          : product.stok_saat_ini <= (product.stok_minimum || 0)
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
