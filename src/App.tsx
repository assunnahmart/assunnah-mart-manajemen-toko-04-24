
import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DataProduk = lazy(() => import('./pages/DataProduk'));
const StockManagementPage = lazy(() => import('./pages/StockManagementPage'));
const Konsinyasi = lazy(() => import('./pages/Konsinyasi'));
const KonsinyasiHarianPage = lazy(() => import('./pages/KonsinyasiHarianPage'));
const POSSystem = lazy(() => import('./pages/POSSystem'));
const PurchasePage = lazy(() => import('./pages/PurchasePage'));
const PenjualanKredit = lazy(() => import('./pages/PenjualanKredit'));
const KasirKasPage = lazy(() => import('./pages/KasirKasPage'));
const KasUmumPage = lazy(() => import('./pages/KasUmumPage'));
const JurnalUmumPage = lazy(() => import('./pages/JurnalUmumPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const KasirManagement = lazy(() => import('./pages/KasirManagement'));
const NewStokPage = lazy(() => import('./pages/NewStokPage'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/data-produk" element={<DataProduk />} />
            <Route path="/stock-management" element={<StockManagementPage />} />
            <Route path="/konsinyasi" element={<Konsinyasi />} />
            <Route path="/konsinyasi-harian" element={<KonsinyasiHarianPage />} />
            <Route path="/pos" element={<POSSystem />} />
            <Route path="/purchase" element={<PurchasePage />} />
            <Route path="/penjualan-kredit" element={<PenjualanKredit />} />
            <Route path="/kasir-kas" element={<KasirKasPage />} />
            <Route path="/kas-umum" element={<KasUmumPage />} />
            <Route path="/jurnal-umum" element={<JurnalUmumPage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/kasir-management" element={<KasirManagement />} />
            <Route path="/new-stok" element={<NewStokPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
