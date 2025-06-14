
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, Truck, TrendingUp, Database, Package, Calculator, BookOpen, FileText } from 'lucide-react';

const AdminDashboard = () => {
  const adminSections = [
    {
      title: "Pelanggan Management",
      description: "Kelola data pelanggan dan piutang",
      icon: Users,
      color: "bg-blue-500",
      path: "/admin/pelanggan"
    },
    {
      title: "Supplier Management", 
      description: "Kelola data supplier dan hutang",
      icon: Truck,
      color: "bg-green-500",
      path: "/admin/supplier"
    },
    {
      title: "Buku Besar Piutang",
      description: "Monitor dan kelola piutang pelanggan",
      icon: BookOpen,
      color: "bg-orange-500",
      path: "/admin/buku-besar-piutang"
    },
    {
      title: "Buku Besar Hutang",
      description: "Monitor dan kelola hutang supplier",
      icon: FileText,
      color: "bg-red-500",
      path: "/admin/buku-besar-hutang"
    },
    {
      title: "Kas Umum",
      description: "Kelola kas dan transaksi keuangan",
      icon: CreditCard,
      color: "bg-purple-500",
      path: "/admin/kas-umum"
    },
    {
      title: "Laba Rugi",
      description: "Analisis laporan laba rugi",
      icon: TrendingUp,
      color: "bg-indigo-500",
      path: "/admin/laba-rugi"
    },
    {
      title: "Laporan Keuangan",
      description: "Berbagai laporan keuangan",
      icon: Calculator,
      color: "bg-teal-500",
      path: "/admin/financial-reports"
    },
    {
      title: "Data Management",
      description: "Kelola data sistem",
      icon: Database,
      color: "bg-gray-500",
      path: "/admin/data-management"
    },
    {
      title: "Product Management",
      description: "Kelola data produk",
      icon: Package,
      color: "bg-yellow-500",
      path: "/admin/product-management"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Administrator</h1>
        <p className="text-gray-600">
          Selamat datang di panel administrator. Pilih menu dari sidebar untuk mengakses fitur yang tersedia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Card key={section.title} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${section.color}`}>
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">{section.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Informasi</h3>
        <p className="text-blue-700">
          Gunakan menu sidebar di sebelah kiri untuk navigasi cepat ke berbagai fitur administrator. 
          Setiap menu memiliki fungsi khusus untuk mengelola aspek berbeda dari sistem.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
