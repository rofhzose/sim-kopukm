import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Tambah ini
import axiosInstance from "../utils/axiosInstance";

export default function BantuanSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // ✅ Inisialisasi router

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

  if (loading)
    return (
      <div className="text-gray-600 text-center mt-10 animate-pulse">
        🔄 Memuat data bantuan...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 text-center mt-10">
        ❌ {error}
      </div>
    );

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 w-full max-w-5xl mt-8">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-blue-100 text-center hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-2">Total Penerima</h2>
          <p className="text-4xl font-bold text-blue-600">
            {data?.total_penerima?.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-green-100 text-center hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-2">
            UMKM Dapat Bantuan
          </h2>
          <p className="text-4xl font-bold text-green-600">
            {data?.jumlah_umkm_dapat_bantuan?.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-yellow-100 text-center hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-2">
            UMKM Terdaftar
          </h2>
          <p className="text-4xl font-bold text-yellow-600">
            {data?.total_umkm_terdaftar?.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-purple-100 text-center hover:scale-[1.02] transition">
          <h2 className="text-lg text-gray-600 font-medium mb-2">
            Persentase Bantuan
          </h2>
          <p className="text-4xl font-bold text-purple-600">
            {data?.persentase_dapat_bantuan}%
          </p>
        </div>
      </div>

      {/* ✅ Tombol menuju halaman bantuan */}
      <button
        onClick={() => navigate("/bantuan")}
        className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md"
      >
        📊 Lihat Data Bantuan
      </button>
    </div>
  );
}
