
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Eye, Clock, DollarSign, CreditCard } from 'lucide-react';
import { usePOSTransactions } from '@/hooks/usePOSTransactions';

interface POSKasirTransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  kasirName: string;
}

const POSKasirTransactionHistory = ({ isOpen, onClose, kasirName }: POSKasirTransactionHistoryProps) => {
  const [selectedDate, setSelectedDate] = useState('');
  const { data: allTransactions, isLoading } = usePOSTransactions();

  // Filter transactions for current kasir
  const kasirTransactions = allTransactions?.filter(
    transaction => transaction.kasir_name === kasirName
  ) || [];

  // Apply date filter
  const filteredTransactions = selectedDate 
    ? kasirTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.created_at).toISOString().split('T')[0];
        return transactionDate === selectedDate;
      })
    : kasirTransactions;

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

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="text-center py-8">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Riwayat Transaksi - {kasirName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
            />
            <Button
              variant="outline"
              onClick={() => setSelectedDate('')}
            >
              Semua Tanggal
            </Button>
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
                      Rp {summary.cashTotal.toLocaleString('id-ID')}
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
                      Rp {summary.creditTotal.toLocaleString('id-ID')}
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
                      Rp {summary.grandTotal.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Daftar Transaksi
                {selectedDate && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    - {new Date(selectedDate).toLocaleDateString('id-ID')}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Tidak ada transaksi ditemukan</p>
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                          Rp {transaction.total_amount.toLocaleString('id-ID')} • 
                          {new Date(transaction.created_at).toLocaleString('id-ID')} •
                          {transaction.items_count} item
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
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

export default POSKasirTransactionHistory;
