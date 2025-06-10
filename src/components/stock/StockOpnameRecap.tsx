
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart3, Users, AlertTriangle, Eye, Calendar, RefreshCw } from 'lucide-react';
import { useStockOpnameRecap, StockOpnameRecapItem } from '@/hooks/useStockOpnameRecap';
import { format } from 'date-fns';

const StockOpnameRecap = () => {
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [selectedItem, setSelectedItem] = useState<StockOpnameRecapItem | null>(null);

  const { data: recapData, isLoading, error, refetch } = useStockOpnameRecap(dateFrom, dateTo);

  console.log('StockOpnameRecap render:', { 
    recapData: recapData?.length, 
    isLoading, 
    error: error?.message,
    dateFrom,
    dateTo 
  });

  const getVarianceCategory = (selisih: number) => {
    if (selisih > 0) return { label: 'Lebih Sistem', color: 'bg-yellow-500' };
    if (selisih < 0) return { label: 'Lebih Real', color: 'bg-red-500' };
    return { label: 'Seimbang', color: 'bg-green-500' };
  };

  const getTotalVariance = () => {
    if (!recapData) return { positive: 0, negative: 0, zero: 0 };
    return recapData.reduce(
      (acc, item) => {
        if (item.selisih_stok > 0) acc.positive++;
        else if (item.selisih_stok < 0) acc.negative++;
        else acc.zero++;
        return acc;
      },
      { positive: 0, negative: 0, zero: 0 }
    );
  };

  const variance = getTotalVariance();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Memuat data rekap stok opname...
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
          <h2 className="text-2xl font-bold text-gray-900">Rekap Stok Opname</h2>
          <p className="text-gray-600">
            Analisis selisih antara stok sistem dan stok fisik berdasarkan input pengguna
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

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter Periode
          </CardTitle>
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
              <p>Total produk direkap: {recapData?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium text-gray-600">Seimbang</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-600">
                {variance.zero}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recap Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detail Rekap Stok Opname
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recapData?.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                Belum ada data stok opname untuk periode yang dipilih
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
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Stok Sistem</TableHead>
                    <TableHead>Total Real</TableHead>
                    <TableHead>Selisih</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pengguna Input</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recapData?.map((item) => {
                    const category = getVarianceCategory(item.selisih_stok);
                    return (
                      <TableRow key={item.barang_id}>
                        <TableCell className="font-medium">
                          {item.nama_barang}
                        </TableCell>
                        <TableCell>{item.satuan}</TableCell>
                        <TableCell>{item.stok_sistem}</TableCell>
                        <TableCell>{item.real_stok_total}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            item.selisih_stok > 0 ? 'text-yellow-600' : 
                            item.selisih_stok < 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {item.selisih_stok > 0 ? '+' : ''}{item.selisih_stok}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-white ${category.color}`}>
                            {category.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {item.jumlah_pengguna_input}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedItem(item)}
                              >
                                <Eye className="h-4 w-4" />
                                Detail
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Detail Input: {item.nama_barang}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Stok Sistem</Label>
                                    <p className="text-lg font-bold text-blue-600">
                                      {item.stok_sistem} {item.satuan}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Total Real</Label>
                                    <p className="text-lg font-bold text-green-600">
                                      {item.real_stok_total} {item.satuan}
                                    </p>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Detail Input Per Pengguna</Label>
                                  <div className="mt-2 space-y-2">
                                    {item.detail_input_pengguna?.length > 0 ? (
                                      item.detail_input_pengguna.map((detail, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium">{detail.nama_kasir}</span>
                                            <span className="text-lg font-bold text-blue-600">
                                              {detail.stok_fisik} {item.satuan}
                                            </span>
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            <p>Tanggal: {format(new Date(detail.tanggal_opname), 'dd/MM/yyyy')}</p>
                                            {detail.keterangan && (
                                              <p>Keterangan: {detail.keterangan}</p>
                                            )}
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-gray-500 text-sm">Tidak ada detail input</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
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

export default StockOpnameRecap;
