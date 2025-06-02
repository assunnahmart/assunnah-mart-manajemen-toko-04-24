import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Calendar, Users, Filter, TrendingUp, DollarSign, Receipt, Download, Eye } from 'lucide-react';
import { usePOSTransactions } from '@/hooks/usePOSTransactions';
import { usePOSReportsToday, usePOSReportsByKasir } from '@/hooks/usePOSReports';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DailyData {
  date: string;
  amount: number;
  count: number;
}

interface PaymentData {
  name: string;
  value: number;
  count: number;
}

interface KasirData {
  name: string;
  amount: number;
  count: number;
}

const POSTransactionReport = () => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    kasir: '',
    paymentMethod: '',
    customer: ''
  });

  const { data: allTransactions, isLoading } = usePOSTransactions();
  const { data: todayReports } = usePOSReportsToday();
  const { data: kasirReports } = usePOSReportsByKasir();

  // Filter transactions based on criteria
  const filteredTransactions = useMemo(() => {
    if (!allTransactions) return [];
    
    return allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.created_at).toISOString().split('T')[0];
      
      // Date filter
      if (filters.startDate && transactionDate < filters.startDate) return false;
      if (filters.endDate && transactionDate > filters.endDate) return false;
      
      // Kasir filter
      if (filters.kasir && !transaction.kasir_name.toLowerCase().includes(filters.kasir.toLowerCase())) return false;
      
      // Payment method filter
      if (filters.paymentMethod && transaction.payment_method !== filters.paymentMethod) return false;
      
      return true;
    });
  }, [allTransactions, filters]);

  // Chart data preparation
  const chartData = useMemo(() => {
    if (!filteredTransactions.length) return { daily: [], payment: [], kasir: [] };

    // Daily sales data
    const dailyDataMap: Record<string, DailyData> = {};
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.created_at).toISOString().split('T')[0];
      if (!dailyDataMap[date]) {
        dailyDataMap[date] = { date, amount: 0, count: 0 };
      }
      dailyDataMap[date].amount += transaction.total_amount;
      dailyDataMap[date].count += 1;
    });

    // Payment method data
    const paymentDataMap: Record<string, PaymentData> = {};
    filteredTransactions.forEach(transaction => {
      const method = transaction.payment_method === 'cash' ? 'Tunai' : 'Kredit';
      if (!paymentDataMap[method]) {
        paymentDataMap[method] = { name: method, value: 0, count: 0 };
      }
      paymentDataMap[method].value += transaction.total_amount;
      paymentDataMap[method].count += 1;
    });

    // Kasir performance data
    const kasirDataMap: Record<string, KasirData> = {};
    filteredTransactions.forEach(transaction => {
      const kasir = transaction.kasir_name;
      if (!kasirDataMap[kasir]) {
        kasirDataMap[kasir] = { name: kasir, amount: 0, count: 0 };
      }
      kasirDataMap[kasir].amount += transaction.total_amount;
      kasirDataMap[kasir].count += 1;
    });

    return {
      daily: Object.values(dailyDataMap).sort((a, b) => a.date.localeCompare(b.date)),
      payment: Object.values(paymentDataMap),
      kasir: Object.values(kasirDataMap)
    };
  }, [filteredTransactions]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      kasir: '',
      paymentMethod: '',
      customer: ''
    });
  };

  const handleViewDetail = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetail(true);
  };

  // Summary statistics
  const summary = useMemo(() => {
    const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.total_amount, 0);
    const totalTransactions = filteredTransactions.length;
    const cashTransactions = filteredTransactions.filter(t => t.payment_method === 'cash');
    const creditTransactions = filteredTransactions.filter(t => t.payment_method === 'credit');
    
    return {
      totalAmount,
      totalTransactions,
      cashAmount: cashTransactions.reduce((sum, t) => sum + t.total_amount, 0),
      creditAmount: creditTransactions.reduce((sum, t) => sum + t.total_amount, 0),
      cashCount: cashTransactions.length,
      creditCount: creditTransactions.length
    };
  }, [filteredTransactions]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Rekap Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tanggal Mulai</label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tanggal Selesai</label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Kasir</label>
                <Input
                  placeholder="Cari kasir..."
                  value={filters.kasir}
                  onChange={(e) => handleFilterChange('kasir', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Metode Pembayaran</label>
                <Select value={filters.paymentMethod} onValueChange={(value) => handleFilterChange('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua metode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua metode</SelectItem>
                    <SelectItem value="cash">Tunai</SelectItem>
                    <SelectItem value="credit">Kredit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={clearFilters} variant="outline" className="w-full">
                  Reset Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Total Transaksi</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{summary.totalTransactions}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700">Total Penjualan</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                Rp {summary.totalAmount.toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">Tunai</span>
              </div>
              <p className="text-lg font-bold text-orange-600">
                Rp {summary.cashAmount.toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-gray-500">{summary.cashCount} transaksi</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-700">Kredit</span>
              </div>
              <p className="text-lg font-bold text-purple-600">
                Rp {summary.creditAmount.toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-gray-500">{summary.creditCount} transaksi</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Data */}
        <Tabs defaultValue="charts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="charts">Diagram & Grafik</TabsTrigger>
            <TabsTrigger value="data">Data Transaksi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts" className="space-y-6">
            {/* Daily Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Penjualan Harian</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    amount: {
                      label: "Penjualan",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="amount" fill="var(--color-amount)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Method Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Metode Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Jumlah",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.payment}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.payment.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Kasir Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performa Kasir</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      amount: {
                        label: "Penjualan",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[250px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.kasir} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="amount" fill="var(--color-amount)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Data Transaksi Detail</span>
                  <Badge variant="secondary">
                    {filteredTransactions.length} transaksi
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Transaksi</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Kasir</TableHead>
                        <TableHead>Metode</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.slice(0, 50).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.transaction_number}
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell>{transaction.kasir_name}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.payment_method === 'cash' ? 'default' : 'secondary'}>
                              {transaction.payment_method === 'cash' ? 'Tunai' : 'Kredit'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            Rp {transaction.total_amount.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                              {transaction.status === 'completed' ? 'Selesai' : transaction.status}
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
                      ))}
                    </TableBody>
                  </Table>
                  
                  {filteredTransactions.length > 50 && (
                    <div className="text-center text-sm text-gray-500 mt-4">
                      Menampilkan 50 dari {filteredTransactions.length} transaksi. Gunakan filter untuk mempersempit hasil.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
                    <span>Bayar:</span>
                    <span>Rp {selectedTransaction.amount_paid.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kembalian:</span>
                    <span>Rp {selectedTransaction.change_amount.toLocaleString('id-ID')}</span>
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

export default POSTransactionReport;
