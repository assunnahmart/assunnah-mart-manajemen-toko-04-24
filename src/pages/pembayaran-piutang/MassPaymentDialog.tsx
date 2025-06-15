
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, DollarSign } from 'lucide-react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCustomers: string[];
  massPaymentForm: {
    payment_date: string;
    keterangan: string;
  };
  setMassPaymentForm: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
  isProcessing: boolean;
};

export function MassPaymentDialog({
  open,
  onOpenChange,
  selectedCustomers,
  massPaymentForm,
  setMassPaymentForm,
  onSave,
  isProcessing
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pembayaran Massal Piutang
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Pembayaran Otomatis</p>
                <ul className="text-xs space-y-1">
                  <li>• Sistem akan melunasi seluruh saldo piutang setiap pelanggan</li>
                  <li>• Nomor transaksi kas umum dibuat otomatis</li>
                  <li>• Jurnal akuntansi terintegrasi</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <Label>Pelanggan Terpilih ({selectedCustomers.length})</Label>
            <div className="max-h-32 overflow-y-auto border rounded p-2 text-sm bg-gray-50">
              {selectedCustomers.length > 0 ? (
                selectedCustomers.map((customer, index) => (
                  <div key={index} className="py-1 border-b border-gray-200 last:border-0">
                    {customer}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 italic">Belum ada pelanggan dipilih</div>
              )}
            </div>
          </div>

          <div>
            <Label>Tanggal Pembayaran</Label>
            <Input
              type="date"
              value={massPaymentForm.payment_date}
              onChange={e => setMassPaymentForm((prev: any) => ({ ...prev, payment_date: e.target.value }))}
            />
          </div>

          <div>
            <Label>Keterangan</Label>
            <Input
              value={massPaymentForm.keterangan}
              onChange={e => setMassPaymentForm((prev: any) => ({ ...prev, keterangan: e.target.value }))}
              placeholder="Keterangan pembayaran massal (opsional)"
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Integrasi Otomatis:</p>
              <ul className="text-xs space-y-1">
                <li>✓ Kas Umum (Pemasukan)</li>
                <li>✓ General Ledger (Jurnal)</li>
                <li>✓ Saldo Piutang (Update)</li>
                <li>✓ Nomor transaksi berurutan</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button 
              onClick={onSave}
              disabled={isProcessing || selectedCustomers.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? 'Memproses...' : `Bayar ${selectedCustomers.length} Pelanggan`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
