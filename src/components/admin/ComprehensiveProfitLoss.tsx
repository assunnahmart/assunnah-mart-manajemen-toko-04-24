
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Download, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ProfitLossData {
  periode: {
    start_date: string;
    end_date: string;
  };
  pendapatan: {
    penjualan_tunai: number;
    penjualan_kredit: number;
    konsinyasi_harian_tunai: number;
    konsinyasi_harian_kredit: number;
    konsinyasi_mingguan_tunai: number;
    konsinyasi_mingguan_kredit: number;
    pendapatan_lain: number;
    total_penjualan: number;
  };
  hpp: {
    persediaan_awal: number;
    pembelian_tunai: number;
    pembelian_kredit: number;
    barang_tersedia: number;
    beban_konsinyasi_harian: number;
    beban_konsinyasi_mingguan: number;
    persediaan_akhir: number;
    hpp_total: number;
  };
  laba_kotor: number;
  beban_administrasi: number;
  laba_bersih: number;
  segmentasi: {
    barang_milik: {
      omset: number;
      hpp: number;
      laba_kotor: number;
    };
    konsinyasi_harian: {
      omset: number;
      hpp: number;
      laba_kotor: number;
    };
    konsinyasi_mingguan: {
      omset: number;
      hpp: number;
      laba_kotor: number;
    };
  };
}

const ComprehensiveProfitLoss = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const { data: profitLossData, isLoading, refetch } = useQuery({
    queryKey: ['comprehensive-profit-loss', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_comprehensive_profit_loss_report', {
        p_start_date: startDate,
        p_end_date: endDate
      });

      if (error) {
        console.error('Error fetching profit loss data:', error);
        throw new Error('Gagal mengambil data laporan laba rugi');
      }

      return data as ProfitLossData;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleExport = () => {
    if (!profitLossData) return;
    
    // Create export data
    const exportData = {
      laporan: 'Laporan Laba Rugi Komprehensif',
      periode: `${startDate} - ${endDate}`,
      data: profitLossData
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-laba-rugi-${startDate}-${endDate}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export berhasil",
      description: "Laporan laba rugi telah diexport"
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Data diperbarui",
      description: "Laporan laba rugi telah diperbarui"
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Laporan Laba Rugi Komprehensif</h2>
          <p className="text-gray-600">Analisis detail pendapatan, biaya, dan profitabilitas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Tanggal Selesai</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleRefresh} className="w-full">
                Update Laporan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Report */}
      <Card>
        <CardHeader>
          <CardTitle>Laporan Laba Rugi</CardTitle>
          <p className="text-sm text-gray-600">
            Periode: {new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* PENDAPATAN */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-700">PENDAPATAN</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Penjualan Tunai</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.pendapatan.penjualan_tunai || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Penjualan Kredit</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.pendapatan.penjualan_kredit || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Pendapatan Konsinyasi Harian Tunai</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.pendapatan.konsinyasi_harian_tunai || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Pendapatan Konsinyasi Harian Kredit</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.pendapatan.konsinyasi_harian_kredit || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Pendapatan Konsinyasi Mingguan Tunai</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.pendapatan.konsinyasi_mingguan_tunai || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Pendapatan Konsinyasi Mingguan Kredit</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.pendapatan.konsinyasi_mingguan_kredit || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Selisih Lebih/ Pendapatan Lain-lain</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.pendapatan.pendapatan_lain || 0)}</TableCell>
                  </TableRow>
                  <TableRow className="border-t-2 border-gray-400">
                    <TableCell className="font-bold text-lg">Total Penjualan</TableCell>
                    <TableCell className="text-right font-bold text-lg text-green-600">
                      {formatCurrency(profitLossData?.pendapatan.total_penjualan || 0)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <Separator />

            {/* HARGA POKOK PENJUALAN */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-red-700">HARGA POKOK PENJUALAN</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Persediaan Awal</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.hpp.persediaan_awal || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Pembelian Tunai</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.hpp.pembelian_tunai || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Pembelian Kredit</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.hpp.pembelian_kredit || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Barang Tersedia untuk Dijual</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.hpp.barang_tersedia || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Beban Konsinyasi Harian</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.hpp.beban_konsinyasi_harian || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Beban Konsinyasi Mingguan</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.hpp.beban_konsinyasi_mingguan || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Persediaan Akhir</TableCell>
                    <TableCell className="text-right">({formatCurrency(profitLossData?.hpp.persediaan_akhir || 0)})</TableCell>
                  </TableRow>
                  <TableRow className="border-t-2 border-gray-400">
                    <TableCell className="font-bold text-lg">HPP</TableCell>
                    <TableCell className="text-right font-bold text-lg text-red-600">
                      {formatCurrency(profitLossData?.hpp.hpp_total || 0)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <Separator />

            {/* LABA KOTOR */}
            <div>
              <Table>
                <TableBody>
                  <TableRow className="border-t-2 border-gray-400">
                    <TableCell className="font-bold text-xl">Laba Kotor</TableCell>
                    <TableCell className="text-right font-bold text-xl text-blue-600">
                      {formatCurrency(profitLossData?.laba_kotor || 0)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <Separator />

            {/* BEBAN OPERASIONAL */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-700">BEBAN ADMINISTRASI & UMUM</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Total Beban Administrasi & Umum</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.beban_administrasi || 0)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <Separator />

            {/* LABA BERSIH */}
            <div>
              <Table>
                <TableBody>
                  <TableRow className="border-t-2 border-gray-400">
                    <TableCell className="font-bold text-xl">Laba (Rugi) Bersih</TableCell>
                    <TableCell className={`text-right font-bold text-xl ${(profitLossData?.laba_bersih || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(profitLossData?.laba_bersih || 0)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segmentation Report */}
      <Card>
        <CardHeader>
          <CardTitle>Laporan Laba Rugi Segmentasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Perbandingan Omset</h4>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>- Barang Milik Assunnah Mart</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.segmentasi.barang_milik.omset || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>- Konsinyasi Harian</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.segmentasi.konsinyasi_harian.omset || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>- Konsinyasi Mingguan</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.segmentasi.konsinyasi_mingguan.omset || 0)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.pendapatan.total_penjualan || 0)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div>
              <h4 className="font-semibold mb-2">HPP</h4>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>- Barang Milik Assunnah Mart</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.segmentasi.barang_milik.hpp || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>- Barang Konsinyasi Harian</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.segmentasi.konsinyasi_harian.hpp || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>- Barang Konsinyasi Mingguan</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.segmentasi.konsinyasi_mingguan.hpp || 0)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.hpp.hpp_total || 0)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Perbandingan Laba Kotor</h4>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>- Barang Milik Assunnah Mart</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.segmentasi.barang_milik.laba_kotor || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>- Konsinyasi Harian</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.segmentasi.konsinyasi_harian.laba_kotor || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>- Konsinyasi Mingguan</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.segmentasi.konsinyasi_mingguan.laba_kotor || 0)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell>Laba Kotor</TableCell>
                    <TableCell className="text-right">{formatCurrency(profitLossData?.laba_kotor || 0)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveProfitLoss;
