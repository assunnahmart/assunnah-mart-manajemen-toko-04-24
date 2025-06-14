import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from "@/components/ui/tooltip"

import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import POSSystem from '@/pages/POSSystem';
import DataProduk from '@/pages/DataProduk';
import StockManagementPage from '@/pages/StockManagementPage';
import Konsinyasi from '@/pages/Konsinyasi';
import KonsinyasiHarianPage from '@/pages/KonsinyasiHarianPage';
import PurchasePage from '@/pages/PurchasePage';
import PenjualanKredit from '@/pages/PenjualanKredit';
import KasirKasPage from '@/pages/KasirKasPage';
import KasUmumPage from '@/pages/KasUmumPage';
import KasirManagement from '@/pages/KasirManagement';
import JurnalUmumPage from '@/pages/JurnalUmumPage';
import LedgerPage from '@/pages/LedgerPage';
import NewStokPage from '@/pages/NewStokPage';
import ReturnsPage from '@/pages/ReturnsPage';
import NotFound from '@/pages/NotFound';
import AdminPanel from '@/pages/AdminPanel';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
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
            <Route path="/kasir-management" element={<KasirManagement />} />
            <Route path="/jurnal-umum" element={<JurnalUmumPage />} />
            <Route path="/ledger" element={<LedgerPage />} />
            <Route path="/new-stok" element={<NewStokPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/pelanggan" element={<AdminPanel />} />
            <Route path="/admin/supplier" element={<AdminPanel />} />
            <Route path="/admin/buku-besar-piutang" element={<AdminPanel />} />
            <Route path="/admin/buku-besar-hutang" element={<AdminPanel />} />
            <Route path="/admin/kas-umum" element={<AdminPanel />} />
            <Route path="/admin/laba-rugi" element={<AdminPanel />} />
            <Route path="/admin/financial-reports" element={<AdminPanel />} />
            <Route path="/admin/data-management" element={<AdminPanel />} />
            <Route path="/admin/product-management" element={<AdminPanel />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
