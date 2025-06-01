
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Search, Eye, Filter, Download } from 'lucide-react';
import { useTransaksiPenjualan } from '@/hooks/useTransaksi';
import { usePOSTransactions } from '@/hooks/usePOSTransactions';
import { usePOSTransactionsToday } from '@/hooks/usePOSTransactions';

const POSCashierTransactionHistory = () => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [dateFilter, setDateFilter] = useState('today');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [cashierFilter, setCashierFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch data from both sources
  const { data: transaksiPenjualan, isLoading: loadingTransaksi } = useTransaksiPenjualan();
  const { data: posTransactions, isLoading: loadingPOS } = usePOSTransactions();
  const { data: todayStats } = usePOSTransactionsToday();

  // Combine and filter data
  const combinedTransactions = useMemo(() => {
    const transactions = [];
    
    // Add regular sales transactions
    if (transaksiPenjualan) {
      transaksiPenjualan.forEach(trans => {
        transactions.push({
          ...trans,
          source: 'manual',
          transaction_number: trans.nomor_transaksi,
          total_amount: trans.total,
          payment_method: trans.jenis_pembayaran,
          kasir_name: trans.kasir?.nama || 'Unknown',
          created_date: new Date(trans.created_at)
        });
      });
    }

    // Add POS transactions
    if (posTransactions) {
      posTransactions.forEach(pos => {
        transactions.push({
          ...pos,
          source: 'pos',
          created_date: new Date(pos.created_at)
        });
      });
    }

    // Apply filters
    let filtered = transactions;

    // Date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(t => t.created_date >= today);
        break;
      case 'week':
        filtered = filtered.filter(t => t.created_date >= thisWeek);
        break;
      case 'month':
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(t => t.created_date >= thisMonth);
        break;
    }

    // Payment method filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(t => {
        const method = t.payment_method?.toLowerCase();
        switch (paymentFilter) {
          case 'cash':
            return method === 'cash' || method === 'tunai';
          case 'credit':
            return method === 'credit' || method === 'kredit';
          case 'card':
            return method === 'card' || method === 'kartu';
          case 'digital':
            return method === 'digital';
          default:
            return true;
        }
      });
    }

    // Cashier filter
    if (cashierFilter !== 'all') {
      filtered = filtered.filter(t => 
        t.kasir_name?.toLowerCase().includes(cashierFilter.toLowerCase())
      );
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.transaction_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.kasir_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => b.created_date.getTime() - a.created_date.getTime());
  }, [transaksiPenjualan, posTransactions, dateFilter, paymentFilter, cashierFilter, searchQuery]);

  // Get unique cashiers for filter
  const uniqueCashiers = useMemo(() => {
    const cashiers = new Set();
    combinedTransactions.forEach(t => {
      if (t.kasir_name) cashiers.add(t.kasir_name);
    });
    return Array.from(cashiers);
  }, [combinedTransactions]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTransactions = combinedTransactions.length;
    const totalAmount = combinedTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
    const cashTransactions = combinedTransactions.filter(t => 
      t.payment_method?.toLowerCase() === 'cash' || t.payment_method?.toLowerCase() === 'tunai'
    ).length;
    const creditTransactions = combinedTransactions.filter(t => 
      t.payment_method?.toLowerCase() === 'credit' || t.payment_method?.toLowerCase() === 'kredit'
    ).length;

    return {
      totalTransactions,
      totalAmount,
      cashTransactions,
      creditTransactions
    };
  }, [combinedTransactions]);

  const formatPaymentMethod = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'tunai':
      case 'cash':
        return 'Tunai';
      case 'kartu':
      case 'card':
        return 'Kartu';
      case 'digital':
        return 'Digital';
      case 'kredit':
      case 'credit':
        return 'Kredit';
      default:
        return method || 'Unknown';
    }
  };

  const formatStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'selesai':
      case 'completed':
        return { label: 'Selesai', variant: 'default' as const };
      case 'pending':
        return { label: 'Pending', variant: 'secondary' as const };
      case 'saved':
        return { label: 'Tersimpan', variant: 'outline' as const };
      default:
        return { label: status || 'Unknown', variant: 'outline' as const };
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
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                  <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Penjualan</p>
                  <p className="text-2xl font-bold">Rp {stats.totalAmount.toLocaleString('id-ID')}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transaksi Tunai</p>
                  <p className="text-2xl font-bold">{stats.cashTransactions}</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Cash</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transaksi Kredit</p>
                  <p className="text-2xl font-bold">{stats.creditTransactions}</p>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">Credit</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Periode</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hari Ini</SelectItem>
                    <SelectItem value="week">Minggu Ini</SelectItem>
                    <SelectItem value="month">Bulan Ini</SelectItem>
                    <SelectItem value="all">Semua</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Pembayaran</label>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="cash">Tunai</SelectItem>
                    <SelectItem value="credit">Kredit</SelectItem>
                    <SelectItem value="card">Kartu</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Kasir</label>
                <Select value={cashierFilter} onValueChange={setCashierFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kasir</SelectItem>
                    {uniqueCashiers.map((cashier) => (
                      <SelectItem key={cashier} value={cashier}>
                        {cashier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Cari</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="No. transaksi, kasir..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Aksi</label>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transaksi Kasir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Transaksi</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kasir</TableHead>
                    <TableHead>Pembayaran</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sumber</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">Tidak ada transaksi ditemukan</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    combinedTransactions.map((transaction) => (
                      <TableRow key={`${transaction.source}-${transaction.id}`}>
                        <TableCell className="font-medium">
                          {transaction.transaction_number}
                        </TableCell>
                        <TableCell>
                          {transaction.created_date.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>{transaction.kasir_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {formatPaymentMethod(transaction.payment_method)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          Rp {(transaction.total_amount || 0).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <Badge {...formatStatus(transaction.status)}>
                            {formatStatus(transaction.status).label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.source === 'pos' ? 'default' : 'secondary'}>
                            {transaction.source === 'pos' ? 'POS' : 'Manual'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(transaction)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Detail Modal */}
      {showDetail && selectedTransaction && (
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Transaksi</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Informasi Transaksi</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Nomor:</span>
                      <span>{selectedTransaction.transaction_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tanggal:</span>
                      <span>{selectedTransaction.created_date.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kasir:</span>
                      <span>{selectedTransaction.kasir_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sumber:</span>
                      <Badge variant={selectedTransaction.source === 'pos' ? 'default' : 'secondary'}>
                        {selectedTransaction.source === 'pos' ? 'POS System' : 'Manual Input'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Pembayaran</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Metode:</span>
                      <span>{formatPaymentMethod(selectedTransaction.payment_method)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-semibold">Rp {(selectedTransaction.total_amount || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge {...formatStatus(selectedTransaction.status)}>
                        {formatStatus(selectedTransaction.status).label}
                      </Badge>
                    </div>
                    {selectedTransaction.notes && (
                      <div className="mt-2">
                        <span className="text-gray-600">Catatan:</span>
                        <p className="text-xs mt-1 text-gray-500">{selectedTransaction.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedTransaction.pos_transaction_items && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Detail Item</h3>
                  <div className="space-y-2">
                    {selectedTransaction.pos_transaction_items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm border-b pb-1">
                        <span>{item.product_name} x {item.quantity}</span>
                        <span>Rp {(item.subtotal || 0).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
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
