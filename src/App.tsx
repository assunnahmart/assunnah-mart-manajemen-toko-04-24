
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
import ErrorBoundary from "@/components/ErrorBoundary";

// Update imports to match the file names in your project!
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import POSSystem from "@/pages/POSSystem";
import DataProduk from "@/pages/DataProduk";
import StockManagementPage from "@/pages/StockManagementPage";
import Konsinyasi from "@/pages/Konsinyasi";
import KonsinyasiHarianPage from "@/pages/KonsinyasiHarianPage";
import KonsinyasiMingguanPage from "@/pages/KonsinyasiMingguanPage";
import PurchasePage from "@/pages/PurchasePage";
import PenjualanKredit from "@/pages/PenjualanKredit";
import KasirKasPage from "@/pages/KasirKasPage";
import KasUmumPage from "@/pages/KasUmumPage";
import AdminPanel from "@/pages/AdminPanel";
import KasirManagement from "@/pages/KasirManagement";
import RekapPiutangPage from "@/pages/RekapPiutangPage";
import RekapHutangPage from "@/pages/RekapHutangPage";
import PembayaranPiutangPage from "@/pages/PembayaranPiutangPage";
import PembayaranHutangPage from "@/pages/PembayaranHutangPage";
import PiutangPage from "@/pages/PiutangPage";
import StockOpnamePage from "@/pages/StockOpnamePage";

function App() {
  const { isAuthenticated, loading } = useSimpleAuth();

  console.log('App: Auth state:', { isAuthenticated, loading });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/pos" element={isAuthenticated ? <POSSystem /> : <Navigate to="/login" />} />
          <Route path="/data-produk" element={isAuthenticated ? <DataProduk /> : <Navigate to="/login" />} />
          <Route path="/stock-management" element={isAuthenticated ? <StockManagementPage /> : <Navigate to="/login" />} />
          <Route path="/konsinyasi" element={isAuthenticated ? <Konsinyasi /> : <Navigate to="/login" />} />
          <Route path="/konsinyasi-harian" element={isAuthenticated ? <KonsinyasiHarianPage /> : <Navigate to="/login" />} />
          <Route path="/konsinyasi-mingguan" element={isAuthenticated ? <KonsinyasiMingguanPage /> : <Navigate to="/login" />} />
          <Route path="/purchase" element={isAuthenticated ? <PurchasePage /> : <Navigate to="/login" />} />
          <Route path="/penjualan-kredit" element={isAuthenticated ? <PenjualanKredit /> : <Navigate to="/login" />} />
          <Route path="/kasir-kas" element={isAuthenticated ? <KasirKasPage /> : <Navigate to="/login" />} />
          <Route path="/kas-umum" element={isAuthenticated ? <KasUmumPage /> : <Navigate to="/login" />} />
          <Route path="/admin/*" element={isAuthenticated ? <AdminPanel /> : <Navigate to="/login" />} />
          <Route path="/kasir-management" element={isAuthenticated ? <KasirManagement /> : <Navigate to="/login" />} />
          <Route path="/laporan/rekap-piutang" element={isAuthenticated ? <RekapPiutangPage /> : <Navigate to="/login" />} />
          <Route path="/laporan/rekap-hutang" element={isAuthenticated ? <RekapHutangPage /> : <Navigate to="/login" />} />
          <Route path="/pembayaran-piutang" element={isAuthenticated ? <PembayaranPiutangPage /> : <Navigate to="/login" />} />
          <Route path="/pembayaran-hutang" element={isAuthenticated ? <PembayaranHutangPage /> : <Navigate to="/login" />} />
          <Route path="/Piutang" element={isAuthenticated ? <PiutangPage /> : <Navigate to="/login" />} />
          <Route path="/stok-opname" element={<StockOpnamePage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App;
