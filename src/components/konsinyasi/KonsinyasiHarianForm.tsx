
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Package } from 'lucide-react';
import { useCreateKonsinyasiHarian } from '@/hooks/useKonsinyasiHarian';
import { useBarangKonsinyasi } from '@/hooks/useBarangKonsinyasi';
import { useSupplier } from '@/hooks/useSupplier';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

const KonsinyasiHarianForm = () => {
  const [supplierId, setSupplierId] = useState('');
  const [productId, setProductId] = useState('');
  const [jumlahTitipan, setJumlahTitipan] = useState(0);
  const [jumlahTerjualSistem, setJumlahTerjualSistem] = useState(0);
  const [jumlahRealTerjual, setJumlahRealTerjual] = useState(0);
  const [keterangan, setKeterangan] = useState('');

  const { data: products } = useBarangKonsinyasi();
  const { data: suppliers } = useSupplier();
  const { user } = useSimpleAuth();
  const createKonsinyasi = useCreateKonsinyasiHarian();
  const { toast } = useToast();

  const selectedProduct = products?.find(p => p.id === productId);
  const selectedSupplier = suppliers?.find(s => s.id === supplierId);

  const sisaStok = jumlahTitipan - jumlahRealTerjual;
  const selisihStok = jumlahRealTerjual - jumlahTerjualSistem;
  const totalPembayaran = selectedProduct ? (selectedProduct.harga_beli || 0) * jumlahRealTerjual : 0;

  const handleSubmit = async () => {
    if (!supplierId || !productId || jumlahTitipan <= 0) {
      toast({
        title: "Data tidak lengkap",
        description: "Pilih supplier, produk, dan masukkan jumlah titipan",
        variant: "destructive"
      });
      return;
    }

    try {
      await createKonsinyasi.mutateAsync({
        supplier_id: supplierId,
        supplier_name: selectedSupplier?.nama || '',
        product_id: productId,
        product_name: selectedProduct?.nama || '',
        jumlah_titipan: jumlahTitipan,
        jumlah_terjual_sistem: jumlahTerjualSistem,
        jumlah_real_terjual: jumlahRealTerjual,
        sisa_stok: sisaStok,
        selisih_stok: selisihStok,
        harga_beli: selectedProduct?.harga_beli || 0,
        total_pembayaran: totalPembayaran,
        kasir_name: user?.full_name || '',
        keterangan
      });

      toast({
        title: "Konsinyasi harian berhasil",
        description: "Data konsinyasi harian berhasil disimpan"
      });

      // Reset form
      setSupplierId('');
      setProductId('');
      setJumlahTitipan(0);
      setJumlahTerjualSistem(0);
      setJumlahRealTerjual(0);
      setKeterangan('');
    } catch (error) {
      toast({
        title: "Gagal menyimpan konsinyasi",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Input Konsinyasi Harian
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih supplier..." />
              </SelectTrigger>
              <SelectContent>
                {suppliers?.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="product">Produk</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih produk..." />
              </SelectTrigger>
              <SelectContent>
                {products?.filter(p => p.jenis_konsinyasi === 'konsinyasi').map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.nama} - Rp {(product.harga_beli || 0).toLocaleString('id-ID')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="jumlah_titipan">Jumlah Titipan</Label>
            <Input
              id="jumlah_titipan"
              type="number"
              value={jumlahTitipan}
              onChange={(e) => setJumlahTitipan(Number(e.target.value))}
              placeholder="Masukkan jumlah titipan..."
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="jumlah_sistem">Jumlah Terjual (Sistem)</Label>
            <Input
              id="jumlah_sistem"
              type="number"
              value={jumlahTerjualSistem}
              onChange={(e) => setJumlahTerjualSistem(Number(e.target.value))}
              placeholder="Jumlah terjual di sistem..."
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="jumlah_real">Jumlah Real Terjual</Label>
            <Input
              id="jumlah_real"
              type="number"
              value={jumlahRealTerjual}
              onChange={(e) => setJumlahRealTerjual(Number(e.target.value))}
              placeholder="Jumlah real terjual..."
              min="0"
            />
          </div>

          <div>
            <Label>Sisa Stok</Label>
            <Input
              value={sisaStok}
              readOnly
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label>Selisih Stok</Label>
            <Input
              value={selisihStok}
              readOnly
              className={`bg-gray-100 ${selisihStok !== 0 ? 'text-red-600' : ''}`}
            />
          </div>

          <div>
            <Label>Total Pembayaran</Label>
            <Input
              value={`Rp ${totalPembayaran.toLocaleString('id-ID')}`}
              readOnly
              className="bg-gray-100 font-medium"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              placeholder="Keterangan tambahan..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={createKonsinyasi.isPending}
          className="w-full"
        >
          {createKonsinyasi.isPending ? 'Menyimpan...' : 'Simpan Konsinyasi'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default KonsinyasiHarianForm;
