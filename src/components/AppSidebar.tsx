
import * as React from "react"
import { Users, CreditCard, Truck, TrendingUp, Database, Package, Calculator, BookOpen, FileText, Home } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const adminMenuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Pelanggan",
    url: "/admin/pelanggan",
    icon: Users,
  },
  {
    title: "Supplier",
    url: "/admin/supplier",
    icon: Truck,
  },
  {
    title: "Buku Besar Piutang",
    url: "/admin/buku-besar-piutang",
    icon: BookOpen,
  },
  {
    title: "Buku Besar Hutang",
    url: "/admin/buku-besar-hutang",
    icon: FileText,
  },
  {
    title: "Kas Umum",
    url: "/admin/kas-umum",
    icon: CreditCard,
  },
  {
    title: "Laba Rugi",
    url: "/admin/laba-rugi",
    icon: TrendingUp,
  },
  {
    title: "Laporan Keuangan",
    url: "/admin/financial-reports",
    icon: Calculator,
  },
  {
    title: "Data Management",
    url: "/admin/data-management",
    icon: Database,
  },
  {
    title: "Product Management",
    url: "/admin/product-management",
    icon: Package,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const navigate = useNavigate()
  const isAdminRoute = location.pathname.startsWith('/admin')

  const handleNavigation = (url: string) => {
    navigate(url)
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="p-4">
          <h2 className="text-lg font-semibold">
            {isAdminRoute ? "Admin Panel" : "Navigation"}
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {isAdminRoute && (
          <SidebarGroup>
            <SidebarGroupLabel>Administrator</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <button onClick={() => handleNavigation(item.url)} className="w-full text-left">
                        <item.icon />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
