
import { useState, useEffect, useRef } from 'react';
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
  const [inputError, setInputError] = useState('');
  const { toast } = useToast();
  const { user } = useSimpleAuth();
  const createTransaction = useCreatePOSTransaction();
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Auto focus on amount input when modal opens
  useEffect(() => {
    if (selectedPaymentMethod === 'cash' && amountInputRef.current) {
      setTimeout(() => {
        amountInputRef.current?.focus();
        amountInputRef.current?.select();
      }, 100);
    }
  }, [selectedPaymentMethod]);

  const changeAmount = Math.max(0, amountPaid - totalAmount);

  const validateInput = () => {
    setInputError('');
    
    if (isNaN(amountPaid) || amountPaid < 0) {
      setInputError('Jumlah bayar harus berupa angka positif');
      return false;
    }
    
    if (selectedPaymentMethod === 'cash' && amountPaid < totalAmount) {
      setInputError('Jumlah bayar harus minimal sama dengan total belanja');
      return false;
    }
    
    return true;
  };

  const updateStockItems = async (items: any[]) => {
    for (const item of items) {
      try {
        const { error } = await supabase
          .rpc('update_stok_barang', {
            barang_id: item.id.toString(),
            jumlah_keluar: item.quantity
          });
        
        if (error) {
          console.error('Error updating stock for item:', item.id, error);
          throw new Error(`Gagal update stok untuk ${item.nama}: ${error.message}`);
        }
      } catch (error) {
        console.error('Stock update error:', error);
        throw error;
      }
    }
  };

  const updateCustomerDebt = async () => {
    if (selectedPaymentMethod !== 'credit' || !selectedCustomer) return;

    try {
      if (selectedCustomer.type === 'unit') {
        const { error } = await supabase
          .from('pelanggan_unit')
          .update({ 
            total_tagihan: selectedCustomer.total_tagihan + totalAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedCustomer.id);
        
        if (error) {
          console.error('Error updating unit debt:', error);
          throw new Error('Gagal update piutang unit');
        }
      } else if (selectedCustomer.type === 'perorangan') {
        const { error } = await supabase
          .from('pelanggan_perorangan')
          .update({ 
            sisa_piutang: selectedCustomer.sisa_piutang + totalAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedCustomer.id);
        
        if (error) {
          console.error('Error updating personal debt:', error);
          throw new Error('Gagal update piutang perorangan');
        }
      }
    } catch (error) {
      console.error('Customer debt update error:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!validateInput()) {
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Starting payment process:', {
        paymentMethod: selectedPaymentMethod,
        totalAmount,
        amountPaid,
        cartItemsCount: cartItems.length
      });

      // Create transaction data
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

      console.log('Creating transaction with data:', { transactionData, itemsData });

      // Create the transaction
      const result = await createTransaction.mutateAsync({
        transaction: transactionData,
        items: itemsData
      });

      console.log('Transaction created successfully:', result);

      // Update stock for all items
      await updateStockItems(cartItems);
      console.log('Stock updated successfully');

      // Update customer debt if credit payment
      await updateCustomerDebt();
      console.log('Customer debt updated successfully');

      // Dispatch completion event for sync
      const event = new CustomEvent('pos-transaction-complete', {
        detail: {
          transaction: result.transaction,
          items: result.items
        }
      });
      window.dispatchEvent(event);
      console.log('Transaction completion event dispatched');

      toast({
        title: "Pembayaran berhasil",
        description: `Transaksi ${result.transaction.transaction_number} telah disimpan dengan metode ${selectedPaymentMethod === 'cash' ? 'tunai' : 'kredit'}`
      });

      // Reset and close
      onSuccess();

    } catch (error: any) {
      console.error('Payment processing error:', error);
      
      let errorMessage = 'Terjadi kesalahan saat memproses pembayaran';
      
      if (error.message?.includes('stok')) {
        errorMessage = 'Gagal memperbarui stok produk';
      } else if (error.message?.includes('piutang')) {
        errorMessage = 'Gagal memperbarui piutang pelanggan';
      } else if (error.message?.includes('transaction')) {
        errorMessage = 'Gagal menyimpan transaksi';
      }
      
      toast({
        title: "Gagal memproses pembayaran",
        description: `${errorMessage}: ${error.message || 'Kesalahan tidak diketahui'}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setAmountPaid(numValue);
    setInputError('');
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
                  ref={amountInputRef}
                  type="number"
                  value={amountPaid}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={`text-lg font-bold ${inputError ? 'border-red-500' : ''}`}
                  min="0"
                  step="1000"
                  disabled={isProcessing}
                />
                {inputError && (
                  <p className="text-sm text-red-600 mt-1">{inputError}</p>
                )}
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
              disabled={isProcessing || (selectedPaymentMethod === 'cash' && (amountPaid < totalAmount || !!inputError))}
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
