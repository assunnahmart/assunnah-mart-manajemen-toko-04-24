import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useCreatePurchaseTransaction } from '@/hooks/usePurchaseTransactions';
import { useBarang } from '@/hooks/useBarang';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useKasir } from '@/hooks/useKasir';
import { useToast } from '@/hooks/use-toast';

interface PurchaseItem {
  barang_id: string;
  nama_barang: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
}

interface PurchaseFormProps {
  suppliers: any[];
}

const PurchaseForm = ({ suppliers }: PurchaseFormProps) => {
  const [supplierId, setSupplierId] = useState('');
  const [jenisTransaksi, setJenisTransaksi] = useState<'cash' | 'kredit'>('cash');
  const [jatuhTempo, setJatuhTempo] = useState('');
  const [catatan, setCatatan] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  const { data: products } = useBarang();
  const { data: kasirData } = useKasir();
  const { user } = useSimpleAuth();
  const createPurchase = useCreatePurchaseTransaction();
  const { toast } = useToast();

  const userKasir = kasirData?.find(k => k.nama === user?.full_name);

  const addItem = () => {
    if (!selectedProduct || quantity <= 0 || unitPrice <= 0) return;

    const product = products?.find(p => p.id === selectedProduct);
    if (!product) return;

    const newItem: PurchaseItem = {
      barang_id: selectedProduct,
      nama_barang: product.nama,
      jumlah: quantity,
      harga_satuan: unitPrice,
      subtotal: quantity * unitPrice
    };

    setItems([...items, newItem]);
    setSelectedProduct('');
    setQuantity(1);
    setUnitPrice(0);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = async () => {
    if (!supplierId || items.length === 0 || !userKasir) {
      toast({
        title: "Data tidak lengkap",
        description: "Pilih supplier dan tambahkan minimal satu item",
        variant: "destructive"
      });
      return;
    }

    try {
      await createPurchase.mutateAsync({
        transaction: {
          supplier_id: supplierId,
          subtotal: totalAmount,
          total: totalAmount,
          jenis_pembayaran: jenisTransaksi,
          kasir_id: userKasir.id,
          jatuh_tempo: jenisTransaksi === 'kredit' ? jatuhTempo : null,
          catatan,
          status: 'completed' // Otomatis selesai
        },
        items: items.map(item => ({
          barang_id: item.barang_id,
          nama_barang: item.nama_barang,
          jumlah: item.jumlah,
          harga_satuan: item.harga_satuan,
          subtotal: item.subtotal
        }))
      });

      toast({
        title: "Transaksi pembelian berhasil",
        description: "Data pembelian telah disimpan dan terintegrasi dengan kas umum serta kartu hutang"
      });

      // Reset form
      setSupplierId('');
      setJenisTransaksi('cash');
      setJatuhTempo('');
      setCatatan('');
      setItems([]);
    } catch (error) {
      toast({
        title: "Gagal menyimpan transaksi",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Transaksi Pembelian Baru
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
            <Label htmlFor="jenis">Jenis Pembayaran</Label>
            <Select value={jenisTransaksi} onValueChange={(value: 'cash' | 'kredit') => setJenisTransaksi(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Tunai</SelectItem>
                <SelectItem value="kredit">Kredit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {jenisTransaksi === 'kredit' && (
            <div>
              <Label htmlFor="jatuhTempo">Jatuh Tempo</Label>
              <Input
                id="jatuhTempo"
                type="date"
                value={jatuhTempo}
                onChange={(e) => setJatuhTempo(e.target.value)}
              />
            </div>
          )}

          <div className={jenisTransaksi === 'cash' ? 'md:col-span-2' : ''}>
            <Label htmlFor="catatan">Catatan</Label>
            <Textarea
              id="catatan"
              placeholder="Catatan transaksi..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </div>
        </div>

        {/* Add Items Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Tambah Produk</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Produk</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih produk..." />
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
            <div>
              <Label>Jumlah</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
              />
            </div>
            <div>
              <Label>Harga Satuan</Label>
              <Input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                min="0"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Tambah
              </Button>
            </div>
          </div>
        </div>

        {/* Items Table */}
        {items.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Daftar Produk</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Harga Satuan</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.nama_barang}</TableCell>
                    <TableCell>{item.jumlah}</TableCell>
                    <TableCell>Rp {item.harga_satuan.toLocaleString('id-ID')}</TableCell>
                    <TableCell>Rp {item.subtotal.toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={items.length === 0 || createPurchase.isPending}
            className="flex-1"
          >
            {createPurchase.isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseForm;
