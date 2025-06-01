
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Receipt } from 'lucide-react';
import { useSupplier } from '@/hooks/useSupplier';
import { useKonsinyasiBarang, useCreateKonsinyasiLaporan } from '@/hooks/useKonsinyasi';
import { useToast } from '@/hooks/use-toast';

interface KonsinyasiItem {
  barang_id: string;
  nama_barang: string;
  harga_beli: number;
  jumlah_terjual: number;
  total_nilai: number;
}

const KonsinyasiForm = () => {
  const { toast } = useToast();
  const { data: suppliers } = useSupplier();
  const { data: konsinyasiBarang } = useKonsinyasiBarang();
  const createLaporan = useCreateKonsinyasiLaporan();

  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [periodeAwal, setPeriodeAwal] = useState<string>('');
  const [periodeAkhir, setPeriodeAkhir] = useState<string>('');
  const [items, setItems] = useState<KonsinyasiItem[]>([]);

  const [selectedBarang, setSelectedBarang] = useState<string>('');
  const [jumlahTerjual, setJumlahTerjual] = useState<number>(0);

  const addItem = () => {
    if (!selectedBarang || jumlahTerjual <= 0) {
      toast({
        title: "Error",
        description: "Pilih barang dan masukkan jumlah terjual",
        variant: "destructive",
      });
      return;
    }

    const barang = konsinyasiBarang?.find(b => b.id === selectedBarang);
    if (!barang) return;

    const totalNilai = (barang.harga_beli || 0) * jumlahTerjual;

    const newItem: KonsinyasiItem = {
      barang_id: barang.id,
      nama_barang: barang.nama,
      harga_beli: barang.harga_beli || 0,
      jumlah_terjual: jumlahTerjual,
      total_nilai: totalNilai
    };

    setItems([...items, newItem]);
    setSelectedBarang('');
    setJumlahTerjual(0);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSupplier || !periodeAwal || !periodeAkhir || items.length === 0) {
      toast({
        title: "Error",
        description: "Lengkapi semua field dan tambahkan minimal 1 item",
        variant: "destructive",
      });
      return;
    }

    const totalPenjualan = items.reduce((sum, item) => sum + item.total_nilai, 0);

    try {
      await createLaporan.mutateAsync({
        laporan: {
          supplier_id: selectedSupplier,
          periode_mulai: periodeAwal,
          periode_selesai: periodeAkhir,
          total_penjualan: totalPenjualan,
          total_komisi: totalPenjualan * 0.1, // 10% komisi
          status: 'completed'
        },
        details: items
      });

      toast({
        title: "Berhasil",
        description: "Laporan konsinyasi berhasil dibuat",
      });

      // Reset form
      setSelectedSupplier('');
      setPeriodeAwal('');
      setPeriodeAkhir('');
      setItems([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal membuat laporan konsinyasi",
        variant: "destructive",
      });
    }
  };

  const printReceipt = () => {
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Tidak ada data untuk dicetak",
        variant: "destructive",
      });
      return;
    }

    const supplier = suppliers?.find(s => s.id === selectedSupplier);
    const totalPenjualan = items.reduce((sum, item) => sum + item.total_nilai, 0);
    const komisi = totalPenjualan * 0.1;

    const printContent = `
      <div style="max-width: 400px; margin: 0 auto; font-family: monospace;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2>TANDA TERIMA KONSINYASI</h2>
          <p>================================</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <p><strong>Supplier:</strong> ${supplier?.nama || ''}</p>
          <p><strong>Periode:</strong> ${periodeAwal} s/d ${periodeAkhir}</p>
          <p><strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID')}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <p>================================</p>
          <p><strong>DETAIL BARANG:</strong></p>
          <p>================================</p>
          ${items.map(item => `
            <p><strong>${item.nama_barang}</strong></p>
            <p>Harga: Rp ${item.harga_beli.toLocaleString('id-ID')}</p>
            <p>Terjual: ${item.jumlah_terjual} pcs</p>
            <p>Total: Rp ${item.total_nilai.toLocaleString('id-ID')}</p>
            <p>--------------------------------</p>
          `).join('')}
        </div>
        
        <div style="margin-top: 20px;">
          <p>================================</p>
          <p><strong>Total Penjualan: Rp ${totalPenjualan.toLocaleString('id-ID')}</strong></p>
          <p><strong>Komisi (10%): Rp ${komisi.toLocaleString('id-ID')}</strong></p>
          <p>================================</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p>Terima kasih atas kerjasama Anda</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Tanda Terima Konsinyasi</title>
            <style>
              body { margin: 20px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Laporan Konsinyasi</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Supplier" />
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
              <Label htmlFor="periode-awal">Periode Awal</Label>
              <Input
                id="periode-awal"
                type="date"
                value={periodeAwal}
                onChange={(e) => setPeriodeAwal(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="periode-akhir">Periode Akhir</Label>
              <Input
                id="periode-akhir"
                type="date"
                value={periodeAkhir}
                onChange={(e) => setPeriodeAkhir(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-medium">Tambah Barang Konsinyasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Produk</Label>
                <Select value={selectedBarang} onValueChange={setSelectedBarang}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {konsinyasiBarang?.filter(b => b.supplier_id === selectedSupplier).map((barang) => (
                      <SelectItem key={barang.id} value={barang.id}>
                        {barang.nama} - Rp {(barang.harga_beli || 0).toLocaleString('id-ID')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Jumlah Terjual</Label>
                <Input
                  type="number"
                  value={jumlahTerjual}
                  onChange={(e) => setJumlahTerjual(Number(e.target.value))}
                  min="0"
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah
                </Button>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Daftar Barang</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Harga Beli</TableHead>
                    <TableHead>Jumlah Terjual</TableHead>
                    <TableHead>Total Nilai</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.nama_barang}</TableCell>
                      <TableCell>Rp {item.harga_beli.toLocaleString('id-ID')}</TableCell>
                      <TableCell>{item.jumlah_terjual}</TableCell>
                      <TableCell>Rp {item.total_nilai.toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
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
              
              <div className="mt-4 text-right">
                <p className="text-lg font-semibold">
                  Total Penjualan: Rp {items.reduce((sum, item) => sum + item.total_nilai, 0).toLocaleString('id-ID')}
                </p>
                <p className="text-md">
                  Komisi (10%): Rp {(items.reduce((sum, item) => sum + item.total_nilai, 0) * 0.1).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={createLaporan.isPending}>
              {createLaporan.isPending ? 'Menyimpan...' : 'Simpan Laporan'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={printReceipt}
              disabled={items.length === 0}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Cetak Tanda Terima
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default KonsinyasiForm;
