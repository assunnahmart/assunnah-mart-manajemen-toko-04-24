
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type TransaksiPenjualan = Tables<'transaksi_penjualan'>;
type DetailTransaksiPenjualan = Tables<'detail_transaksi_penjualan'>;
type TransaksiInsert = TablesInsert<'transaksi_penjualan'>;
type DetailTransaksiInsert = TablesInsert<'detail_transaksi_penjualan'>;

export const useTransaksiPenjualan = (limit?: number) => {
  return useQuery({
    queryKey: ['transaksi_penjualan', limit],
    queryFn: async () => {
      let query = supabase
        .from('transaksi_penjualan')
        .select(`
          *,
          kasir (nama),
          pelanggan_unit (nama_unit),
          pelanggan_perorangan (nama)
        `)
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};

export const useTransaksiHariIni = () => {
  return useQuery({
    queryKey: ['transaksi_hari_ini'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('transaksi_penjualan')
        .select('*')
        .gte('tanggal_transaksi', `${today}T00:00:00`)
        .lt('tanggal_transaksi', `${today}T23:59:59`)
        .eq('status', 'selesai');
      
      if (error) throw error;
      
      const totalTransaksi = data.length;
      const totalPendapatan = data.reduce((sum, t) => sum + (t.total || 0), 0);
      
      return {
        totalTransaksi,
        totalPendapatan,
        transaksi: data as TransaksiPenjualan[]
      };
    },
  });
};

export const useCreateTransaksi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      transaksi, 
      detail 
    }: { 
      transaksi: TransaksiInsert; 
      detail: DetailTransaksiInsert[] 
    }) => {
      // Insert transaksi
      const { data: transaksiData, error: transaksiError } = await supabase
        .from('transaksi_penjualan')
        .insert(transaksi)
        .select()
        .single();
      
      if (transaksiError) throw transaksiError;
      
      // Insert detail transaksi
      const detailWithTransaksiId = detail.map(d => ({
        ...d,
        transaksi_id: transaksiData.id
      }));
      
      const { data: detailData, error: detailError } = await supabase
        .from('detail_transaksi_penjualan')
        .insert(detailWithTransaksiId)
        .select();
      
      if (detailError) throw detailError;
      
      // Update stok barang
      for (const item of detail) {
        if (item.barang_id) {
          const { error: stokError } = await supabase.rpc('update_stok_barang', {
            barang_id: item.barang_id,
            jumlah_keluar: item.jumlah
          });
          
          if (stokError) console.error('Error updating stock:', stokError);
        }
      }
      
      return { transaksi: transaksiData, detail: detailData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaksi_penjualan'] });
      queryClient.invalidateQueries({ queryKey: ['transaksi_hari_ini'] });
      queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
      queryClient.invalidateQueries({ queryKey: ['barang_stok_rendah'] });
    },
  });
};
