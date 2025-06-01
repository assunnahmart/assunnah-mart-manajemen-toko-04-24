
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Users, Search, Eye, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { usePOSTransactions } from '@/hooks/usePOSTransactions';

const POSCashierTransactionHistory = () => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  const { data: allTransactions, isLoading } = usePOSTransactions();

  // Group transactions by cashier and calculate summary statistics
  const cashierSummary = useMemo(() => {
    if (!allTransactions) return {};
    
    const summary = {};
    
    allTransactions.forEach(transaction => {
      const cashierName = transaction.kasir_name;
      const transactionDate = new Date(transaction.created_at).toISOString().split('T')[0];
      
      if (!summary[cashierName]) {
        summary[cashierName] = {
          totalTransactions: 0,
          totalAmount: 0,
          transactions: [],
          dates: new Set()
        };
      }
      
      summary[cashierName].totalTransactions += 1;
      summary[cashierName].totalAmount += transaction.total_amount;
      summary[cashierName].transactions.push(transaction);
      summary[cashierName].dates.add(transactionDate);
    });
    
    return summary;
  }, [allTransactions]);

  // Filter transactions based on search and date
  const filteredCashiers = useMemo(() => {
    if (!cashierSummary) return {};
    
    const filtered = {};
    
    Object.entries(cashierSummary).forEach(([cashierName, data]: [string, any]) => {
      let shouldInclude = true;
      
      // Apply search filter
      if (searchQuery) {
        shouldInclude = cashierName.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      if (shouldInclude) {
        let filteredTransactions = data.transactions;
        
        // Apply date filter
        if (selectedDate) {
          filteredTransactions = data.transactions.filter((transaction: any) => {
            const transactionDate = new Date(transaction.created_at).toISOString().split('T')[0];
            return transactionDate === selectedDate;
          });
        }
        
        if (filteredTransactions.length > 0) {
          filtered[cashierName] = {
            ...data,
            transactions: filteredTransactions,
            filteredTotalTransactions: filteredTransactions.length,
            filteredTotalAmount: filteredTransactions.reduce((sum: number, t: any) => sum + t.total_amount, 0)
          };
        }
      }
    });
    
    return filtered;
  }, [cashierSummary, searchQuery, selectedDate]);

  const handleViewDetail = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowDetail(true);
  };

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
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama kasir..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48"
          />
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedDate('');
            }}
          >
            Clear
          </Button>
        </div>

        {/* Cashier Summary Cards */}
        <div className="grid gap-4">
          {Object.entries(filteredCashiers).map(([cashierName, data]: [string, any]) => (
            <Card key={cashierName} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    {cashierName}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <FileText className="h-3 w-3 mr-1" />
                      {selectedDate ? data.filteredTotalTransactions : data.totalTransactions} Transaksi
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Rp {(selectedDate ? data.filteredTotalAmount : data.totalAmount).toLocaleString('id-ID')}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {selectedDate ? 
                    `Transaksi pada ${new Date(selectedDate).toLocaleDateString('id-ID')}` :
                    `Aktif selama ${data.dates.size} hari`
                  }
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(selectedDate ? data.transactions.filter((t: any) => {
                    const transactionDate = new Date(t.created_at).toISOString().split('T')[0];
                    return transactionDate === selectedDate;
                  }) : data.transactions.slice(0, 5)).map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{transaction.transaction_number}</span>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status === 'completed' ? 'Selesai' : transaction.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Rp {transaction.total_amount.toLocaleString('id-ID')} • 
                          {new Date(transaction.created_at).toLocaleString('id-ID')}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetail(transaction)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {!selectedDate && data.transactions.length > 5 && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      Dan {data.transactions.length - 5} transaksi lainnya...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {Object.keys(filteredCashiers).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Tidak ada riwayat transaksi kasir ditemukan</p>
            {(searchQuery || selectedDate) && (
              <p className="text-sm mt-2">Coba ubah filter pencarian atau tanggal</p>
            )}
          </div>
        )}
      </div>

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
                    <span>{selectedTransaction.transaction_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>{selectedTransaction.kasir_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Metode:</span>
                    <span>{selectedTransaction.payment_method === 'cash' ? 'Tunai' : 'Kredit'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>Rp {selectedTransaction.total_amount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={selectedTransaction.status === 'completed' ? 'default' : 'secondary'}>
                      {selectedTransaction.status === 'completed' ? 'Selesai' : selectedTransaction.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Waktu:</span>
                    <span>{new Date(selectedTransaction.created_at).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
              
              {selectedTransaction.notes && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Catatan</h3>
                  <p className="text-sm text-gray-700">{selectedTransaction.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default POSCashierTransactionHistory;
