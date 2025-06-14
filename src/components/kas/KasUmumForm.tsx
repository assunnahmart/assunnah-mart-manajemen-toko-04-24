
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign } from 'lucide-react';
import { useCreateKasTransaction } from '@/hooks/useKasUmum';
import { useChartOfAccounts } from '@/hooks/useChartOfAccounts';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

const KasUmumForm = () => {
  const [jenisTransaksi, setJenisTransaksi] = useState<'masuk' | 'keluar'>('masuk');
  const [akunId, setAkunId] = useState('');
  const [jumlah, setJumlah] = useState(0);
  const [keterangan, setKeterangan] = useState('');

  const { data: accounts } = useChartOfAccounts();
  const { user } = useSimpleAuth();
  const createTransaction = useCreateKasTransaction();
  const { toast } = useToast();

  console.log('KasUmumForm - DEBUG START');
  console.log('KasUmumForm accounts:', accounts);
  
  // Enhanced validation to filter out accounts with invalid IDs
  const validAccounts = accounts?.filter(account => {
    const hasValidId = account && 
                      account.id && 
                      typeof account.id === 'string' && 
                      account.id.trim() !== '' &&
                      account.id !== null &&
                      account.id !== undefined;
    
    console.log('Account validation:', { 
      account: account?.nama_akun, 
      id: account?.id, 
      type: typeof account?.id,
      isValid: hasValidId 
    });
    
    if (!hasValidId) {
      console.error('INVALID ACCOUNT DETECTED:', account);
    }
    
    return hasValidId;
  }) || [];

  console.log('Valid accounts after filtering:', validAccounts.length);
  console.log('KasUmumForm - DEBUG END');

  const handleSubmit = async () => {
    if (!akunId || jumlah <= 0) {
      toast({
        title: "Data tidak lengkap",
        description: "Pilih akun dan masukkan jumlah yang valid",
        variant: "destructive"
      });
      return;
    }

    try {
      await createTransaction.mutateAsync({
        jenis_transaksi: jenisTransaksi,
        akun_id: akunId,
        jumlah,
        keterangan,
        kasir_username: user?.username || '',
        kasir_name: user?.full_name || ''
      });

      toast({
        title: "Transaksi kas berhasil",
        description: `Transaksi ${jenisTransaksi} sebesar Rp ${jumlah.toLocaleString('id-ID')} berhasil disimpan`
      });

      // Reset form
      setAkunId('');
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
          <DollarSign className="h-5 w-5" />
          Input Transaksi Kas Umum
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="jenis">Jenis Transaksi</Label>
            <Select value={jenisTransaksi || "masuk"} onValueChange={(value: 'masuk' | 'keluar') => setJenisTransaksi(value)}>
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
            <Label htmlFor="akun">Akun</Label>
            <Select value={akunId || ""} onValueChange={setAkunId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih akun..." />
              </SelectTrigger>
              <SelectContent>
                {validAccounts.map((account) => {
                  console.log('Rendering account SelectItem:', { id: account.id, nama: account.nama_akun });
                  if (!account.id || account.id.trim() === '') {
                    console.error('ATTEMPTING TO RENDER INVALID ACCOUNT:', account);
                    return null;
                  }
                  return (
                    <SelectItem key={account.id} value={account.id}>
                      {account.kode_akun} - {account.nama_akun}
                    </SelectItem>
                  );
                })}
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

export default KasUmumForm;
