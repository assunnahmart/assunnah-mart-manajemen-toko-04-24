
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pembayaran Massal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Pelanggan Terpilih ({selectedCustomers.length})</Label>
            <div className="max-h-32 overflow-y-auto border rounded p-2 text-sm">
              {selectedCustomers.map((customer, index) => (
                <div key={index}>{customer}</div>
              ))}
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
              placeholder="Keterangan pembayaran massal"
            />
          </div>
          <Button 
            onClick={onSave}
            disabled={isProcessing || selectedCustomers.length === 0}
            className="w-full"
          >
            {isProcessing ? 'Memproses...' : 'Proses Pembayaran Massal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
