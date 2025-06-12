import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Store, Package, ShoppingCart, Calculator, CreditCard, TrendingUp, Users, Settings, Package2, BookOpen } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
export function AppSidebar() {
  const {
    user,
    signOut
  } = useSimpleAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const handleLogout = () => {
    signOut();
    toast({
      title: "Logout berhasil",
      description: "Anda telah keluar dari sistem"
    });
    navigate('/login');
  };
  const isActive = (path: string) => location.pathname === path;
  const menuItems = [{
    path: '/dashboard',
    label: 'Dashboard',
    icon: TrendingUp
  }, {
    path: '/pos',
    label: 'POS System',
    icon: Calculator
  }, {
    path: '/data-produk',
    label: 'Data Produk',
    icon: Package
  }, {
    path: '/stock-management',
    label: 'Stok Management',
    icon: Store
  }, {
    path: '/konsinyasi',
    label: 'Konsinyasi',
    icon: ShoppingCart
  }, {
    path: '/konsinyasi-harian',
    label: 'Konsinyasi Harian',
    icon: Package
  }, {
    path: '/purchase',
    label: 'Pembelian',
    icon: ShoppingCart
  }, {
    path: '/penjualan-kredit',
    label: 'Penjualan Kredit',
    icon: CreditCard
  }, {
    path: '/kasir-kas',
    label: 'Kasir Kas',
    icon: CreditCard
  }, {
    path: '/kas-umum',
    label: 'Kas Umum',
    icon: CreditCard
  }, {
    path: '/jurnal-umum',
    label: 'Jurnal Umum',
    icon: BookOpen
  }, {
    path: '/admin',
    label: 'Admin Panel',
    icon: Settings
  }, {
    path: '/kasir-management',
    label: 'Kasir Management',
    icon: Users
  }, {
    path: '/new-stok',
    label: 'New Stok',
    icon: Package2,
    badge: 'NEW'
  }];

  // Check if user is authorized to see Management System menu
  const showManagementMenu = user?.username === 'Jamhur' || user?.username === 'Ginanjar';
  if (!showManagementMenu) {
    return null;
  }
  return <Sidebar className="animate-fade-in">
      <SidebarHeader className="p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <img src="/lovable-uploads/163a7d14-7869-47b2-b33b-40be703e48e1.png" alt="Assunnah Mart Logo" className="h-8 w-8 object-contain animate-flip-horizontal" />
          <div>
            <h2 className="text-lg font-bold text-yellow-700">Assunnah Mart</h2>
            <p className="text-xs text-amber-900">Management System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="bg-amber-300">
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)}>
                    <Link to={item.path} className="flex items-center gap-3 w-full">
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1 text-amber-950">{item.label}</span>
                      {item.badge && <Badge variant="secondary" className="text-xs bg-green-500 text-white">
                          {item.badge}
                        </Badge>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <User className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600 truncate">{user?.full_name}</span>
          </div>
          <Button onClick={handleLogout} variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>;
}