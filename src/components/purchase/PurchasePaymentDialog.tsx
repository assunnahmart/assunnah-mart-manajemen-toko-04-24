
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useKasir } from '@/hooks/useKasir';

interface PurchasePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    id: string;
    nomor_transaksi: string;
    supplier: { nama: string; id: string };
    total: number;
    sisa_hutang?: number;
    jenis_pembayaran: string;
  };
}

const PurchasePaymentDialog = ({
  isOpen,
  onClose,
  transaction
}: PurchasePaymentDialogProps) => {
  const [amount, setAmount] = useState(0);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  const { user } = useSimpleAuth();
  const { data: kasirData } = useKasir();
  const queryClient = useQueryClient();

  const userKasir = kasirData?.find(k => k.nama === user?.full_name);
  const currentDebt = transaction.sisa_hutang || (transaction.jenis_pembayaran === 'kredit' ? transaction.total : 0);

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      toast({
        title: "Error",
        description: "Masukkan jumlah pembayaran yang valid",
        variant: "destructive"
      });
      return;
    }

    if (amount > currentDebt) {
      toast({
        title: "Error", 
        description: `Pembayaran tidak boleh melebihi sisa hutang (Rp ${currentDebt.toLocaleString('id-ID')})`,
        variant: "destructive"
      });
      return;
    }

    if (!referenceNumber.trim()) {
      toast({
        title: "Error",
        description: "Masukkan nomor referensi pembayaran",
        variant: "destructive"
      });
      return;
    }

    if (!userKasir) {
      toast({
        title: "Error",
        description: "Data kasir tidak ditemukan",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Generate kas transaction number
      const { data: kasTransactionNumber, error: kasNumberError } = await supabase
        .rpc('generate_kas_transaction_number');
      
      if (kasNumberError) throw kasNumberError;

      // Get kas account
      const { data: kasAccount, error: kasAccountError } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .eq('kode_akun', '1001')
        .eq('is_active', true)
        .single();
      
      if (kasAccountError || !kasAccount) {
        throw new Error('Akun kas tidak ditemukan');
      }

      // Calculate new debt amount
      const newDebtAmount = currentDebt - amount;

      // Update transaksi_pembelian with new sisa_hutang
      const { error: updateError } = await supabase
        .from('transaksi_pembelian')
        .update({ 
          sisa_hutang: newDebtAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      if (updateError) throw updateError;

      // Create kas keluar entry
      const { error: kasError } = await supabase
        .from('kas_umum_transactions')
        .insert({
          transaction_number: kasTransactionNumber as string,
          tanggal_transaksi: new Date().toISOString().split('T')[0],
          jenis_transaksi: 'keluar',
          akun_id: kasAccount.id,
          jumlah: amount,
          keterangan: `Pembayaran hutang pembelian - ${transaction.nomor_transaksi} - ${transaction.supplier.nama} - ${notes}`,
          referensi_tipe: 'purchase_payment',
          referensi_id: transaction.id,
          kasir_username: user?.username || 'system',
          kasir_name: userKasir.nama
        });
      
      if (kasError) throw kasError;

      // Record supplier payment in ledger
      const { error: supplierPaymentError } = await supabase
        .rpc('record_supplier_payment', {
          p_supplier_id: transaction.supplier.id,
          p_amount: amount,
          p_payment_date: new Date().toISOString().split('T')[0],
          p_reference_number: referenceNumber,
          p_kasir_name: userKasir.nama,
          p_keterangan: notes
        });

      if (supplierPaymentError) throw supplierPaymentError;

      toast({
        title: "Berhasil",
        description: `Pembayaran sebesar Rp ${amount.toLocaleString('id-ID')} berhasil dicatat`
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['purchase_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-payables-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['kas_umum_transactions'] });

      onClose();
      setAmount(0);
      setReferenceNumber('');
      setNotes('');
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal memproses pembayaran",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bayar Hutang Pembelian</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">
              Transaksi: {transaction.nomor_transaksi}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              Supplier: {transaction.supplier.nama}
            </div>
            <div className="font-bold text-red-600">
              Sisa Hutang: Rp {currentDebt.toLocaleString('id-ID')}
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Jumlah Pembayaran</Label>
            <Input
              id="amount"
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Masukkan jumlah pembayaran"
              max={currentDebt}
            />
          </div>

          <div>
            <Label htmlFor="reference">Nomor Referensi</Label>
            <Input
              id="reference"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Nomor bukti pembayaran"
            />
          </div>

          <div>
            <Label htmlFor="notes">Keterangan</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keterangan pembayaran (opsional)"
              rows={3}
            />
          </div>

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
              disabled={isProcessing || !amount || !referenceNumber.trim()}
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

export default PurchasePaymentDialog;
