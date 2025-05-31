
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Receipt, Calendar } from 'lucide-react';
import { useTransaksiPenjualan } from '@/hooks/useTransaksi';
import { usePOSTransactions } from '@/hooks/usePOSTransactions';

const POSTransactionHistory = () => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  
  const { data: transaksiPenjualan, isLoading: loadingTransaksi } = useTransaksiPenjualan(20);
  const { data: posTransactions, isLoading: loadingPOS } = usePOSTransactions(20);

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'tunai':
      case 'cash':
        return 'Tunai';
      case 'kartu':
      case 'card':
        return 'Kartu';
      case 'digital':
        return 'Digital';
      case 'quick_save':
        return 'Simpan Cepat';
      default:
        return method;
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'selesai':
      case 'completed':
        return { label: 'Selesai', variant: 'default' as const };
      case 'pending':
        return { label: 'Pending', variant: 'secondary' as const };
      case 'saved':
        return { label: 'Tersimpan', variant: 'outline' as const };
      default:
        return { label: status, variant: 'outline' as const };
    }
  };

  const handleViewDetail = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowDetail(true);
  };

  if (loadingTransaksi || loadingPOS) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Riwayat Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {/* Transaksi Penjualan */}
            {transaksiPenjualan?.map((transaksi) => (
              <div key={`transaksi-${transaksi.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{transaksi.nomor_transaksi}</span>
                    <Badge {...formatStatus(transaksi.status || 'selesai')}>
                      {formatStatus(transaksi.status || 'selesai').label}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatPaymentMethod(transaksi.jenis_pembayaran)} • 
                    Rp {(transaksi.total || 0).toLocaleString('id-ID')} •
                    {new Date(transaksi.created_at || '').toLocaleString('id-ID')}
                  </div>
                  <div className="text-xs text-gray-500">
                    Kasir: {transaksi.kasir?.nama || 'Unknown'}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDetail(transaksi)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* POS Transactions */}
            {posTransactions?.map((pos) => (
              <div key={`pos-${pos.id}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{pos.transaction_number}</span>
                    <Badge {...formatStatus(pos.status)}>
                      {formatStatus(pos.status).label}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">POS</Badge>
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatPaymentMethod(pos.payment_method)} • 
                    Rp {(pos.total_amount || 0).toLocaleString('id-ID')} •
                    {new Date(pos.created_at).toLocaleString('id-ID')}
                  </div>
                  <div className="text-xs text-gray-500">
                    Kasir: {pos.kasir_name}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDetail(pos)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {(!transaksiPenjualan?.length && !posTransactions?.length) && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Belum ada transaksi</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      {showDetail && selectedTransaction && (
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detail Transaksi</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Informasi Transaksi</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Nomor:</span>
                    <span>{selectedTransaction.nomor_transaksi || selectedTransaction.transaction_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Metode:</span>
                    <span>{formatPaymentMethod(selectedTransaction.jenis_pembayaran || selectedTransaction.payment_method)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>Rp {(selectedTransaction.total || selectedTransaction.total_amount || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge {...formatStatus(selectedTransaction.status)}>
                      {formatStatus(selectedTransaction.status).label}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default POSTransactionHistory;
