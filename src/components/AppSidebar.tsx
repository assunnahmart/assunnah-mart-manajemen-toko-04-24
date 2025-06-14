import * as React from "react";
import { Users, CreditCard, Truck, TrendingUp, Database, Package, Calculator, BookOpen, FileText, Home, Store, ShoppingCart, LogOut, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import { useToast } from "@/hooks/use-toast";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
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
  title: "Buku Besar Piutang",
  url: "/admin/buku-besar-piutang",
  icon: BookOpen
}, {
  title: "Buku Besar Hutang",
  url: "/admin/buku-besar-hutang",
  icon: FileText
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
}];
const mainMenuItems = [{
  title: "Dashboard",
  url: "/dashboard",
  icon: TrendingUp
}, {
  title: "POS System",
  url: "/pos",
  icon: Calculator
}, {
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
  title: "Pembelian",
  url: "/purchase",
  icon: ShoppingCart
}, {
  title: "Penjualan Kredit",
  url: "/penjualan-kredit",
  icon: CreditCard
}, {
  title: "Kasir Kas",
  url: "/kasir-kas",
  icon: CreditCard
}, {
  title: "Kas Umum",
  url: "/kas-umum",
  icon: CreditCard
}, {
  title: "Kasir Management",
  url: "/kasir-management",
  icon: Users
}];
export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useSimpleAuth();
  const {
    toast
  } = useToast();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const handleNavigation = (url: string) => {
    navigate(url);
  };
  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout berhasil",
      description: "Anda telah keluar dari sistem"
    });
    navigate('/');
  };
  return <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            
            <div>
              <h2 className="text-lg font-semibold">Assunnah Mart</h2>
              <p className="text-sm text-gray-500">Management System</p>
            </div>
          </div>
          {user && <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <User className="h-4 w-4" />
              <div className="flex-1">
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Main System Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Sistem Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <button onClick={() => handleNavigation(item.url)} className="w-full text-left">
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Panel Menu - Show for all users but highlight admin access */}
        <SidebarGroup>
          <SidebarGroupLabel>Panel Administrator</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url} disabled={user?.role !== 'admin'}>
                    <button onClick={() => handleNavigation(item.url)} className="w-full text-left" disabled={user?.role !== 'admin'}>
                      <item.icon />
                      <span>{item.title}</span>
                      {user?.role !== 'admin' && <span className="ml-auto text-xs text-gray-400">Admin</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 border-t">
          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>;
}