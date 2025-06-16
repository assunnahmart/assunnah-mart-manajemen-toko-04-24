
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUpdateKonsinyasiMingguan } from '@/hooks/useKonsinyasiMingguan';

interface KonsinyasiMingguanEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  konsinyasiData: any;
}

const KonsinyasiMingguanEditDialog = ({
  isOpen,
  onClose,
  konsinyasiData
}: KonsinyasiMingguanEditDialogProps) => {
  const [jumlahRealTerjual, setJumlahRealTerjual] = useState('');
  const [sisaStok, setSisaStok] = useState('');
  const updateMutation = useUpdateKonsinyasiMingguan();
  const { toast } = useToast();

  useEffect(() => {
    if (konsinyasiData) {
      setJumlahRealTerjual(konsinyasiData.jumlah_real_terjual?.toString() || '');
      setSisaStok(konsinyasiData.sisa_stok?.toString() || '');
    }
  }, [konsinyasiData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!konsinyasiData) return;

    try {
      // Calculate derived values
      const realTerjual = parseInt(jumlahRealTerjual) || 0;
      const selisihStok = konsinyasiData.jumlah_terjual_sistem - realTerjual;
      const totalPembayaran = realTerjual * (konsinyasiData.harga_satuan || 0);

      const updateData = {
        jumlah_real_terjual: realTerjual,
        sisa_stok: parseInt(sisaStok) || 0,
        selisih_stok: selisihStok,
        total_pembayaran: totalPembayaran,
        updated_at: new Date().toISOString()
      };

      await updateMutation.mutateAsync({
        id: konsinyasiData.id,
        data: updateData
      });

      toast({
        title: "Berhasil",
        description: "Data konsinyasi mingguan berhasil diperbarui"
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating konsinyasi:', error);
      toast({
        title: "Gagal memperbarui",
        description: error.message || "Terjadi kesalahan saat memperbarui data",
        variant: "destructive"
      });
    }
  };

  if (!konsinyasiData) return null;

  const selisihStok = konsinyasiData.jumlah_terjual_sistem - (parseInt(jumlahRealTerjual) || 0);
  const totalPembayaran = (parseInt(jumlahRealTerjual) || 0) * (konsinyasiData.harga_satuan || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Konsinyasi Mingguan</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Input value={konsinyasiData.supplier_name} readOnly className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label>Produk</Label>
            <Input value={konsinyasiData.product_name} readOnly className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label>Periode Minggu</Label>
            <Input 
              value={`${new Date(konsinyasiData.minggu_mulai).toLocaleDateString('id-ID')} - ${new Date(konsinyasiData.minggu_selesai).toLocaleDateString('id-ID')}`} 
              readOnly 
              className="bg-gray-50" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jumlah Titipan</Label>
              <Input value={konsinyasiData.jumlah_titipan} readOnly className="bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label>Terjual Sistem</Label>
              <Input value={konsinyasiData.jumlah_terjual_sistem} readOnly className="bg-gray-50" />
            </div>
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

          {/* Summary */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Perhitungan
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Selisih:</span>
                <p className={`font-medium ${selisihStok !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {selisihStok}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Total Bayar:</span>
                <p className="font-medium text-green-600">
                  Rp {totalPembayaran.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button type="submit" disabled={updateMutation.isPending} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KonsinyasiMingguanEditDialog;
