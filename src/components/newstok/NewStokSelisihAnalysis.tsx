import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useStockOpnameRecap } from '@/hooks/useStockOpnameRecap';
import { format } from 'date-fns';

const NewStokSelisihAnalysis = () => {
  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const { data: recapData, isLoading, error, refetch } = useStockOpnameRecap(dateFrom, dateTo);

  const renderDetailInputPengguna = (detail: any) => {
    if (!detail) return null;
    
    let parsedDetail;
    try {
      // Handle both string and object types
      parsedDetail = typeof detail === 'string' ? JSON.parse(detail) : detail;
    } catch (error) {
      console.error('Error parsing detail input pengguna:', error);
      return null;
    }
    
    if (!Array.isArray(parsedDetail)) return null;
    
    return (
      <div className="space-y-1">
        {parsedDetail.map((input: any, index: number) => (
          <div key={index} className="text-xs p-2 bg-gray-50 rounded">
            <p className="font-medium">{input.nama_kasir || input.kasir_name}</p>
            <p>Stok Input: {input.stok_fisik} | {input.tanggal_opname || input.tanggal_input}</p>
            {input.keterangan && <p className="text-gray-600">{input.keterangan}</p>}
          </div>
        ))}
      </div>
    );
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Analisis Selisih Stok Opname</h2>
          <p className="text-gray-600">
            Analisis detail selisih antara stok sistem dan stok real berdasarkan stock opname
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
                    <TableHead>Total Stok Real</TableHead>
                    <TableHead>Selisih</TableHead>
                    <TableHead>Detail Input Pengguna</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recapData?.map((item) => (
                    <TableRow key={item.barang_id}>
                      <TableCell className="font-medium">{item.nama_barang}</TableCell>
                      <TableCell>{item.satuan}</TableCell>
                      <TableCell className="text-blue-600 font-medium">{item.stok_sistem}</TableCell>
                      <TableCell className="text-green-600 font-medium">{item.real_stok_total}</TableCell>
                      <TableCell className={
                        item.selisih_stok > 0 ? 'text-yellow-600 font-medium' : 
                        item.selisih_stok < 0 ? 'text-red-600 font-medium' : 'text-gray-600 font-medium'
                      }>
                        {item.selisih_stok}
                      </TableCell>
                      <TableCell>
                        {renderDetailInputPengguna(item.detail_input_pengguna)}
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

export default NewStokSelisihAnalysis;
