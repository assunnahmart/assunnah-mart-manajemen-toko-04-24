
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
    <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg shadow-lg p-6 mb-6">
      <div className="text-center mb-6">
        {/* Assunnah Mart Logo Header */}
        <div className="flex items-center justify-center mb-4">
          <div className="bg-white p-3 rounded-lg shadow-md mr-3">
            <img 
              src="/lovable-uploads/163a7d14-7869-47b2-b33b-40be703e48e1.png" 
              alt="Assunnah Mart Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Assunnah Mart</h1>
            <p className="text-pink-100 text-sm">Sistem Manajemen Toko</p>
            <p className="text-pink-200 text-xs">belanja hemat, berkah, nikmat</p>
          </div>
        </div>
        
        <h2 className="text-4xl font-bold mb-2">
          {totalTransactions}
        </h2>
        <p className="text-xl opacity-90">Total Transaksi Hari Ini</p>
        <p className="text-sm opacity-75 mt-1">
          Operator: {user?.full_name} ({user?.role === 'admin' ? 'Administrator' : 'Kasir'})
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
          <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-80" />
          <p className="text-2xl font-bold">
            Rp {totalAmount.toLocaleString('id-ID')}
          </p>
          <p className="text-sm opacity-75">Total Penjualan</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-80" />
          <p className="text-2xl font-bold">{summaryData.totalProduk}</p>
          <p className="text-sm opacity-75">Produk Aktif</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 text-center col-span-2 lg:col-span-1 backdrop-blur-sm">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-80" />
          <p className="text-2xl font-bold">{summaryData.totalPelanggan}</p>
          <p className="text-sm opacity-75">Pelanggan</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
