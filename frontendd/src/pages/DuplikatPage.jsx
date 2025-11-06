import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import DuplikatTable from "../components/DuplikatTable";

export default function DuplikatPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔍 Filter states
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
  });

  // ✅ Fetch data utama (mirip bantuan)
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      params.append("page", filters.page);
      params.append("limit", 50);

      const res = await axiosInstance.get(`/dashboard/umkm-duplikat-list?${params}`);
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

  // ✅ Ambil data setiap kali filter/page berubah
  useEffect(() => {
    fetchData();
  }, [filters]);

  // ✅ Handle next/prev pagination
  const handleNext = () => {
    if (filters.page < pagination.totalPages)
      setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handlePrev = () => {
    if (filters.page > 1)
      setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  // ✅ Apply filter manual
  const handleApplyFilter = () => {
    setFilters((prev) => ({ ...prev, page: 1 })); // reset ke halaman 1
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-orange-600">
        🧾 Data UMKM Duplikat
      </h1>

      {/* =================== FILTER BAR =================== */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex flex-wrap items-center gap-4 border">
        {/* Search */}
        <input
          type="text"
          placeholder="Cari nama / nama usaha..."
          value={filters.search}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              search: e.target.value,
              page: 1,
            }))
          }
          className="border rounded-lg px-3 py-2 w-64 focus:ring-2 focus:ring-orange-400 outline-none"
        />

        {/* Tombol filter */}
        <button
          onClick={handleApplyFilter}
          disabled={loading}
          className={`${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700"
          } text-white px-4 py-2 rounded-lg transition`}
        >
          {loading ? "Memuat..." : "Terapkan Filter"}
        </button>
      </div>

      {/* =================== TABLE =================== */}
      {loading ? (
        <p className="text-gray-500 text-center mt-10">🔄 Memuat data...</p>
      ) : error ? (
        <p className="text-red-500 text-center mt-10">{error}</p>
      ) : (
        <DuplikatTable data={data} />
      )}

      {/* =================== PAGINATION =================== */}
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
