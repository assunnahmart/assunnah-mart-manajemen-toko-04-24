
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import SupplierDebtRecap from "@/components/admin/SupplierDebtRecap";

export default function SupplierDebtRecapPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 p-6">
            <SupplierDebtRecap />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
