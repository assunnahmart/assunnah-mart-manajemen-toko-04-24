
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useMonthlyReceivablesSummary } from "@/hooks/useLedgers";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

const months = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

export default function RekapPiutangPage() {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const { data, isLoading, error, refetch } = useMonthlyReceivablesSummary(year);

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export data:', data);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Rekap Piutang per Bulan</h2>
                  <p className="text-muted-foreground mt-2">
                    Laporan rincian total piutang, pembayaran, dan sisa piutang per bulan dalam tahun berjalan
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={2000}
                    max={2100}
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    className="w-32"
                    placeholder="Tahun"
                  />
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Rekapitulasi Piutang Tahun {year}</span>
                    {data && data.length > 0 && (
                      <span className="text-sm font-normal text-muted-foreground">
                        Total {data.length} entri
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-3 text-muted-foreground">Memuat data...</span>
                    </div>
                  ) : error ? (
                    <div className="py-8 text-center">
                      <div className="text-red-600 mb-2">
                        Gagal memuat data: {error.message}
                      </div>
                      <Button variant="outline" onClick={handleRefresh}>
                        Coba Lagi
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-semibold">Pelanggan</TableHead>
                            <TableHead className="font-semibold">Bulan</TableHead>
                            <TableHead className="font-semibold text-right">Saldo Awal</TableHead>
                            <TableHead className="font-semibold text-right">Piutang Baru</TableHead>
                            <TableHead className="font-semibold text-right">Pembayaran</TableHead>
                            <TableHead className="font-semibold text-right">Sisa Piutang</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data && data.length > 0 ? (
                            data.map((row: any, idx: number) => (
                              <TableRow key={`${row.pelanggan_id}_${row.bulan}_${idx}`} className="hover:bg-muted/50">
                                <TableCell className="font-medium">{row.pelanggan_name}</TableCell>
                                <TableCell>{row.nama_bulan || months[(row.bulan || 1)-1]}</TableCell>
                                <TableCell className="text-right font-mono">
                                  {formatRupiah(row.saldo_awal)}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {formatRupiah(row.jumlah_piutang_baru)}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {formatRupiah(row.jumlah_bayar)}
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  <span className={`font-medium ${
                                    Number(row.sisa_piutang) > 0 
                                      ? "text-red-600" 
                                      : "text-green-600"
                                  }`}>
                                    {formatRupiah(row.sisa_piutang)}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="text-4xl">📊</div>
                                  <div>Tidak ada data rekap piutang untuk tahun {year}</div>
                                  <div className="text-sm">Pilih tahun yang berbeda atau tambah data piutang</div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
