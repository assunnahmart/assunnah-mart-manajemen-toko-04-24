
import * as React from "react";
import { Users, CreditCard, Truck, TrendingUp, Database, Package, Calculator, BookOpen, FileText, Home, Store, ShoppingCart, LogOut, User, DollarSign } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { useToast } from "@/hooks/use-toast";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

// Menu sistem utama (utama/toko)
const mainMenuItems = [{
  title: "Dashboard",
  url: "/dashboard",
  icon: TrendingUp
}, {
  title: "POS System",
  url: "/pos",
  icon: Calculator
},
// Menu rekap laporan piutang & hutang
{
  title: "Rekap Piutang",
  url: "/laporan/rekap-piutang",
  icon: BookOpen
}, {
  title: "Rekap Hutang",
  url: "/laporan/rekap-hutang",
  icon: FileText
},
// Tambahkan dua menu berikut:
{
  title: "Buku Besar Piutang",
  url: "/admin/buku-besar-piutang",
  icon: BookOpen
}, {
  title: "Buku Besar Hutang",
  url: "/admin/buku-besar-hutang",
  icon: FileText
}];

// Penjualan & Pembelian
const jualBeliMenuItems = [{
  title: "Data Produk",
  url: "/data-produk",
  icon: Package
}, {
  title: "Stock Management",
  url: "/stock-management",
  icon: Store
}, {
  title: "Konsinyasi",
  url: "/konsinyasi",
  icon: ShoppingCart
}, {
  title: "Konsinyasi Harian",
  url: "/konsinyasi-harian",
  icon: Package
}, {
  title: "Konsinyasi Mingguan",
  url: "/konsinyasi-mingguan",
  icon: Package
}, {
  title: "Pembelian",
  url: "/purchase",
  icon: ShoppingCart
}, {
  title: "Penjualan Kredit",
  url: "/penjualan-kredit",
  icon: CreditCard
}];

// Kas & Piutang - Tambahkan menu pembayaran
const kasPiutangMenuItems = [{
  title: "Kasir Kas",
  url: "/kasir-kas",
  icon: CreditCard
}, {
  title: "Kas Umum",
  url: "/kas-umum",
  icon: CreditCard
}, {
  title: "Pembayaran Piutang",
  url: "/pembayaran-piutang",
  icon: DollarSign
}, {
  title: "Pembayaran Hutang",
  url: "/pembayaran-hutang",
  icon: DollarSign
}, {
  title: "Kasir Management",
  url: "/kasir-management",
  icon: Users
}];

// Panel Admin
const adminMenuItems = [{
  title: "Dashboard",
  url: "/admin",
  icon: Home
}, {
  title: "Pelanggan",
  url: "/admin/pelanggan",
  icon: Users
}, {
  title: "Supplier",
  url: "/admin/supplier",
  icon: Truck
}, {
  title: "Kas Umum",
  url: "/admin/kas-umum",
  icon: CreditCard
}, {
  title: "Laba Rugi",
  url: "/admin/laba-rugi",
  icon: TrendingUp
}, {
  title: "Laporan Keuangan",
  url: "/admin/financial-reports",
  icon: Calculator
}, {
  title: "Data Management",
  url: "/admin/data-management",
  icon: Database
}, {
  title: "Product Management",
  url: "/admin/product-management",
  icon: Package
},
// Menu baru
{
  title: "Kartu Hutang",
  url: "/admin/kartu-hutang",
  icon: FileText
}, {
  title: "Kartu Piutang",
  url: "/admin/kartu-piutang",
  icon: FileText
}];

// Helper render menu as regular rows
function MenuSection({ label, menuItems, user, location, onNavigate, adminOnly = false }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold uppercase text-slate-500 mb-2">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            const isDisabled = adminOnly && user?.role !== "admin";
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  className={`
                    transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 rounded-lg
                    ${isActive ? "bg-blue-100 text-blue-800 border-l-4 border-blue-600 font-medium" : ""}
                    ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  <div
                    onClick={() => !isDisabled && onNavigate(item.url)}
                    className="flex items-center gap-3 py-2 px-3"
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "text-blue-700" : "text-slate-600"}`} />
                    <span className={`text-sm ${isActive ? "text-blue-800 font-medium" : "text-slate-700"}`}>
                      {item.title}
                    </span>
                    {isDisabled && (
                      <span className="text-xs text-slate-400 ml-auto">Admin Only</span>
                    )}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
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
    <Sidebar variant="inset" className="border-r border-slate-200 bg-white" {...props}>
      <SidebarHeader>
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="/lovable-uploads/63181b78-99d7-4d69-be72-332dd429807c.png" 
                alt="Assunnah Mart Logo" 
                className="h-10 w-auto object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Assunnah Mart</h2>
              <p className="text-sm text-slate-500">Management System</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{user.full_name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="py-4">
        <MenuSection 
          label="Sistem Utama" 
          menuItems={mainMenuItems} 
          user={user} 
          location={location} 
          onNavigate={navigate} 
        />
        <MenuSection 
          label="Penjualan & Pembelian" 
          menuItems={jualBeliMenuItems} 
          user={user} 
          location={location} 
          onNavigate={navigate} 
        />
        <MenuSection 
          label="Kas & Piutang" 
          menuItems={kasPiutangMenuItems} 
          user={user} 
          location={location} 
          onNavigate={navigate} 
        />
        <MenuSection 
          label="Panel Administrator" 
          menuItems={adminMenuItems} 
          user={user} 
          location={location} 
          onNavigate={navigate} 
          adminOnly 
        />
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4 border-t border-slate-100">
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
