import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Bar,
} from "recharts";
import { Users, Banknote, FileText, AlertCircle } from "lucide-react";

export default function KoperasiSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [duplikatSummary, setDuplikatSummary] = useState(null); // optional quick view
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("dashboard/koperasi-summary");
        if (!mounted) return;

        if (res.data?.success) {
          setData(res.data.data);
          setError("");
        } else {
          setError(res.data?.message || "Response tidak sukses dari server");
        }
      } catch (err) {
        console.error("fetchSummary error:", err);
        setError(err.response?.data?.message || err.message || "Gagal memuat data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSummary();
    return () => {
      mounted = false;
    };
  }, []);

  // optional quick fetch duplikat (first page)
  const fetchDuplikat = async () => {
    try {
      const res = await axiosInstance.get("dashboard/koperasi-duplikat?limit=50");
      if (res.data?.success) {
        setDuplikatSummary(res.data.data);
      } else {
        console.warn("Duplikat API tidak sukses:", res.data);
      }
    } catch (err) {
      console.warn("Gagal fetch duplikat:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-16 h-16 border-4 border-slate-100 rounded-full relative">
          <div className="w-16 h-16 border-4 border-slate-700 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p className="mt-3 text-gray-600 font-medium">Memuat data Koperasi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <p className="text-red-700">Gagal memuat data: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // map fields from API response (controller returns this structure)
  const total = data.total_koperasi ?? 0;
  const active = data.total_aktif ?? 0;
  const nonactive = data.total_nonaktif ?? total - active;
  const total_lengkap = data.kelengkapan?.total_lengkap ?? 0;
  const total_tidak_lengkap = data.kelengkapan?.total_tidak_lengkap ?? total - total_lengkap;

  const pieKelengkapan = [
    { name: "Lengkap", value: total_lengkap, color: "#10b981" },
    { name: "Tidak Lengkap", value: total_tidak_lengkap, color: "#f59e0b" },
  ];

  const perKecamatan = data.per_kecamatan || [];
  const perJenis = data.per_jenis_koperasi || [];
  const perKeuangan = (data.per_keuangan || []).map((r) => ({
    ...r,
    // ensure color mapping
    color:
      r.kondisi_keuangan === "Sehat"
        ? "#10b981"
        : r.kondisi_keuangan === "Prihatin"
        ? "#f97316"
        : r.kondisi_keuangan === "Gagal"
        ? "#ef4444"
        : "#94a3b8",
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-yellow-600 p-3 rounded-xl">
            <Banknote className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Koperasi</h1>
            <p className="text-sm text-gray-600">Ringkasan data & analisis koperasi (live)</p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => {
                fetchDuplikat();
                navigate("/koperasi-duplikat"); // optional: navigate to a dedicated page
                navigate("/duplikat-koperasi"); // optional: navigate to a dedicated page
              }}
              className="px-3 py-2 bg-amber-100 text-amber-800 rounded-md border border-amber-200 text-sm hover:bg-amber-200 transition"
            >
              Lihat Duplikat NIK
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 bg-slate-100 rounded-md border text-sm hover:bg-slate-200"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Koperasi</p>
                <p className="text-2xl font-bold text-slate-900">{Number(total).toLocaleString("id-ID")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <Banknote className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Koperasi Aktif</p>
                <p className="text-2xl font-bold text-green-600">{Number(active).toLocaleString("id-ID")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Koperasi Nonaktif</p>
                <p className="text-2xl font-bold text-yellow-600">{Number(nonactive).toLocaleString("id-ID")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* KELENGKAPAN + PIE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-slate-800 mb-3">Analisis Singkat</h3>
            <p className="text-gray-700 mb-4">{data.analisis?.keterangan}</p>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-2">Dasar Perhitungan</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Total koperasi: {total}</li>
                <li>• Total aktif: {active}</li>
                <li>• Total tidak aktif: {nonactive}</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <h4 className="font-bold text-slate-800 mb-3">Kelengkapan Data</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieKelengkapan} dataKey="value" cx="50%" cy="50%" outerRadius={70} label>
                  {pieKelengkapan.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => v?.toLocaleString?.("id-ID") ?? v} />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-3 text-center">
              <div className="text-2xl font-bold">{Number(total_lengkap).toLocaleString("id-ID")}</div>
              <div className="text-sm text-gray-500">Data lengkap</div>
              <div className="text-sm text-gray-400 mt-1">{Number(total_tidak_lengkap).toLocaleString("id-ID")} data belum lengkap</div>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <h4 className="font-bold mb-3">Sebaran Koperasi per Kecamatan</h4>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={perKecamatan}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="kecamatan" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(v) => v.toLocaleString("id-ID")} />
                <Legend />
                <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <h4 className="font-bold mb-3">Sebaran Koperasi berdasarkan Jenis</h4>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={perJenis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="jenis" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(v) => v.toLocaleString("id-ID")} />
                <Legend />
                <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PER KEUANGAN */}
        <div className="mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <h4 className="font-bold mb-3">Grade Koperasi</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {perKeuangan.map((k) => (
                <div key={k.kondisi_keuangan} className="p-3 rounded-lg bg-gray-50 border">
                  <div className="font-semibold text-slate-900">{k.kondisi_keuangan}</div>
                  <div className="text-2xl font-bold">{Number(k.total).toLocaleString("id-ID")}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-center mb-10">
          <button
            onClick={() => navigate("/koperasidata")}
            className="px-8 py-3 bg-yellow-600 text-white font-semibold rounded-xl hover:bg-yellow-700 transition shadow"
          >
            <FileText className="w-4 h-4 inline-block mr-2" />
            Lihat Data Koperasi Lengkap
          </button>
        </div>
      </div>
    </div>
  );
}
