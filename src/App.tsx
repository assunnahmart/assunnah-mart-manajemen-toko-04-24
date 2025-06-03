
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import POSSystem from "./pages/POSSystem";
import DaftarProduk from "./pages/DaftarProduk";
import AdminPanel from "./pages/AdminPanel";
import Konsinyasi from "./pages/Konsinyasi";
import PurchasePage from "./pages/PurchasePage";
import KasUmumPage from "./pages/KasUmumPage";
import StockManagementPage from "./pages/StockManagementPage";
import PenjualanKredit from "./pages/PenjualanKredit";
import KasirManagement from "./pages/KasirManagement";
import KonsinyasiHarianPage from "./pages/KonsinyasiHarianPage";
import KasirKasPage from "./pages/KasirKasPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POSSystem />} />
          <Route path="/daftar-produk" element={<DaftarProduk />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/konsinyasi" element={<Konsinyasi />} />
          <Route path="/konsinyasi-harian" element={<KonsinyasiHarianPage />} />
          <Route path="/purchase" element={<PurchasePage />} />
          <Route path="/kas-umum" element={<KasUmumPage />} />
          <Route path="/kasir-kas" element={<KasirKasPage />} />
          <Route path="/stock-management" element={<StockManagementPage />} />
          <Route path="/penjualan-kredit" element={<PenjualanKredit />} />
          <Route path="/kasir-management" element={<KasirManagement />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
