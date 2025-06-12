
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { useStockSync } from '@/hooks/useStockSync';
import { usePOSTransactionsToday } from '@/hooks/usePOSTransactions';
import { useStockMutations } from '@/hooks/useStockManagement';

const StockOpnameRealTimeSync = () => {
  const { forceSync } = useStockSync();
  const { data: todayTransactions } = usePOSTransactionsToday();
  const { data: recentMutations } = useStockMutations();

  const todayPOSCount = todayTransactions?.totalTransactions || 0;
  const todayStockMutations = recentMutations?.filter(mutation => 
    mutation.referensi_tipe === 'penjualan' && 
    new Date(mutation.created_at).toDateString() === new Date().toDateString()
  )?.length || 0;

  const isSynced = todayPOSCount === todayStockMutations;

  return (
    <Card className={`mb-4 border-l-4 ${
      isSynced ? 'border-l-green-500 bg-green-50' : 'border-l-yellow-500 bg-yellow-50'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              isSynced ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
            }`}>
              {isSynced ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Sinkronisasi Real-time POS & Stok Opname
              </h3>
              <p className="text-sm text-gray-600">
                {isSynced 
                  ? 'Semua transaksi POS telah tersinkronisasi dengan stok sistem'
                  : 'Memantau sinkronisasi antara POS dan stok sistem...'
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
              <p className="font-bold text-green-600">{todayStockMutations}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={forceSync}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sync Manual
            </Button>
          </div>
        </div>

        {!isSynced && (
          <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Informasi:</strong> Sistem sedang memantau sinkronisasi data. 
              Stok akan tersinkronisasi otomatis setelah setiap transaksi POS selesai.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockOpnameRealTimeSync;
