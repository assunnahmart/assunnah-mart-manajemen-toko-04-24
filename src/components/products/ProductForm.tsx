
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateBarangKonsinyasi, useUpdateBarangKonsinyasi } from '@/hooks/useBarangKonsinyasi';
import { useSupplier } from '@/hooks/useSupplier';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id?: string;
  nama: string;
  barcode?: string;
  jenis_konsinyasi: string;
  satuan: string;
  harga_beli?: number;
  harga_jual?: number;
  stok_saat_ini: number;
  stok_minimal: number;
  status: string;
  supplier_id?: string;
  kategori_pembelian?: string;
}

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductForm = ({ product, onClose, onSuccess }: ProductFormProps) => {
  const { toast } = useToast();
  const createProduct = useCreateBarangKonsinyasi();
  const updateProduct = useUpdateBarangKonsinyasi();
  const { data: suppliers } = useSupplier();
  
  const [formData, setFormData] = useState({
    nama: product?.nama || '',
    barcode: product?.barcode || '',
    jenis_konsinyasi: product?.jenis_konsinyasi || 'harian',
    satuan: product?.satuan || 'pcs',
    harga_beli: product?.harga_beli || 0,
    harga_jual: product?.harga_jual || 0,
    stok_saat_ini: product?.stok_saat_ini || 0,
    stok_minimal: product?.stok_minimal || 0,
    status: product?.status || 'aktif',
    supplier_id: product?.supplier_id || 'none',
    kategori_pembelian: product?.kategori_pembelian || 'retail'
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        supplier_id: formData.supplier_id === 'none' ? null : formData.supplier_id
      };

      if (product?.id) {
        // Update existing product
        await updateProduct.mutateAsync({
          id: product.id,
          updates: submitData
        });
      } else {
        // Create new product
        await createProduct.mutateAsync(submitData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Gagal menyimpan",
        description: `Terjadi kesalahan: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Produk' : 'Tambah Produk Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nama">Nama Produk *</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => handleInputChange('nama', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="supplier_id">Supplier</Label>
            <Select
              value={formData.supplier_id}
              onValueChange={(value) => handleInputChange('supplier_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tanpa Supplier</SelectItem>
                {suppliers?.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => handleInputChange('barcode', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jenis_konsinyasi">Jenis Barang</Label>
              <Select
                value={formData.jenis_konsinyasi}
                onValueChange={(value) => handleInputChange('jenis_konsinyasi', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harian">Harian</SelectItem>
                  <SelectItem value="mingguan">Mingguan</SelectItem>
                  <SelectItem value="pembelian">Pembelian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="kategori_pembelian">Kategori Pembelian</Label>
              <Select
                value={formData.kategori_pembelian}
                onValueChange={(value) => handleInputChange('kategori_pembelian', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="grosir">Grosir</SelectItem>
                  <SelectItem value="khusus">Khusus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="satuan">Satuan</Label>
            <Input
              id="satuan"
              value={formData.satuan}
              onChange={(e) => handleInputChange('satuan', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="harga_beli">Harga Beli</Label>
              <Input
                id="harga_beli"
                type="number"
                value={formData.harga_beli}
                onChange={(e) => handleInputChange('harga_beli', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="harga_jual">Harga Jual</Label>
              <Input
                id="harga_jual"
                type="number"
                value={formData.harga_jual}
                onChange={(e) => handleInputChange('harga_jual', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stok_saat_ini">Stok Saat Ini</Label>
              <Input
                id="stok_saat_ini"
                type="number"
                value={formData.stok_saat_ini}
                onChange={(e) => handleInputChange('stok_saat_ini', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="stok_minimal">Stok Minimal</Label>
              <Input
                id="stok_minimal"
                type="number"
                value={formData.stok_minimal}
                onChange={(e) => handleInputChange('stok_minimal', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.nama}
              className="flex-1"
            >
              {loading ? 'Menyimpan...' : (product ? 'Update' : 'Simpan')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
