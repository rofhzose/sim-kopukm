import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import DuplikatTable from "../components/DuplikatTable";
import { Loader2, Undo, Search, RefreshCw } from "lucide-react";

export default function DuplikatPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [params] = useSearchParams();
  const type = params.get("type") || "kombinasi";

  const [filters, setFilters] = useState({
    page: 1,
    search: "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.get(
        `/dashboard/umkm-duplikat-by-type?type=${type}&page=${filters.page}&limit=50&search=${filters.search}`
      );

      if (res.data.success) {
        setData(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setError("Gagal memuat data duplikat UMKM.");
      }
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setError("Tidak dapat terhubung ke server duplikat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.page, type]);

  const handleApplySearch = () => {
    setFilters({ ...filters, page: 1 });
    fetchData();
  };

  const handleResetSearch = () => {
    setFilters({ page: 1, search: "" });
    setTimeout(fetchData, 80);
  };

  const handleNext = () =>
    setFilters((prev) => ({
      ...prev,
      page: Math.min(prev.page + 1, pagination.total_page),
    }));

  const handlePrev = () =>
    setFilters((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }));

  const getTitle = () => {
    switch (type) {
      case "nama":
        return "Duplikasi Berdasarkan Nama";
      case "usaha":
        return "Duplikasi Berdasarkan Nama Usaha";
      default:
        return "Duplikasi Berdasarkan Kombinasi Nama + Usaha + Wilayah";
    }
  };

  const isFiltered = filters.search.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1500px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl p-8 shadow-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{getTitle()}</h1>
              <p className="text-orange-100 mt-2 text-lg">
                Data indikasi duplikasi UMKM
              </p>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="px-5 py-3 bg-white text-red-700 font-bold rounded-xl shadow-md hover:bg-red-50 transition flex items-center gap-2"
            >
              <Undo className="w-5 h-5" />
              Kembali
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-600 p-2.5 rounded-xl">
              <Search className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Pencarian Data Duplikat</h2>

            {isFiltered && (
              <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-bold animate-pulse">
                Filter Aktif
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleApplySearch()}
                type="text"
                placeholder="Cari nama / nama usaha..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <button
              onClick={handleApplySearch}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-md"
            >
              Cari
            </button>

            {isFiltered && (
              <button
                onClick={handleResetSearch}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition shadow-md"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* PAGINATION (TOP) */}
        {pagination?.total_group > 1 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 font-medium">
              Halaman{" "}
              <strong className="text-red-600">{pagination.current_page}</strong>{" "}
              dari <strong>{pagination.total_page}</strong>
              <span className="mx-2 text-gray-400">•</span>
              Total Grup:{" "}
              <strong className="text-red-600">
                {pagination.total_group?.toLocaleString("id-ID")}
              </strong>
            </div>

            <div className="flex items-center gap-2">

              {/* Prev */}
              <button
                onClick={handlePrev}
                disabled={pagination.current_page === 1}
                className="px-4 py-2 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-40"
              >
                Sebelumnya
              </button>

              {/* Page Number Loop */}
              <div className="flex gap-1">
                {[...Array(pagination.total_page)].map((_, i) => {
                  const pageNum = i + 1;

                  if (
                    pageNum === 1 ||
                    pageNum === pagination.total_page ||
                    Math.abs(pageNum - pagination.current_page) <= 1
                  )
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setFilters({ ...filters, page: pageNum })}
                        className={`w-11 h-11 rounded-xl font-bold transition ${
                          pagination.current_page === pageNum
                            ? "bg-red-600 text-white shadow-lg"
                            : "border-2 border-gray-300 hover:bg-red-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );

                  if (
                    pageNum === pagination.current_page - 2 ||
                    pageNum === pagination.current_page + 2
                  )
                    return (
                      <span
                        key={pageNum}
                        className="px-2 text-gray-400"
                      >
                        ...
                      </span>
                    );

                  return null;
                })}
              </div>

              {/* Next */}
              <button
                onClick={handleNext}
                disabled={pagination.current_page === pagination.total_page}
                className="px-4 py-2 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-40"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
              <p className="mt-6 text-xl font-bold text-gray-700">
                Memuat Data Duplikat...
              </p>
            </div>
          ) : error ? (
            <div className="py-20 text-center bg-red-50 border-2 border-red-200 rounded-2xl">
              <p className="text-2xl font-bold text-red-700">{error}</p>
            </div>
          ) : (
            <DuplikatTable
              data={data}
              page={pagination.current_page}
              limit={pagination.per_page}
            />
          )}
        </div>
      </div>
    </div>
  );
}
