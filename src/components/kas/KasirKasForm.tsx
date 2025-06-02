
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Wallet } from 'lucide-react';
import { useCreateKasirKasTransaction } from '@/hooks/useKasirKas';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

const KasirKasForm = () => {
  const [jenisTransaksi, setJenisTransaksi] = useState<'masuk' | 'keluar'>('masuk');
  const [kategori, setKategori] = useState('');
  const [jumlah, setJumlah] = useState(0);
  const [keterangan, setKeterangan] = useState('');

  const { user } = useSimpleAuth();
  const createTransaction = useCreateKasirKasTransaction();
  const { toast } = useToast();

  const kategoriOptions = {
    masuk: [
      'Penjualan Tunai',
      'Setoran Modal',
      'Penerimaan Lain-lain'
    ],
    keluar: [
      'Pembayaran Konsinyasi',
      'Pengeluaran Operasional',
      'Pengeluaran Lain-lain'
    ]
  };

  const handleSubmit = async () => {
    if (!kategori || jumlah <= 0) {
      toast({
        title: "Data tidak lengkap",
        description: "Pilih kategori dan masukkan jumlah yang valid",
        variant: "destructive"
      });
      return;
    }

    try {
      await createTransaction.mutateAsync({
        jenis_transaksi: jenisTransaksi,
        kategori,
        jumlah,
        keterangan,
        kasir_name: user?.full_name || ''
      });

      toast({
        title: "Transaksi kas berhasil",
        description: `Transaksi ${jenisTransaksi} sebesar Rp ${jumlah.toLocaleString('id-ID')} berhasil disimpan`
      });

      // Reset form
      setKategori('');
      setJumlah(0);
      setKeterangan('');
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
          <Wallet className="h-5 w-5" />
          Input Transaksi Kas Kasir
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="jenis">Jenis Transaksi</Label>
            <Select value={jenisTransaksi} onValueChange={(value: 'masuk' | 'keluar') => {
              setJenisTransaksi(value);
              setKategori(''); // Reset kategori when jenis changes
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masuk">Kas Masuk</SelectItem>
                <SelectItem value="keluar">Kas Keluar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="kategori">Kategori</Label>
            <Select value={kategori} onValueChange={setKategori}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori..." />
              </SelectTrigger>
              <SelectContent>
                {kategoriOptions[jenisTransaksi].map((kat) => (
                  <SelectItem key={kat} value={kat}>
                    {kat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="jumlah">Jumlah</Label>
            <Input
              id="jumlah"
              type="number"
              value={jumlah}
              onChange={(e) => setJumlah(Number(e.target.value))}
              placeholder="Masukkan jumlah..."
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              placeholder="Keterangan transaksi..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={createTransaction.isPending}
          className="w-full"
        >
          {createTransaction.isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default KasirKasForm;
