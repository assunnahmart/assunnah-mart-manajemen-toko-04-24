
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, AlertTriangle, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { useStockOpnameRecap } from '@/hooks/useStockOpnameRecap';
import { useToast } from '@/hooks/use-toast';

const StockOpnameRecap = () => {
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const { data: stockData, isLoading, error } = useStockOpnameRecap(dateFrom, dateTo);
  const { toast } = useToast();

  const getSelisihInfo = (selisih: number) => {
    if (selisih > 0) {
      return {
        icon: <TrendingUp className="h-4 w-4 text-orange-500" />,
        text: 'Lebih Sistem',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      };
    } else if (selisih < 0) {
      return {
        icon: <TrendingDown className="h-4 w-4 text-red-500" />,
        text: 'Lebih Real',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    } else {
      return {
        icon: <TrendingUp className="h-4 w-4 text-green-500" />,
        text: 'Seimbang',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      };
    }
  };

  const showItemDetail = (item: any) => {
    setSelectedItem(item);
    setShowDetailDialog(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Memuat data rekap stok opname...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-600">
            Error: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Rekap Stok Opname</h2>
          <p className="text-gray-600">Rekap hasil stok opname berdasarkan periode</p>
        </div>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tanggal Mulai</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label>Tanggal Selesai</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => {
                setDateFrom(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                setDateTo(new Date().toISOString().split('T')[0]);
              }}>
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockData?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lebih Sistem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stockData?.filter(item => item.selisih_stok > 0).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lebih Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stockData?.filter(item => item.selisih_stok < 0).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Seimbang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stockData?.filter(item => item.selisih_stok === 0).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Rekap Stok Opname</CardTitle>
        </CardHeader>
        <CardContent>
          {stockData && stockData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Stok Sistem</TableHead>
                    <TableHead>Stok Real</TableHead>
                    <TableHead>Selisih</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Input Pengguna</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockData.map((item) => {
                    const selisihInfo = getSelisihInfo(item.selisih_stok);
                    return (
                      <TableRow key={item.barang_id}>
                        <TableCell className="font-medium">{item.nama_barang}</TableCell>
                        <TableCell>{item.satuan}</TableCell>
                        <TableCell>{item.stok_sistem.toLocaleString('id-ID')}</TableCell>
                        <TableCell>{item.real_stok_total.toLocaleString('id-ID')}</TableCell>
                        <TableCell className={selisihInfo.color}>
                          {Math.abs(item.selisih_stok).toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={selisihInfo.bgColor}>
                            <div className="flex items-center gap-1">
                              {selisihInfo.icon}
                              {selisihInfo.text}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>{item.jumlah_pengguna_input} pengguna</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => showItemDetail(item)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada data stok opname untuk periode ini</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detail Input Pengguna - {selectedItem?.nama_barang}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stok Sistem</Label>
                  <div className="text-lg font-semibold">{selectedItem.stok_sistem}</div>
                </div>
                <div>
                  <Label>Total Stok Real</Label>
                  <div className="text-lg font-semibold">{selectedItem.real_stok_total}</div>
                </div>
              </div>
            )}
            
            {selectedItem?.detail_input_pengguna && Array.isArray(selectedItem.detail_input_pengguna) && selectedItem.detail_input_pengguna.length > 0 && (
              <div>
                <Label>Detail Input dari Setiap Pengguna</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Kasir</TableHead>
                      <TableHead>Stok Fisik</TableHead>
                      <TableHead>Tanggal Input</TableHead>
                      <TableHead>Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItem.detail_input_pengguna.map((input: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{input.kasir_name || input.nama_kasir}</TableCell>
                        <TableCell>{input.stok_fisik}</TableCell>
                        <TableCell>
                          {new Date(input.tanggal_input || input.tanggal_opname).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>{input.keterangan || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockOpnameRecap;
