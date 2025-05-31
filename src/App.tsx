
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import KasirManagement from "./pages/KasirManagement";
import Konsinyasi from "./pages/Konsinyasi";
import PenjualanKredit from "./pages/PenjualanKredit";
import POSSystem from "./pages/POSSystem";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/kasir" element={<KasirManagement />} />
            <Route path="/konsinyasi" element={<Konsinyasi />} />
            <Route path="/kredit" element={<PenjualanKredit />} />
            <Route path="/pos" element={<POSSystem />} />
            {/* Placeholder routes - akan dibuat di iterasi berikutnya */}
            <Route path="/laporan" element={<div className="p-8 text-center"><h1 className="text-2xl">Laporan Keuangan - Coming Soon</h1></div>} />
            <Route path="/stok-opname" element={<div className="p-8 text-center"><h1 className="text-2xl">Stok Opname - Coming Soon</h1></div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
