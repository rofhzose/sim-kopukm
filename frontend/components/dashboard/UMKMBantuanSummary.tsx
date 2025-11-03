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

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axiosInstance.get("/dashboard/bantuan-summary");
      if (res.data.success) setSummary(res.data.data);
    } catch (err: any) {
      console.error("❌ Gagal ambil summary:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-50  text-gray-800">
      <h2 className="text-2xl font-bold text-center mb-4 text-blue-800">
        📊 PENERIMA BANTUAN UMKM
      </h2>

      {summary && (
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Penerima</p>
              <p className="text-3xl font-bold text-blue-700">
                {summary.total_penerima.toLocaleString()}
              </p>
            </div>

            <div className="hidden md:block w-px h-10 bg-gray-300" />

            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Dapat Bantuan</p>
              <p className="text-3xl font-bold text-green-600">
                {summary.jumlah_umkm_dapat_bantuan.toLocaleString()}
              </p>
            </div>

            <div className="hidden md:block w-px h-10 bg-gray-300" />

            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Terdaftar</p>
              <p className="text-3xl font-bold text-yellow-600">
                {summary.total_umkm_terdaftar.toLocaleString()}
              </p>
            </div>

            <div className="hidden md:block w-px h-10 bg-gray-300" />

            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Persentase</p>
              <p className="text-3xl font-bold text-purple-600">
                {summary.persentase_dapat_bantuan}%
              </p>
            </div>
          </div>

          {/* Tombol ke halaman tabel */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => router.push("/informasi/data-awal/penerima-bantuan")}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            >
              Lihat Semua Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UMKMBantuanSummary;
