
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Package, Save, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useKonsinyasiSuppliers, useKonsinyasiProductsBySupplier, usePOSSalesForProduct, useCreateKonsinyasiMingguan } from '@/hooks/useKonsinyasiMingguan';

const KonsinyasiMingguanForm = () => {
  const { data: suppliers } = useKonsinyasiSuppliers();
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [weekStartDate, setWeekStartDate] = useState('');
  const [weekEndDate, setWeekEndDate] = useState('');
  const [jumlahTitipan, setJumlahTitipan] = useState('');
  const [jumlahRealTerjual, setJumlahRealTerjual] = useState('');
  const [sisaStok, setSisaStok] = useState('');

  const { data: products } = useKonsinyasiProductsBySupplier(selectedSupplierId);
  const { data: salesData } = usePOSSalesForProduct(selectedProductId, weekStartDate);
  const createMutation = useCreateKonsinyasiMingguan();
  const { toast } = useToast();

  // Auto calculate end date when start date is selected (7 days later)
  const handleStartDateChange = (date: string) => {
    setWeekStartDate(date);
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // 7 days total (including start date)
      setWeekEndDate(endDate.toISOString().split('T')[0]);
    }
  };

  // Calculate derived values
  const jumlahTerjualSistem = salesData?.totalSold || 0;
  const selisihStok = jumlahTerjualSistem - (parseInt(jumlahRealTerjual) || 0);
  
  // Get selected product details for price calculation
  const selectedProduct = products?.find(p => p.id === selectedProductId);
  const totalPembayaran = selectedProduct ? 
    (parseInt(jumlahRealTerjual) || 0) * selectedProduct.harga_jual : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSupplierId || !selectedProductId || !weekStartDate || !weekEndDate || !jumlahTitipan) {
      toast({
        title: "Data tidak lengkap",
        description: "Harap lengkapi semua field yang diperlukan",
        variant: "destructive"
      });
      return;
    }

    try {
      const konsinyasiData = {
        supplier_id: selectedSupplierId,
        product_id: selectedProductId,
        supplier_name: suppliers?.find(s => s.id === selectedSupplierId)?.nama || '',
        product_name: selectedProduct?.nama || '',
        minggu_mulai: weekStartDate,
        minggu_selesai: weekEndDate,
        jumlah_titipan: parseInt(jumlahTitipan),
        jumlah_terjual_sistem: jumlahTerjualSistem,
        jumlah_real_terjual: parseInt(jumlahRealTerjual) || 0,
        sisa_stok: parseInt(sisaStok) || 0,
        selisih_stok: selisihStok,
        total_pembayaran: totalPembayaran,
        status: 'completed'
      };

      await createMutation.mutateAsync(konsinyasiData);
      
      // Reset form
      setSelectedSupplierId('');
      setSelectedProductId('');
      setWeekStartDate('');
      setWeekEndDate('');
      setJumlahTitipan('');
      setJumlahRealTerjual('');
      setSisaStok('');

      toast({
        title: "Berhasil",
        description: "Data konsinyasi mingguan berhasil disimpan"
      });
    } catch (error) {
      console.error('Error saving konsinyasi mingguan:', error);
      toast({
        title: "Gagal menyimpan",
        description: error.message || "Terjadi kesalahan saat menyimpan data",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Input Konsinyasi Mingguan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih supplier" />
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

            <div className="space-y-2">
              <Label htmlFor="product">Produk</Label>
              <Select 
                value={selectedProductId} 
                onValueChange={setSelectedProductId}
                disabled={!selectedSupplierId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekStart">Minggu Mulai</Label>
              <Input
                id="weekStart"
                type="date"
                value={weekStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekEnd">Minggu Selesai</Label>
              <Input
                id="weekEnd"
                type="date"
                value={weekEndDate}
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jumlahTitipan">Jumlah Titipan</Label>
              <Input
                id="jumlahTitipan"
                type="number"
                value={jumlahTitipan}
                onChange={(e) => setJumlahTitipan(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terjualSistem">Terjual Sistem (Otomatis)</Label>
              <Input
                id="terjualSistem"
                type="number"
                value={jumlahTerjualSistem}
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="realTerjual">Real Terjual</Label>
              <Input
                id="realTerjual"
                type="number"
                value={jumlahRealTerjual}
                onChange={(e) => setJumlahRealTerjual(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sisaStok">Sisa Stok</Label>
              <Input
                id="sisaStok"
                type="number"
                value={sisaStok}
                onChange={(e) => setSisaStok(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Summary Section */}
          {selectedProduct && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Ringkasan Perhitungan
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Selisih Stok:</span>
                  <p className={`font-medium ${selisihStok !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {selisihStok}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Harga Satuan:</span>
                  <p className="font-medium">Rp {selectedProduct.harga_jual.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Pembayaran:</span>
                  <p className="font-medium text-green-600">
                    Rp {totalPembayaran.toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-medium text-blue-600">Mingguan</p>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending ? 'Menyimpan...' : 'Simpan Konsinyasi Mingguan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default KonsinyasiMingguanForm;
