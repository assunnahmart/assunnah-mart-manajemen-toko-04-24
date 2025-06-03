
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateKonsinyasiHarian } from '@/hooks/useKonsinyasiHarian';
import { useToast } from '@/hooks/use-toast';

interface KonsinyasiHarianEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  konsinyasiData: any;
}

const KonsinyasiHarianEditDialog = ({ isOpen, onClose, konsinyasiData }: KonsinyasiHarianEditDialogProps) => {
  const [jumlahTitipan, setJumlahTitipan] = useState(0);
  const [jumlahTerjualSistem, setJumlahTerjualSistem] = useState(0);
  const [jumlahRealTerjual, setJumlahRealTerjual] = useState(0);
  const [keterangan, setKeterangan] = useState('');

  const updateKonsinyasi = useUpdateKonsinyasiHarian();
  const { toast } = useToast();

  useEffect(() => {
    if (konsinyasiData) {
      setJumlahTitipan(konsinyasiData.jumlah_titipan || 0);
      setJumlahTerjualSistem(konsinyasiData.jumlah_terjual_sistem || 0);
      setJumlahRealTerjual(konsinyasiData.jumlah_real_terjual || 0);
      setKeterangan(konsinyasiData.keterangan || '');
    }
  }, [konsinyasiData]);

  const sisaStok = jumlahTitipan - jumlahRealTerjual;
  const selisihStok = jumlahRealTerjual - jumlahTerjualSistem;
  const totalPembayaran = (konsinyasiData?.harga_beli || 0) * jumlahRealTerjual;

  const handleSave = async () => {
    if (!konsinyasiData?.id) return;

    try {
      const updatedData = {
        jumlah_titipan: jumlahTitipan,
        jumlah_terjual_sistem: jumlahTerjualSistem,
        jumlah_real_terjual: jumlahRealTerjual,
        sisa_stok: sisaStok,
        selisih_stok: selisihStok,
        total_pembayaran: totalPembayaran,
        keterangan
      };

      await updateKonsinyasi.mutateAsync({
        id: konsinyasiData.id,
        data: updatedData
      });

      toast({
        title: "Konsinyasi berhasil diupdate",
        description: "Data konsinyasi harian telah diperbarui"
      });

      onClose();
    } catch (error) {
      toast({
        title: "Gagal mengupdate konsinyasi",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (!konsinyasiData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Konsinyasi Harian</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Supplier</Label>
              <Input value={konsinyasiData.supplier_name} readOnly className="bg-gray-100" />
            </div>
            <div>
              <Label>Produk</Label>
              <Input value={konsinyasiData.product_name} readOnly className="bg-gray-100" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jumlah_titipan">Jumlah Titipan</Label>
              <Input
                id="jumlah_titipan"
                type="number"
                value={jumlahTitipan}
                onChange={(e) => setJumlahTitipan(Number(e.target.value))}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="jumlah_sistem">Jumlah Terjual (Sistem POS)</Label>
              <Input
                id="jumlah_sistem"
                type="number"
                value={jumlahTerjualSistem}
                onChange={(e) => setJumlahTerjualSistem(Number(e.target.value))}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jumlah_real">Jumlah Real Terjual</Label>
              <Input
                id="jumlah_real"
                type="number"
                value={jumlahRealTerjual}
                onChange={(e) => setJumlahRealTerjual(Number(e.target.value))}
                min="0"
              />
            </div>
            <div>
              <Label>Sisa Stok</Label>
              <Input value={sisaStok} readOnly className="bg-gray-100" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Selisih Stok (Real - Sistem)</Label>
              <Input
                value={selisihStok}
                readOnly
                className={`bg-gray-100 ${selisihStok !== 0 ? 'text-red-600 font-medium' : ''}`}
              />
            </div>
            <div>
              <Label>Total Pembayaran</Label>
              <Input
                value={`Rp ${totalPembayaran.toLocaleString('id-ID')}`}
                readOnly
                className="bg-green-50 font-bold text-green-700"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              placeholder="Keterangan tambahan..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={updateKonsinyasi.isPending}
            >
              {updateKonsinyasi.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KonsinyasiHarianEditDialog;
