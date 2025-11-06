import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

export default function UMKMDuplikatSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/umkm-duplikat-summary");
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError("Gagal memuat data duplikat UMKM.");
        }
      } catch (err) {
        console.error("Error fetch UMKM duplikat:", err);
        setError("Tidak dapat terhubung ke API duplikat UMKM.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🌀 Loading State
  if (loading)
    return (
      <div className="text-gray-600 text-center mt-10 animate-pulse">
        🔄 Memuat data duplikat UMKM...
      </div>
    );

  // ❌ Error State
  if (error)
    return (
      <div className="text-red-500 text-center mt-10">
        ❌ {error}
      </div>
    );

  // ✅ Main Content
  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mt-8">

        {/* 🔸 Grup Duplikat */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-orange-100 text-center hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-2">
            Grup Duplikat
          </h2>
          <p className="text-4xl font-bold text-orange-600">
            {data?.total_duplikat_group?.toLocaleString("id-ID") ?? "-"}
          </p>
        </div>

        {/* 🔺 Total Record Duplikat */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-red-100 text-center hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-2">
            Total Record Duplikat
          </h2>
          <p className="text-4xl font-bold text-red-600">
            {data?.total_record_duplikat?.toLocaleString("id-ID") ?? "-"}
          </p>
        </div>
      </div>

      {/* 🧾 Tombol menuju halaman daftar duplikat */}
      <button
        onClick={() => navigate("/duplikat")}
        className="mt-8 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-all shadow-md"
      >
        🧾 Lihat Detail Duplikat UMKM
      </button>
    </div>
  );
}
