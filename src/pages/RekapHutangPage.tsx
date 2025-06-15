
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useMonthlyDebtSummary } from "@/hooks/useLedgers";
import { Input } from "@/components/ui/input";

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

export default function RekapHutangPage() {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const { data, isLoading, error } = useMonthlyDebtSummary(year);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Rekap Hutang / Bulan</h2>
          <p className="text-gray-600">Rincian total hutang, pembayaran, dan sisa hutang per bulan dalam tahun berjalan.</p>
        </div>
        <div>
          <Input
            type="number"
            min={2000}
            max={2100}
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="w-32 text-base"
            placeholder="Tahun"
          />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Rekapitulasi Hutang (per Bulan)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center">Memuat data...</div>
          ) : error ? (
            <div className="py-6 text-center text-red-600">Gagal memuat data: {error.message}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Bulan</TableHead>
                    <TableHead>Saldo Awal</TableHead>
                    <TableHead>Hutang Baru</TableHead>
                    <TableHead>Pembayaran</TableHead>
                    <TableHead>Sisa Hutang</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data && data.length > 0 ? (
                    data.map((row: any, idx: number) => (
                      <TableRow key={row.supplier_id + "_" + row.bulan + "_" + idx}>
                        <TableCell className="font-semibold">{row.supplier_name}</TableCell>
                        <TableCell>{row.nama_bulan || months[(row.bulan || 1)-1]}</TableCell>
                        <TableCell>{formatRupiah(row.saldo_awal)}</TableCell>
                        <TableCell>{formatRupiah(row.jumlah_hutang_baru)}</TableCell>
                        <TableCell>{formatRupiah(row.jumlah_bayar)}</TableCell>
                        <TableCell>
                          <span className={Number(row.sisa_hutang) > 0 ? "text-orange-700" : "text-emerald-700"}>
                            {formatRupiah(row.sisa_hutang)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">Tidak ada data rekap hutang untuk tahun ini.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
