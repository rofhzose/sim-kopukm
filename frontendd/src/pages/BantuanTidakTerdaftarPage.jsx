import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { AlertTriangle, Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LogoKarawang from "../assets/logo_karawang.png";

export default function BantuanTidakTerdaftarPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Opsi filter dropdown (ambil dari backend)
  const [filterOptions, setFilterOptions] = useState({
    tahun: [],
    kecamatan: [],
    jenis_alat_bantu: [],
  });

  // 🔹 State filter aktif
  const [filters, setFilters] = useState({
    search: "",
    tahun: "",
    kecamatan: "",
    jenis_alat_bantu: "",
    penerima: "semua", // semua | satu_kali | ganda
    page: 1,
    limit: 50,
  });

  const navigate = useNavigate();

  // ✅ Ambil daftar opsi filter dari API
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await axiosInstance.get(
          "/dashboard/bantuan-tidak-terdaftar-filters"
        );
        if (res.data.success) {
          setFilterOptions(res.data.data);
        }
      } catch (err) {
        console.error("❌ Gagal memuat data filter:", err);
      }
    };
    fetchFilters();
  }, []);

  // ✅ Ambil data utama (berdasarkan filter)
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();

      // tambahkan filter aktif ke query
      Object.entries(filters).forEach(([key, val]) => {
        if (val && key !== "limit") params.append(key, val);
      });
      params.append("limit", filters.limit);

      const res = await axiosInstance.get(
        `/dashboard/bantuan-tidak-terdaftar-list?${params.toString()}`
      );

      if (res.data.success) {
        setData(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setError("Gagal memuat data penerima tidak terdaftar.");
      }
    } catch (err) {
      console.error("❌ Gagal fetch data:", err);
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // 🔁 Pagination
  const handleNext = () => {
    if (filters.page < pagination.totalPages)
      setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
  };
  const handlePrev = () => {
    if (filters.page > 1)
      setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  // 🚫 Render nilai kosong → ikon warning
  const renderValue = (value) =>
    !value || value === "0" || value === "NULL" ? (
      <div className="flex items-center justify-center text-yellow-500">
        <AlertTriangle size={18} />
      </div>
    ) : (
      value
    );

  // 🔄 Reset semua filter
  const handleReset = () => {
    setFilters({
      search: "",
      tahun: "",
      kecamatan: "",
      jenis_alat_bantu: "",
      penerima: "semua",
      page: 1,
      limit: 50,
    });
  };

  return (
    <div className="p-6">
      {/* 🔙 Tombol Kembali */}


      {/* ================= HEADER ================= */}
<div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 shadow-2xl text-white mb-6">
  <div className="flex items-center justify-between">
    
    {/* Logo + Text */}
    <div className="flex items-center gap-4">
      <div className="bg-white bg-opacity-20 h-16 flex items-center justify-center rounded-xl backdrop-blur-sm">
        <img src={LogoKarawang} alt="Logo Karawang" className="w-full h-14" />
      </div>
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Penerima Bantuan Tidak Terdaftar
        </h1>
        <p className="text-blue-100 mt-2 text-lg">
          Sistem Informasi Bantuan & Program Dukungan UMKM
        </p>
      </div>
    </div>

    {/* Tombol Kembali */}
    <button
      onClick={() => navigate(-1)}
      className="px-5 py-3 bg-white text-blue-700 font-bold rounded-xl shadow-md hover:bg-blue-50 transition"
    >
      Kembali
    </button>
  </div>
</div>

      
{/* ================= FILTER BAR ================= */}
<div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">

  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

    {/* 🔍 Pencarian */}
    <div className="md:col-span-5">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Pencarian
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama / UMKM / produk..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 focus:ring-2 focus:ring-red-500"
        />
      </div>
    </div>

    {/* 📅 Tahun */}
    <div className="md:col-span-2">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Tahun
      </label>
      <select
        value={filters.tahun}
        onChange={(e) => setFilters(prev => ({ ...prev, tahun: e.target.value, page: 1 }))}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
      >
        <option value="">Semua Tahun</option>
        {filterOptions.tahun.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
    </div>

    {/* 🏙 Kecamatan */}
    <div className="md:col-span-3">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Kecamatan
      </label>
      <select
        value={filters.kecamatan}
        onChange={(e) => setFilters(prev => ({ ...prev, kecamatan: e.target.value, page: 1 }))}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
      >
        <option value="">Semua Kecamatan</option>
        {filterOptions.kecamatan.map((k) => (
          <option key={k}>{k}</option>
        ))}
      </select>
    </div>

    {/* 🧰 Jenis Bantuan */}
    <div className="md:col-span-2">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Jenis Bantuan
      </label>
      <select
        value={filters.jenis_alat_bantu}
        onChange={(e) => setFilters(prev => ({ ...prev, jenis_alat_bantu: e.target.value, page: 1 }))}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
      >
        <option value="">Semua Jenis Bantuan</option>
        {filterOptions.jenis_alat_bantu.map((j) => (
          <option key={j}>{j}</option>
        ))}
      </select>
    </div>

    {/* 🗂 Jenis Penerima */}
    <div className="md:col-span-2">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Jenis Penerima
      </label>
      <select
        value={filters.penerima}
        onChange={(e) => setFilters(prev => ({ ...prev, penerima: e.target.value, page: 1 }))}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
      >
        <option value="semua">🗂 Semua Penerima</option>
        <option value="satu_kali">✅ Penerima 1x</option>
        <option value="ganda">🔁 Penerima Ganda</option>
      </select>
    </div>

    {/* 🔄 RESET */}
    <div className="md:col-span-12 flex justify-end">
      <button
        onClick={handleReset}
        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition"
      >
        🔄 Reset
      </button>
    </div>
  </div>
</div>
{/* ================= PAGINATION ATAS ================= */}
{!loading && pagination?.totalPages > 1 && (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-4">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">

      <div className="text-sm text-gray-600 font-medium">
        Halaman <strong className="text-red-600">{pagination.page}</strong> dari{" "}
        <strong>{pagination.totalPages}</strong>
        <span className="mx-2 text-gray-400">•</span>
        Total Data:{" "}
        <strong className="text-red-600">
          {pagination.total?.toLocaleString("id-ID")}
        </strong>
      </div>

      <div className="flex items-center gap-2">

        {/* Prev Button */}
        <button
          onClick={handlePrev}
          disabled={filters.page === 1}
          className="px-5 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50
          disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Sebelumnya
        </button>

        {/* Page Numbers */}
        <div className="flex gap-1">
          {[...Array(pagination.totalPages)].map((_, i) => {
            const page = i + 1;

            if (
              page === 1 ||
              page === pagination.totalPages ||
              Math.abs(page - filters.page) <= 1
            ) {
              return (
                <button
                  key={page}
                  onClick={() => setFilters(prev => ({ ...prev, page }))}
                  className={`w-11 h-11 rounded-xl font-bold transition ${
                    filters.page === page
                      ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg"
                      : "border-2 border-gray-300 hover:bg-red-50"
                  }`}
                >
                  {page}
                </button>
              );
            }

            if (
              page === filters.page - 2 ||
              page === filters.page + 2
            ) {
              return (
                <span key={page} className="px-2 text-gray-400">
                  ...
                </span>
              );
            }

            return null;
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={filters.page === pagination.totalPages}
          className="px-5 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50
          disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Selanjutnya
        </button>

      </div>
    </div>
  </div>
)}


      {/* ================= TABLE ================= */}
      {loading ? (
        <p className="text-gray-500 text-center mt-10">🔄 Memuat data...</p>
      ) : error ? (
        <p className="text-red-500 text-center mt-10">{error}</p>
      ) : data.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          Tidak ada data ditemukan.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <p className="text-gray-600 text-sm mb-2">
            Total Data: {pagination?.total?.toLocaleString("id-ID") ?? 0}
          </p>
          <table className="min-w-full border border-gray-200 rounded-lg bg-white shadow">
            <thead className="bg-red-600 text-white">
              <tr>
                <th className="px-3 py-2 text-left">No</th>
                <th className="px-3 py-2 text-left">Nama</th>
                <th className="px-3 py-2 text-left">NIK</th>
                <th className="px-3 py-2 text-left">Nama Produk</th>
                <th className="px-3 py-2 text-left">Nama UMKM</th>
                <th className="px-3 py-2 text-left">Alamat</th>
                <th className="px-3 py-2 text-left">Kecamatan</th>
                <th className="px-3 py-2 text-left">No HP</th>
                <th className="px-3 py-2 text-left">Jenis Bantuan</th>
                <th className="px-3 py-2 text-left">Tahun</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, i) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-2">
                    {(filters.page - 1) * filters.limit + i + 1}
                  </td>
                  <td className="px-3 py-2">{renderValue(item.nama)}</td>
                  <td className="px-3 py-2">{renderValue(item.nik)}</td>
                  <td className="px-3 py-2">{renderValue(item.nama_produk)}</td>
                  <td className="px-3 py-2">{renderValue(item.nama_umkm)}</td>
                  <td className="px-3 py-2">{renderValue(item.alamat)}</td>
                  <td className="px-3 py-2">{renderValue(item.kecamatan)}</td>
                  <td className="px-3 py-2">{renderValue(item.no_hp)}</td>
                  <td className="px-3 py-2">
                    {renderValue(item.jenis_alat_bantu)}
                  </td>
                  <td className="px-3 py-2">{renderValue(item.tahun)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


    </div>
  );
}
