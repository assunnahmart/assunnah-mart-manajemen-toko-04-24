
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Printer, Save } from 'lucide-react';

interface CartItem {
  id: string;
  nama: string;
  harga_jual: number;
  quantity: number;
  satuan: string;
}

interface POSPaymentProps {
  cartItems: CartItem[];
  totalAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

const POSPayment = ({ cartItems, totalAmount, onClose, onSuccess }: POSPaymentProps) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [printReceipt, setPrintReceipt] = useState(true);
  const [processing, setProcessing] = useState(false);

  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, paid - totalAmount);
  };

  const handlePayment = async () => {
    const paid = parseFloat(amountPaid) || 0;
    
    if (paid < totalAmount) {
      alert('Jumlah bayar kurang dari total!');
      return;
    }

    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Payment processed:', {
        cartItems,
        totalAmount,
        amountPaid: paid,
        change: calculateChange(),
        paymentMethod,
        printReceipt
      });

      if (printReceipt) {
        console.log('Printing receipt...');
        // Here you would integrate with printer
      }

      alert('Pembayaran berhasil!');
      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setProcessing(false);
    }
  };

  const quickAmountButtons = [
    { label: 'Pas', amount: totalAmount },
    { label: '50K', amount: 50000 },
    { label: '100K', amount: 100000 },
    { label: '200K', amount: 200000 }
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pembayaran
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Ringkasan Pesanan</h3>
            <div className="space-y-1 text-sm">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.nama} x{item.quantity}</span>
                  <span>Rp {(item.harga_jual * item.quantity).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-2 pt-2 font-bold">
              <div className="flex justify-between">
                <span>Total</span>
                <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label>Metode Pembayaran</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Tunai</SelectItem>
                <SelectItem value="card">Kartu</SelectItem>
                <SelectItem value="digital">Digital Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount Paid */}
          <div>
            <Label>Jumlah Bayar</Label>
            <Input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0"
              className="text-lg"
            />
            
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {quickAmountButtons.map((btn) => (
                <Button
                  key={btn.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmountPaid(btn.amount.toString())}
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Change */}
          {amountPaid && (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Kembalian</span>
                <span className="text-lg font-bold text-green-600">
                  Rp {calculateChange().toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}

          {/* Print Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="printReceipt"
              checked={printReceipt}
              onChange={(e) => setPrintReceipt(e.target.checked)}
            />
            <Label htmlFor="printReceipt" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Cetak struk
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={processing}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handlePayment}
              disabled={processing || !amountPaid || parseFloat(amountPaid) < totalAmount}
              className="flex-1"
            >
              {processing ? 'Memproses...' : 'Bayar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default POSPayment;
