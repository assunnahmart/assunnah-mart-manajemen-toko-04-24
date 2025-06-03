
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCreateKasTransaction } from '@/hooks/useKasUmum';
import { useCreateKasirKasTransaction } from '@/hooks/useKasirKas';
import { useToast } from '@/hooks/use-toast';

export const useKonsinyasiPayment = () => {
  const queryClient = useQueryClient();
  const createKasTransaction = useCreateKasTransaction();
  const createKasirTransaction = useCreateKasirKasTransaction();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      konsinyasiId, 
      konsinyasiData, 
      kasirId, 
      kasirName 
    }: { 
      konsinyasiId: string;
      konsinyasiData: any; 
      kasirId: string; 
      kasirName: string; 
    }) => {
      try {
        console.log('Processing konsinyasi payment:', { konsinyasiId, konsinyasiData, kasirId, kasirName });
        
        // Calculate selisih amount (difference × unit price)
        const selisihAmount = Math.abs(konsinyasiData.selisih_stok * konsinyasiData.harga_beli);
        
        // Create main payment transaction (outgoing for goods sold)
        if (konsinyasiData.total_pembayaran > 0) {
          await createKasirTransaction.mutateAsync({
            kasir_id: null,
            kasir_name: kasirName,
            jenis_transaksi: 'keluar',
            kategori: 'konsinyasi',
            jumlah: konsinyasiData.total_pembayaran,
            keterangan: `Pembayaran konsinyasi ${konsinyasiData.product_name} - ${konsinyasiData.supplier_name}`,
            referensi_tipe: 'konsinyasi_payment',
            referensi_id: konsinyasiId,
            sync_to_kas_umum: true
          });
        }

        // Handle stock difference transactions
        if (konsinyasiData.selisih_stok !== 0 && selisihAmount > 0) {
          if (konsinyasiData.selisih_stok > 0) {
            // More sold than system recorded - additional income
            await createKasirTransaction.mutateAsync({
              kasir_id: null,
              kasir_name: kasirName,
              jenis_transaksi: 'masuk',
              kategori: 'konsinyasi_selisih',
              jumlah: selisihAmount,
              keterangan: `Penerimaan selisih lebih konsinyasi (+${konsinyasiData.selisih_stok} pcs) ${konsinyasiData.product_name}`,
              referensi_tipe: 'konsinyasi_difference',
              referensi_id: konsinyasiId,
              sync_to_kas_umum: true
            });
          } else {
            // Less sold than system recorded - expense/loss
            await createKasirTransaction.mutateAsync({
              kasir_id: null,
              kasir_name: kasirName,
              jenis_transaksi: 'keluar',
              kategori: 'konsinyasi_selisih',
              jumlah: selisihAmount,
              keterangan: `Pengeluaran selisih kurang konsinyasi (${konsinyasiData.selisih_stok} pcs) ${konsinyasiData.product_name}`,
              referensi_tipe: 'konsinyasi_difference',
              referensi_id: konsinyasiId,
              sync_to_kas_umum: true
            });
          }
        }

        const totalTransactions = konsinyasiData.total_pembayaran + (selisihAmount || 0);
        const selisihMessage = konsinyasiData.selisih_stok !== 0 
          ? ` dan selisih ${konsinyasiData.selisih_stok > 0 ? 'penerimaan' : 'pengeluaran'} Rp ${selisihAmount.toLocaleString('id-ID')}`
          : '';

        toast({
          title: "Pembayaran konsinyasi berhasil",
          description: `Kas keluar Rp ${konsinyasiData.total_pembayaran.toLocaleString('id-ID')}${selisihMessage} telah dicatat dan disinkronkan ke kas umum`
        });

        return true;
      } catch (error) {
        console.error('Error creating consignment payment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasir_kas_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['kas_umum_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['kas_balance'] });
    },
  });
};
