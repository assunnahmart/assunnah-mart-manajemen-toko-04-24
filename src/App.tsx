
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";

import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import PosPage from "@/pages/PosPage";
import DataProdukPage from "@/pages/DataProdukPage";
import StockManagementPage from "@/pages/StockManagementPage";
import KonsinyasiPage from "@/pages/KonsinyasiPage";
import KonsinyasiHarianPage from "@/pages/KonsinyasiHarianPage";
import PurchasePage from "@/pages/PurchasePage";
import PenjualanKreditPage from "@/pages/PenjualanKreditPage";
import KasirKasPage from "@/pages/KasirKasPage";
import KasUmumPage from "@/pages/KasUmumPage";
import AdminPanel from "@/pages/AdminPanel";
import KasirManagementPage from "@/pages/KasirManagementPage";
import RekapPiutangPage from "@/pages/RekapPiutangPage";
import RekapHutangPage from "@/pages/RekapHutangPage";

function App() {
  const { isLoggedIn } = useSimpleAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/dashboard" element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/pos" element={isLoggedIn ? <PosPage /> : <Navigate to="/login" />} />
        <Route path="/data-produk" element={isLoggedIn ? <DataProdukPage /> : <Navigate to="/login" />} />
        <Route path="/stock-management" element={isLoggedIn ? <StockManagementPage /> : <Navigate to="/login" />} />
        <Route path="/konsinyasi" element={isLoggedIn ? <KonsinyasiPage /> : <Navigate to="/login" />} />
        <Route path="/konsinyasi-harian" element={isLoggedIn ? <KonsinyasiHarianPage /> : <Navigate to="/login" />} />
        <Route path="/purchase" element={isLoggedIn ? <PurchasePage /> : <Navigate to="/login" />} />
        <Route path="/penjualan-kredit" element={isLoggedIn ? <PenjualanKreditPage /> : <Navigate to="/login" />} />
        <Route path="/kasir-kas" element={isLoggedIn ? <KasirKasPage /> : <Navigate to="/login" />} />
        <Route path="/kas-umum" element={isLoggedIn ? <KasUmumPage /> : <Navigate to="/login" />} />
        <Route path="/admin/*" element={isLoggedIn ? <AdminPanel /> : <Navigate to="/login" />} />
        <Route path="/kasir-management" element={isLoggedIn ? <KasirManagementPage /> : <Navigate to="/login" />} />
        <Route path="/laporan/rekap-piutang" element={isLoggedIn ? <RekapPiutangPage /> : <Navigate to="/login" />} />
        <Route path="/laporan/rekap-hutang" element={isLoggedIn ? <RekapHutangPage /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App;
