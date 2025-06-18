
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, RefreshCw, FileText } from 'lucide-react';
import { useSupplierDebtRecap } from '@/hooks/useSupplierDebtRecap';
import { useToast } from '@/hooks/use-toast';

const SupplierDebtRecap = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { data: recapData, isLoading, error, refetch } = useSupplierDebtRecap(selectedYear);
  const { toast } = useToast();

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Data diperbarui",
      description: "Data rekapitulasi hutang telah disinkronkan"
    });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: "Export",
      description: "Fitur export akan segera tersedia"
    });
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rekapitulasi Hutang Supplier</h1>
          <p className="text-gray-600">Laporan rekapitulasi hutang supplier per bulan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Year Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Filter Tahun
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-32">
              <Label>Tahun</Label>
              <Input
                type="number"
                min={2020}
                max={2030}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              />
            </div>
            <Button onClick={() => refetch()} className="mt-6">
              Tampilkan Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recap Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rekapitulasi Hutang Tahun {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Memuat data rekapitulasi...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>Gagal memuat data: {error.message}</p>
              <Button variant="outline" onClick={handleRefresh} className="mt-2">
                Coba Lagi
              </Button>
            </div>
          ) : !recapData || recapData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Tidak ada data rekapitulasi hutang untuk tahun {selectedYear}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">NO</TableHead>
                    <TableHead className="min-w-48">Nama Supplier</TableHead>
                    <TableHead className="text-right">Saldo Awal Hutang</TableHead>
                    {months.map(month => (
                      <TableHead key={month} className="text-center min-w-32">
                        <div className="space-y-1">
                          <div className="font-medium">{month}</div>
                          <div className="flex justify-between text-xs">
                            <span>Masuk</span>
                            <span>Keluar</span>
                            <span>Saldo</span>
                          </div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recapData.map((supplier, index) => (
                    <TableRow key={supplier.supplier_id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{supplier.supplier_name}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(supplier.saldo_awal)}
                      </TableCell>
                      {months.map((month, monthIndex) => {
                        const monthData = supplier.monthly_data?.find(m => m.bulan === monthIndex + 1);
                        return (
                          <TableCell key={month} className="text-center">
                            <div className="space-y-1 text-xs">
                              <div className="text-green-600 font-mono">
                                {formatRupiah(monthData?.hutang_masuk || 0)}
                              </div>
                              <div className="text-red-600 font-mono">
                                {formatRupiah(monthData?.pembayaran_keluar || 0)}
                              </div>
                              <div className="font-bold font-mono">
                                {formatRupiah(monthData?.saldo_akhir || 0)}
                              </div>
                            </div>
                          </TableCell>
                        );
                      })}
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

export default SupplierDebtRecap;
