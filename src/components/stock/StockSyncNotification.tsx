import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { usePOSTransactionsToday } from '@/hooks/usePOSTransactions';
import { useStockMutations, useStockSyncStatus } from '@/hooks/useStockManagement';
import { useQueryClient } from '@tanstack/react-query';

const StockSyncNotification = () => {
  const queryClient = useQueryClient();
  const { data: todayTransactions } = usePOSTransactionsToday();
  const { data: recentMutations } = useStockMutations();
  const { data: syncStatus } = useStockSyncStatus();
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

  const syncOk = syncStatus?.isSynced || (todayPOSCount === recentStockMutations);

  const handleForceSync = () => {
    // Force refresh all queries
    queryClient.invalidateQueries({ queryKey: ['stock_data'] });
    queryClient.invalidateQueries({ queryKey: ['stock_mutations'] });
    queryClient.invalidateQueries({ queryKey: ['barang_konsinyasi'] });
    queryClient.invalidateQueries({ queryKey: ['barang-konsinyasi'] });
    queryClient.invalidateQueries({ queryKey: ['barang'] });
    queryClient.invalidateQueries({ queryKey: ['low_stock_products'] });
    queryClient.invalidateQueries({ queryKey: ['pos_transactions_today'] });
    queryClient.invalidateQueries({ queryKey: ['stock_sync_status'] });
    setLastSyncTime(new Date());
  };

  return (
    <Card className={`mb-4 ${syncOk ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              syncOk ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
            }`}>
              {syncOk ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Sinkronisasi POS & Stok Real-time
              </h3>
              <p className="text-sm text-gray-600">
                {syncOk 
                  ? 'Data stok tersinkronisasi sempurna dengan transaksi POS'
                  : 'Mendeteksi perbedaan data, memantau sinkronisasi...'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
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

            <Button
              variant="outline"
              size="sm"
              onClick={handleForceSync}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Force Sync
            </Button>
          </div>
        </div>

        {!syncOk && (
          <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Info:</strong> Sistem sedang memantau sinkronisasi data. 
              Jika perbedaan tetap ada, data akan tersinkronisasi otomatis dalam beberapa detik.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockSyncNotification;
