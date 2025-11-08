import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { AlertTriangle, Search } from "lucide-react";

export default function TableBantuan() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Filter dropdown data dari API
  const [filterOptions, setFilterOptions] = useState({
    kecamatan: [],
    jenis_alat_bantu: [],
    tahun: [],
    keterangan: [],
    status_profil: [],
  });

  // 🔹 Filter states
  const [filters, setFilters] = useState({
    search: "",
    kecamatan: "",
    jenis_alat_bantu: "",
    tahun: "",
    keterangan: "",
    status_profil: "",
    page: 1,
    limit: 50,
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

  // =============================== 🔹 FETCH DATA
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await axiosInstance.get(`/dashboard/bantuan-list?${params}`);
      if (res.data.success) {
        setData(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setError("Gagal memuat data bantuan.");
      }
    } catch (err) {
      console.error("❌ Error fetching bantuan:", err);
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

  // =============================== 🔹 PAGINATION
  const handleNext = () => {
    if (filters.page < pagination.totalPages)
      setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handlePrev = () => {
    if (filters.page > 1)
      setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  // =============================== 🔹 RESET FILTER
  const handleReset = () => {
    setFilters({
      search: "",
      kecamatan: "",
      jenis_alat_bantu: "",
      tahun: "",
      keterangan: "",
      status_profil: "",
      page: 1,
      limit: 50,
    });
  };

  // =============================== 🔹 Render value (kosong = ikon warning)
  const renderValue = (value) =>
    !value || value === "0" || value === "NULL" ? (
      <div className="flex items-center justify-center text-yellow-500">
        <AlertTriangle size={18} />
      </div>
    ) : (
      value
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        🎁 Data Bantuan UMKM
      </h1>

      {/* =============================== 🔍 FILTER BAR */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center border">
        {/* Search */}
        <div className="flex items-center border rounded-lg px-3 py-2 w-64">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Cari nama / UMKM / produk..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
            }
            className="w-full outline-none text-gray-700"
          />
        </div>

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
          className="border rounded-lg px-3 py-2 text-gray-700"
        >
          <option value="">🏙 Semua Kecamatan</option>
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
          <option value="">🧰 Semua Jenis Bantuan</option>
          {filterOptions.jenis_alat_bantu.map((j) => (
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
          className="border rounded-lg px-3 py-2 text-gray-700"
        >
          <option value="">📅 Semua Tahun</option>
          {filterOptions.tahun.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Keterangan */}
        <select
          value={filters.keterangan}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              keterangan: e.target.value,
              page: 1,
            }))
          }
          className="border rounded-lg px-3 py-2 text-gray-700"
        >
          <option value="">🏷 Semua Keterangan</option>
          {filterOptions.keterangan.map((ket) => (
            <option key={ket} value={ket}>
              {ket}
            </option>
          ))}
        </select>

        {/* Status Profil */}
        <select
          value={filters.status_profil}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              status_profil: e.target.value,
              page: 1,
            }))
          }
          className="border rounded-lg px-3 py-2 text-gray-700"
        >
          {filterOptions.status_profil.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          🔄 Reset
        </button>
      </div>

      {/* =============================== 📋 TABLE */}
      {loading ? (
        <p className="text-gray-500 text-center mt-10">🔄 Memuat data...</p>
      ) : error ? (
        <p className="text-red-500 text-center mt-10">{error}</p>
      ) : data.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          Tidak ada data bantuan ditemukan.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg bg-white shadow">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-3 py-2 text-left">No</th>
                <th className="px-3 py-2 text-left">Nama</th>
                <th className="px-3 py-2 text-left">NIK</th>
                <th className="px-3 py-2 text-left">Nama Produk</th>
                <th className="px-3 py-2 text-left">Nama UMKM</th>
                <th className="px-3 py-2 text-left">Alamat</th>
                <th className="px-3 py-2 text-left">Kecamatan</th>
                <th className="px-3 py-2 text-left">No HP</th>
                <th className="px-3 py-2 text-left">NIB</th>
                <th className="px-3 py-2 text-left">No PIRT</th>
                <th className="px-3 py-2 text-left">No Halal</th>
                <th className="px-3 py-2 text-left">Jenis Alat Bantu</th>
                <th className="px-3 py-2 text-left">Tahun</th>
                <th className="px-3 py-2 text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-blue-50 transition-colors"
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
                  <td className="px-3 py-2">{renderValue(item.nib)}</td>
                  <td className="px-3 py-2">{renderValue(item.no_pirt)}</td>
                  <td className="px-3 py-2">{renderValue(item.no_halal)}</td>
                  <td className="px-3 py-2">{renderValue(item.jenis_alat_bantu)}</td>
                  <td className="px-3 py-2">{renderValue(item.tahun)}</td>
                  <td className="px-3 py-2">{renderValue(item.keterangan)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =============================== 📑 PAGINATION */}
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
            Halaman {pagination.page} / {pagination.totalPages}
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
