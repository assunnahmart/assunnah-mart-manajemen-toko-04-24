import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, Printer, Save, Receipt } from 'lucide-react';
import { useCreateTransaksi } from '@/hooks/useTransaksi';
import { useCreatePOSTransaction } from '@/hooks/usePOSTransactions';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: string;
  nama: string;
  harga_jual: number;
  quantity: number;
  satuan: string;
}

interface Customer {
  id: string;
  name: string;
  type: 'unit' | 'perorangan' | 'guest';
  phone?: string;
}

interface POSPaymentProps {
  cartItems: CartItem[];
  totalAmount: number;
  selectedCustomer: Customer | null;
  selectedPaymentMethod: string;
  onClose: () => void;
  onSuccess: () => void;
}

const POSPayment = ({ 
  cartItems, 
  totalAmount, 
  selectedCustomer,
  selectedPaymentMethod,
  onClose, 
  onSuccess 
}: POSPaymentProps) => {
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  const [amountPaid, setAmountPaid] = useState('');
  const [creditNotes, setCreditNotes] = useState('');
  const [printReceipt, setPrintReceipt] = useState(true);
  const [processing, setProcessing] = useState(false);

  const createPOSTransaction = useCreatePOSTransaction();
  const createTransaksi = useCreateTransaksi();

  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, paid - totalAmount);
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'cash';
      case 'credit': return 'credit';
      default: return 'cash'; // Default fallback
    }
  };

  const handlePayment = async () => {
    const paid = parseFloat(amountPaid) || 0;
    
    // For credit payment, amount paid can be 0 or partial
    if (selectedPaymentMethod === 'cash' && paid < totalAmount) {
      toast({
        title: "Jumlah bayar kurang",
        description: "Jumlah bayar kurang dari total untuk pembayaran tunai!",
        variant: "destructive"
      });
      return;
    }

    // For credit payment, require customer selection
    if (selectedPaymentMethod === 'credit' && !selectedCustomer) {
      toast({
        title: "Pilih pelanggan",
        description: "Pembayaran kredit memerlukan pemilihan pelanggan!",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    
    try {
      // Generate unique transaction number using database function
      const { data: transactionNumber, error: numberError } = await supabase
        .rpc('generate_transaction_number');
      
      if (numberError) {
        console.error('Error generating transaction number:', numberError);
        throw new Error('Gagal membuat nomor transaksi');
      }

      console.log('Generated transaction number:', transactionNumber);

      const customerNote = selectedCustomer ? `Pelanggan: ${selectedCustomer.name}` : 'Tanpa pelanggan';
      const creditNote = selectedPaymentMethod === 'credit' ? `Catatan kredit: ${creditNotes}` : '';
      const receiptNote = printReceipt ? 'Cetak struk' : 'Tanpa struk';
      const notes = [customerNote, creditNote, receiptNote].filter(Boolean).join(' - ');
      
      // For credit payment, calculate remaining debt
      const remainingDebt = selectedPaymentMethod === 'credit' ? totalAmount - paid : 0;
      const paymentStatus = selectedPaymentMethod === 'credit' && remainingDebt > 0 ? 'kredit' : 'selesai';

      console.log('Payment data:', {
        nomor_transaksi: transactionNumber,
        jenis_pembayaran: getPaymentMethodText(selectedPaymentMethod),
        subtotal: totalAmount,
        total: totalAmount,
        bayar: paid,
        kembalian: selectedPaymentMethod === 'cash' ? calculateChange() : 0,
        status: paymentStatus,
        catatan: notes
      });

      const result = await createTransaksi.mutateAsync({
        transaksi: {
          nomor_transaksi: transactionNumber, // Use generated number
          jenis_pembayaran: getPaymentMethodText(selectedPaymentMethod),
          subtotal: totalAmount,
          total: totalAmount,
          bayar: paid,
          kembalian: selectedPaymentMethod === 'cash' ? calculateChange() : 0,
          status: paymentStatus,
          catatan: notes
        },
        detail: cartItems.map(item => ({
          barang_id: item.id,
          nama_barang: item.nama,
          harga_satuan: item.harga_jual,
          jumlah: item.quantity,
          subtotal: item.harga_jual * item.quantity
        }))
      });

      // Also save to POS transactions for compatibility
      await createPOSTransaction.mutateAsync({
        transaction: {
          kasir_username: user?.username || 'unknown',
          kasir_name: user?.full_name || 'Unknown',
          total_amount: totalAmount,
          payment_method: selectedPaymentMethod,
          amount_paid: paid,
          change_amount: selectedPaymentMethod === 'cash' ? calculateChange() : 0,
          items_count: cartItems.length,
          status: paymentStatus === 'kredit' ? 'credit' as const : 'completed' as const,
          notes: notes
        },
        items: cartItems.map(item => ({
          product_id: item.id.toString(),
          product_name: item.nama,
          unit_price: item.harga_jual,
          quantity: item.quantity,
          subtotal: item.harga_jual * item.quantity,
          unit: item.satuan || 'pcs'
        }))
      });

      if (printReceipt) {
        console.log('Printing receipt...');
      }

      const successMessage = selectedPaymentMethod === 'credit' 
        ? `Transaksi kredit berhasil! ${remainingDebt > 0 ? `Sisa tagihan: Rp ${remainingDebt.toLocaleString('id-ID')}` : ''}`
        : "Pembayaran berhasil!";

      toast({
        title: successMessage,
        description: "Transaksi telah disimpan dan terintegrasi dengan laporan rekap penjualan"
      });
      
      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Terjadi kesalahan",
        description: `Gagal memproses pembayaran: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
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

  const isCreditPayment = selectedPaymentMethod === 'credit';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCreditPayment ? <Receipt className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
            {isCreditPayment ? 'Pembayaran Kredit' : 'Pembayaran'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Info */}
          {selectedCustomer && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedCustomer.type === 'unit' ? 'Unit' : 
                     selectedCustomer.type === 'perorangan' ? 'Perorangan' : 'Tamu'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Info */}
          <div className={`p-3 rounded-lg ${isCreditPayment ? 'bg-orange-50' : 'bg-green-50'}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">Metode Pembayaran:</span>
              <Badge variant="secondary">
                {isCreditPayment ? 'Kredit' : 'Tunai'}
              </Badge>
            </div>
          </div>

          {/* Credit Payment Warning */}
          {isCreditPayment && !selectedCustomer && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="text-red-700 text-sm">⚠️ Pembayaran kredit memerlukan pemilihan pelanggan</p>
            </div>
          )}

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

          {/* Amount Paid */}
          <div>
            <Label>
              {isCreditPayment ? 'Jumlah Bayar (opsional - bisa 0 untuk hutang penuh)' : 'Jumlah Bayar'}
            </Label>
            <Input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0"
              className="text-lg"
            />
            
            {/* Quick Amount Buttons - only for cash */}
            {!isCreditPayment && (
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
            )}
          </div>

          {/* Credit Notes */}
          {isCreditPayment && (
            <div>
              <Label>Catatan Kredit</Label>
              <Textarea
                value={creditNotes}
                onChange={(e) => setCreditNotes(e.target.value)}
                placeholder="Catatan tambahan untuk pembayaran kredit..."
                rows={2}
              />
            </div>
          )}

          {/* Change/Debt Info */}
          {amountPaid && (
            <div className={`p-3 rounded-lg ${isCreditPayment ? 'bg-orange-50' : 'bg-green-50'}`}>
              {isCreditPayment ? (
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Sisa Hutang</span>
                    <span className="text-lg font-bold text-orange-600">
                      Rp {Math.max(0, totalAmount - parseFloat(amountPaid)).toLocaleString('id-ID')}
                    </span>
                  </div>
                  {parseFloat(amountPaid) > 0 && (
                    <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                      <span>Dibayar sekarang</span>
                      <span>Rp {parseFloat(amountPaid).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Kembalian</span>
                  <span className="text-lg font-bold text-green-600">
                    Rp {calculateChange().toLocaleString('id-ID')}
                  </span>
                </div>
              )}
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
              disabled={processing || (!isCreditPayment && (!amountPaid || parseFloat(amountPaid) < totalAmount)) || (isCreditPayment && !selectedCustomer)}
              className="flex-1"
            >
              {processing ? 'Memproses...' : (isCreditPayment ? 'Simpan Kredit' : 'Bayar')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default POSPayment;
