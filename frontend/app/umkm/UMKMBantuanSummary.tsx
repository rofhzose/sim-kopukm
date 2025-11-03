"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";

interface SummaryData {
  total_penerima: number;
  jumlah_umkm_dapat_bantuan: number;
  total_umkm_terdaftar: number;
  persentase_dapat_bantuan: string;
}

const UMKMBantuanSummary: React.FC = () => {
  const router = useRouter();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Ambil data ringkasan dari API saat pertama kali load
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/bantuan-summary");
        if (res.data.success) setSummary(res.data.data);
      } catch (err) {
        console.error("❌ Gagal ambil summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Memuat data ringkasan bantuan...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Judul */}
      <h2 className="text-2xl font-bold text-center mb-4 text-blue-800">
        📊 PENERIMA BANTUAN UMKM
      </h2>

      {/* Card Ringkasan */}
      {summary ? (
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Total penerima */}
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Penerima</p>
              <p className="text-3xl font-bold text-blue-700">
                {summary.total_penerima.toLocaleString()}
              </p>
            </div>

            <div className="hidden md:block w-px h-10 bg-gray-300" />

            {/* Dapat bantuan */}
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Dapat Bantuan</p>
              <p className="text-3xl font-bold text-green-600">
                {summary.jumlah_umkm_dapat_bantuan.toLocaleString()}
              </p>
            </div>

            <div className="hidden md:block w-px h-10 bg-gray-300" />

            {/* Total terdaftar */}
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Terdaftar</p>
              <p className="text-3xl font-bold text-yellow-600">
                {summary.total_umkm_terdaftar.toLocaleString()}
              </p>
            </div>

            <div className="hidden md:block w-px h-10 bg-gray-300" />

            {/* Persentase */}
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Persentase</p>
              <p className="text-3xl font-bold text-purple-600">
                {summary.persentase_dapat_bantuan}%
              </p>
            </div>
          </div>

          {/* Tombol navigasi */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() =>
                router.push("/informasi/data-awal/penerima-bantuan")
              }
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium shadow-sm"
            >
              📋 Lihat Daftar Penerima Bantuan
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-600">Tidak ada data tersedia.</p>
      )}
    </div>
  );
};

export default UMKMBantuanSummary;
