
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, Package, RefreshCw, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBarangKonsinyasi } from '@/hooks/useBarang';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ProductDataManagement = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();
  const { data: products, refetch } = useBarangKonsinyasi();

  const handleDeleteAllProducts = async () => {
    setIsDeleting(true);
    
    try {
      // Delete related data first to avoid foreign key constraints
      const { error: mutasiError } = await supabase
        .from('mutasi_stok')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (mutasiError) throw mutasiError;

      const { error: opnameError } = await supabase
        .from('stok_opname')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (opnameError) throw opnameError;

      const { error: konsinyasiDetailError } = await supabase
        .from('konsinyasi_detail')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (konsinyasiDetailError) throw konsinyasiDetailError;

      const { error: konsinyasiHarianError } = await supabase
        .from('konsinyasi_harian')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (konsinyasiHarianError) throw konsinyasiHarianError;

      const { error: transactionItemsError } = await supabase
        .from('pos_transaction_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (transactionItemsError) throw transactionItemsError;

      const { error: detailTransaksiError } = await supabase
        .from('detail_transaksi_penjualan')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (detailTransaksiError) throw detailTransaksiError;

      const { error: detailPembelianError } = await supabase
        .from('detail_transaksi_pembelian')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (detailPembelianError) throw detailPembelianError;

      // Finally delete the products
      const { error: productsError } = await supabase
        .from('barang_konsinyasi')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (productsError) throw productsError;
      
      toast({
        title: "Berhasil",
        description: "Semua data produk berhasil dihapus",
      });
      
      setShowConfirmDialog(false);
      setConfirmText('');
      refetch();
      
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: `Gagal menghapus data produk: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmTextValid = () => {
    return confirmText === 'HAPUS SEMUA PRODUK';
  };

  const exportProducts = () => {
    if (!products || products.length === 0) return;
    
    const csvContent = [
      ['Nama Produk', 'Barcode', 'Jenis', 'Satuan', 'Harga Beli', 'Harga Jual', 'Stok Saat Ini', 'Stok Minimal', 'Status'],
      ...products.map(product => [
        product.nama,
        product.barcode || '',
        product.jenis_konsinyasi,
        product.satuan,
        product.harga_beli || 0,
        product.harga_jual || 0,
        product.stok_saat_ini,
        product.stok_minimal,
        product.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-produk-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Manajemen Data Produk</h3>
          <p className="text-gray-600">
            Kelola dan hapus data produk konsinyasi
          </p>
        </div>
        <Badge variant="destructive" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Admin Only
        </Badge>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Peringatan:</strong> Menghapus data produk akan menghapus semua data terkait 
          termasuk transaksi, stok opname, dan riwayat mutasi stok. Operasi ini tidak dapat dibatalkan.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Statistik Produk</span>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                <Package className="h-3 w-3 mr-1" />
                {products?.length || 0} produk
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Total Produk:</strong> {products?.length || 0}</p>
              <p><strong>Produk Aktif:</strong> {products?.filter(p => p.status === 'aktif').length || 0}</p>
              <p><strong>Produk Nonaktif:</strong> {products?.filter(p => p.status === 'nonaktif').length || 0}</p>
              <p><strong>Stok Rendah:</strong> {products?.filter(p => p.stok_saat_ini <= p.stok_minimal).length || 0}</p>
            </div>
            
            <Button
              variant="outline"
              onClick={exportProducts}
              disabled={!products || products.length === 0}
              className="w-full flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data Produk
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Hapus Semua Data Produk</span>
              <Badge variant="destructive">
                Berbahaya
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Hapus semua data produk beserta riwayat transaksi, stok opname, dan mutasi stok terkait.
            </p>
            
            <div className="text-xs text-gray-500">
              <strong>Data yang akan dihapus:</strong>
              <ul className="list-disc list-inside mt-1">
                <li>Semua produk konsinyasi</li>
                <li>Riwayat mutasi stok</li>
                <li>Data stok opname</li>
                <li>Detail transaksi terkait</li>
              </ul>
            </div>
            
            <Button
              variant="destructive"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isDeleting || !products || products.length === 0}
              className="w-full flex items-center gap-2"
            >
              {isDeleting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isDeleting ? 'Menghapus...' : 'Hapus Semua Produk'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Konfirmasi Penghapusan Data Produk
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Anda akan menghapus <strong>SEMUA DATA PRODUK</strong> dan data terkait. 
                Operasi ini tidak dapat dibatalkan!
              </AlertDescription>
            </Alert>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Ketik "HAPUS SEMUA PRODUK" untuk konfirmasi:
              </Label>
              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="mt-1"
                placeholder="HAPUS SEMUA PRODUK"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmText('');
                }}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAllProducts}
                disabled={!isConfirmTextValid() || isDeleting}
                className="flex-1"
              >
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDataManagement;
