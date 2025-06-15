
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSupplier: string;
  paymentForm: {
    amount: number;
    reference_number: string;
    keterangan: string;
    payment_date: string;
  };
  setPaymentForm: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
  isPending: boolean;
};

export function SupplierPaymentDialog({
  open,
  onOpenChange,
  selectedSupplier,
  paymentForm,
  setPaymentForm,
  onSave,
  isPending,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat Pembayaran Hutang</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Supplier</Label>
            <Input value={selectedSupplier} disabled />
          </div>
          <div>
            <Label>Tanggal Pembayaran</Label>
            <Input
              type="date"
              value={paymentForm.payment_date}
              onChange={e => setPaymentForm((prev: any) => ({ ...prev, payment_date: e.target.value }))}
            />
          </div>
          <div>
            <Label>Jumlah Pembayaran</Label>
            <Input
              type="number"
              value={paymentForm.amount}
              onChange={e => setPaymentForm((prev: any) => ({ ...prev, amount: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label>Nomor Referensi</Label>
            <Input
              value={paymentForm.reference_number}
              onChange={e => setPaymentForm((prev: any) => ({ ...prev, reference_number: e.target.value }))}
              placeholder="Nomor bukti pembayaran"
            />
          </div>
          <div>
            <Label>Keterangan</Label>
            <Input
              value={paymentForm.keterangan}
              onChange={e => setPaymentForm((prev: any) => ({ ...prev, keterangan: e.target.value }))}
              placeholder="Keterangan pembayaran"
            />
          </div>
          <Button
            onClick={onSave}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Pembayaran'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
