
import React from "react";
import PiutangCard from "@/components/PiutangCard";

// Fallback: Pastikan sesuatu selalu muncul di halaman.
const PiutangPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-3 text-blue-800">Dashboard Piutang</h1>
    <p className="mb-4 text-gray-500">
      Selamat datang di halaman rekap dan analisis piutang pelanggan.
    </p>
    <React.Suspense fallback={<div className="text-center py-10">Memuat data piutang...</div>}>
      <PiutangCard />
    </React.Suspense>
  </div>
);

export default PiutangPage;
