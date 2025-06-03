
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
      konsinyasiData, 
      kasirId, 
      kasirName 
    }: { 
      konsinyasiData: any; 
      kasirId: string; 
      kasirName: string; 
    }) => {
      try {
        // Create kasir kas transaction (outgoing) - don't pass kasir_id as UUID since our system uses string IDs
        await createKasirTransaction.mutateAsync({
          kasir_id: null, // Set to null since our kasir table expects UUID but auth system uses strings
          kasir_name: kasirName,
          jenis_transaksi: 'keluar',
          kategori: 'konsinyasi',
          jumlah: konsinyasiData.total_pembayaran,
          keterangan: `Pembayaran konsinyasi ${konsinyasiData.product_name} - ${konsinyasiData.supplier_name}`,
          referensi_tipe: 'konsinyasi_payment',
          referensi_id: konsinyasiData.id,
          sync_to_kas_umum: true
        });

        toast({
          title: "Pembayaran konsinyasi berhasil",
          description: `Kas keluar Rp ${konsinyasiData.total_pembayaran.toLocaleString('id-ID')} telah dicatat dan disinkronkan ke kas umum`
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
