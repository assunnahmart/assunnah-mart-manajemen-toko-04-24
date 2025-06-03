
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { usePOSTransactionsToday } from '@/hooks/usePOSTransactions';
import { useStockMutations } from '@/hooks/useStockManagement';

const StockSyncNotification = () => {
  const { data: todayTransactions } = usePOSTransactionsToday();
  const { data: recentMutations } = useStockMutations();
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSyncTime(new Date());
    }, 30000); // Update sync time every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const todayPOSCount = todayTransactions?.totalTransactions || 0;
  const recentStockMutations = recentMutations?.filter(mutation => 
    mutation.referensi_tipe === 'penjualan' && 
    new Date(mutation.created_at).toDateString() === new Date().toDateString()
  )?.length || 0;

  const syncStatus = todayPOSCount === recentStockMutations ? 'synced' : 'warning';

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              syncStatus === 'synced' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
            }`}>
              {syncStatus === 'synced' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Sinkronisasi POS & Stok
              </h3>
              <p className="text-sm text-gray-600">
                {syncStatus === 'synced' 
                  ? 'Data stok tersinkronisasi dengan transaksi POS'
                  : 'Menunggu sinkronisasi data...'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <Badge variant="secondary" className="mb-1">
                Transaksi POS Hari Ini
              </Badge>
              <p className="font-bold text-blue-600">{todayPOSCount}</p>
            </div>
            
            <div className="text-center">
              <Badge variant="secondary" className="mb-1">
                Mutasi Stok Hari Ini
              </Badge>
              <p className="font-bold text-green-600">{recentStockMutations}</p>
            </div>
            
            <div className="text-center">
              <Badge variant="outline" className="mb-1">
                <RefreshCw className="h-3 w-3 mr-1" />
                Terakhir Sync
              </Badge>
              <p className="text-xs text-gray-500">
                {lastSyncTime.toLocaleTimeString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockSyncNotification;
