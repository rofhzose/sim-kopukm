import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import TableUMKM from "../components/UMKMTable";

export default function UMKMPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleNext = () => {
    if (filters.page < pagination.totalPages)
      setFilters({ ...filters, page: filters.page + 1 });
  };

  const handlePrev = () => {
    if (filters.page > 1) setFilters({ ...filters, page: filters.page - 1 });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">
        📊 Data UMKM Kabupaten Karawang
      </h1>

      {/* =================== FILTER BAR =================== */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex flex-wrap items-center gap-4 border">
        {/* Search */}
        <input
          type="text"
          placeholder="Cari nama / usaha / NIB..."
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value })
          }
          className="border rounded-lg px-3 py-2 w-64 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        {/* Kecamatan */}
        <select
          value={filters.kecamatan}
          onChange={(e) =>
            setFilters({ ...filters, kecamatan: e.target.value })
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

        {/* Jenis UKM */}
        <select
          value={filters.jenis_ukm}
          onChange={(e) =>
            setFilters({ ...filters, jenis_ukm: e.target.value })
          }
          className="border rounded-lg px-3 py-2 w-48 focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option value="">Semua Jenis UKM</option>
          {jenisList.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>

        <button
          onClick={handleApplyFilter}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Terapkan Filter
        </button>
      </div>

      {/* =================== TABEL =================== */}
      {loading ? (
        <p className="text-gray-500 text-center mt-10">🔄 Memuat data...</p>
      ) : error ? (
        <p className="text-red-500 text-center mt-10">{error}</p>
      ) : (
        <TableUMKM data={data} />
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
