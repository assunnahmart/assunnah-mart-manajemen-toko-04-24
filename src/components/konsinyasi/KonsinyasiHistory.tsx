
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt } from 'lucide-react';
import { useKonsinyasiLaporan } from '@/hooks/useKonsinyasi';

const KonsinyasiHistory = () => {
  const { data: laporanList, isLoading } = useKonsinyasiLaporan();

  const printReceipt = (laporan: any) => {
    const printContent = `
      <div style="max-width: 400px; margin: 0 auto; font-family: monospace;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2>TANDA TERIMA KONSINYASI</h2>
          <p>================================</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <p><strong>Supplier:</strong> ${laporan.supplier?.nama || ''}</p>
          <p><strong>Periode:</strong> ${laporan.periode_mulai} s/d ${laporan.periode_selesai}</p>
          <p><strong>Tanggal:</strong> ${new Date(laporan.created_at).toLocaleDateString('id-ID')}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <p>================================</p>
          <p><strong>DETAIL BARANG:</strong></p>
          <p>================================</p>
          ${laporan.konsinyasi_detail?.map((item: any) => `
            <p><strong>${item.nama_barang}</strong></p>
            <p>Harga: Rp ${item.harga_beli.toLocaleString('id-ID')}</p>
            <p>Terjual: ${item.jumlah_terjual} pcs</p>
            <p>Total: Rp ${item.total_nilai.toLocaleString('id-ID')}</p>
            <p>--------------------------------</p>
          `).join('')}
        </div>
        
        <div style="margin-top: 20px;">
          <p>================================</p>
          <p><strong>Total Penjualan: Rp ${(laporan.total_penjualan || 0).toLocaleString('id-ID')}</strong></p>
          <p><strong>Komisi (10%): Rp ${(laporan.total_komisi || 0).toLocaleString('id-ID')}</strong></p>
          <p>================================</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p>Terima kasih atas kerjasama Anda</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Tanda Terima Konsinyasi</title>
            <style>
              body { margin: 20px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
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
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Laporan Konsinyasi</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Total Penjualan</TableHead>
              <TableHead>Total Komisi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {laporanList?.map((laporan) => (
              <TableRow key={laporan.id}>
                <TableCell>{laporan.supplier?.nama}</TableCell>
                <TableCell>
                  {laporan.periode_mulai} s/d {laporan.periode_selesai}
                </TableCell>
                <TableCell>Rp {(laporan.total_penjualan || 0).toLocaleString('id-ID')}</TableCell>
                <TableCell>Rp {(laporan.total_komisi || 0).toLocaleString('id-ID')}</TableCell>
                <TableCell>
                  <Badge variant={laporan.status === 'completed' ? 'default' : 'secondary'}>
                    {laporan.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => printReceipt(laporan)}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Cetak
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default KonsinyasiHistory;
