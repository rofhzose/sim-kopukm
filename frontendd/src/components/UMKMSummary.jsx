import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance"; 
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, Users, CheckCircle, AlertCircle, Activity, FileText, Building2 } from "lucide-react";

// =========================
// CARD STATISTIK
// =========================
const StatCard = ({ icon: Icon, title, value, color, bgColor, percentage }) => (
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
          {value?.toLocaleString("id-ID")}
        </p>
        {percentage && (
          <div className="flex items-center gap-1 mt-2">
            <div className="bg-green-100 px-2 py-1 rounded-md flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-600">{percentage}%</span>
            </div>
            <span className="text-xs text-gray-500">dari total</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

// =========================
// CHART CARD
// =========================
const ChartCard = ({ title, children, description, icon: Icon }) => (
  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200">
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        {Icon && (
          <div className="bg-blue-100 p-2 rounded-lg">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      {description && <p className="text-sm text-gray-500 ml-9">{description}</p>}
    </div>
    {children}
  </div>
);

// =========================
// PAGE UTAMA
// =========================
export default function UMKMSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/umkm-summary");

        if (res.data?.success) {
          setData(res.data.data);
        } else {
          setError("Gagal memuat data UMKM summary.");
        }
      } catch (err) {
        console.error(err);
        setError("Tidak dapat menghubungi API.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
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
        <p className="mt-4 text-gray-600 font-semibold">Memuat data dashboard...</p>
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

  // ===========================
  // HITUNG PERSENTASE
  // ===========================
  const percentage_lengkap = ((data.total_lengkap / data.total_umkm) * 100).toFixed(1);
  const percentage_belum = ((data.total_belum_lengkap / data.total_umkm) * 100).toFixed(1);

  // ===========================
  // DATA CHART
  // ===========================
  const pieData = [
    { name: "Data Lengkap", value: data.total_lengkap, color: "#10b981" },
    { name: "Data Belum Lengkap", value: data.total_belum_lengkap, color: "#f59e0b" }
  ];

  const chartKecamatan = data.per_kecamatan?.map((item) => ({
    kecamatan: item.kecamatan,
    total: item.total
  })) || [];

  const chartJenis = data.per_jenis_ukm?.map((item) => ({
    jenis: item.jenis,
    total: item.total
  })) || [];

  const nibData = [
    { name: "Punya NIB", value: Number(data.status_nib.punya), color: "#3b82f6" },
    { name: "Belum Punya NIB", value: Number(data.status_nib.belum), color: "#ef4444" }
  ];

  // ===========================
  // RENDER PAGE
  // ===========================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Dashboard UMKM
              </h1>
              <p className="text-gray-600 text-sm mt-1">Ringkasan data dan analisis UMKM terdaftar</p>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={Users} 
            title="Total UMKM" 
            value={data.total_umkm} 
            color="border-blue-600" 
            bgColor="bg-blue-100"
          />
          <StatCard 
            icon={CheckCircle} 
            title="Data Lengkap" 
            value={data.total_lengkap} 
            percentage={percentage_lengkap} 
            color="border-green-600" 
            bgColor="bg-green-100"
          />
          <StatCard 
            icon={AlertCircle} 
            title="Belum Lengkap" 
            value={data.total_belum_lengkap} 
            percentage={percentage_belum} 
            color="border-yellow-600" 
            bgColor="bg-yellow-100"
          />
        </div>

        {/* ANALISIS DATA */}
        <ChartCard title="Analisis Data & Penjelasan" icon={FileText}>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            
            {/* Keterangan */}
            <p className="text-base">{data.analisis.keterangan}</p>

            {/* Dasar Perhitungan */}
            <div className="bg-gray-50 p-5 rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3 text-lg">📊 Dasar Perhitungan</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="bg-blue-600 w-1.5 h-1.5 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold text-gray-800">Total UMKM</p>
                    <p className="text-sm text-gray-600">{data.analisis.dasar_perhitungan.total_umkm}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-green-600 w-1.5 h-1.5 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold text-gray-800">Data Lengkap</p>
                    <p className="text-sm text-gray-600">{data.analisis.dasar_perhitungan.total_lengkap}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="bg-yellow-600 w-1.5 h-1.5 rounded-full mt-2"></div>
                  <div>
                    <p className="font-semibold text-gray-800">Data Belum Lengkap</p>
                    <p className="text-sm text-gray-600">{data.analisis.dasar_perhitungan.total_belum_lengkap}</p>
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
                  <p className="text-sm text-gray-700">{data.analisis.catatan}</p>
                </div>
              </div>
            </div>

          </div>
        </ChartCard>

        {/* CHARTS ROW 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">

          {/* PIE -> Kelengkapan */}
          <ChartCard title="Distribusi Kelengkapan Data" icon={Activity}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => v.toLocaleString("id-ID")} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* PIE -> Status NIB */}
          <ChartCard title="Status Kepemilikan NIB" icon={FileText}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={nibData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  dataKey="value"
                >
                  {nibData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => v.toLocaleString("id-ID")} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>

        {/* BAR CHART KECAMATAN */}
        <div className="mb-8">
          <ChartCard title="Sebaran UMKM per Kecamatan" icon={Building2}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartKecamatan}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="kecamatan" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #3b82f6',
                    borderRadius: '8px',
                    fontWeight: 600
                  }} 
                  formatter={(v) => v.toLocaleString("id-ID")}
                />
                <Legend />
                <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* BAR CHART JENIS UKM */}
        <div className="mb-8">
          <ChartCard title="Sebaran UMKM berdasarkan Jenis UKM" icon={Activity}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartJenis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="jenis" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #10b981',
                    borderRadius: '8px',
                    fontWeight: 600
                  }} 
                  formatter={(v) => v.toLocaleString("id-ID")}
                />
                <Legend />
                <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* BUTTON */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/umkm")}
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-xl flex items-center gap-3"
          >
            <FileText className="w-5 h-5" />
            Lihat Data UMKM Lengkap
          </button>
        </div>

      </div>
    </div>
  );
}
