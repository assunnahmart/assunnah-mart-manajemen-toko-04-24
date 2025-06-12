
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useStockOpnameRecap } from '@/hooks/useStockOpnameRecap';
import { format } from 'date-fns';

const SelisihStokOpname = () => {
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const { data: recapData, isLoading, error, refetch } = useStockOpnameRecap(dateFrom, dateTo);

  const getVarianceIcon = (selisih: number) => {
    if (selisih > 0) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    if (selisih < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-green-500" />;
  };

  const getVarianceBadge = (selisih: number) => {
    if (selisih > 0) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Lebih Sistem</Badge>;
    if (selisih < 0) return <Badge variant="secondary" className="bg-red-100 text-red-800">Lebih Real</Badge>;
    return <Badge variant="secondary" className="bg-green-100 text-green-800">Seimbang</Badge>;
  };

  const getVarianceStats = () => {
    if (!recapData) return { positive: 0, negative: 0, zero: 0, totalItems: 0, totalVariance: 0 };
    
    return recapData.reduce(
      (acc, item) => {
        acc.totalItems++;
        acc.totalVariance += Math.abs(item.selisih_stok);
        
        if (item.selisih_stok > 0) acc.positive++;
        else if (item.selisih_stok < 0) acc.negative++;
        else acc.zero++;
        
        return acc;
      },
      { positive: 0, negative: 0, zero: 0, totalItems: 0, totalVariance: 0 }
    );
  };

  const stats = getVarianceStats();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Memuat data selisih stok opname...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Error: {error.message}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Coba Lagi
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Selisih Stok Opname</h2>
          <p className="text-gray-600">
            Rekap selisih antara stok sistem dan stok real berdasarkan stock opname
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filter Periode */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Periode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
            <div className="text-sm text-gray-600">
              <p>Periode: {format(new Date(dateFrom), 'dd/MM/yyyy')} - {format(new Date(dateTo), 'dd/MM/yyyy')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Produk</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">{stats.totalItems}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lebih Sistem</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">{stats.positive}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lebih Real</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-600">{stats.negative}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Seimbang</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Minus className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{stats.zero}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Selisih</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{stats.totalVariance}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Selisih */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Selisih Stok</CardTitle>
        </CardHeader>
        <CardContent>
          {recapData?.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                Belum ada data selisih stok untuk periode yang dipilih
              </p>
              <p className="text-sm text-gray-400">
                Silakan ubah periode atau pastikan ada data stok opname yang sudah diapprove
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Stok Sistem</TableHead>
                    <TableHead>Stok Real</TableHead>
                    <TableHead>Selisih</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pengguna Input</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recapData?.map((item) => (
                    <TableRow key={item.barang_id}>
                      <TableCell className="font-medium">
                        {item.nama_barang}
                      </TableCell>
                      <TableCell>{item.satuan}</TableCell>
                      <TableCell>
                        <span className="font-medium text-blue-600">
                          {item.stok_sistem}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          {item.real_stok_total}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getVarianceIcon(item.selisih_stok)}
                          <span className={`font-medium ${
                            item.selisih_stok > 0 ? 'text-yellow-600' : 
                            item.selisih_stok < 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {item.selisih_stok > 0 ? '+' : ''}{item.selisih_stok}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getVarianceBadge(item.selisih_stok)}
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="font-medium">{item.jumlah_pengguna_input}</span>
                          <span className="text-sm text-gray-500 ml-1">user</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SelisihStokOpname;
