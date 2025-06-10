
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

  console.log('KasirKasForm - User:', user);

  const handleSubmit = async () => {
    console.log('KasirKasForm - Submit started with data:', {
      jenisTransaksi,
      kategori,
      jumlah,
      keterangan,
      userKasirId: user?.kasir_id
    });

    if (!kategori || jumlah <= 0) {
      toast({
        title: "Data tidak lengkap",
        description: "Pilih kategori dan masukkan jumlah yang valid",
        variant: "destructive"
      });
      return;
    }

    if (!user?.kasir_id) {
      console.error('KasirKasForm - No kasir_id found for user:', user);
      toast({
        title: "Error",
        description: "Kasir ID tidak ditemukan. Silakan login ulang.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('KasirKasForm - Submitting transaction with kasir_id:', user.kasir_id);
      
      const transactionData = {
        jenis_transaksi: jenisTransaksi,
        kategori,
        jumlah,
        keterangan,
        kasir_id: user.kasir_id, // Use the authenticated user's kasir_id
        kasir_name: user.full_name || user.username,
        referensi_tipe: 'manual_entry'
      };

      console.log('KasirKasForm - Transaction data to submit:', transactionData);

      await createTransaction.mutateAsync(transactionData);

      toast({
        title: "Transaksi kas berhasil",
        description: `Transaksi ${jenisTransaksi} sebesar Rp ${jumlah.toLocaleString('id-ID')} berhasil disimpan`
      });

      // Reset form
      setKategori('');
      setJumlah(0);
      setKeterangan('');
      
      console.log('KasirKasForm - Transaction completed successfully');
    } catch (error: any) {
      console.error('KasirKasForm - Error saving transaction:', error);
      toast({
        title: "Gagal menyimpan transaksi",
        description: error.message || "Terjadi kesalahan saat menyimpan transaksi",
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
        {user && (
          <div className="text-sm text-gray-600">
            <p>Login sebagai: {user.full_name} ({user.username})</p>
            <p className="text-green-600">Kasir ID: {user.kasir_id}</p>
          </div>
        )}
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
          disabled={createTransaction.isPending || !user?.kasir_id}
          className="w-full"
        >
          {createTransaction.isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default KasirKasForm;
