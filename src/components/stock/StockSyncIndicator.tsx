
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock,
  Database,
  Zap,
  ClipboardList
} from 'lucide-react';
import { useStockSyncMonitor } from '@/hooks/useStockSyncMonitor';
import { usePOSTransactionsToday } from '@/hooks/usePOSTransactions';
import { useStockMutations, useStockSyncStatus } from '@/hooks/useStockManagement';
import { useStockOpnameRecap } from '@/hooks/useStockOpnameRecap';

const StockSyncIndicator = () => {
  const { syncStatus, forceSyncAll } = useStockSyncMonitor();
  const { data: todayTransactions } = usePOSTransactionsToday();
  const { data: recentMutations } = useStockMutations();
  const { data: syncStatusData } = useStockSyncStatus();
  const { data: stockOpnameRecap } = useStockOpnameRecap();

  const todayPOSCount = todayTransactions?.totalTransactions || 0;
  const todayStockMutations = recentMutations?.filter(mutation => 
    mutation.referensi_tipe === 'penjualan' && 
    new Date(mutation.created_at).toDateString() === new Date().toDateString()
  )?.length || 0;

  const todayStockOpnameCount = syncStatusData?.stockOpnameCount || 0;
  const totalProductsWithOpname = stockOpnameRecap?.length || 0;

  const isSynced = todayPOSCount === todayStockMutations && syncStatus.syncErrors.length === 0;

  return (
    <Card className={`mb-4 border-l-4 ${
      !syncStatus.isOnline ? 'border-l-red-500 bg-red-50' :
      syncStatus.pendingSync ? 'border-l-yellow-500 bg-yellow-50' :
      isSynced ? 'border-l-green-500 bg-green-50' : 
      'border-l-orange-500 bg-orange-50'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              !syncStatus.isOnline ? 'bg-red-100 text-red-600' :
              syncStatus.pendingSync ? 'bg-yellow-100 text-yellow-600' :
              isSynced ? 'bg-green-100 text-green-600' : 
              'bg-orange-100 text-orange-600'
            }`}>
              {!syncStatus.isOnline ? (
                <WifiOff className="h-5 w-5" />
              ) : syncStatus.pendingSync ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : isSynced ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Sinkronisasi Stok Terintegrasi (POS • Pembelian • Opname)
              </h3>
              <p className="text-sm text-gray-600">
                {!syncStatus.isOnline ? 'Tidak ada koneksi internet' :
                 syncStatus.pendingSync ? 'Sedang sinkronisasi data...' :
                 isSynced ? 'Semua data tersinkronisasi sempurna dengan stok opname' :
                 'Monitoring sinkronisasi data stok real-time'
                }
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {syncStatus.lastSync.toLocaleTimeString('id-ID')}
                </Badge>
                <Badge variant={syncStatus.isOnline ? "default" : "destructive"} className="text-xs">
                  {syncStatus.isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                  {syncStatus.isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <Badge variant="secondary" className="mb-1">
                <Database className="h-3 w-3 mr-1" />
                Transaksi POS
              </Badge>
              <p className="font-bold text-blue-600">{todayPOSCount}</p>
            </div>
            
            <div className="text-center">
              <Badge variant="secondary" className="mb-1">
                <RefreshCw className="h-3 w-3 mr-1" />
                Mutasi Stok
              </Badge>
              <p className="font-bold text-green-600">{todayStockMutations}</p>
            </div>

            <div className="text-center">
              <Badge variant="secondary" className="mb-1">
                <ClipboardList className="h-3 w-3 mr-1" />
                Stok Opname
              </Badge>
              <p className="font-bold text-purple-600">{todayStockOpnameCount}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={forceSyncAll}
              disabled={syncStatus.pendingSync}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncStatus.pendingSync ? 'animate-spin' : ''}`} />
              Sync All
            </Button>
          </div>
        </div>

        {syncStatus.syncErrors.length > 0 && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error Sinkronisasi:</strong>
              <ul className="list-disc list-inside mt-1">
                {syncStatus.syncErrors.slice(-3).map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {totalProductsWithOpname > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Info Stok Opname:</strong> {totalProductsWithOpname} produk telah dilakukan stok opname hari ini. 
              Data stok sistem telah disesuaikan dengan hasil opname untuk akurasi inventory yang optimal.
            </p>
          </div>
        )}

        {!isSynced && syncStatus.isOnline && !syncStatus.pendingSync && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Info:</strong> Sistem memantau sinkronisasi secara real-time. 
              Data akan tersinkronisasi otomatis setelah setiap transaksi POS, pembelian, atau stok opname.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockSyncIndicator;
