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
import { Users, Banknote, FileText, AlertCircle, Activity } from "lucide-react";

/**
 * KoperasiSummary.jsx
 * - coba fetch /dashboard/koperasi-summary
 * - kalau gagal -> fallback ke mockData (developer mode)
 */

const mockData = {
  total_koperasi: 830,
  total_aktif: 720,
  total_nonaktif: 110,
  per_kecamatan: [
    { kecamatan: "Karawang Barat", total: 120 },
    { kecamatan: "Karawang Timur", total: 90 },
    { kecamatan: "Telukjambe", total: 70 },
    { kecamatan: "Cikampek", total: 180 },
    { kecamatan: "Purwasari", total: 150 },
    { kecamatan: "Tirtamulya", total: 120 },
    { kecamatan: "Lemahabang", total: 100 },
  ],
  per_sektor: [
    { sektor: "Pertanian", total: 200 },
    { sektor: "Perdagangan", total: 280 },
    { sektor: "Jasa", total: 150 },
    { sektor: "Industri", total: 80 },
    { sektor: "Lainnya", total: 120 },
  ],
  analisis: {
    keterangan:
      "Sebagian besar koperasi telah aktif. Fokus pembinaan diarahkan pada koperasi nonaktif dan sektor industri kecil.",
    dasar_perhitungan: {
      total_koperasi: "Jumlah data koperasi terdaftar",
      total_aktif: "Koperasi dengan status aktif",
      total_nonaktif: "Koperasi yang belum aktif atau nonaktif",
    },
    catatan: "Data saat ini masih menggunakan mock (dev). Hubungkan backend untuk data real.",
  },
  status_keuangan: {
    sehat: 520,
    prihatin: 210,
    gagal: 100,
  },
};

export default function KoperasiSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchSummary = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/koperasi-summary");
        if (!mounted) return;
        if (res.data?.success) {
          setData(res.data.data);
          setUsingMock(false);
        } else {
          // jika response non-standard treat as mock
          setData(mockData);
          setUsingMock(true);
        }
      } catch (err) {
        console.warn("Koperasi summary fetch failed — using mock data.", err?.message || err);
        if (!mounted) return;
        setData(mockData);
        setUsingMock(true);
        // setError optionally if you want to show an error card; keep silent so UI still shows
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSummary();
    return () => {
      mounted = false;
    };
  }, []);

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

  if (!data) {
    return (
      <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <p className="text-red-700">Gagal memuat data koperasi.</p>
        </div>
      </div>
    );
  }

  // derived values
  const total = data.total_koperasi || 0;
  const active = data.total_aktif || 0;
  const nonactive = data.total_nonaktif || 0;

  const pieStatus = [
    { name: "Aktif", value: active, color: "#10b981" },
    { name: "Nonaktif", value: nonactive, color: "#f59e0b" },
  ];

  const keuanganData = [
    { name: "Sehat", value: data.status_keuangan?.sehat || 0, color: "#3b82f6" },
    { name: "Prihatin", value: data.status_keuangan?.prihatin || 0, color: "#f97316" },
    { name: "Gagal", value: data.status_keuangan?.gagal || 0, color: "#ef4444" },
  ];

  const chartKecamatan = (data.per_kecamatan || []).map((it) => ({
    kecamatan: it.kecamatan,
    total: it.total,
  }));

  const chartSektor = (data.per_sektor || []).map((it) => ({
    sektor: it.sektor,
    total: it.total,
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
            <p className="text-sm text-gray-600">Ringkasan data & analisis koperasi</p>
          </div>

          {usingMock && (
            <div className="ml-auto">
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md border border-amber-200">
                DEV: menggunakan data mock
              </span>
            </div>
          )}
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
                <p className="text-2xl font-bold text-slate-900">{total.toLocaleString("id-ID")}</p>
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
                <p className="text-2xl font-bold text-green-600">{active.toLocaleString("id-ID")}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{nonactive.toLocaleString("id-ID")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ANALISIS & DASAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-slate-800 mb-3">Analisis Singkat</h3>
            <p className="text-gray-700 mb-4">{data.analisis?.keterangan}</p>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-2">Dasar Perhitungan</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• {data.analisis?.dasar_perhitungan?.total_koperasi}</li>
                <li>• {data.analisis?.dasar_perhitungan?.total_aktif}</li>
                <li>• {data.analisis?.dasar_perhitungan?.total_nonaktif}</li>
              </ul>
            </div>

            <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800 font-semibold">📝 Catatan</p>
              <p className="text-sm text-gray-700 mt-1">{data.analisis?.catatan}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <h4 className="font-bold text-slate-800 mb-3">Status Keuangan</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={keuanganData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label>
                  {keuanganData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => v.toLocaleString("id-ID")} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-semibold text-slate-900">{(data.status_keuangan?.sehat || 0).toLocaleString("id-ID")}</div>
                <div className="text-gray-500">Sehat</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-slate-900">{(data.status_keuangan?.prihatin || 0).toLocaleString("id-ID")}</div>
                <div className="text-gray-500">Prihatin</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-slate-900">{(data.status_keuangan?.gagal || 0).toLocaleString("id-ID")}</div>
                <div className="text-gray-500">Gagal</div>
              </div>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* KECAMATAN */}
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <h4 className="font-bold mb-3">Sebaran Koperasi per Kecamatan</h4>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartKecamatan}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="kecamatan" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(v) => v.toLocaleString("id-ID")} />
                <Legend />
                <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* SEKTOR */}
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <h4 className="font-bold mb-3">Sebaran Koperasi berdasarkan Sektor</h4>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartSektor}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="sektor" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(v) => v.toLocaleString("id-ID")} />
                <Legend />
                <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-center mb-10">
          <button
            onClick={() => navigate("/koperasi")}
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
