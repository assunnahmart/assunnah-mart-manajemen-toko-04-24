
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useKasUmum = () => {
  return useQuery({
    queryKey: ['kas_umum'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get cash transactions from POS
      const { data: posCash, error: posError } = await supabase
        .from('pos_transactions')
        .select('*')
        .eq('payment_method', 'cash')
        .eq('status', 'completed');
      
      if (posError) throw posError;
      
      // Get cash transactions from regular sales
      const { data: regularCash, error: regularError } = await supabase
        .from('transaksi_penjualan')
        .select('*')
        .eq('jenis_pembayaran', 'cash')
        .eq('status', 'selesai');
      
      if (regularError) throw regularError;
      
      // Calculate totals
      const totalKasMasuk = [
        ...posCash.map(t => t.total_amount),
        ...regularCash.map(t => t.total)
      ].reduce((sum, amount) => sum + amount, 0);
      
      // Today's cash income
      const todayCash = [
        ...posCash.filter(t => new Date(t.created_at).toDateString() === new Date().toDateString()),
        ...regularCash.filter(t => new Date(t.created_at).toDateString() === new Date().toDateString())
      ];
      
      const todayKasMasuk = todayCash.reduce((sum, t) => {
        return sum + (('total_amount' in t) ? t.total_amount : t.total);
      }, 0);
      
      return {
        totalKasMasuk,
        todayKasMasuk,
        totalTransaksiKas: posCash.length + regularCash.length,
        todayTransaksiKas: todayCash.length,
        detailTransaksi: [...posCash, ...regularCash],
        todayTransaksi: todayCash
      };
    },
  });
};

export const useLabaRugi = () => {
  return useQuery({
    queryKey: ['laba_rugi'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get all completed transactions
      const [posResult, regularResult] = await Promise.all([
        supabase
          .from('pos_transactions')
          .select('*, pos_transaction_items(*)')
          .eq('status', 'completed'),
        supabase
          .from('transaksi_penjualan')
          .select('*, detail_transaksi_penjualan(*)')
          .eq('status', 'selesai')
      ]);
      
      if (posResult.error) throw posResult.error;
      if (regularResult.error) throw regularResult.error;
      
      // Calculate revenue
      const totalPendapatan = [
        ...posResult.data.map(t => t.total_amount),
        ...regularResult.data.map(t => t.total)
      ].reduce((sum, amount) => sum + amount, 0);
      
      // Estimate cost of goods sold (simplified calculation)
      let totalHPP = 0;
      
      // Get product costs from barang_konsinyasi
      const { data: products, error: productsError } = await supabase
        .from('barang_konsinyasi')
        .select('id, harga_beli, harga_jual');
      
      if (!productsError && products) {
        const productMap = products.reduce((map, product) => {
          map[product.id] = product;
          return map;
        }, {});
        
        // Calculate HPP from POS transactions
        posResult.data.forEach(transaction => {
          transaction.pos_transaction_items?.forEach(item => {
            const product = productMap[item.product_id];
            if (product) {
              totalHPP += (product.harga_beli || 0) * item.quantity;
            }
          });
        });
        
        // Calculate HPP from regular transactions
        regularResult.data.forEach(transaction => {
          transaction.detail_transaksi_penjualan?.forEach(item => {
            const product = productMap[item.barang_id];
            if (product) {
              totalHPP += (product.harga_beli || 0) * item.jumlah;
            }
          });
        });
      }
      
      const labaKotor = totalPendapatan - totalHPP;
      const marginKeuntungan = totalPendapatan > 0 ? (labaKotor / totalPendapatan) * 100 : 0;
      
      // Today's calculations
      const todayTransactions = [
        ...posResult.data.filter(t => new Date(t.created_at).toDateString() === new Date().toDateString()),
        ...regularResult.data.filter(t => new Date(t.created_at).toDateString() === new Date().toDateString())
      ];
      
      const todayPendapatan = todayTransactions.reduce((sum, t) => {
        return sum + (('total_amount' in t) ? t.total_amount : t.total);
      }, 0);
      
      return {
        totalPendapatan,
        totalHPP,
        labaKotor,
        marginKeuntungan,
        todayPendapatan,
        totalTransaksi: posResult.data.length + regularResult.data.length,
        todayTransaksi: todayTransactions.length
      };
    },
  });
};

export const useSupplierData = () => {
  return useQuery({
    queryKey: ['supplier_data'],
    queryFn: async () => {
      const { data: suppliers, error: supplierError } = await supabase
        .from('supplier')
        .select('*')
        .order('nama');
      
      if (supplierError) throw supplierError;
      
      // Get products by supplier
      const { data: products, error: productsError } = await supabase
        .from('barang_konsinyasi')
        .select('*');
      
      if (productsError) throw productsError;
      
      // Group products by supplier
      const supplierStats = suppliers.map(supplier => {
        const supplierProducts = products.filter(p => p.supplier_id === supplier.id);
        const totalProducts = supplierProducts.length;
        const totalValue = supplierProducts.reduce((sum, p) => sum + (p.harga_beli * p.stok_saat_ini), 0);
        
        return {
          ...supplier,
          totalProducts,
          totalValue,
          products: supplierProducts
        };
      });
      
      return {
        suppliers: supplierStats,
        totalSuppliers: suppliers.length,
        totalProducts: products.length
      };
    },
  });
};
