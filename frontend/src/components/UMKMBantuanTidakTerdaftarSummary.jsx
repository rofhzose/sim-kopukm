import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { 
  AlertCircle, 
  AlertTriangle,
  Users, 
  UserCheck,
  FileText,
  Calendar,
  Activity
} from "lucide-react";

// =========================
// STAT CARD COMPONENT
// =========================
const StatCard = ({ icon: Icon, title, value, color, bgColor, subtitle }) => (
  <div className={`bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 ${color}`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <div className={`${bgColor} p-2 rounded-lg`}>
            <Icon className={`w-5 h-5 ${color.replace('border-', 'text-')}`} />
          </div>
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
        </div>
        <p className={`text-4xl font-bold ${color.replace('border-', 'text-')} mb-2`}>
          {typeof value === 'number' ? value.toLocaleString("id-ID") : value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

export default function UMKMBantuanTidakTerdaftarSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(
          "/dashboard/bantuan-tidak-terdaftar-summary"
        );
        if (res.data?.success) {
          setData(res.data.data);
        } else {
          setError("Gagal memuat data ringkasan bantuan tidak terdaftar.");
        }
      } catch (err) {
        console.error("❌ Error fetching bantuan tidak terdaftar:", err);
        setError("Tidak dapat terhubung ke server.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ===========================
  // LOADING STATE
  // ===========================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-red-100 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-red-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-gray-600 font-semibold">Memuat analisis bantuan tidak terdaftar...</p>
      </div>
    );
  }

  // ===========================
  // ERROR STATE
  // ===========================
  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-500 p-6 rounded-xl">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const analisis = data?.analisis || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-3 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Bantuan Tidak Terdaftar
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Ringkasan penerima bantuan yang belum terdaftar dalam sistem UMKM
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-2 bg-slate-100 rounded-md border text-sm hover:bg-slate-200"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* STAT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={AlertCircle} 
            title="Total Tidak Terdaftar" 
            value={data?.total_tidak_terdaftar ?? 0} 
            color="border-red-600" 
            bgColor="bg-red-100"
          />
          <StatCard 
            icon={UserCheck} 
            title="Penerima 1x Bantuan" 
            value={data?.duplikasi?.penerima_1x ?? 0} 
            color="border-green-600" 
            bgColor="bg-green-100"
          />
          <StatCard 
            icon={Users} 
            title="Penerima Ganda" 
            value={data?.duplikasi?.penerima_ganda ?? 0} 
            color="border-yellow-600" 
            bgColor="bg-yellow-100"
            subtitle="Menerima bantuan lebih dari 1x"
          />
        </div>

        {/* RINGKASAN TAHUNAN */}
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 mb-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Ringkasan per Tahun</h3>
            </div>
            <p className="text-sm text-gray-500 ml-9">
              Jumlah penerima bantuan yang tidak terdaftar berdasarkan tahun
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg bg-white">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Tahun</th>
                  <th className="px-6 py-3 text-left font-semibold">Jumlah Tidak Terdaftar</th>
                </tr>
              </thead>
              <tbody>
                {data?.ringkasan_tahunan?.map((r, index) => (
                  <tr
                    key={r.tahun}
                    className={`border-b hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">{r.tahun}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {r.jumlah_tidak_terdaftar.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ANALISIS & PENJELASAN */}
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 mb-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Penjelasan Data</h3>
            </div>
          </div>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            
            {/* Keterangan */}
            <p className="text-base">{analisis.keterangan}</p>

            {/* Dasar Perhitungan */}
            <div className="bg-gray-50 p-5 rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3 text-lg">📊 Dasar Perhitungan</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="bg-red-600 w-1.5 h-1.5 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold text-gray-800">Total Tidak Terdaftar</p>
                    <p className="text-sm text-gray-600">
                      {analisis.dasar_perhitungan?.total_tidak_terdaftar}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-blue-600 w-1.5 h-1.5 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold text-gray-800">Ringkasan Tahunan</p>
                    <p className="text-sm text-gray-600">
                      {analisis.dasar_perhitungan?.ringkasan_tahunan}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-green-600 w-1.5 h-1.5 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold text-gray-800">Analisis Tahunan</p>
                    <p className="text-sm text-gray-600">
                      {analisis.dasar_perhitungan?.analisis_tahunan}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-yellow-600 w-1.5 h-1.5 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold text-gray-800">Duplikasi</p>
                    <p className="text-sm text-gray-600">
                      {analisis.dasar_perhitungan?.duplikasi}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Catatan */}
            <div className="bg-blue-50 p-5 rounded-xl border-2 border-blue-200">
              <div className="flex items-start gap-2">
                <span className="text-2xl">📝</span>
                <div>
                  <p className="font-bold text-blue-800 mb-1">Catatan Penting</p>
                  <p className="text-sm text-gray-700">{analisis.catatan}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/bantuan-tidak-terdaftar")}
            className="px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-xl flex items-center gap-3"
          >
            <Activity className="w-5 h-5" />
            Lihat Detail Penerima Tidak Terdaftar
          </button>
        </div>

      </div>
    </div>
  );
}