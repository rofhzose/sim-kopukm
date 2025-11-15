import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UMKMSummary from "../components/UMKMSummary";
import BantuanSummary from "../components/UMKMBantuan";
import UMKMDuplikatSummary from "../components/UMKMDuplikat";
import UMKMBantuanTidakTerdaftarSummary from "../components/UMKMBantuanTidakTerdaftarSummary";
import { Home, FileText, Store, Banknote } from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // helper untuk cek active button (simple)
  const isActive = (path) => {
    // kalau mau matching lebih spesifik ubah logic ini
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 pb-28"> {/* pb-28 supaya tidak ketutup footer */}
      <h1 className="text-3xl font-bold text-blue-700 mb-6">
        📊 Dashboard Data UMKM & Bantuan
      </h1>

      {/* UMKM Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Statistik Data UMKM
        </h2>
        <UMKMSummary />
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Statistik Terindikasi Duplikat
        </h2>
        <UMKMDuplikatSummary />
      </section>

      {/* Bantuan Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Statistik Data Bantuan
        </h2>
        <BantuanSummary />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Statistik Data Bantuan Tidak Terdaftar
        </h2>
        <div className="w-full flex justify-center items-start pt-10">
          <UMKMBantuanTidakTerdaftarSummary />
        </div>
      </section>

      {/* ===== FOOTER NAVIGATION ===== */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-2">
        <div className="grid grid-cols-4 text-center">
          {/* Dashboard */}
          <button
            onClick={() => navigate("/overview")}
            className={`flex flex-col items-center py-2 transition ${
              isActive("/overview") ? "text-blue-600" : "text-gray-700"
            }`}
          >
            <Home size={22} />
            <span className="text-xs font-medium">Dashboard</span>
          </button>

          {/* Sekretariat */}
          <button
            onClick={() => navigate("/sekretariat")}
            className={`flex flex-col items-center py-2 transition ${
              isActive("/sekretariat") ? "text-blue-600" : "text-gray-700"
            }`}
          >
            <FileText size={22} />
            <span className="text-xs font-medium">Sekretariat</span>
          </button>

          {/* Bidang UMKM */}
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex flex-col items-center py-2 transition ${
              isActive("/dashboard") ? "text-blue-600" : "text-gray-700"
            }`}
          >
            <Store size={22} />
            <span className="text-xs font-medium">Bidang UMKM</span>
          </button>

          {/* Bidang Koperasi */}
          <button
            onClick={() => navigate("/koperasi")}
            className={`flex flex-col items-center py-2 transition ${
              isActive("/koperasi") ? "text-blue-600" : "text-gray-700"
            }`}
          >
            <Banknote size={22} />
            <span className="text-xs font-medium">Koperasi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
