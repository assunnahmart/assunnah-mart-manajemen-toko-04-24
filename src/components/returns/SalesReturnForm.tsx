
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import { useCreateSalesReturn } from '@/hooks/useReturTransactions';
import { usePOSTransactions } from '@/hooks/usePOSTransactions';
import { useBarang } from '@/hooks/useBarang';
import { useKasir } from '@/hooks/useKasir';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

interface ReturnItem {
  barang_id: string;
  nama_barang: string;
  jumlah_retur: number;
  harga_satuan: number;
  subtotal_retur: number;
  alasan_item: string;
}

const SalesReturnForm = () => {
  const [selectedTransactionId, setSelectedTransactionId] = useState('');
  const [pelangganName, setPelangganName] = useState('');
  const [jenisRetur, setJenisRetur] = useState<'barang' | 'uang'>('barang');
  const [alasanRetur, setAlasanRetur] = useState('');
  const [catatan, setCatatan] = useState('');
  const [status, setStatus] = useState<'pending' | 'approved'>('pending');
  const [items, setItems] = useState<ReturnItem[]>([]);
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [itemReason, setItemReason] = useState('');

  const { data: posTransactions } = usePOSTransactions();
  const { data: products } = useBarang();
  const { data: kasirData } = useKasir();
  const { user } = useSimpleAuth();
  const createReturn = useCreateSalesReturn();
  const { toast } = useToast();

  const userKasir = kasirData?.find(k => k.nama === user?.full_name);

  const addItem = () => {
    if (!selectedProductId || quantity <= 0 || unitPrice <= 0) return;

    const product = products?.find(p => p.id === selectedProductId);
    if (!product) return;

    const newItem: ReturnItem = {
      barang_id: selectedProductId,
      nama_barang: product.nama,
      jumlah_retur: quantity,
      harga_satuan: unitPrice,
      subtotal_retur: quantity * unitPrice,
      alasan_item: itemReason
    };

    setItems([...items, newItem]);
    setSelectedProductId('');
    setQuantity(1);
    setUnitPrice(0);
    setItemReason('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalReturn = items.reduce((sum, item) => sum + item.subtotal_retur, 0);

  const handleSubmit = async () => {
    if (!userKasir || items.length === 0) {
      toast({
        title: "Error",
        description: "Lengkapi semua field yang diperlukan",
        variant: "destructive"
      });
      return;
    }

    try {
      await createReturn.mutateAsync({
        retur: {
          pos_transaction_id: selectedTransactionId || null,
          pelanggan_name: pelangganName,
          kasir_id: userKasir.id,
          total_retur: totalReturn,
          jenis_retur: jenisRetur,
          alasan_retur: alasanRetur,
          status,
          catatan
        },
        items: items.map(item => ({
          barang_id: item.barang_id,
          nama_barang: item.nama_barang,
          jumlah_retur: item.jumlah_retur,
          harga_satuan: item.harga_satuan,
          subtotal_retur: item.subtotal_retur,
          alasan_item: item.alasan_item
        }))
      });

      toast({
        title: "Retur penjualan berhasil",
        description: `Retur telah disimpan dengan status ${status}`
      });

      // Reset form
      setSelectedTransactionId('');
      setPelangganName('');
      setJenisRetur('barang');
      setAlasanRetur('');
      setCatatan('');
      setStatus('pending');
      setItems([]);
    } catch (error: any) {
      toast({
        title: "Gagal menyimpan retur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retur Penjualan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transaction and Customer Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="transaction">Transaksi POS (Opsional)</Label>
            <Select value={selectedTransactionId} onValueChange={setSelectedTransactionId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih transaksi POS" />
              </SelectTrigger>
              <SelectContent>
                {posTransactions?.map((transaction) => (
                  <SelectItem key={transaction.id} value={transaction.id}>
                    {transaction.transaction_number} - Rp {transaction.total_amount.toLocaleString('id-ID')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pelangganName">Nama Pelanggan</Label>
            <Input
              id="pelangganName"
              value={pelangganName}
              onChange={(e) => setPelangganName(e.target.value)}
              placeholder="Nama pelanggan"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="jenisRetur">Jenis Retur</Label>
            <Select value={jenisRetur} onValueChange={(value: 'barang' | 'uang') => setJenisRetur(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="barang">Tukar Barang</SelectItem>
                <SelectItem value="uang">Refund Uang</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: 'pending' | 'approved') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Return Reason */}
        <div>
          <Label htmlFor="alasanRetur">Alasan Retur</Label>
          <Textarea
            id="alasanRetur"
            value={alasanRetur}
            onChange={(e) => setAlasanRetur(e.target.value)}
            placeholder="Jelaskan alasan retur..."
          />
        </div>

        {/* Add Item Form */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Tambah Item Retur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Produk</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
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

              <div>
                <Label>Jumlah</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Harga Satuan</Label>
                <Input
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  min="0"
                />
              </div>

              <div>
                <Label>Alasan Item</Label>
                <Input
                  value={itemReason}
                  onChange={(e) => setItemReason(e.target.value)}
                  placeholder="Alasan khusus item ini..."
                />
              </div>
            </div>

            <Button onClick={addItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Item
            </Button>
          </CardContent>
        </Card>

        {/* Items Table */}
        {items.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Item Retur</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.nama_barang}</TableCell>
                    <TableCell>{item.jumlah_retur}</TableCell>
                    <TableCell>Rp {item.harga_satuan.toLocaleString('id-ID')}</TableCell>
                    <TableCell>Rp {item.subtotal_retur.toLocaleString('id-ID')}</TableCell>
                    <TableCell>{item.alasan_item}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="text-right mt-4">
              <p className="text-lg font-bold">
                Total Retur: Rp {totalReturn.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <Label htmlFor="catatan">Catatan</Label>
          <Textarea
            id="catatan"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Catatan tambahan..."
          />
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={createReturn.isPending || items.length === 0}
          className="w-full"
        >
          {createReturn.isPending ? 'Menyimpan...' : 'Simpan Retur Penjualan'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SalesReturnForm;
