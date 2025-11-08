import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import DuplikatTable from "../components/DuplikatTable";

export default function DuplikatPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [params] = useSearchParams();
  const type = params.get("type") || "kombinasi";

  const [filters, setFilters] = useState({ page: 1 });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(
        `/dashboard/umkm-duplikat-by-type?type=${type}&page=${filters.page}&limit=50`
      );
      if (res.data.success) {
        setData(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setError("Gagal memuat data duplikat UMKM.");
      }
    } catch (err) {
      console.error("❌ Error fetching duplikat data:", err);
      setError("Tidak dapat terhubung ke server duplikat UMKM.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, type]);

  const handleNext = () =>
    setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
  const handlePrev = () =>
    setFilters((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }));

  const getTitle = () => {
    switch (type) {
      case "nama":
        return "👤 Duplikasi Berdasarkan Nama";
      case "usaha":
        return "🏢 Duplikasi Berdasarkan Nama Usaha";
      default:
        return "🧩 Duplikasi Berdasarkan Kombinasi Nama + Usaha + Wilayah";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-orange-600">{getTitle()}</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
        >
          ⬅ Kembali
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center mt-10">🔄 Memuat data...</p>
      ) : error ? (
        <p className="text-red-500 text-center mt-10">{error}</p>
      ) : (
        <DuplikatTable data={data} />
      )}

      {pagination?.total_group > 1 && (
        <div className="flex justify-center items-center mt-6 gap-4">
          <button
            onClick={handlePrev}
            disabled={filters.page === 1}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
          >
            ⬅️ Prev
          </button>

          <span className="text-gray-700 font-medium">
            Halaman {pagination.current_page}
          </span>

          <button
            onClick={handleNext}
            disabled={data.length < pagination.per_page}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
          >
            Next ➡️
          </button>
        </div>
      )}
    </div>
  );
}
