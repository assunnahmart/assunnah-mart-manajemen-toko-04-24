
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import POSSystem from "./pages/POSSystem";
import DataProduk from "./pages/DataProduk";
import StockManagementPage from "./pages/StockManagementPage";
import Konsinyasi from "./pages/Konsinyasi";
import KonsinyasiHarianPage from "./pages/KonsinyasiHarianPage";
import PurchasePage from "./pages/PurchasePage";
import PenjualanKredit from "./pages/PenjualanKredit";
import KasirKasPage from "./pages/KasirKasPage";
import KasUmumPage from "./pages/KasUmumPage";
import AdminPanel from "./pages/AdminPanel";
import KasirManagement from "./pages/KasirManagement";
import NewStokPage from "./pages/NewStokPage";
import ReturnsPage from "./pages/ReturnsPage";
import JurnalUmumPage from "./pages/JurnalUmumPage";
import LedgerPage from "./pages/LedgerPage";
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
          <Route path="/data-produk" element={<DataProduk />} />
          <Route path="/stock-management" element={<StockManagementPage />} />
          <Route path="/konsinyasi" element={<Konsinyasi />} />
          <Route path="/konsinyasi-harian" element={<KonsinyasiHarianPage />} />
          <Route path="/purchase" element={<PurchasePage />} />
          <Route path="/penjualan-kredit" element={<PenjualanKredit />} />
          <Route path="/kasir-kas" element={<KasirKasPage />} />
          <Route path="/kas-umum" element={<KasUmumPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/kasir-management" element={<KasirManagement />} />
          <Route path="/stok-management" element={<NewStokPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/jurnal-umum" element={<JurnalUmumPage />} />
          <Route path="/ledger" element={<LedgerPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
