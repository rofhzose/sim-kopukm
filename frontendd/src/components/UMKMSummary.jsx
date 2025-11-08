import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function UMKMSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/umkm-summary");
        if (res.data?.success) {
          setData(res.data.data);
        } else {
          setError("Gagal memuat data UMKM summary.");
        }
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError("Tidak dapat terhubung ke API.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔄 Loader
  if (loading) {
    return (
      <div className="flex flex-col items-center text-gray-600 mt-10 animate-pulse">
        <span className="text-2xl">🔄</span>
        <p className="mt-2 text-sm">Memuat data UMKM...</p>
      </div>
    );
  }

  // ❌ Error handling
  if (error) {
    return (
      <div className="text-red-500 text-center mt-10 font-medium">
        ❌ {error}
      </div>
    );
  }

  const analisis = data?.analisis || {};

  // ✅ Tampilan utama
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-6xl px-4">
      <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-2">
        🏢 Ringkasan Data UMKM Terdaftar
      </h1>

      {/* === GRID CARD === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
        {/* Total UMKM */}
        <div className="bg-white shadow-md rounded-xl p-6 border border-blue-100 text-center hover:shadow-lg hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-1">Total UMKM</h2>
          <p className="text-4xl font-bold text-blue-600">
            {data?.total_umkm?.toLocaleString("id-ID") ?? 0}
          </p>
        </div>

        {/* Data Lengkap */}
        <div className="bg-white shadow-md rounded-xl p-6 border border-green-100 text-center hover:shadow-lg hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-1">Data Lengkap</h2>
          <p className="text-4xl font-bold text-green-600">
            {data?.total_lengkap?.toLocaleString("id-ID") ?? 0}
          </p>
        </div>

        {/* Data Belum Lengkap */}
        <div className="bg-white shadow-md rounded-xl p-6 border border-yellow-100 text-center hover:shadow-lg hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-1">
            Data Belum Lengkap
          </h2>
          <p className="text-4xl font-bold text-yellow-600">
            {data?.total_belum_lengkap?.toLocaleString("id-ID") ?? 0}
          </p>
        </div>
      </div>

      {/* === PENJELASAN === */}
      <div className="bg-white shadow-md rounded-xl p-6 mt-8 w-full text-gray-700 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          🧠 Penjelasan Singkat
        </h3>

        <p className="text-gray-700 leading-relaxed mb-3">
          {analisis.keterangan ||
            "Data ini menunjukkan total UMKM yang terdaftar di sistem serta tingkat kelengkapan datanya."}
        </p>

        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>
            <strong>Total UMKM:</strong>{" "}
            {analisis.dasar_perhitungan?.total_umkm ||
              "Jumlah seluruh UMKM yang tercatat di sistem database."}
          </li>
          <li>
            <strong>Data Lengkap:</strong>{" "}
            {analisis.dasar_perhitungan?.total_lengkap ||
              "Jumlah UMKM yang sudah mengisi semua kolom penting seperti nama, alamat, lokasi, dan NIB."}
          </li>
          <li>
            <strong>Data Belum Lengkap:</strong>{" "}
            {analisis.dasar_perhitungan?.total_belum_lengkap ||
              "Jumlah UMKM yang masih ada kolom kosong atau belum terisi dengan lengkap."}
          </li>
        </ul>

        <p className="text-sm text-gray-500 mt-3 italic">
          📝 {analisis.catatan ||
            "Kolom yang diperiksa meliputi nama, jenis kelamin, usaha, alamat, kecamatan, desa, longitude, latitude, jenis UKM, dan NIB."}
        </p>
      </div>

      {/* === TOMBOL === */}
      <button
        onClick={() => navigate("/umkm")}
        className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md"
      >
        📋 Lihat Data UMKM
      </button>
    </div>
  );
}
