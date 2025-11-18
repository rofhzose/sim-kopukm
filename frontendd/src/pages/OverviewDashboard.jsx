import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { Home, FileText, Store, Banknote, FileCheck, BarChart3, Users, Layers, Building2 } from "lucide-react";
import logoDinkop from "../assets/logo_dinkopukm.png";
import logoKrw from "../assets/logo_karawang.png";
import logoKoperasi from "../assets/logo_koperasi.png";

export default function OverviewDashboard() {
  const navigate = useNavigate();
  const [umkmSummary, setUmkmSummary] = useState(null);
  const [loadingUmkm, setLoadingUmkm] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/umkm-summary");
        if (res.data?.success) {
          setUmkmSummary(res.data.data);
        }
      } catch (err) {
        console.error("Gagal memuat summary UMKM:", err);
      } finally {
        setLoadingUmkm(false);
      }
    };

    fetchSummary();
  }, []);

  // ====== KOPERASI SUMMARY FETCH (tambahan) ======
  const [koperasiSummary, setKoperasiSummary] = useState(null);
  const [loadingKoperasi, setLoadingKoperasi] = useState(true);
  const [errorKoperasi, setErrorKoperasi] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchKoperasiSummary = async () => {
      setLoadingKoperasi(true);
      setErrorKoperasi("");
      let res = null;

      // try several endpoints (fallback) to match backend mounting
      const endpoints = [
        "/api/dashboard/koperasi-summary",
        "/dashboard/koperasi-summary",
        "/api/koperasi-summary",
        "/koperasi-summary",
      ];

      for (const ep of endpoints) {
        try {
          res = await axiosInstance.get(ep);
          if (res?.data && (res.data.success || typeof res.data === "object")) break;
        } catch (err) {
          // try next endpoint
        }
      }

      if (!res || !res.data) {
        if (!mounted) return;
        setErrorKoperasi("Gagal memuat statistik koperasi");
        setLoadingKoperasi(false);
        return;
      }

      // normalize response (matches controller we created)
      try {
        const payload = res.data;
        const d = payload.data ?? payload;

        // **Simpan seluruh objek response** supaya kelengkapan tersedia
        if (mounted) {
          setKoperasiSummary(d);
        }
      } catch (err) {
        if (mounted) setErrorKoperasi("Format response tidak dikenali");
      } finally {
        if (mounted) setLoadingKoperasi(false);
      }
    };

    fetchKoperasiSummary();
    return () => {
      mounted = false;
    };

  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* ====== HEADER / HERO ====== */}
      <div className="p-6">
        <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow-sm">
          <img src={logoDinkop} alt="DINKOPUKM Karawang" className="w-60 drop-shadow-sm" />
        </h1>

        <p className="text-gray-600 mt-2 text-lg"></p>

        {/* HERO ART */}
        <div className="mt-6 w-full bg-white shadow-md rounded-2xl p-6 border border-gray-100 flex items-center justify-between">
          {/* TEXT KIRI */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-blue-950">Sistem Informasi dan Manajemen</h2>
            <p className="text-gray-600 mt-1">Akses semua data dan bidang dalam satu tempat.</p>
          </div>

          {/* LOGO KANAN */}
          <div className="flex items-center gap-4">
            <img src={logoKrw} alt="Karawang" className="w-20 h-auto drop-shadow-sm" />
            <img src={logoKoperasi} alt="Koperasi" className="w-20 h-auto drop-shadow-sm" />
          </div>
        </div>
      </div>

      {/* ====== FEATURE CARDS ====== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-6 mt-4">
        {/* Card 1: Sekretariat */}
        <div
          onClick={() => navigate("/sekretariat")}
          className="cursor-pointer group bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-xl transition-all hover:-translate-y-1">
           <div className="flex justify-center">
          <FileText size={40} className="text-green-600 mb-1 group-hover:scale-110 transition" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-10 text-center">SEKRETARIAT</h3>
           <ul className="text-sm text-slate-600 space-y-2">
            <li>• Sub Bagian Umum dan Kepegawaian</li>
            <li>• Sub Bagian Program dan Keuangan</li>
          </ul>
        </div>

        {/* Card 2: Bidang UMKM */}
        <div
          onClick={() => navigate("/dashboard")}
          className="cursor-pointer group bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-xl transition-all hover:-translate-y-1">
         <div className="flex justify-center">
           <Store size={40} className="text-blue-600 mb-1 group-hover:scale-110 transition" />
          </div>
          <h3 className="text-l font-bold text-gray-800 mb-6 text-center">BIDANG PEMBERDAYAAN DAN PENGEMBANGAN USAHA MIKRO, KECIL DAN MENENGAH</h3>
           <ul className="text-sm text-slate-600 space-y-2">
            <li>• Pendataan dan Fasilitas UMKM </li>
            <li>• Pemberdayaan UMKM</li>
            <li>• Pengembangan, Penguatan dan Perlindungan Usaha Mikro</li>
          </ul>
        </div>

        {/* Card 3: Bidang Koperasi */}
        <div
          onClick={() => navigate("/koperasi")}
          className="cursor-pointer group bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex justify-center">
          <Banknote size={40} className="text-yellow-600 mb-1 group-hover:scale-110 transition" />
          </div>
          <h3 className="text-l font-bold text-gray-800 mb-6 text-center">BIDANG PENGAWASAN, PEMERIKSAAN DAN PENILAIAN KOPERASI</h3>
           <ul className="text-sm text-slate-600 space-y-2">
            <li>• Penilaian Koperasi</li>
            <li>• Keanggotaan dan Penerapan Peraturan</li>
            <li>• Pengawasan, Pemeriksaan dan Penilaian Kesehatan</li>
          </ul>
        </div>

        {/* Card 4: Bidang Koperasi */}
        <div
          onClick={() => navigate("/koperasi")}
          className="cursor-pointer group bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex justify-center">
          <FileCheck size={40} className="text-purple-600 mb-1 group-hover:scale-110 transition" />
          </div>
          <h3 className="text-l font-bold text-gray-800 mb-6 text-center">BIDANG PEMBERDAYAAN DAN PERIZINAN KOPERASI</h3>
           <ul className="text-sm text-slate-600 space-y-2">
            <li>• Perizinan Koperasi</li>
            <li>• Peningkatan Kapasitas SDM Koperasi</li>
            <li>• Pengembangan, Penguatan dan Perlindungan Koperasi</li>
          </ul>
        </div>
      </div>

      {/* ====== QUICK STATS ====== */}
      <div className="px-6 mt-8 mb-28">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Statistik Singkat</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center gap-4">
            <BarChart3 size={40} className="text-green-600" />
            <div>
              <p className="text-gray-500">Analisis Laporan</p>
              <p className="text-2xl font-bold">Sekretariat</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center gap-4">
            <Users size={40} className="text-blue-600" />
            <div>
              <p className="text-gray-500">Total UMKM Terdata</p>
              <p className="text-2xl font-bold text-gray-800">
                {loadingUmkm ? "Memuat..." : umkmSummary?.total_umkm?.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center gap-4">
            <Building2 size={40} className="text-yellow-600" />
            <div>
              <p className="text-gray-500">Jumlah Koperasi Aktif</p>
              <p className="text-2xl font-bold">
                {loadingKoperasi
                  ? "Memuat..."
                  : errorKoperasi
                  ? "—"
                  : (koperasiSummary?.total_aktif ?? 0).toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center gap-4">
            <Layers size={40} className="text-purple-600" />
            <div>
              <p className="text-gray-500">Data Koperasi belum Lengkap</p>
              <p className="text-2xl font-bold">
                {loadingKoperasi
                  ? "Memuat..."
                  : errorKoperasi
                  ? "—"
                  : (Number(koperasiSummary?.kelengkapan?.total_tidak_lengkap ?? 0)).toLocaleString("id-ID")}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
