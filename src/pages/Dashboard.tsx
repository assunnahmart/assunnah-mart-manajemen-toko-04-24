import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Package, TrendingUp, CreditCard, AlertTriangle, ShoppingCart, FileText, BarChart3, Clipboard } from "lucide-react";
import { Link } from "react-router-dom";
import StatsCard from "@/components/StatsCard";
import { useKasir } from "@/hooks/useKasir";
import { useBarangKonsinyasi, useBarangStokRendah } from "@/hooks/useBarangKonsinyasi";
import { usePelangganKredit } from "@/hooks/usePelanggan";
import { useTransaksiHariIni } from "@/hooks/useTransaksi";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

const Dashboard = () => {
  const { data: kasirData } = useKasir();
  const { data: barangHarian } = useBarangKonsinyasi('harian');
  const { data: barangMingguan } = useBarangKonsinyasi('mingguan');
  const { data: barangStokRendah } = useBarangStokRendah();
  const { data: pelangganKredit } = usePelangganKredit();
  const { data: transaksiHariIni } = useTransaksiHariIni();

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalTagihanKredit = (pelangganKredit?.unit.reduce((sum, u) => sum + Number(u.total_tagihan), 0) || 0) +
                            (pelangganKredit?.perorangan.reduce((sum, p) => sum + Number(p.sisa_piutang), 0) || 0);

  const menuItems = [
    {
      title: "Point of Sale",
      description: "Sistem kasir dan penjualan",
      icon: ShoppingCart,
      href: "/pos",
      color: "bg-blue-500",
      status: "Coming Soon"
    },
    {
      title: "Manajemen Kasir",
      description: "Kelola data kasir dan jadwal",
      icon: Users,
      href: "/kasir",
      color: "bg-green-500"
    },
    {
      title: "Konsinyasi",
      description: "Barang konsinyasi harian & mingguan",
      icon: Package,
      href: "/konsinyasi",
      color: "bg-purple-500"
    },
    {
      title: "Penjualan Kredit",
      description: "Tagihan unit & potong gaji",
      icon: CreditCard,
      href: "/kredit",
      color: "bg-orange-500"
    },
    {
      title: "Laporan Keuangan",
      description: "Laporan penjualan dan keuangan",
      icon: BarChart3,
      href: "/laporan",
      color: "bg-indigo-500",
      status: "Coming Soon"
    },
    {
      title: "Stok Opname",
      description: "Pemeriksaan dan penyesuaian stok",
      icon: Clipboard,
      href: "/stok-opname",
      color: "bg-red-500",
      status: "Coming Soon"
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Selamat datang di sistem manajemen Assunnah Mart</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Transaksi Hari Ini"
                value={transaksiHariIni?.totalTransaksi || 0}
                description={`Pendapatan: ${formatRupiah(transaksiHariIni?.totalPendapatan || 0)}`}
                icon={TrendingUp}
              />
              <StatsCard
                title="Total Kasir"
                value={kasirData?.length || 0}
                description="Kasir aktif"
                icon={Users}
              />
              <StatsCard
                title="Barang Konsinyasi"
                value={(barangHarian?.length || 0) + (barangMingguan?.length || 0)}
                description={`${barangHarian?.length || 0} harian, ${barangMingguan?.length || 0} mingguan`}
                icon={Package}
              />
              <StatsCard
                title="Total Tagihan Kredit"
                value={formatRupiah(totalTagihanKredit)}
                description={`${(pelangganKredit?.unit.length || 0) + (pelangganKredit?.perorangan.length || 0)} pelanggan`}
                icon={CreditCard}
              />
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${item.color} text-white`}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      {item.status && (
                        <Badge variant="secondary" className="text-xs">
                          {item.status}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                    <Button asChild className="w-full" disabled={item.status === "Coming Soon"}>
                      <Link to={item.href}>
                        Buka {item.title}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Alerts */}
            {barangStokRendah && barangStokRendah.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <AlertTriangle className="h-5 w-5" />
                    Peringatan Stok Rendah
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    Terdapat {barangStokRendah.length} barang dengan stok di bawah batas minimal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="border-orange-300 text-orange-800 hover:bg-orange-100">
                    <Link to="/konsinyasi">
                      Lihat Detail Stok
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
                <CardDescription>
                  Transaksi dan aktivitas terbaru hari ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transaksiHariIni?.transaksi && transaksiHariIni.transaksi.length > 0 ? (
                  <div className="space-y-4">
                    {transaksiHariIni.transaksi.slice(0, 5).map((transaksi) => (
                      <div key={transaksi.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{transaksi.nomor_transaksi}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaksi.tanggal_transaksi || '').toLocaleTimeString('id-ID')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatRupiah(Number(transaksi.total))}</p>
                          <Badge variant={transaksi.status === 'selesai' ? 'default' : 'secondary'}>
                            {transaksi.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">Belum ada transaksi hari ini</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
