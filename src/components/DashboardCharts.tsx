
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingCart, Package, CreditCard, Users } from 'lucide-react';
import { usePOSTransactions } from '@/hooks/usePOSTransactions';
import { usePurchaseTransactions } from '@/hooks/usePurchaseTransactions';
import { useCustomerReceivablesSummary, useSupplierPayablesSummary } from '@/hooks/useLedgers';
import { usePiutangPelanggan } from '@/hooks/usePiutang';

interface DashboardChartsProps {
  startDate?: string;
  endDate?: string;
  period: string;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ startDate, endDate, period }) => {
  const { data: posTransactions } = usePOSTransactions();
  const { data: purchaseTransactions } = usePurchaseTransactions();
  const { data: receivablesSummary } = useCustomerReceivablesSummary();
  const { data: payablesSummary } = useSupplierPayablesSummary();
  const { data: piutangData } = usePiutangPelanggan();

  // Get date range based on period
  const getDateRange = () => {
    const today = new Date();
    const endDateObj = endDate ? new Date(endDate) : today;
    let startDateObj: Date;

    if (startDate && period === 'custom') {
      startDateObj = new Date(startDate);
    } else {
      switch (period) {
        case 'today':
          startDateObj = new Date(today);
          break;
        case '7days':
          startDateObj = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDateObj = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'thismonth':
          startDateObj = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case 'lastmonth':
          startDateObj = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          endDateObj.setDate(0); // Last day of previous month
          break;
        default:
          startDateObj = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
    }

    return { startDateObj, endDateObj };
  };

  const { startDateObj, endDateObj } = getDateRange();

  // Filter POS transactions by date range
  const filteredPOSTransactions = posTransactions?.filter(transaction => {
    const transactionDate = new Date(transaction.created_at);
    return transactionDate >= startDateObj && transactionDate <= endDateObj && transaction.status === 'completed';
  }) || [];

  // Filter purchase transactions by date range
  const filteredPurchaseTransactions = purchaseTransactions?.filter(transaction => {
    const transactionDate = new Date(transaction.created_at);
    return transactionDate >= startDateObj && transactionDate <= endDateObj;
  }) || [];

  // Prepare sales data based on period
  const prepareSalesData = () => {
    const salesByDate: { [key: string]: number } = {};
    
    filteredPOSTransactions.forEach(transaction => {
      const date = new Date(transaction.created_at).toISOString().split('T')[0];
      salesByDate[date] = (salesByDate[date] || 0) + transaction.total_amount;
    });

    // Generate data based on period
    const data = [];
    const currentDate = new Date(startDateObj);
    
    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayName = currentDate.toLocaleDateString('id-ID', { 
        weekday: period === '7days' ? 'short' : undefined,
        day: 'numeric',
        month: period === '30days' || period === 'thismonth' || period === 'lastmonth' ? 'short' : undefined
      });
      
      data.push({
        day: dayName,
        amount: salesByDate[dateStr] || 0,
        date: dateStr
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data.slice(-30); // Limit to last 30 entries for readability
  };

  // Prepare purchase data based on period
  const preparePurchaseData = () => {
    const purchasesByDate: { [key: string]: number } = {};
    
    filteredPurchaseTransactions.forEach(transaction => {
      const date = new Date(transaction.created_at).toISOString().split('T')[0];
      purchasesByDate[date] = (purchasesByDate[date] || 0) + transaction.total;
    });

    const data = [];
    const currentDate = new Date(startDateObj);
    
    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayName = currentDate.toLocaleDateString('id-ID', { 
        weekday: period === '7days' ? 'short' : undefined,
        day: 'numeric',
        month: period === '30days' || period === 'thismonth' || period === 'lastmonth' ? 'short' : undefined
      });
      
      data.push({
        day: dayName,
        amount: purchasesByDate[dateStr] || 0,
        date: dateStr
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data.slice(-30);
  };

  const salesData = prepareSalesData();
  const purchaseData = preparePurchaseData();

  // Calculate totals for the period
  const totalSales = filteredPOSTransactions.reduce((sum, t) => sum + t.total_amount, 0);
  const totalPurchases = filteredPurchaseTransactions.reduce((sum, t) => sum + t.total, 0);

  // Prepare debt data (pie chart)
  const debtData = [
    {
      name: 'Hutang Supplier',
      value: payablesSummary?.reduce((sum: number, item: any) => sum + (item.saldo || 0), 0) || 0,
      color: '#ef4444'
    },
    {
      name: 'Piutang Pelanggan',
      value: piutangData?.totalPiutang || 0,
      color: '#22c55e'
    }
  ];

  // Prepare receivables by customer type
  const receivablesData = [
    {
      type: 'Unit',
      amount: piutangData?.totalPiutangUnit || 0
    },
    {
      type: 'Perorangan',
      amount: piutangData?.totalPiutangPerorangan || 0
    },
    {
      type: 'Kredit Periode Ini',
      amount: filteredPOSTransactions.filter(t => t.payment_method === 'credit').reduce((sum, t) => sum + t.total_amount, 0)
    }
  ];

  const chartConfig = {
    amount: {
      label: "Jumlah (Rp)",
      color: "hsl(var(--chart-1))",
    },
    sales: {
      label: "Penjualan",
      color: "hsl(var(--chart-2))",
    },
    purchase: {
      label: "Pembelian",
      color: "hsl(var(--chart-3))",
    },
  };

  const periodTitle = period === 'today' ? 'Hari Ini' : 
                    period === '7days' ? '7 Hari Terakhir' :
                    period === '30days' ? '30 Hari Terakhir' :
                    period === 'thismonth' ? 'Bulan Ini' :
                    period === 'lastmonth' ? 'Bulan Lalu' :
                    period === 'custom' ? `${startDate} - ${endDate}` : 'Periode Terpilih';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Sales Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-blue-600" />
            Penjualan - {periodTitle}
          </CardTitle>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-lg font-bold text-blue-600">
              Rp {totalSales.toLocaleString('id-ID')}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <BarChart data={salesData}>
              <XAxis dataKey="day" />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Penjualan']}
              />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Purchase Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-purple-600" />
            Pembelian - {periodTitle}
          </CardTitle>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-lg font-bold text-purple-600">
              Rp {totalPurchases.toLocaleString('id-ID')}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <LineChart data={purchaseData}>
              <XAxis dataKey="day" />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Pembelian']}
              />
              <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Debt Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-red-600" />
            Hutang vs Piutang Saat Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <PieChart>
              <Pie
                data={debtData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {debtData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Receivables Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            Breakdown Piutang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <BarChart data={receivablesData}>
              <XAxis dataKey="type" />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Piutang']}
              />
              <Bar dataKey="amount" fill="#22c55e" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
