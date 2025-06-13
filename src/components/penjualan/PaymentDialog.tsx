
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
  onPaymentSubmit: (paymentData: any) => Promise<void>;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  customer,
  onPaymentSubmit
}) => {
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'cash',
    reference: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!paymentForm.amount || paymentForm.amount <= 0) {
      toast({
        title: "Error",
        description: "Masukkan jumlah pembayaran yang valid",
        variant: "destructive"
      });
      return;
    }

    const outstandingAmount = customer.total_tagihan || customer.sisa_piutang || 0;
    if (paymentForm.amount > outstandingAmount) {
      toast({
        title: "Error",
        description: "Jumlah pembayaran melebihi hutang yang tersisa",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onPaymentSubmit(paymentForm);
      
      toast({
        title: "Berhasil",
        description: "Pembayaran berhasil dicatat"
      });

      // Reset form
      setPaymentForm({
        amount: 0,
        paymentMethod: 'cash',
        reference: '',
        notes: ''
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memproses pembayaran",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const outstandingAmount = customer?.total_tagihan || customer?.sisa_piutang || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pembayaran Hutang
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Pelanggan</div>
            <div className="font-medium">{customer?.nama}</div>
            {customer?.nama_unit && (
              <div className="text-sm text-gray-600">{customer.nama_unit}</div>
            )}
            <div className="text-sm font-medium text-red-600 mt-1">
              Hutang: {formatRupiah(outstandingAmount)}
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <Label htmlFor="amount">Jumlah Pembayaran *</Label>
            <Input
              id="amount"
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm(prev => ({ 
                ...prev, 
                amount: Number(e.target.value) 
              }))}
              placeholder="Masukkan jumlah pembayaran"
              max={outstandingAmount}
            />
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
            <select
              id="paymentMethod"
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm(prev => ({ 
                ...prev, 
                paymentMethod: e.target.value 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Tunai</option>
              <option value="transfer">Transfer Bank</option>
              <option value="check">Cek</option>
            </select>
          </div>

          {/* Reference Number */}
          <div>
            <Label htmlFor="reference">Nomor Referensi</Label>
            <Input
              id="reference"
              value={paymentForm.reference}
              onChange={(e) => setPaymentForm(prev => ({ 
                ...prev, 
                reference: e.target.value 
              }))}
              placeholder="Nomor bukti pembayaran (opsional)"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm(prev => ({ 
                ...prev, 
                notes: e.target.value 
              }))}
              placeholder="Catatan pembayaran (opsional)"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memproses...' : 'Bayar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
