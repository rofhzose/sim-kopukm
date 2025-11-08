import React, { useEffect, useState } from "react";
import { AlertTriangle, Search } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

export default function BantuanTidakTerdaftarTable() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Filter dropdown options
  const [filterOptions, setFilterOptions] = useState({
    tahun: [],
    kecamatan: [],
    jenis_alat_bantu: [],
  });

  // 🔹 Filter state
  const [filters, setFilters] = useState({
    search: "",
    tahun: "",
    kecamatan: "",
    jenis_alat_bantu: "",
    penerima: "semua", // semua | satu_kali | ganda
    page: 1,
    limit: 50,
  });

  // ✅ Fetch daftar filter
  const fetchFilters = async () => {
    try {
      const res = await axiosInstance.get("/dashboard/bantuan-tidak-terdaftar-filters");
      if (res.data.success) {
        setFilterOptions(res.data.data);
      }
    } catch (err) {
      console.error("❌ Gagal memuat filter:", err);
    }
  };

  // ✅ Fetch data utama
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== "" && key !== "limit") params.append(key, val);
      });
      params.append("limit", filters.limit);

      const res = await axiosInstance.get(`/dashboard/bantuan-tidak-terdaftar-list?${params}`);
      if (res.data.success) {
        setData(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setError("Gagal memuat data bantuan tidak terdaftar.");
      }
    } catch (err) {
      console.error("❌ Error fetch:", err);
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

  // 🔄 Reset filter
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

  // ✅ Render nilai kosong (warning icon)
  const renderValue = (value) =>
    !value || value === "0" || value === "NULL" ? (
      <div className="flex items-center justify-center text-yellow-500">
        <AlertTriangle size={18} />
      </div>
    ) : (
      value
    );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-red-700 mb-4">
        🚨 Penerima Bantuan Tidak Terdaftar
      </h1>

      {/* =================== FILTER BAR =================== */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex flex-wrap items-center gap-4 border">
        {/* Search */}
        <div className="flex items-center border rounded-lg px-3 py-2 w-64">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Cari nama / produk / kecamatan..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
            }
            className="w-full outline-none text-gray-700"
          />
        </div>

        {/* Tahun */}
        <select
          value={filters.tahun}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, tahun: e.target.value, page: 1 }))
          }
          className="border rounded-lg px-3 py-2 text-gray-700"
        >
          <option value="">Semua Tahun</option>
          {filterOptions.tahun.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Kecamatan */}
        <select
          value={filters.kecamatan}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, kecamatan: e.target.value, page: 1 }))
          }
          className="border rounded-lg px-3 py-2 text-gray-700"
        >
          <option value="">Semua Kecamatan</option>
          {filterOptions.kecamatan.map((k) => (
            <option key={k} value={k}>
              {k}
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
          className="border rounded-lg px-3 py-2 text-gray-700"
        >
          <option value="">Semua Jenis Bantuan</option>
          {filterOptions.jenis_alat_bantu.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>

        {/* Jenis Penerima */}
        <select
          value={filters.penerima}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, penerima: e.target.value, page: 1 }))
          }
          className="border rounded-lg px-3 py-2 text-gray-700"
        >
          <option value="semua">Semua Penerima</option>
          <option value="satu_kali">Penerima 1x</option>
          <option value="ganda">Penerima Ganda</option>
        </select>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          🔄 Reset
        </button>
      </div>

      {/* =================== TABLE =================== */}
      {loading ? (
        <p className="text-gray-500 text-center mt-10">🔄 Memuat data...</p>
      ) : error ? (
        <p className="text-red-500 text-center mt-10">{error}</p>
      ) : data.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          Tidak ada data penerima bantuan tidak terdaftar.
        </p>
      ) : (
        <div className="overflow-x-auto mt-4">
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
                <th className="px-3 py-2 text-left">No. HP</th>
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
                  <td className="px-3 py-2">{(filters.page - 1) * filters.limit + i + 1}</td>
                  <td className="px-3 py-2">{renderValue(item.nama)}</td>
                  <td className="px-3 py-2">{renderValue(item.nik)}</td>
                  <td className="px-3 py-2">{renderValue(item.nama_produk)}</td>
                  <td className="px-3 py-2">{renderValue(item.nama_umkm)}</td>
                  <td className="px-3 py-2">{renderValue(item.alamat)}</td>
                  <td className="px-3 py-2">{renderValue(item.kecamatan)}</td>
                  <td className="px-3 py-2">{renderValue(item.no_hp)}</td>
                  <td className="px-3 py-2">{renderValue(item.jenis_alat_bantu)}</td>
                  <td className="px-3 py-2">{renderValue(item.tahun)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =================== PAGINATION =================== */}
      {pagination?.totalPages > 1 && (
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
