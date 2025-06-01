
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, DollarSign } from 'lucide-react';
import { usePOSTransactionsToday } from '@/hooks/usePOSTransactions';

const POSTransactionHistory = () => {
  const { data: todayData, isLoading } = usePOSTransactionsToday();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Ringkasan Hari Ini
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">Total Transaksi</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {todayData?.totalTransactions || 0}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-700">Total Penjualan</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              Rp {(todayData?.totalAmount || 0).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Data transaksi akan otomatis tersinkronisasi dengan stok barang dan kas umum.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default POSTransactionHistory;
