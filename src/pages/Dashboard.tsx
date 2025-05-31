
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
      color: "from-blue-500 to-blue-600",
      status: "Coming Soon"
    },
    {
      title: "Manajemen Kasir",
      description: "Kelola data kasir dan jadwal",
      icon: Users,
      href: "/kasir",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Konsinyasi",
      description: "Barang konsinyasi harian & mingguan",
      icon: Package,
      href: "/konsinyasi",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Penjualan Kredit",
      description: "Tagihan unit & potong gaji",
      icon: CreditCard,
      href: "/kredit",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Laporan Keuangan",
      description: "Laporan penjualan dan keuangan",
      icon: BarChart3,
      href: "/laporan",
      color: "from-indigo-500 to-indigo-600",
      status: "Coming Soon"
    },
    {
      title: "Stok Opname",
      description: "Pemeriksaan dan penyesuaian stok",
      icon: Clipboard,
      href: "/stok-opname",
      color: "from-red-500 to-red-600",
      status: "Coming Soon"
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <div className="p-3 sm:p-6">
          <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mobile-optimized mt-1">Selamat datang di sistem manajemen Assunnah Mart</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item, index) => (
                <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-200 border-0 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} text-white shadow-lg`}>
                        <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      {item.status && (
                        <Badge variant="secondary" className="text-xs">
                          {item.status}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <h3 className="font-semibold text-base sm:text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 mobile-optimized">{item.description}</p>
                    <Button asChild className="w-full h-10 font-medium" disabled={item.status === "Coming Soon"}>
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
              <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-orange-800 text-base sm:text-lg">
                    <AlertTriangle className="h-5 w-5" />
                    Peringatan Stok Rendah
                  </CardTitle>
                  <CardDescription className="text-orange-700 mobile-optimized">
                    Terdapat {barangStokRendah.length} barang dengan stok di bawah batas minimal
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild variant="outline" className="border-orange-300 text-orange-800 hover:bg-orange-100 h-10">
                    <Link to="/konsinyasi">
                      Lihat Detail Stok
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card className="shadow-md border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Aktivitas Terbaru</CardTitle>
                <CardDescription className="mobile-optimized">
                  Transaksi dan aktivitas terbaru hari ini
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {transaksiHariIni?.transaksi && transaksiHariIni.transaksi.length > 0 ? (
                  <div className="space-y-3">
                    {transaksiHariIni.transaksi.slice(0, 5).map((transaksi) => (
                      <div key={transaksi.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base truncate">{transaksi.nomor_transaksi}</p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {new Date(transaksi.tanggal_transaksi || '').toLocaleTimeString('id-ID')}
                          </p>
                        </div>
                        <div className="text-right ml-3">
                          <p className="font-medium text-sm sm:text-base">{formatRupiah(Number(transaksi.total))}</p>
                          <Badge variant={transaksi.status === 'selesai' ? 'default' : 'secondary'} className="text-xs">
                            {transaksi.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                    <p className="mt-2 mobile-optimized">Belum ada transaksi hari ini</p>
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
