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

  // ✅ Tampilkan data
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-5xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
        <div className="bg-white shadow-md rounded-xl p-6 border border-blue-100 text-center hover:shadow-lg hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-1">Total UMKM</h2>
          <p className="text-4xl font-bold text-blue-600">
            {data?.total_umkm?.toLocaleString("id-ID") ?? 0}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 border border-red-100 text-center hover:shadow-lg hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-1">Total Duplikat</h2>
          <p className="text-4xl font-bold text-red-600">
            {data?.total_duplikat?.toLocaleString("id-ID") ?? 0}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 border border-yellow-100 text-center hover:shadow-lg hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-1">
            Data Belum Lengkap
          </h2>
          <p className="text-4xl font-bold text-yellow-600">
            {data?.total_belum_lengkap?.toLocaleString("id-ID") ?? 0}
          </p>
        </div>
      </div>

      {/* Tombol navigasi */}
      <button
        onClick={() => navigate("/umkm")}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md"
      >
        📊 Lihat Data UMKM
      </button>
    </div>
  );
}
