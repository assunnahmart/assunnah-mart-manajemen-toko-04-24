
import { Card, CardContent } from '@/components/ui/card';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { usePOSTransactionsToday } from '@/hooks/usePOSTransactions';
import { useTransaksiHariIni } from '@/hooks/useTransaksi';
import { ShoppingCart, DollarSign, Package, Users } from 'lucide-react';

const DashboardSummary = () => {
  const { user } = useSimpleAuth();
  const { data: posStats } = usePOSTransactionsToday();
  const { data: transaksiStats } = useTransaksiHariIni();

  // Combine data from both POS and regular transactions
  const totalTransactions = (posStats?.totalTransactions || 0) + (transaksiStats?.totalTransaksi || 0);
  const totalAmount = (posStats?.totalAmount || 0) + (transaksiStats?.totalPendapatan || 0);

  // Mock data for non-transaction metrics - in real app this would come from API
  const summaryData = {
    totalProduk: 1234,
    totalPelanggan: 89
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-6 mb-6">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold mb-2">
          {totalTransactions}
        </h2>
        <p className="text-xl opacity-90">Total Transaksi Hari Ini</p>
        <p className="text-sm opacity-75 mt-1">
          Operator: {user?.full_name} ({user?.role === 'admin' ? 'Administrator' : 'Kasir'})
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-80" />
          <p className="text-2xl font-bold">
            Rp {totalAmount.toLocaleString('id-ID')}
          </p>
          <p className="text-sm opacity-75">Total Penjualan</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 text-center">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-80" />
          <p className="text-2xl font-bold">{summaryData.totalProduk}</p>
          <p className="text-sm opacity-75">Produk Aktif</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 text-center col-span-2 lg:col-span-1">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-80" />
          <p className="text-2xl font-bold">{summaryData.totalPelanggan}</p>
          <p className="text-sm opacity-75">Pelanggan</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
