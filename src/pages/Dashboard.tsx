
import NewProtectedRoute from '@/components/NewProtectedRoute';
import NewNavbar from '@/components/NewNavbar';
import DashboardSummary from '@/components/DashboardSummary';
import PiutangCard from '@/components/PiutangCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, TrendingUp, Users, Package, Eye, FileText, CreditCard } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { usePOSTransactionsToday } from '@/hooks/usePOSTransactions';
import { useTransaksiHariIni } from '@/hooks/useTransaksi';
import POSReports from '@/components/reports/POSReports';

const Dashboard = () => {
  const { user } = useSimpleAuth();
  const { data: posToday } = usePOSTransactionsToday();
  const { data: transaksiToday } = useTransaksiHariIni();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <NewProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <NewNavbar />
        
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Selamat datang, {user?.full_name}
              </Badge>
              <Badge variant="secondary">
                {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="piutang" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Piutang
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Laporan Kasir
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Transaksi Terbaru
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <DashboardSummary />
            </TabsContent>

            <TabsContent value="piutang">
              <PiutangCard />
            </TabsContent>

            <TabsContent value="reports">
              <POSReports />
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              {/* Recent POS Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Transaksi POS Terbaru
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {posToday?.transactions && posToday.transactions.length > 0 ? (
                    <div className="space-y-3">
                      {posToday.transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="font-medium">{transaction.transaction_number}</p>
                            <p className="text-sm text-gray-600">
                              {transaction.kasir_name} • {transaction.items_count} item
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">
                              Rp {transaction.total_amount.toLocaleString('id-ID')}
                            </p>
                            <Badge variant={transaction.payment_method === 'cash' ? 'secondary' : 'outline'}>
                              {transaction.payment_method === 'cash' ? 'Tunai' : 'Kredit'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Belum ada transaksi POS hari ini</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Regular Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Transaksi Manual Terbaru
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transaksiToday?.transaksi && transaksiToday.transaksi.length > 0 ? (
                    <div className="space-y-3">
                      {transaksiToday.transaksi.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium">{transaction.nomor_transaksi}</p>
                            <p className="text-sm text-gray-600">
                              Manual Entry
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              Rp {transaction.total.toLocaleString('id-ID')}
                            </p>
                            <Badge variant={transaction.jenis_pembayaran === 'cash' ? 'secondary' : 'outline'}>
                              {transaction.jenis_pembayaran === 'cash' ? 'Tunai' : 'Kredit'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Belum ada transaksi manual hari ini</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </NewProtectedRoute>
  );
};

export default Dashboard;
