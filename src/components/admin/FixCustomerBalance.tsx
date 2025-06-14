
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useFixCustomerBalance } from '@/hooks/useLedgers';
import { useToast } from '@/hooks/use-toast';

const FixCustomerBalance = () => {
  const [customerName, setCustomerName] = useState('Junaedi');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fixBalance = useFixCustomerBalance();
  const { toast } = useToast();

  const handleFixBalance = async () => {
    if (!customerName.trim()) {
      toast({
        title: "Error",
        description: "Masukkan nama pelanggan",
        variant: "destructive"
      });
      return;
    }

    try {
      await fixBalance.mutateAsync(customerName);
      toast({
        title: "Berhasil",
        description: `Saldo piutang ${customerName} telah diperbaiki dan disinkronkan`
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Perbaikan Saldo Piutang
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-orange-700 text-sm mb-4">
          Gunakan fitur ini untuk memperbaiki saldo piutang pelanggan yang tidak sinkron dengan data POS.
        </p>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
              <RefreshCw className="h-4 w-4 mr-2" />
              Perbaiki Saldo Pelanggan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Perbaiki Saldo Piutang Pelanggan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Fitur ini akan menyinkronkan ulang data piutang dengan transaksi POS dan memperbaiki saldo yang tidak akurat.
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Nama Pelanggan</label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Masukkan nama pelanggan"
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Proses yang akan dilakukan:</p>
                  <ul className="mt-1 text-xs space-y-1">
                    <li>✓ Sinkronisasi transaksi POS kredit</li>
                    <li>✓ Recalkulasi saldo piutang</li>
                    <li>✓ Update data pelanggan</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button 
                  onClick={handleFixBalance}
                  disabled={fixBalance.isPending || !customerName.trim()}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  {fixBalance.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Perbaiki Saldo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default FixCustomerBalance;
