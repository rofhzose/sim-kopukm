import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import TableBantuan from "../components/BantuanTable";

export default function BantuanPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Filter options
  const [kecamatanList, setKecamatanList] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const [tahunList, setTahunList] = useState([]);

  // 🔹 Filter states
  const [filters, setFilters] = useState({
    search: "",
    kecamatan: "",
    jenis_alat_bantu: "",
    tahun: "",
    page: 1,
  });

  // ✅ Fetch dropdown filter
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/bantuan-filter");
        if (res.data.success) {
          setKecamatanList(res.data.data.kecamatan);
          setJenisList(res.data.data.jenis_alat_bantu);
          setTahunList(res.data.data.tahun);
        }
      } catch (err) {
        console.error("❌ Gagal memuat filter bantuan:", err);
      }
    };
    fetchFilters();
  }, []);

  // ✅ Fetch data utama
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.kecamatan) params.append("kecamatan", filters.kecamatan);
      if (filters.jenis_alat_bantu)
        params.append("jenis_alat_bantu", filters.jenis_alat_bantu);
      if (filters.tahun) params.append("tahun", filters.tahun);
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
      setError("Tidak dapat terhubung ke server bantuan.");
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
      <h1 className="text-2xl font-bold mb-4 text-blue-600">
        🎁 Data Bantuan UMKM
      </h1>

      {/* =================== FILTER BAR =================== */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex flex-wrap items-center gap-4 border">
        {/* Search */}
        <input
          type="text"
          placeholder="Cari nama / UMKM / produk..."
          value={filters.search}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
          }
          className="border rounded-lg px-3 py-2 w-64 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        {/* Kecamatan */}
        <select
          value={filters.kecamatan}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              kecamatan: e.target.value,
              page: 1,
            }))
          }
          className="border rounded-lg px-3 py-2 w-52 focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option value="">Semua Kecamatan</option>
          {kecamatanList.map((kec) => (
            <option key={kec} value={kec}>
              {kec}
            </option>
          ))}
        </select>

        {/* Jenis Alat Bantu */}
        <select
          value={filters.jenis_alat_bantu}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              jenis_alat_bantu: e.target.value,
              page: 1,
            }))
          }
          className="border rounded-lg px-3 py-2 w-52 focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option value="">Semua Jenis Bantuan</option>
          {jenisList.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>

        {/* Tahun */}
        <select
          value={filters.tahun}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, tahun: e.target.value, page: 1 }))
          }
          className="border rounded-lg px-3 py-2 w-36 focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option value="">Semua Tahun</option>
          {tahunList.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Tombol filter */}
        <button
          onClick={handleApplyFilter}
          disabled={loading}
          className={`${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
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
        <TableBantuan data={data} />
      )}

      {/* =================== PAGINATION =================== */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-4">
          <button
            onClick={handlePrev}
            disabled={filters.page === 1}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
          >
            ⬅️ Prev
          </button>

          <span className="text-gray-700 font-medium">
            Halaman {pagination.page} dari {pagination.totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={filters.page === pagination.totalPages}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
          >
            Next ➡️
          </button>
        </div>
      )}
    </div>
  );
}
