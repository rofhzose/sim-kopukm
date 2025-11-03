"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";

interface UmkmSummary {
  total_umkm: number;
  total_duplikat: number;
  total_belum_lengkap: number;
}

const UMKMSummary: React.FC = () => {
  const router = useRouter();
  const [summary, setSummary] = useState<UmkmSummary | null>(null);

  // 🧠 Ambil data ringkasan
  const fetchSummary = async () => {
    console.log("🚀 Fetching data /dashboard/umkm-summary");
    try {
      const res = await axiosInstance.get("/dashboard/umkm-summary");
      console.log("📦 Response:", res.data);

      if (res.data.success) {
        setSummary(res.data.data);
        console.log("✅ Summary set:", res.data.data);
      } else {
        console.warn("⚠️ Response success = false");
      }
    } catch (err) {
      console.error("❌ Gagal ambil summary:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (!summary) {
    return (
      <div className="text-center text-gray-500 mt-10">
        ⏳ Memuat data UMKM...
      </div>
    );
  }

  // 📊 Hitung persentase data lengkap
  const calculatePercentage = () => {
    const lengkap =
      summary.total_umkm - (summary.total_duplikat + summary.total_belum_lengkap);
    return ((lengkap / summary.total_umkm) * 100).toFixed(2);
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 mt-10">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">
        📊 DATA UMKM KARAWANG
      </h2>

      {/* Summary Grid */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 font-medium">Total UMKM</p>
          <p className="text-3xl font-bold text-blue-700">
            {summary.total_umkm.toLocaleString()}
          </p>
        </div>

        <div className="hidden md:block w-px h-10 bg-gray-300" />

        <div className="text-center">
          <p className="text-sm text-gray-600 font-medium">Data Duplikat</p>
          <p className="text-3xl font-bold text-orange-600">
            {summary.total_duplikat.toLocaleString()}
          </p>
        </div>

        <div className="hidden md:block w-px h-10 bg-gray-300" />

        <div className="text-center">
          <p className="text-sm text-gray-600 font-medium">Belum Lengkap</p>
          <p className="text-3xl font-bold text-red-600">
            {summary.total_belum_lengkap.toLocaleString()}
          </p>
        </div>

        <div className="hidden md:block w-px h-10 bg-gray-300" />

        <div className="text-center">
          <p className="text-sm text-gray-600 font-medium">Data Lengkap</p>
          <p className="text-3xl font-bold text-green-600">
            {calculatePercentage()}%
          </p>
        </div>
      </div>

      {/* Tombol ke halaman daftar UMKM */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => router.push("/informasi/data-awal/umkm")}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium"
        >
          📋 Lihat Semua Data UMKM
        </button>
      </div>
    </div>
  );
};

export default UMKMSummary;
