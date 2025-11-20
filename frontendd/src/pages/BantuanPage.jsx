import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import TableBantuan from "../components/BantuanTable";
import { Search, Filter, RefreshCw, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LogoKarawang from "../assets/logo_karawang.png";

export default function BantuanPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔹 Filter dropdown data dari API
  const [filterOptions, setFilterOptions] = useState({
    kecamatan: [],
    jenis_alat_bantu: [],
    tahun: [],
    keterangan: [],
    status_profil: [],
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    kecamatan: "",
    jenis_alat_bantu: "",
    tahun: "",
    keterangan: "",
    status_profil: "",
    page: 1,
  });

  // =============================== 🔹 FETCH FILTER OPTIONS
  const fetchFilters = async () => {
    try {
      const res = await axiosInstance.get("/dashboard/bantuan-filter");
      if (res.data.success) setFilterOptions(res.data.data);
    } catch (err) {
      console.error("❌ Gagal memuat filter:", err);
    }
  };

  // Fetch data dengan filter
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.kecamatan) params.append("kecamatan", filters.kecamatan);
      if (filters.jenis_alat_bantu) params.append("jenis_alat_bantu", filters.jenis_alat_bantu);
      if (filters.tahun) params.append("tahun", filters.tahun);
      if (filters.keterangan) params.append("keterangan", filters.keterangan);
      if (filters.status_profil) params.append("status_profil", filters.status_profil);
      params.append("page", filters.page);
      params.append("limit", 100);

      const res = await axiosInstance.get(`/dashboard/bantuan-list?${params}`);
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

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters.page]);

  const handleApplyFilter = () => {
    setFilters({ ...filters, page: 1 });
    fetchData();
  };

  const handleResetFilter = () => {
    setFilters({
      search: "",
      kecamatan: "",
      jenis_alat_bantu: "",
      tahun: "",
      keterangan: "",
      status_profil: "",
      page: 1,
    });
    setTimeout(fetchData, 100);
  };

  const handleNext = () => {
    if (filters.page < pagination.totalPages)
      setFilters({ ...filters, page: filters.page + 1 });
  };

  const handlePrev = () => {
    if (filters.page > 1) 
      setFilters({ ...filters, page: filters.page - 1 });
  };

  const isFilterActive = filters.search || filters.kecamatan || filters.jenis_alat_bantu || filters.tahun || filters.keterangan || filters.status_profil;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 shadow-2xl text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 h-16 flex items-center justify-center rounded-xl backdrop-blur-sm">
                <img src={LogoKarawang} alt="Logo Karawang" className="w-full h-14" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Data Bantuan UMKM Kabupaten Karawang
                </h1>
                <p className="text-blue-100 mt-2 text-lg">
                  Sistem Informasi Bantuan & Program Dukungan UMKM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-3 bg-white text-blue-700 font-bold rounded-xl shadow-md hover:bg-blue-50 transition"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Filter & Pencarian</h2>
              {isFilterActive && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  Filter Aktif
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Pencarian + Tombol Aksi */}
            <div className="md:col-span-12">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pencarian</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari nama penerima, UMKM, produk..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyFilter()}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-700"
                  />
                </div>
                <button
                  onClick={handleApplyFilter}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md"
                >
                  Terapkan
                </button>
                {isFilterActive && (
                  <button
                    onClick={handleResetFilter}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition shadow-md"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Kecamatan */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kecamatan</label>
              <select
                value={filters.kecamatan}
                onChange={(e) => setFilters({ ...filters, kecamatan: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Semua Kecamatan</option>
                {filterOptions.kecamatan.map((kec) => (
                  <option key={kec} value={kec}>{kec}</option>
                ))}
              </select>
            </div>

            {/* Jenis Alat Bantu */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Bantuan</label>
              <select
                value={filters.jenis_alat_bantu}
                onChange={(e) => setFilters({ ...filters, jenis_alat_bantu: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Semua Jenis Bantuan</option>
                {filterOptions.jenis_alat_bantu.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>

            {/* Tahun */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tahun</label>
              <select
                value={filters.tahun}
                onChange={(e) => setFilters({ ...filters, tahun: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Semua Tahun</option>
                {filterOptions.tahun.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Keterangan */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Keterangan</label>
              <select
                value={filters.keterangan}
                onChange={(e) => setFilters({ ...filters, keterangan: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Semua Keterangan</option>
                {filterOptions.keterangan.map((ket) => (
                  <option key={ket} value={ket}>{ket}</option>
                ))}
              </select>
            </div>

            {/* Status Profil */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status Profil</label>
              <select
                value={filters.status_profil}
                onChange={(e) => setFilters({ ...filters, status_profil: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Semua Profil</option>
                {filterOptions.status_profil.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Total Data */}
          {pagination.totalData > 0 && (
            <div className="mt-4 text-right">
              <span className="text-sm text-gray-600">
                Total: <strong className="text-blue-600 text-lg">{pagination.totalData?.toLocaleString("id-ID")}</strong> data ditemukan
              </span>
            </div>
          )}
        </div>

        {/* Pagination (di atas tabel) */}
        {!loading && pagination.totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 font-medium">
                Halaman <strong className="text-blue-600">{pagination.page}</strong> dari <strong>{pagination.totalPages}</strong>
                <span className="mx-2 text-gray-400">•</span>
                Total: <strong className="text-blue-600">{pagination.total?.toLocaleString("id-ID")}</strong> data
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrev} 
                  disabled={filters.page === 1}
                  className="px-5 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Sebelumnya
                </button>

                <div className="flex gap-1">
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (page === 1 || page === pagination.totalPages || Math.abs(page - filters.page) <= 1) {
                      return (
                        <button
                          key={page}
                          onClick={() => setFilters({ ...filters, page })}
                          className={`w-11 h-11 rounded-xl font-bold transition ${
                            filters.page === page
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                              : "border-2 border-gray-300 hover:bg-blue-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                    if (page === filters.page - 2 || page === filters.page + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button 
                  onClick={handleNext} 
                  disabled={filters.page === pagination.totalPages}
                  className="px-5 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading / Error / Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-xl border border-gray-200">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            <p className="text-xl font-bold text-gray-700 mt-6">Memuat Data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-2xl border-2 border-red-200">
            <p className="text-2xl font-bold text-red-700">{error}</p>
            <button 
              onClick={fetchData} 
              className="mt-4 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <TableBantuan
            data={data}
            page={pagination.page}
            limit={pagination.limit}
          />
        )}
      </div>
    </div>
  );
}