
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Clock, DollarSign, CreditCard, Calendar } from 'lucide-react';
import { usePOSTransactions } from '@/hooks/usePOSTransactions';

interface POSFastTransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  kasirName?: string;
}

const POSFastTransactionHistory = ({ 
  isOpen, 
  onClose, 
  kasirName 
}: POSFastTransactionHistoryProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: allTransactions, isLoading } = usePOSTransactions();

  // Pre-filter and cache transactions for current kasir and date
  const filteredTransactions = allTransactions?.filter(transaction => {
    const transactionDate = new Date(transaction.created_at).toISOString().split('T')[0];
    const matchesDate = transactionDate === selectedDate;
    const matchesKasir = !kasirName || transaction.kasir_name === kasirName;
    const matchesSearch = !searchQuery || 
      transaction.transaction_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.kasir_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDate && matchesKasir && matchesSearch;
  }) || [];

  // Calculate summary
  const summary = filteredTransactions.reduce((acc, transaction) => {
    if (transaction.payment_method === 'cash') {
      acc.cashCount++;
      acc.cashTotal += transaction.total_amount;
    } else {
      acc.creditCount++;
      acc.creditTotal += transaction.total_amount;
    }
    acc.totalCount++;
    acc.grandTotal += transaction.total_amount;
    return acc;
  }, {
    cashCount: 0,
    cashTotal: 0,
    creditCount: 0,
    creditTotal: 0,
    totalCount: 0,
    grandTotal: 0
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Riwayat Transaksi{kasirName && ` - ${kasirName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tanggal</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Cari Transaksi</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nomor transaksi atau kasir..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDate(new Date().toISOString().split('T')[0]);
                  setSearchQuery('');
                }}
              >
                Reset Filter
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Transaksi</p>
                    <p className="text-lg font-bold text-blue-600">{summary.totalCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tunai ({summary.cashCount})</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatRupiah(summary.cashTotal)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Kredit ({summary.creditCount})</p>
                    <p className="text-lg font-bold text-orange-600">
                      {formatRupiah(summary.creditTotal)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Grand Total</p>
                    <p className="text-lg font-bold text-purple-600">
                      {formatRupiah(summary.grandTotal)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daftar Transaksi - {new Date(selectedDate).toLocaleDateString('id-ID')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading transaksi...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Tidak ada transaksi ditemukan</p>
                  <p className="text-sm mt-2">Coba ubah filter tanggal atau pencarian</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{transaction.transaction_number}</span>
                          <Badge variant={transaction.payment_method === 'cash' ? 'default' : 'secondary'}>
                            {transaction.payment_method === 'cash' ? 'Tunai' : 'Kredit'}
                          </Badge>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status === 'completed' ? 'Selesai' : transaction.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-semibold text-green-600">
                            {formatRupiah(transaction.total_amount)}
                          </span>
                          {' • '}
                          {new Date(transaction.created_at).toLocaleTimeString('id-ID')}
                          {' • '}
                          {transaction.items_count} item
                          {' • '}
                          {transaction.kasir_name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default POSFastTransactionHistory;
