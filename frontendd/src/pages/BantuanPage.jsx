import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import TableBantuan from "../components/BantuanTable";
import { AlertTriangle, Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BantuanPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // ✅ Fetch data utama
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(
        `/dashboard/bantuan-list?page=${page}&limit=100`
      );
      if (res.data.success) {
        setData(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setError("Gagal memuat data bantuan.");
      }
    } catch (err) {
      console.error("❌ Gagal fetch data bantuan:", err);
      setError("Tidak dapat terhubung ke server bantuan.");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Ambil data setiap kali halaman berubah
  useEffect(() => {
    fetchData();
  }, [page]);

  return (
    <div className="p-6">
      {/* 🔙 Tombol Kembali */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                <ArrowLeft size={18} /> Kembali
              </button>
              <h1 className="text-2xl font-bold text-red-600">
                🎁 Data Bantuan UMKM
              </h1>
      </div>
      {/* =================== TABLE =================== */}
      {loading ? (
        <p className="text-gray-500 text-center mt-10">🔄 Memuat data...</p>
      ) : error ? (
        <p className="text-red-500 text-center mt-10">{error}</p>
      ) : (
        <TableBantuan
          data={data}
          pagination={pagination}
          setPage={setPage}
          currentPage={page}
        />
      )}
    </div>
  );
}
