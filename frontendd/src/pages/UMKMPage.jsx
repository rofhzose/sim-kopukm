import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import TableUMKM from "../components/SummaryTable";
import { Search, Filter, RefreshCw, MapPin, Building2, Loader2 } from "lucide-react";

export default function UMKMPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  // 🔹 Filter options
  const [kecamatanList, setKecamatanList] = useState([]);
  const [jenisList, setJenisList] = useState([]);

  // 🔹 Filter states
  const [filters, setFilters] = useState({
    search: "",
    kecamatan: "",
    jenis_ukm: "",
    page: 1,
  });

  // ✅ Ambil filter list (kecamatan, jenis UKM)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/umkm-filter");
        if (res.data.success) {
          setKecamatanList(res.data.data.kecamatan);
          setJenisList(res.data.data.jenis_ukm);
        }
      } catch (err) {
        console.error("❌ Gagal ambil filter:", err);
      }
    };
    fetchFilters();
  }, []);

  // ✅ Fetch data tabel
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.kecamatan) params.append("kecamatan", filters.kecamatan);
      if (filters.jenis_ukm) params.append("jenis_ukm", filters.jenis_ukm);
      params.append("page", filters.page);
      params.append("limit", 100);

      const res = await axiosInstance.get(`/dashboard/umkm-list?${params}`);
      if (res.data.success) {
        setData(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setError("Gagal memuat data.");
      }
    } catch (err) {
      setError("Gagal memuat data UMKM.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.page]); // hanya reload saat ganti page

  const handleApplyFilter = () => {
    setFilters({ ...filters, page: 1 });
    fetchData();
  };

  const handleResetFilter = () => {
    setFilters({
      search: "",
      kecamatan: "",
      jenis_ukm: "",
      page: 1,
    });
    setTimeout(fetchData, 100);
  };

  const handleNext = () => {
    if (filters.page < pagination.totalPages)
      setFilters({ ...filters, page: filters.page + 1 });
  };

  const handlePrev = () => {
    if (filters.page > 1) setFilters({ ...filters, page: filters.page - 1 });
  };

  const isFilterActive = filters.search || filters.kecamatan || filters.jenis_ukm;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
       {/* Header */}
<div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 shadow-2xl text-white">
  <div className="flex items-start justify-between">
    
    {/* Kiri: Icon + Judul */}
    <div className="flex items-center gap-4">
      <div className="bg-white bg-opacity-20 p-4 rounded-xl backdrop-blur-sm">
        <Building2 className="w-10 h-10" />
      </div>

      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Data UMKM Kabupaten Karawang
        </h1>
        <p className="text-blue-100 mt-2 text-lg">
          Sistem Informasi & Manajemen Data Usaha Mikro, Kecil, dan Menengah
        </p>
      </div>
    </div>

    {/* Kanan: Tombol Kembali */}
          <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-white text-blue-700 font-semibold rounded-lg shadow-md hover:bg-blue-50 transition"
        title="Kembali"
      >
        ⬅ Kembali
      </button>
  </div>
</div>


        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Filter & Pencarian</h2>
            {isFilterActive && (
              <span className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                Filter Aktif
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pencarian
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nama / usaha / NIB..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Kecamatan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Kecamatan
              </label>
              <select
                value={filters.kecamatan}
                onChange={(e) => setFilters({ ...filters, kecamatan: e.target.value })}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 bg-white cursor-pointer"
              >
                <option value="">Semua Kecamatan</option>
                {kecamatanList.map((kec) => (
                  <option key={kec} value={kec}>
                    {kec}
                  </option>
                ))}
              </select>
            </div>

            {/* Jenis UKM */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Jenis UKM
              </label>
              <select
                value={filters.jenis_ukm}
                onChange={(e) => setFilters({ ...filters, jenis_ukm: e.target.value })}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 bg-white cursor-pointer"
              >
                <option value="">Semua Jenis UKM</option>
                {jenisList.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleApplyFilter}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Filter className="w-5 h-5" />
              Terapkan Filter
            </button>

            {isFilterActive && (
              <button
                onClick={handleResetFilter}
                className="flex items-center gap-2 px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                Reset Filter
              </button>
            )}

            <div className="ml-auto text-sm text-gray-600 font-medium">
              {pagination.totalData && (
                <span className="bg-gray-100 px-4 py-2 rounded-lg">
                  Total: <span className="font-bold text-blue-600">{pagination.totalData}</span> data ditemukan
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-xl border border-gray-200">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-full">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-700 mt-6">Memuat Data...</p>
            <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-xl border-2 border-red-200">
            <div className="bg-red-100 p-6 rounded-full mb-4">
              <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-red-700">{error}</p>
            <button
              onClick={fetchData}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Coba Lagi
            </button>
          </div>
        ) : (
          <TableUMKM 
    data={data} 
    page={pagination.page} 
    limit={pagination.limit} 
/>

        )}

        {/* Pagination - Server Side */}
        {!loading && pagination.totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 font-medium">
                Halaman Server: <span className="font-bold text-blue-600">{pagination.page}</span> dari <span className="font-bold">{pagination.totalPages}</span>
                <span className="mx-2">•</span>
                Total: <span className="font-bold text-blue-600">{pagination.totalData}</span> data
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  disabled={filters.page === 1}
                  className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700 transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(pagination.totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= filters.page - 1 && pageNum <= filters.page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setFilters({ ...filters, page: pageNum })}
                          className={`min-w-[44px] h-11 rounded-xl font-bold transition-all ${
                            filters.page === pageNum
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110"
                              : "bg-white border-2 border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 shadow-sm"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === filters.page - 2 || pageNum === filters.page + 2) {
                      return (
                        <span key={pageNum} className="text-gray-400 px-2 font-bold">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={handleNext}
                  disabled={filters.page === pagination.totalPages}
                  className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700 transition-all shadow-sm hover:shadow-md"
                >
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}