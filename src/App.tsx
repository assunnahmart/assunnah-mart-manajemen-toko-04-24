
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import POSSystem from "./pages/POSSystem";
import DaftarProduk from "./pages/DaftarProduk";
import Konsinyasi from "./pages/Konsinyasi";
import PenjualanKredit from "./pages/PenjualanKredit";
import KasirManagement from "./pages/KasirManagement";
import AdminPanel from "./pages/AdminPanel";
import StockManagementPage from "./pages/StockManagementPage";
import PurchasePage from "./pages/PurchasePage";
import KasUmumPage from "./pages/KasUmumPage";
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POSSystem />} />
          <Route path="/products" element={<DaftarProduk />} />
          <Route path="/konsinyasi" element={<Konsinyasi />} />
          <Route path="/penjualan-kredit" element={<PenjualanKredit />} />
          <Route path="/kasir" element={<KasirManagement />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/stock" element={<StockManagementPage />} />
          <Route path="/purchase" element={<PurchasePage />} />
          <Route path="/kas-umum" element={<KasUmumPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
