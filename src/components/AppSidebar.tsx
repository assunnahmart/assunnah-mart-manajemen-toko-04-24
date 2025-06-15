import * as React from "react";
import {
  Users, CreditCard, Truck, TrendingUp, Database, Package, Calculator, BookOpen,
  FileText, Home, Store, ShoppingCart, LogOut, User
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { useToast } from "@/hooks/use-toast";
import { Sidebar, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Menu system utama (utama/toko)
const mainMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: TrendingUp },
  { title: "POS System", url: "/pos", icon: Calculator },
  // Tambahkan dua menu berikut:
  { title: "Buku Besar Piutang", url: "/admin/buku-besar-piutang", icon: BookOpen },
  { title: "Buku Besar Hutang", url: "/admin/buku-besar-hutang", icon: FileText },
];

// Penjualan & Pembelian
const jualBeliMenuItems = [
  { title: "Data Produk", url: "/data-produk", icon: Package },
  { title: "Stock Management", url: "/stock-management", icon: Store },
  { title: "Konsinyasi", url: "/konsinyasi", icon: ShoppingCart },
  { title: "Konsinyasi Harian", url: "/konsinyasi-harian", icon: Package },
  { title: "Pembelian", url: "/purchase", icon: ShoppingCart },
  { title: "Penjualan Kredit", url: "/penjualan-kredit", icon: CreditCard },
];

// Kas & Piutang
const kasPiutangMenuItems = [
  { title: "Kasir Kas", url: "/kasir-kas", icon: CreditCard },
  { title: "Kas Umum", url: "/kas-umum", icon: CreditCard },
  { title: "Kasir Management", url: "/kasir-management", icon: Users },
];

// Panel Admin
const adminMenuItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Pelanggan", url: "/admin/pelanggan", icon: Users },
  { title: "Supplier", url: "/admin/supplier", icon: Truck },
  // Hapus Buku Besar Piutang & Hutang dari sini
  // { title: "Buku Besar Piutang", url: "/admin/buku-besar-piutang", icon: BookOpen },
  // { title: "Buku Besar Hutang", url: "/admin/buku-besar-hutang", icon: FileText },
  { title: "Kas Umum", url: "/admin/kas-umum", icon: CreditCard },
  { title: "Laba Rugi", url: "/admin/laba-rugi", icon: TrendingUp },
  { title: "Laporan Keuangan", url: "/admin/financial-reports", icon: Calculator },
  { title: "Data Management", url: "/admin/data-management", icon: Database },
  { title: "Product Management", url: "/admin/product-management", icon: Package }
];

// Helper render menu as card grid by category
function MenuGrid({ label, menuItems, user, location, onNavigate, adminOnly = false }) {
  return (
    <div className="mb-5">
      <p className="text-xs text-gray-500 font-semibold uppercase px-4 mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-3 px-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
        {menuItems.map(item => {
          const isActive = location.pathname === item.url;
          const isDisabled = adminOnly && user?.role !== "admin";
          return (
            <Card
              key={item.title}
              className={`transition-all shadow-sm cursor-pointer px-0 ${isActive
                ? "ring-2 ring-accent bg-accent/10"
                : "hover:shadow-lg"} ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => !isDisabled && onNavigate(item.url)}
            >
              <CardContent className="flex flex-col items-center justify-center py-4 gap-2">
                <item.icon className="h-6 w-6 mb-1 text-primary" />
                <span className="text-[0.95rem] text-center font-semibold break-words">{item.title}</span>
                {isDisabled && (
                  <span className="text-xs text-gray-500 mt-1">Admin Only</span>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useSimpleAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout berhasil",
      description: "Anda telah keluar dari sistem"
    });
    navigate('/');
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Assunnah Mart</h2>
              <p className="text-sm text-gray-500">Management System</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <User className="h-4 w-4" />
              <div className="flex-1">
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <div className="flex-1 overflow-y-auto py-2">
        <MenuGrid label="Sistem Utama" menuItems={mainMenuItems} user={user} location={location} onNavigate={navigate} />
        <MenuGrid label="Penjualan & Pembelian" menuItems={jualBeliMenuItems} user={user} location={location} onNavigate={navigate} />
        <MenuGrid label="Kas & Piutang" menuItems={kasPiutangMenuItems} user={user} location={location} onNavigate={navigate} />
        <MenuGrid label="Panel Administrator" menuItems={adminMenuItems} user={user} location={location} onNavigate={navigate} adminOnly />
      </div>
      <SidebarFooter>
        <div className="p-4 border-t">
          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
