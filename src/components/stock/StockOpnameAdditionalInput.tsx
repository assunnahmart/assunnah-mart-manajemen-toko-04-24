
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Info, Package } from 'lucide-react';
import { useCreateNewStokOpname } from '@/hooks/useCreateNewStokOpname';
import { useKasir } from '@/hooks/useKasir';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

interface StockOpnameAdditionalInputProps {
  productId: string;
  productName: string;
  currentSystemStock: number;
  currentRealStock: number;
  unit: string;
  onSuccess?: () => void;
}

const StockOpnameAdditionalInput = ({
  productId,
  productName,
  currentSystemStock,
  currentRealStock,
  unit,
  onSuccess
}: StockOpnameAdditionalInputProps) => {
  const [additionalStock, setAdditionalStock] = useState('');
  const [keterangan, setKeterangan] = useState('');
  
  const { data: kasirData } = useKasir();
  const { user } = useSimpleAuth();
  const createStockOpname = useCreateNewStokOpname();
  const { toast } = useToast();

  // Get kasir ID from authenticated user
  const getKasirId = () => {
    if (user?.role === 'kasir' && user?.kasir_id) {
      return user.kasir_id;
    }
    // For admin users, try to find their kasir record
    const adminKasir = kasirData?.find(k => k.nama === user?.full_name || k.email === user?.username);
    return adminKasir?.id;
  };

  const handleSubmit = async () => {
    const kasirId = getKasirId();
    
    if (!additionalStock || additionalStock === '') {
      toast({
        title: "Error",
        description: "Mohon masukkan jumlah stok tambahan",
        variant: "destructive"
      });
      return;
    }

    if (!kasirId) {
      toast({
        title: "Error",
        description: "Data kasir tidak ditemukan. Mohon login ulang atau hubungi admin.",
        variant: "destructive"
      });
      return;
    }

    const additionalAmount = parseInt(additionalStock);
    if (additionalAmount <= 0) {
      toast({
        title: "Error",
        description: "Jumlah stok tambahan harus lebih dari 0",
        variant: "destructive"
      });
      return;
    }

    try {
      await createStockOpname.mutateAsync({
        barang_id: productId,
        stok_fisik: additionalAmount,
        kasir_id: kasirId,
        keterangan: `Input tambahan - ${keterangan}`
      });

      toast({
        title: "Berhasil",
        description: `Stok tambahan ${additionalAmount} ${unit} untuk ${productName} berhasil ditambahkan`
      });

      // Reset form
      setAdditionalStock('');
      setKeterangan('');
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding additional stock:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan stok tambahan: " + (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const newTotalRealStock = currentRealStock + (parseInt(additionalStock) || 0);
  const newSelisih = currentSystemStock - newTotalRealStock;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Plus className="h-5 w-5" />
          Tambah Stok Real - {productName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Fitur Tambah Stok Real:</strong> Menambahkan input stok real tanpa mengubah stok sistem. 
            Total stok real akan menjadi gabungan dari semua input pengguna.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Stok Sistem Saat Ini</Label>
            <div className="p-2 bg-white rounded border">
              <Badge variant="outline" className="text-blue-800 border-blue-300">
                {currentSystemStock} {unit}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Total Stok Real Saat Ini</Label>
            <div className="p-2 bg-white rounded border">
              <Badge variant="outline" className="text-green-800 border-green-300">
                {currentRealStock} {unit}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="additionalStock">Jumlah Stok Tambahan *</Label>
          <Input
            id="additionalStock"
            type="number"
            value={additionalStock}
            onChange={(e) => setAdditionalStock(e.target.value)}
            min="1"
            placeholder="Masukkan jumlah stok yang ingin ditambahkan..."
          />
        </div>

        {additionalStock && !isNaN(Number(additionalStock)) && Number(additionalStock) > 0 && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-800">Preview Setelah Penambahan:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-yellow-700">Total Stok Real Baru:</span>
                    <Badge variant="outline" className="ml-2 text-yellow-800 border-yellow-300">
                      {newTotalRealStock} {unit}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-yellow-700">Selisih Baru:</span>
                    <Badge variant={newSelisih === 0 ? "default" : "secondary"} className="ml-2">
                      {newSelisih > 0 ? '+' : ''}{newSelisih} {unit}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-yellow-600">
                  {newSelisih === 0 
                    ? 'Stok akan seimbang setelah penambahan'
                    : newSelisih > 0
                      ? 'Stok sistem masih lebih banyak'
                      : 'Stok real akan lebih banyak dari sistem'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <Label htmlFor="keterangan">Keterangan/Catatan</Label>
          <Textarea
            id="keterangan"
            placeholder="Catatan untuk penambahan stok ini..."
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!additionalStock || additionalStock === '' || createStockOpname.isPending}
          className="w-full"
        >
          {createStockOpname.isPending ? 'Menambahkan...' : 'Tambah Stok Real'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StockOpnameAdditionalInput;
