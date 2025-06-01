import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCreatePOSTransaction } from '@/hooks/usePOSTransactions';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { supabase } from '@/integrations/supabase/client';

interface POSPaymentProps {
  cartItems: any[];
  totalAmount: number;
  selectedCustomer: any;
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
  const [amountPaid, setAmountPaid] = useState(totalAmount);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useSimpleAuth();
  const createTransaction = useCreatePOSTransaction();

  const changeAmount = Math.max(0, amountPaid - totalAmount);

  const handlePayment = async () => {
    if (selectedPaymentMethod === 'cash' && amountPaid < totalAmount) {
      toast({
        title: "Pembayaran tidak cukup",
        description: "Jumlah bayar harus minimal sama dengan total belanja",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const transactionData = {
        kasir_username: user?.username || 'unknown',
        kasir_name: user?.full_name || 'Unknown',
        total_amount: totalAmount,
        payment_method: selectedPaymentMethod,
        amount_paid: amountPaid,
        change_amount: changeAmount,
        items_count: cartItems.length,
        status: 'completed' as const,
        notes: `${selectedCustomer ? `Pelanggan: ${selectedCustomer.name}` : 'Tanpa pelanggan'} - Metode: ${selectedPaymentMethod === 'cash' ? 'Tunai' : 'Kredit'}`
      };

      const itemsData = cartItems.map(item => ({
        product_id: item.id.toString(),
        product_name: item.nama,
        unit_price: item.harga_jual,
        quantity: item.quantity,
        subtotal: item.harga_jual * item.quantity,
        unit: item.satuan || 'pcs'
      }));

      await createTransaction.mutateAsync({
        transaction: transactionData,
        items: itemsData
      });

      // Update customer debt if credit payment
      if (selectedPaymentMethod === 'credit' && selectedCustomer) {
        if (selectedCustomer.type === 'unit') {
          const { error } = await supabase
            .from('pelanggan_unit')
            .update({ 
              total_tagihan: selectedCustomer.total_tagihan + totalAmount,
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedCustomer.id);
          
          if (error) console.error('Error updating unit debt:', error);
        } else if (selectedCustomer.type === 'perorangan') {
          const { error } = await supabase
            .from('pelanggan_perorangan')
            .update({ 
              sisa_piutang: selectedCustomer.sisa_piutang + totalAmount,
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedCustomer.id);
          
          if (error) console.error('Error updating personal debt:', error);
        }
      }

      toast({
        title: "Pembayaran berhasil",
        description: `Transaksi telah disimpan dengan metode ${selectedPaymentMethod === 'cash' ? 'tunai' : 'kredit'}`
      });

      onSuccess();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Gagal memproses pembayaran",
        description: `Terjadi kesalahan: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Pembayaran {selectedPaymentMethod === 'cash' ? 'Tunai' : 'Kredit'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Total Belanja:</span>
              <span className="font-bold">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
            {selectedCustomer && (
              <div className="text-sm text-gray-600">
                Pelanggan: {selectedCustomer.name}
              </div>
            )}
          </div>

          {selectedPaymentMethod === 'cash' ? (
            <>
              <div>
                <Label htmlFor="amountPaid">Jumlah Bayar</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="text-lg font-bold"
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span>Kembalian:</span>
                  <span className="font-bold text-green-600">
                    Rp {changeAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-orange-700 text-sm">
                Transaksi kredit akan ditambahkan ke piutang pelanggan
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing || (selectedPaymentMethod === 'cash' && amountPaid < totalAmount)}
              className="flex-1"
            >
              {isProcessing ? 'Memproses...' : 'Bayar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default POSPayment;
