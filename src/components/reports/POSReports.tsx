
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CalendarDays, CreditCard, Banknote, TrendingUp, Download, User, Printer } from 'lucide-react';
import { usePOSReportsToday, usePOSReportsByKasir } from '@/hooks/usePOSReports';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

const POSReports = () => {
  const { user } = useSimpleAuth();
  const { data: todayReport, isLoading: loadingToday } = usePOSReportsToday();
  const { data: kasirReports, isLoading: loadingKasir } = usePOSReportsByKasir();

  const exportToday = () => {
    if (!todayReport) return;
    
    const data = {
      tanggal: new Date().toLocaleDateString('id-ID'),
      laporan_harian: {
        total_transaksi: todayReport.totalTransactions,
        grand_total: todayReport.grandTotal,
        tunai: {
          jumlah_transaksi: todayReport.cashTransactions,
          total_amount: todayReport.cashTotal
        },
        kredit: {
          jumlah_transaksi: todayReport.creditTransactions,
          total_amount: todayReport.creditTotal
        }
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-kasir-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    if (!todayReport) return;
    
    const printContent = `
      <html>
        <head>
          <title>Laporan Kasir Harian - Assunnah Mart</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #e50012;
              padding-bottom: 20px;
            }
            .logo { 
              font-size: 24px; 
              font-weight: bold; 
              color: #e50012;
              margin-bottom: 5px;
            }
            .tagline { 
              font-size: 12px; 
              color: #666; 
              font-style: italic;
            }
            .date { 
              font-size: 18px; 
              margin: 20px 0; 
              color: #333;
            }
            .summary { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 20px; 
              margin: 20px 0; 
            }
            .summary-card { 
              border: 1px solid #ddd; 
              padding: 15px; 
              border-radius: 8px;
              background: #f9f9f9;
            }
            .summary-title { 
              font-weight: bold; 
              color: #e50012; 
              margin-bottom: 10px;
            }
            .amount { 
              font-size: 18px; 
              font-weight: bold; 
              color: #333;
            }
            .count { 
              font-size: 14px; 
              color: #666;
            }
            .total-section { 
              margin-top: 30px; 
              padding: 20px; 
              background: #e50012; 
              color: white; 
              border-radius: 8px;
              text-align: center;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              font-size: 12px; 
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ASSUNNAH MART</div>
            <div class="tagline">belanja hemat, berkah, nikmat</div>
            <div class="date">Laporan Kasir Harian</div>
            <div class="date">${new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <div class="summary-title">PENJUALAN TUNAI</div>
              <div class="amount">Rp ${todayReport.cashTotal.toLocaleString('id-ID')}</div>
              <div class="count">${todayReport.cashTransactions} transaksi</div>
            </div>
            
            <div class="summary-card">
              <div class="summary-title">PENJUALAN KREDIT</div>
              <div class="amount">Rp ${todayReport.creditTotal.toLocaleString('id-ID')}</div>
              <div class="count">${todayReport.creditTransactions} transaksi</div>
            </div>
          </div>
          
          <div class="total-section">
            <div style="font-size: 16px; margin-bottom: 10px;">TOTAL PENJUALAN HARI INI</div>
            <div style="font-size: 28px; font-weight: bold;">Rp ${todayReport.grandTotal.toLocaleString('id-ID')}</div>
            <div style="font-size: 14px; margin-top: 5px;">${todayReport.totalTransactions} total transaksi</div>
          </div>
          
          <div class="footer">
            <p>Operator: ${user?.full_name} (${user?.role === 'admin' ? 'Administrator' : 'Kasir'})</p>
            <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  if (loadingToday || loadingKasir) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Laporan Kasir Harian</h2>
          <p className="text-gray-600 flex items-center gap-2 mt-1">
            <CalendarDays className="h-4 w-4" />
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={printReport} variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Cetak Laporan
          </Button>
          <Button onClick={exportToday} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {todayReport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                  <p className="text-2xl font-bold">{todayReport.totalTransactions}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Penjualan Tunai</p>
                  <p className="text-xl font-bold text-green-600">
                    Rp {todayReport.cashTotal.toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-gray-500">{todayReport.cashTransactions} transaksi</p>
                </div>
                <Banknote className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Penjualan Kredit</p>
                  <p className="text-xl font-bold text-orange-600">
                    Rp {todayReport.creditTotal.toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-gray-500">{todayReport.creditTransactions} transaksi</p>
                </div>
                <CreditCard className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Grand Total</p>
                  <p className="text-2xl font-bold text-red-600">
                    Rp {todayReport.grandTotal.toLocaleString('id-ID')}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-600" />
              Detail Penjualan Tunai
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayReport?.cashTransactionList.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Belum ada transaksi tunai hari ini</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {todayReport?.cashTransactionList.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {'transaction_number' in transaction ? transaction.transaction_number : transaction.nomor_transaksi}
                      </p>
                      <p className="text-sm text-gray-600">
                        {'kasir_name' in transaction ? transaction.kasir_name : 'Manual Entry'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        Rp {(('total_amount' in transaction) ? transaction.total_amount : transaction.total).toLocaleString('id-ID')}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {'items_count' in transaction ? `${transaction.items_count} item` : 'N/A'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credit Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              Detail Penjualan Kredit
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayReport?.creditTransactionList.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Belum ada transaksi kredit hari ini</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {todayReport?.creditTransactionList.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {'transaction_number' in transaction ? transaction.transaction_number : transaction.nomor_transaksi}
                      </p>
                      <p className="text-sm text-gray-600">
                        {'kasir_name' in transaction ? transaction.kasir_name : 'Manual Entry'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">
                        Rp {(('total_amount' in transaction) ? transaction.total_amount : transaction.total).toLocaleString('id-ID')}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {'items_count' in transaction ? `${transaction.items_count} item` : 'N/A'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Kasir Performance */}
      {kasirReports && kasirReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Performa Kasir Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kasirReports.map((kasir, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{kasir.kasirName}</h3>
                      <p className="text-sm text-gray-600">{kasir.totalTransactions} transaksi</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        Rp {kasir.grandTotal.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tunai:</span>
                      <span className="font-medium text-green-600">
                        Rp {kasir.cashTotal.toLocaleString('id-ID')} ({kasir.cashTransactions})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Kredit:</span>
                      <span className="font-medium text-orange-600">
                        Rp {kasir.creditTotal.toLocaleString('id-ID')} ({kasir.creditTransactions})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default POSReports;
