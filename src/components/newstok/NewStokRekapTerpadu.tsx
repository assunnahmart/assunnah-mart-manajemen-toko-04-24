
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart3, Info, Calendar, RefreshCw, Download, TrendingUp, AlertTriangle } from 'lucide-react';
import { useStockOpnameRecap } from '@/hooks/useStockOpnameRecap';
import { format } from 'date-fns';

const NewStokRekapTerpadu = () => {
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const { data: recapData, isLoading, error, refetch } = useStockOpnameRecap(dateFrom, dateTo);

  const getVarianceCategory = (selisih: number) => {
    if (selisih > 0) return { label: 'Lebih Sistem', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    if (selisih < 0) return { label: 'Lebih Real', color: 'bg-red-500', textColor: 'text-red-600' };
    return { label: 'Seimbang', color: 'bg-green-500', textColor: 'text-green-600' };
  };

  const getTotalVariance = () => {
    if (!recapData) return { positive: 0, negative: 0, zero: 0, totalAbsolute: 0 };
    return recapData.reduce(
      (acc, item) => {
        if (item.selisih_stok > 0) acc.positive++;
        else if (item.selisih_stok < 0) acc.negative++;
        else acc.zero++;
        acc.totalAbsolute += Math.abs(item.selisih_stok);
        return acc;
      },
      { positive: 0, negative: 0, zero: 0, totalAbsolute: 0 }
    );
  };

  const variance = getTotalVariance();
  const accuracyRate = recapData?.length ? ((variance.zero / recapData.length) * 100).toFixed(1) : '100';

  const handleExport = () => {
    if (!recapData || recapData.length === 0) return;
    
    const csvContent = [
      ['Nama Barang', 'Satuan', 'Stok Sistem', 'Total Real', 'Selisih', 'Status', 'Jumlah Input User'],
      ...recapData.map(item => [
        item.nama_barang,
        item.satuan,
        item.stok_sistem,
        item.real_stok_total,
        item.selisih_stok,
        getVarianceCategory(item.selisih_stok).label,
        item.jumlah_pengguna_input
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap-terpadu-${dateFrom}-${dateTo}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Rekap Terpadu New Stok:</strong> Analisis komprehensif dari semua data stok opname dengan perhitungan akurasi dan trend selisih.
        </AlertDescription>
      </Alert>

      {/* Filter Periode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter Periode Analisis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label htmlFor="dateFrom">Tanggal Mulai</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Tanggal Selesai</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              <p>Periode: {format(new Date(dateFrom), 'dd/MM/yyyy')} - {format(new Date(dateTo), 'dd/MM/yyyy')}</p>
              <p>Total produk: {recapData?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Produk</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">
                {recapData?.length || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Akurasi Stok</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600">
                {accuracyRate}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lebih Sistem</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">
                {variance.positive}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lebih Real</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-600">
                {variance.negative}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Selisih</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold text-purple-600">
                {variance.totalAbsolute}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detail Rekap Terpadu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Memuat data rekap...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Error: {error.message}
              </AlertDescription>
            </Alert>
          ) : recapData?.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                Belum ada data stok opname untuk periode yang dipilih
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Stok Sistem</TableHead>
                    <TableHead>Total Real</TableHead>
                    <TableHead>Selisih</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>% Akurasi</TableHead>
                    <TableHead>Input User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recapData?.map((item) => {
                    const category = getVarianceCategory(item.selisih_stok);
                    const accuracy = item.stok_sistem > 0 
                      ? (100 - (Math.abs(item.selisih_stok) / item.stok_sistem * 100)).toFixed(1)
                      : '100';
                    
                    return (
                      <TableRow key={item.barang_id}>
                        <TableCell className="font-medium">
                          {item.nama_barang}
                        </TableCell>
                        <TableCell>{item.satuan}</TableCell>
                        <TableCell>{item.stok_sistem}</TableCell>
                        <TableCell>{item.real_stok_total}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${category.textColor}`}>
                            {item.selisih_stok > 0 ? '+' : ''}{item.selisih_stok}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-white ${category.color}`}>
                            {category.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={accuracy === '100.0' ? 'text-green-600 font-medium' : 'text-orange-600'}>
                            {accuracy}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{item.jumlah_pengguna_input} user</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewStokRekapTerpadu;
