import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Download, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const { data: profitLossData, isLoading, refetch } = useQuery({
    queryKey: ['comprehensive_profit_loss', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_comprehensive_profit_loss_report', {
        p_start_date: startDate,
        p_end_date: endDate
      });
      
      if (error) {
        console.error('Error fetching profit loss data:', error);
        throw error;
      }
      
      return data as unknown as ProfitLossData;
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const exportToPrint = () => {
    if (!profitLossData) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const htmlContent = `
      <html>
        <head>
          <title>Laporan Laba Rugi</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .bg-gray { background-color: #f5f5f5; }
            h1, h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h1>LAPORAN LABA RUGI</h1>
          <h2>Periode: ${profitLossData.periode.start_date} s/d ${profitLossData.periode.end_date}</h2>
          
          <table>
            <tr class="bg-gray"><th colspan="2">PENDAPATAN</th></tr>
            <tr><td>Penjualan Tunai</td><td class="text-right">${formatCurrency(profitLossData.pendapatan.penjualan_tunai)}</td></tr>
            <tr><td>Penjualan Kredit</td><td class="text-right">${formatCurrency(profitLossData.pendapatan.penjualan_kredit)}</td></tr>
            <tr><td>Pendapatan Konsinyasi Harian Tunai</td><td class="text-right">${formatCurrency(profitLossData.pendapatan.konsinyasi_harian_tunai)}</td></tr>
            <tr><td>Pendapatan Konsinyasi Harian Kredit</td><td class="text-right">${formatCurrency(profitLossData.pendapatan.konsinyasi_harian_kredit)}</td></tr>
            <tr><td>Pendapatan Konsinyasi Mingguan Tunai</td><td class="text-right">${formatCurrency(profitLossData.pendapatan.konsinyasi_mingguan_tunai)}</td></tr>
            <tr><td>Pendapatan Konsinyasi Mingguan Kredit</td><td class="text-right">${formatCurrency(profitLossData.pendapatan.konsinyasi_mingguan_kredit)}</td></tr>
            <tr><td>Selisih Lebih/Pendapatan Lain-lain</td><td class="text-right">${formatCurrency(profitLossData.pendapatan.pendapatan_lain)}</td></tr>
            <tr class="font-bold bg-gray"><td>Total Penjualan</td><td class="text-right">${formatCurrency(profitLossData.pendapatan.total_penjualan)}</td></tr>
          </table>
          
          <table>
            <tr class="bg-gray"><th colspan="2">HARGA POKOK PENJUALAN</th></tr>
            <tr><td>Persediaan Awal</td><td class="text-right">${formatCurrency(profitLossData.hpp.persediaan_awal)}</td></tr>
            <tr><td>Pembelian Tunai</td><td class="text-right">${formatCurrency(profitLossData.hpp.pembelian_tunai)}</td></tr>
            <tr><td>Pembelian Kredit</td><td class="text-right">${formatCurrency(profitLossData.hpp.pembelian_kredit)}</td></tr>
            <tr><td>Barang Tersedia untuk Dijual</td><td class="text-right">${formatCurrency(profitLossData.hpp.barang_tersedia)}</td></tr>
            <tr><td>Beban Konsinyasi Harian</td><td class="text-right">${formatCurrency(profitLossData.hpp.beban_konsinyasi_harian)}</td></tr>
            <tr><td>Beban Konsinyasi Mingguan</td><td class="text-right">${formatCurrency(profitLossData.hpp.beban_konsinyasi_mingguan)}</td></tr>
            <tr><td>Persediaan Akhir</td><td class="text-right">${formatCurrency(profitLossData.hpp.persediaan_akhir)}</td></tr>
            <tr class="font-bold bg-gray"><td>HPP</td><td class="text-right">${formatCurrency(profitLossData.hpp.hpp_total)}</td></tr>
            <tr class="font-bold bg-gray"><td>Laba Kotor</td><td class="text-right">${formatCurrency(profitLossData.laba_kotor)}</td></tr>
          </table>
          
          <table>
            <tr class="bg-gray"><th colspan="2">BEBAN OPERASIONAL</th></tr>
            <tr><td>Total Beban Administrasi & Umum</td><td class="text-right">${formatCurrency(profitLossData.beban_administrasi)}</td></tr>
            <tr class="font-bold bg-gray"><td>Laba (Rugi) Bersih</td><td class="text-right">${formatCurrency(profitLossData.laba_bersih)}</td></tr>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Memuat laporan laba rugi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Laporan Laba Rugi Komprehensif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="start-date">Tanggal Mulai</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Tanggal Selesai</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={() => refetch()} className="flex-1">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Update Laporan
              </Button>
              <Button onClick={exportToPrint} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          {profitLossData && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">LAPORAN LABA RUGI</h2>
                <p className="text-gray-600">
                  Periode: {profitLossData.periode.start_date} s/d {profitLossData.periode.end_date}
                </p>
              </div>

              {/* PENDAPATAN */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">PENDAPATAN</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Penjualan Tunai</span>
                      <span className="font-mono">{formatCurrency(profitLossData.pendapatan.penjualan_tunai)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Penjualan Kredit</span>
                      <span className="font-mono">{formatCurrency(profitLossData.pendapatan.penjualan_kredit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pendapatan Konsinyasi Harian Tunai</span>
                      <span className="font-mono">{formatCurrency(profitLossData.pendapatan.konsinyasi_harian_tunai)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pendapatan Konsinyasi Harian Kredit</span>
                      <span className="font-mono">{formatCurrency(profitLossData.pendapatan.konsinyasi_harian_kredit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pendapatan Konsinyasi Mingguan Tunai</span>
                      <span className="font-mono">{formatCurrency(profitLossData.pendapatan.konsinyasi_mingguan_tunai)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pendapatan Konsinyasi Mingguan Kredit</span>
                      <span className="font-mono">{formatCurrency(profitLossData.pendapatan.konsinyasi_mingguan_kredit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Selisih Lebih/Pendapatan Lain-lain</span>
                      <span className="font-mono">{formatCurrency(profitLossData.pendapatan.pendapatan_lain)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg bg-gray-50 p-2 rounded">
                      <span>Total Penjualan</span>
                      <span className="font-mono">{formatCurrency(profitLossData.pendapatan.total_penjualan)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* HPP */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">HARGA POKOK PENJUALAN</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Persediaan Awal</span>
                      <span className="font-mono">{formatCurrency(profitLossData.hpp.persediaan_awal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pembelian Tunai</span>
                      <span className="font-mono">{formatCurrency(profitLossData.hpp.pembelian_tunai)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pembelian Kredit</span>
                      <span className="font-mono">{formatCurrency(profitLossData.hpp.pembelian_kredit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Barang Tersedia untuk Dijual</span>
                      <span className="font-mono">{formatCurrency(profitLossData.hpp.barang_tersedia)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beban Konsinyasi Harian</span>
                      <span className="font-mono">{formatCurrency(profitLossData.hpp.beban_konsinyasi_harian)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Beban Konsinyasi Mingguan</span>
                      <span className="font-mono">{formatCurrency(profitLossData.hpp.beban_konsinyasi_mingguan)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Persediaan Akhir</span>
                      <span className="font-mono">{formatCurrency(profitLossData.hpp.persediaan_akhir)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg bg-gray-50 p-2 rounded">
                      <span>HPP</span>
                      <span className="font-mono">{formatCurrency(profitLossData.hpp.hpp_total)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg bg-green-50 p-2 rounded">
                      <span>Laba Kotor</span>
                      <span className="font-mono text-green-600">{formatCurrency(profitLossData.laba_kotor)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* BEBAN OPERASIONAL */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">BEBAN OPERASIONAL</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Beban Administrasi & Umum</span>
                      <span className="font-mono">{formatCurrency(profitLossData.beban_administrasi)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-xl bg-blue-50 p-3 rounded">
                      <span>Laba (Rugi) Bersih</span>
                      <span className={`font-mono ${profitLossData.laba_bersih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(profitLossData.laba_bersih)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SEGMENTASI */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">LAPORAN LABA RUGI SEGMENTASI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-bold">Barang Milik Assunnah Mart</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Omset:</span>
                          <span className="font-mono">{formatCurrency(profitLossData.segmentasi.barang_milik.omset)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>HPP:</span>
                          <span className="font-mono">{formatCurrency(profitLossData.segmentasi.barang_milik.hpp)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Laba Kotor:</span>
                          <span className="font-mono text-green-600">{formatCurrency(profitLossData.segmentasi.barang_milik.laba_kotor)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-bold">Konsinyasi Harian</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Omset:</span>
                          <span className="font-mono">{formatCurrency(profitLossData.segmentasi.konsinyasi_harian.omset)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>HPP:</span>
                          <span className="font-mono">{formatCurrency(profitLossData.segmentasi.konsinyasi_harian.hpp)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Laba Kotor:</span>
                          <span className="font-mono text-green-600">{formatCurrency(profitLossData.segmentasi.konsinyasi_harian.laba_kotor)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-bold">Konsinyasi Mingguan</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Omset:</span>
                          <span className="font-mono">{formatCurrency(profitLossData.segmentasi.konsinyasi_mingguan.omset)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>HPP:</span>
                          <span className="font-mono">{formatCurrency(profitLossData.segmentasi.konsinyasi_mingguan.hpp)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Laba Kotor:</span>
                          <span className="font-mono text-green-600">{formatCurrency(profitLossData.segmentasi.konsinyasi_mingguan.laba_kotor)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveProfitLoss;
