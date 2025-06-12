
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, TrendingUp, TrendingDown, Minus, Users, Eye } from 'lucide-react';
import { useStockOpnameRecap } from '@/hooks/useStockOpnameRecap';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';

const NewStokSelisihAnalysis = () => {
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const { data: recapData, isLoading, refetch } = useStockOpnameRecap(dateFrom, dateTo);

  const getSelisihCategory = (selisih: number) => {
    if (selisih > 0) return {
      label: 'Lebih Sistem',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      icon: TrendingUp,
      description: 'Stok sistem lebih besar dari total real stok'
    };
    if (selisih < 0) return {
      label: 'Lebih Real',
      color: 'bg-red-500',
      textColor: 'text-red-700',
      icon: TrendingDown,
      description: 'Total real stok lebih besar dari stok sistem'
    };
    return {
      label: 'Seimbang',
      color: 'bg-green-500',
      textColor: 'text-green-700',
      icon: Minus,
      description: 'Stok sistem sama dengan total real stok'
    };
  };

  const getAnalysisStats = () => {
    if (!recapData) return { total: 0, positive: 0, negative: 0, zero: 0, totalSelisih: 0 };
    
    return recapData.reduce(
      (acc, item) => {
        acc.total++;
        acc.totalSelisih += Math.abs(item.selisih_stok);
        if (item.selisih_stok > 0) acc.positive++;
        else if (item.selisih_stok < 0) acc.negative++;
        else acc.zero++;
        return acc;
      },
      { total: 0, positive: 0, negative: 0, zero: 0, totalSelisih: 0 }
    );
  };

  const stats = getAnalysisStats();
  const accuracyRate = stats.total > 0 ? (stats.zero / stats.total * 100).toFixed(1) : '100';

  return (
    <div className="space-y-6">
      <Alert>
        <Calculator className="h-4 w-4" />
        <AlertDescription>
          <strong>Analisis Selisih New Stok:</strong> Perhitungan berdasarkan rumus Stok Sistem (tetap) dikurangi Total Real Stok (jumlah semua input pengguna).
        </AlertDescription>
      </Alert>

      {/* Filter Period */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Periode Analisis</CardTitle>
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
            <Button onClick={() => refetch()} disabled={isLoading}>
              {isLoading ? 'Memuat...' : 'Analisis'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Produk</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lebih Sistem</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-yellow-600">{stats.positive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lebih Real</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-red-600">{stats.negative}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Seimbang</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">{stats.zero}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Akurasi</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-purple-600">{accuracyRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Detail Analisis Selisih Stok
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Memuat analisis...</div>
          ) : !recapData || recapData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data untuk periode yang dipilih
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Stok Sistem</TableHead>
                    <TableHead>Total Real</TableHead>
                    <TableHead>Selisih</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Jumlah Input User</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recapData.map((item) => {
                    const category = getSelisihCategory(item.selisih_stok);
                    const Icon = category.icon;
                    
                    return (
                      <TableRow key={item.barang_id}>
                        <TableCell className="font-medium">
                          {item.nama_barang}
                          <div className="text-xs text-gray-500">{item.satuan}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {item.stok_sistem}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {item.real_stok_total}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${category.textColor}`} />
                            <span className={`font-medium ${category.textColor}`}>
                              {item.selisih_stok > 0 ? '+' : ''}{item.selisih_stok}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-white ${category.color}`}>
                            {category.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{item.jumlah_pengguna_input}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                                Detail
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Analisis Detail: {item.nama_barang}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="text-center">
                                    <Label>Stok Sistem</Label>
                                    <div className="text-2xl font-bold text-blue-600">
                                      {item.stok_sistem}
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <Label>Total Real Stok</Label>
                                    <div className="text-2xl font-bold text-green-600">
                                      {item.real_stok_total}
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <Label>Selisih</Label>
                                    <div className={`text-2xl font-bold ${category.textColor}`}>
                                      {item.selisih_stok > 0 ? '+' : ''}{item.selisih_stok}
                                    </div>
                                  </div>
                                </div>

                                <Alert>
                                  <Icon className="h-4 w-4" />
                                  <AlertDescription>
                                    <strong>{category.label}:</strong> {category.description}
                                  </AlertDescription>
                                </Alert>
                                
                                <div>
                                  <Label>Detail Input Per User</Label>
                                  <div className="mt-2 space-y-2">
                                    {item.detail_input_pengguna?.map((detail, index) => (
                                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium">{detail.nama_kasir}</span>
                                          <Badge variant="outline">
                                            {detail.stok_fisik} {item.satuan}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                          <p>Tanggal: {format(new Date(detail.tanggal_opname), 'dd/MM/yyyy')}</p>
                                          {detail.keterangan && (
                                            <p>Keterangan: {detail.keterangan}</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
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

export default NewStokSelisihAnalysis;
