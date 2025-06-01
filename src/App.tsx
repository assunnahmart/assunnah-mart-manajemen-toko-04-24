
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import POSSystem from "@/pages/POSSystem";
import DaftarProduk from "@/pages/DaftarProduk";
import PurchasePage from "@/pages/PurchasePage";
import StockManagementPage from "@/pages/StockManagementPage";
import KasUmumPage from "@/pages/KasUmumPage";
import Konsinyasi from "@/pages/Konsinyasi";
import PenjualanKredit from "@/pages/PenjualanKredit";
import KasirManagement from "@/pages/KasirManagement";
import AdminPanel from "@/pages/AdminPanel";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pos" element={<POSSystem />} />
            <Route path="/products" element={<DaftarProduk />} />
            <Route path="/purchase" element={<PurchasePage />} />
            <Route path="/stock" element={<StockManagementPage />} />
            <Route path="/kas-umum" element={<KasUmumPage />} />
            <Route path="/konsinyasi" element={<Konsinyasi />} />
            <Route path="/penjualan-kredit" element={<PenjualanKredit />} />
            <Route path="/kasir" element={<KasirManagement />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
