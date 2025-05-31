
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  Users, 
  Package, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Banknote
} from "lucide-react";
import { useTransaksiHariIni } from "@/hooks/useTransaksi";
import { useBarangStokRendah } from "@/hooks/useBarangKonsinyasi";
import { usePelangganKredit } from "@/hooks/usePelanggan";
import { useKasir } from "@/hooks/useKasir";
import StatsCard from "@/components/StatsCard";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: transaksiHariIni } = useTransaksiHariIni();
  const { data: barangStokRendah } = useBarangStokRendah();
  const { data: pelangganKredit } = usePelangganKredit();
  const { data: kasirData } = useKasir();

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const kasirAktif = kasirData?.filter(k => k.status === 'aktif').length || 0;
  const totalPiutangUnit = pelangganKredit?.unit.reduce((sum, p) => sum + (p.total_tagihan || 0), 0) || 0;
  const totalPiutangPerorangan = pelangganKredit?.perorangan.reduce((sum, p) => sum + (p.sisa_piutang || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Assunnah Mart</h1>
          <p className="text-gray-600">Jalan Kalitanjung No 52B</p>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Transaksi Hari Ini"
            value={transaksiHariIni?.totalTransaksi || 0}
            description="Total transaksi"
            icon={Store}
          />
          <StatsCard
            title="Pendapatan Hari Ini"
            value={formatRupiah(transaksiHariIni?.totalPendapatan || 0)}
            description="Total pendapatan"
            icon={Banknote}
          />
          <StatsCard
            title="Kasir Aktif"
            value={kasirAktif}
            description="Dari total kasir"
            icon={Users}
          />
          <StatsCard
            title="Stok Rendah"
            value={barangStokRendah?.length || 0}
            description="Barang perlu restock"
            icon={AlertTriangle}
          />
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Menu Utama
              </CardTitle>
              <CardDescription>Akses cepat ke fitur utama</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/pos')}
              >
                <Store className="mr-2 h-4 w-4" />
                POS System
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/kasir')}
              >
                <Users className="mr-2 h-4 w-4" />
                Manajemen Kasir
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/konsinyasi')}
              >
                <Package className="mr-2 h-4 w-4" />
                Konsinyasi
              </Button>
            </CardContent>
          </Card>

          {/* Stok Rendah */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Stok Rendah
              </CardTitle>
              <CardDescription>Barang yang perlu direstock</CardDescription>
            </CardHeader>
            <CardContent>
              {barangStokRendah && barangStokRendah.length > 0 ? (
                <div className="space-y-2">
                  {barangStokRendah.slice(0, 3).map((barang) => (
                    <div key={barang.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{barang.nama}</p>
                        <p className="text-xs text-gray-500">{barang.jenis_konsinyasi}</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {barang.stok_saat_ini}/{barang.stok_minimal}
                      </Badge>
                    </div>
                  ))}
                  {barangStokRendah.length > 3 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => navigate('/konsinyasi')}
                    >
                      Lihat Semua ({barangStokRendah.length})
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Semua stok dalam kondisi baik</p>
              )}
            </CardContent>
          </Card>

          {/* Piutang */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                Total Piutang
              </CardTitle>
              <CardDescription>Piutang yang belum terbayar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Unit:</span>
                <span className="font-medium">{formatRupiah(totalPiutangUnit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Perorangan:</span>
                <span className="font-medium">{formatRupiah(totalPiutangPerorangan)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatRupiah(totalPiutangUnit + totalPiutangPerorangan)}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate('/kredit')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Kelola Piutang
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Transaksi Terbaru
            </CardTitle>
            <CardDescription>5 transaksi terakhir hari ini</CardDescription>
          </CardHeader>
          <CardContent>
            {transaksiHariIni?.transaksi && transaksiHariIni.transaksi.length > 0 ? (
              <div className="space-y-3">
                {transaksiHariIni.transaksi.slice(0, 5).map((transaksi) => (
                  <div key={transaksi.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{transaksi.nomor_transaksi}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaksi.created_at || '').toLocaleTimeString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatRupiah(transaksi.total)}</p>
                      <Badge variant={transaksi.jenis_pembayaran === 'cash' ? 'default' : 'secondary'}>
                        {transaksi.jenis_pembayaran}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => navigate('/laporan')}>
                  Lihat Semua Transaksi
                </Button>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">Belum ada transaksi hari ini</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
