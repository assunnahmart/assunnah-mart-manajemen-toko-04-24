
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCustomers: string[];
  massPaymentForm: {
    payment_date: string;
    reference_number: string;
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
  isProcessing,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat Pembayaran Massal ({selectedCustomers.length} pelanggan)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Pelanggan Terpilih</Label>
            <div className="flex flex-wrap gap-2">
              {selectedCustomers.map(name => (
                <Badge variant="outline" key={name}>{name}</Badge>
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
            <Label>Nomor Referensi</Label>
            <Input
              value={massPaymentForm.reference_number}
              onChange={e => setMassPaymentForm((prev: any) => ({ ...prev, reference_number: e.target.value }))}
              placeholder="Nomor bukti pembayaran"
            />
          </div>
          <div>
            <Label>Keterangan</Label>
            <Input
              value={massPaymentForm.keterangan}
              onChange={e => setMassPaymentForm((prev: any) => ({ ...prev, keterangan: e.target.value }))}
              placeholder="Keterangan pembayaran"
            />
          </div>
          <Button
            onClick={onSave}
            disabled={isProcessing || selectedCustomers.length === 0}
            className="w-full"
          >
            {isProcessing ? 'Menyimpan...' : `Simpan Pembayaran (${selectedCustomers.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
