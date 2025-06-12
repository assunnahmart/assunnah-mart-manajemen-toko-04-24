
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Calculator,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  useFinancialPeriods, 
  useCurrentPeriod,
  useFinancialSummary,
  useTrialBalance,
  useBalanceSheet,
  useIncomeStatement,
  useGenerateFinancialReports
} from '@/hooks/useFinancialReports';
import GeneralJournal from './GeneralJournal';

const FinancialReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const { toast } = useToast();
  
  const { data: periods } = useFinancialPeriods();
  const { data: currentPeriod } = useCurrentPeriod();
  const { data: summary } = useFinancialSummary(selectedPeriod || currentPeriod?.id);
  const { data: trialBalance } = useTrialBalance(selectedPeriod || currentPeriod?.id || '');
  const { data: balanceSheet } = useBalanceSheet(selectedPeriod || currentPeriod?.id || '');
  const { data: incomeStatement } = useIncomeStatement(selectedPeriod || currentPeriod?.id || '');
  
  const generateReports = useGenerateFinancialReports();

  const activePeriod = selectedPeriod ? periods?.find(p => p.id === selectedPeriod) : currentPeriod;

  const handleGenerateReports = async () => {
    if (!activePeriod?.id) return;
    
    try {
      await generateReports.mutateAsync(activePeriod.id);
      toast({
        title: "Berhasil",
        description: "Laporan keuangan berhasil dibuat",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal membuat laporan keuangan",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Laporan Keuangan</h3>
          <p className="text-gray-600">
            Kelola dan lihat laporan keuangan perusahaan
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          <FileText className="h-4 w-4 mr-1" />
          Laporan Akuntansi
        </Badge>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pilih Periode Laporan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder={currentPeriod ? `Periode Aktif: ${currentPeriod.name}` : "Pilih periode"} />
              </SelectTrigger>
              <SelectContent>
                {periods?.map(period => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name} ({period.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              onClick={handleGenerateReports}
              disabled={!activePeriod?.id || generateReports.isPending}
              className="flex items-center gap-2"
            >
              {generateReports.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4" />
              )}
              Generate Laporan
            </Button>
          </div>
          
          {activePeriod && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Periode aktif: <strong>{activePeriod.name}</strong> 
                ({new Date(activePeriod.start_date).toLocaleDateString('id-ID')} - {new Date(activePeriod.end_date).toLocaleDateString('id-ID')})
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Aset</p>
                  <p className="text-xl font-bold">{formatCurrency(summary.totalAssets)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendapatan</p>
                  <p className="text-xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Laba Bersih</p>
                  <p className={`text-xl font-bold ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.netIncome)}
                  </p>
                </div>
                {summary.netIncome >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status Neraca</p>
                  <p className={`text-sm font-medium ${summary.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                    {summary.isBalanced ? 'Seimbang' : 'Tidak Seimbang'}
                  </p>
                </div>
                {summary.isBalanced ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Reports Tabs */}
      <Tabs defaultValue="journal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="journal" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Jurnal Umum
          </TabsTrigger>
          <TabsTrigger value="trial-balance">Neraca Saldo</TabsTrigger>
          <TabsTrigger value="income-statement">Laba Rugi</TabsTrigger>
          <TabsTrigger value="balance-sheet">Neraca</TabsTrigger>
        </TabsList>

        <TabsContent value="journal">
          <GeneralJournal />
        </TabsContent>

        <TabsContent value="trial-balance">
          <Card>
            <CardHeader>
              <CardTitle>Neraca Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Akun</TableHead>
                      <TableHead>Nama Akun</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Kredit</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trialBalance?.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.chart_of_accounts?.kode_akun}</TableCell>
                        <TableCell>{item.chart_of_accounts?.nama_akun}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.debit_total || 0)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.credit_total || 0)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.ending_balance || 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income-statement">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Laba Rugi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Nama Akun</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeStatement?.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="capitalize">{item.account_type}</TableCell>
                        <TableCell>{item.chart_of_accounts?.nama_akun}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount || 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader>
              <CardTitle>Neraca</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Nama Akun</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balanceSheet?.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="capitalize">{item.account_type}</TableCell>
                        <TableCell>{item.chart_of_accounts?.nama_akun}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount || 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReports;
