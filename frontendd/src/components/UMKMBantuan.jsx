import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { 
  AlertCircle, 
  Users, 
  CheckCircle, 
  ShieldCheck, 
  XCircle, 
  TrendingUp, 
  Package,
  FileText,
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

export default function BantuanSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/bantuan-summary");
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError("Gagal memuat data bantuan.");
        }
      } catch (err) {
        setError("Tidak dapat terhubung ke API bantuan.");
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
          <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-gray-600 font-semibold">Memuat data bantuan...</p>
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
    <div className=" bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-3 rounded-xl">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Daftar Penerima Bantuan UMKM
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Ringkasan data penerima bantuan dan kelengkapan profil
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={Users} 
            title="Total Penerima" 
            value={data?.total_penerima} 
            color="border-blue-600" 
            bgColor="bg-blue-100"
          />
          <StatCard 
            icon={Package} 
            title="UMKM Dapat Bantuan" 
            value={data?.jumlah_umkm_dapat_bantuan} 
            color="border-green-600" 
            bgColor="bg-green-100"
          />
          <StatCard 
            icon={TrendingUp} 
            title="Persentase Bantuan" 
            value={`${data?.persentase_dapat_bantuan ?? 0}%`}
            color="border-purple-600" 
            bgColor="bg-purple-100"
          />
          <StatCard 
            icon={CheckCircle} 
            title="Profil Lengkap" 
            value={data?.total_lengkap} 
            color="border-amber-600" 
            bgColor="bg-amber-100"
          />
          <StatCard 
            icon={ShieldCheck} 
            title="Lengkap & Valid" 
            value={data?.total_lengkap_valid} 
            color="border-emerald-600" 
            bgColor="bg-emerald-100"
            subtitle="Data lengkap + PIRT & Halal valid"
          />
          <StatCard 
            icon={XCircle} 
            title="Belum Lengkap" 
            value={data?.total_belum_lengkap} 
            color="border-red-600" 
            bgColor="bg-red-100"
          />
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
            <p className="text-base">
              {analisis.keterangan ||
                "Data ini menampilkan jumlah penerima bantuan, kelengkapan profil, dan validitas izin usaha (PIRT & Halal)."}
            </p>

            {/* Dasar Perhitungan */}
            <div className="bg-gray-50 p-5 rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3 text-lg">📊 Dasar Perhitungan</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="bg-blue-600 w-1.5 h-1.5 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold text-gray-800">Total Penerima</p>
                    <p className="text-sm text-gray-600">
                      {analisis.dasar_perhitungan?.total_penerima ||
                        "Jumlah seluruh penerima bantuan yang tercatat di sistem."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-amber-600 w-1.5 h-1.5 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold text-gray-800">Profil Lengkap</p>
                    <p className="text-sm text-gray-600">
                      {analisis.dasar_perhitungan?.total_lengkap ||
                        "Penerima yang telah mengisi seluruh kolom wajib (nama, alamat, NIK, produk, izin, dan lainnya)."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-emerald-600 w-1.5 h-1.5 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold text-gray-800">Lengkap & Valid</p>
                    <p className="text-sm text-gray-600">
                      {analisis.dasar_perhitungan?.total_lengkap_valid ||
                        "Penerima bantuan yang sudah memiliki data lengkap serta sertifikat PIRT dan Halal valid."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-red-600 w-1.5 h-1.5 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold text-gray-800">Belum Lengkap</p>
                    <p className="text-sm text-gray-600">
                      {analisis.dasar_perhitungan?.total_belum_lengkap ||
                        "Penerima bantuan yang masih memiliki data kosong atau belum lengkap."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-purple-600 w-1.5 h-1.5 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold text-gray-800">Persentase Bantuan</p>
                    <p className="text-sm text-gray-600">
                      {analisis.dasar_perhitungan?.persentase_dapat_bantuan ||
                        "Perbandingan UMKM penerima bantuan dengan total UMKM terdaftar di sistem."}
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
                  <p className="text-sm text-gray-700">
                    {analisis.catatan ||
                      "Kolom yang diperiksa: nama, NIK, nama_produk, nama_umkm, alamat, kecamatan, no_hp, NIB, no_pirt, no_halal, jenis_alat_bantu, tahun, dan keterangan."}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/bantuan")}
            className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-xl flex items-center gap-3"
          >
            <Activity className="w-5 h-5" />
            Lihat Data Bantuan Lengkap
          </button>
        </div>

      </div>
    </div>
  );
}