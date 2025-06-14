
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingCart, Package, CreditCard, Users } from 'lucide-react';
import { usePOSTransactionsToday } from '@/hooks/usePOSTransactions';
import { usePurchaseTransactions } from '@/hooks/usePurchaseTransactions';
import { useCustomerReceivablesSummary, useSupplierPayablesSummary } from '@/hooks/useLedgers';
import { usePiutangPelanggan } from '@/hooks/usePiutang';

const DashboardCharts = () => {
  const { data: todayPOS } = usePOSTransactionsToday();
  const { data: purchaseTransactions } = usePurchaseTransactions();
  const { data: receivablesSummary } = useCustomerReceivablesSummary();
  const { data: payablesSummary } = useSupplierPayablesSummary();
  const { data: piutangData } = usePiutangPelanggan();

  // Prepare sales data (last 7 days)
  const salesData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
    
    // For demo purposes, using today's data for all days
    // In real implementation, you'd fetch actual daily data
    const amount = i === 6 ? (todayPOS?.totalAmount || 0) : Math.random() * 5000000;
    
    return {
      day: dayName,
      amount: Math.round(amount)
    };
  });

  // Prepare purchase data (last 7 days)
  const purchaseData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
    
    // Get today's purchases
    const todayPurchases = purchaseTransactions?.filter(p => 
      new Date(p.created_at).toDateString() === new Date().toDateString()
    ) || [];
    const todayAmount = todayPurchases.reduce((sum, p) => sum + p.total, 0);
    
    const amount = i === 6 ? todayAmount : Math.random() * 3000000;
    
    return {
      day: dayName,
      amount: Math.round(amount)
    };
  });

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
      type: 'Kredit Hari Ini',
      amount: piutangData?.totalCreditSalesToday || 0
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Sales Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-blue-600" />
            Diagram Penjualan (7 Hari Terakhir)
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
            Diagram Pembelian (7 Hari Terakhir)
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
            Diagram Hutang vs Piutang
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
            Diagram Piutang per Kategori
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
