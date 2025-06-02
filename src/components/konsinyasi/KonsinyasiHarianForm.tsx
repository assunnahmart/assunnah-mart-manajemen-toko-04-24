
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, RefreshCw, Wallet } from 'lucide-react';
import { 
  useCreateKonsinyasiHarian, 
  useKonsinyasiSuppliers, 
  useKonsinyasiProductsBySupplier,
  usePOSSalesForProduct 
} from '@/hooks/useKonsinyasiHarian';
import { useKonsinyasiPayment } from '@/hooks/useKonsinyasiPayment';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

const KonsinyasiHarianForm = () => {
  const [supplierId, setSupplierId] = useState('');
  const [productId, setProductId] = useState('');
  const [jumlahTitipan, setJumlahTitipan] = useState(0);
  const [jumlahTerjualSistem, setJumlahTerjualSistem] = useState(0);
  const [jumlahRealTerjual, setJumlahRealTerjual] = useState(0);
  const [keterangan, setKeterangan] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [processPayment, setProcessPayment] = useState(false);

  const { data: suppliers } = useKonsinyasiSuppliers();
  const { data: products } = useKonsinyasiProductsBySupplier(supplierId);
  const { data: posSales, refetch: refetchPOSSales } = usePOSSalesForProduct(productId, selectedDate);
  const { user } = useSimpleAuth();
  const createKonsinyasi = useCreateKonsinyasiHarian();
  const processPaymentMutation = useKonsinyasiPayment();
  const { toast } = useToast();

  const selectedProduct = products?.find(p => p.id === productId);
  const selectedSupplier = suppliers?.find(s => s.id === supplierId);

  // Auto-sync POS sales data when product or date changes
  useEffect(() => {
    if (posSales?.totalSold !== undefined) {
      setJumlahTerjualSistem(posSales.totalSold);
    }
  }, [posSales]);

  const sisaStok = jumlahTitipan - jumlahRealTerjual;
  const selisihStok = jumlahRealTerjual - jumlahTerjualSistem;
  const totalPembayaran = selectedProduct ? (selectedProduct.harga_beli || 0) * jumlahRealTerjual : 0;

  const handleSyncPOSSales = () => {
    refetchPOSSales();
    toast({
      title: "Data disinkronkan",
      description: "Data penjualan POS telah diperbarui"
    });
  };

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
      // Create consignment record
      const konsinyasiData = {
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
        tanggal_konsinyasi: selectedDate,
        kasir_name: user?.full_name || '',
        keterangan
      };

      await createKonsinyasi.mutateAsync(konsinyasiData);

      // Process payment if checked
      if (processPayment && totalPembayaran > 0) {
        await processPaymentMutation.mutateAsync({
          konsinyasiData: {
            ...konsinyasiData,
            id: Date.now().toString() // Temporary ID for reference
          },
          kasirId: user?.kasir_id || '',
          kasirName: user?.full_name || ''
        });
      }

      toast({
        title: "Konsinyasi harian berhasil",
        description: processPayment 
          ? `Data konsinyasi dan pembayaran Rp ${totalPembayaran.toLocaleString('id-ID')} berhasil disimpan`
          : "Data konsinyasi harian berhasil disimpan"
      });

      // Reset form
      setSupplierId('');
      setProductId('');
      setJumlahTitipan(0);
      setJumlahTerjualSistem(0);
      setJumlahRealTerjual(0);
      setKeterangan('');
      setProcessPayment(false);
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
            <Label htmlFor="date">Tanggal Konsinyasi</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="supplier">Supplier (Produk Konsinyasi Harian)</Label>
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
            <Label htmlFor="product">Produk Konsinyasi Harian</Label>
            <Select value={productId} onValueChange={setProductId} disabled={!supplierId}>
              <SelectTrigger>
                <SelectValue placeholder={supplierId ? "Pilih produk..." : "Pilih supplier dulu"} />
              </SelectTrigger>
              <SelectContent>
                {products?.map((product) => (
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
            <Label htmlFor="jumlah_sistem">Jumlah Terjual (Sistem POS)</Label>
            <div className="flex gap-2">
              <Input
                id="jumlah_sistem"
                type="number"
                value={jumlahTerjualSistem}
                onChange={(e) => setJumlahTerjualSistem(Number(e.target.value))}
                placeholder="Otomatis dari POS..."
                min="0"
                className="bg-blue-50"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSyncPOSSales}
                disabled={!productId}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-blue-600 mt-1">Data otomatis dari penjualan POS tanggal {selectedDate}</p>
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
            <Label>Selisih Stok (Real - Sistem)</Label>
            <Input
              value={selisihStok}
              readOnly
              className={`bg-gray-100 ${selisihStok !== 0 ? 'text-red-600 font-medium' : ''}`}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Total Pembayaran ke Supplier</Label>
            <Input
              value={`Rp ${totalPembayaran.toLocaleString('id-ID')}`}
              readOnly
              className="bg-green-50 font-bold text-green-700 text-lg"
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

          <div className="md:col-span-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="process_payment"
                checked={processPayment}
                onCheckedChange={setProcessPayment}
              />
              <Label htmlFor="process_payment" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Proses pembayaran sekaligus (kas keluar otomatis ke kas umum)
              </Label>
            </div>
            {processPayment && totalPembayaran > 0 && (
              <p className="text-sm text-orange-600 mt-2">
                Akan mencatat kas keluar Rp {totalPembayaran.toLocaleString('id-ID')} dan sinkronisasi ke kas umum
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={createKonsinyasi.isPending || processPaymentMutation.isPending}
          className="w-full"
        >
          {createKonsinyasi.isPending || processPaymentMutation.isPending 
            ? 'Menyimpan...' 
            : processPayment 
              ? 'Simpan Konsinyasi & Proses Pembayaran'
              : 'Simpan Konsinyasi'
          }
        </Button>
      </CardContent>
    </Card>
  );
};

export default KonsinyasiHarianForm;
