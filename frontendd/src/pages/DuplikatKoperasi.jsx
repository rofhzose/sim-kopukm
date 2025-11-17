// src/pages/DuplikatKoperasi.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import DuplikatTableKoperasi from "../components/DuplikatTableKoperasi";

export default function DuplikatKoperasi() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, per_page: 50, total_group: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const qsPage = Number(params.get("page") || 1);
  const qsLimit = Number(params.get("limit") || 50);
  const [filters, setFilters] = useState({ page: qsPage, limit: qsLimit });

  const endpoints = [
    "/api/dashboard/koperasi-duplikat",
    "/dashboard/koperasi-duplikat",
    "/api/koperasi-duplikat",
    "/koperasi-duplikat",
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    let lastErr = null;
    let res = null;

    for (const ep of endpoints) {
      try {
        // server expects (limit, offset) in many implementations
        res = await axiosInstance.get(ep, { params: { limit: filters.limit, offset: (filters.page - 1) * filters.limit } });
        if (res?.data) break;
      } catch (err) {
        lastErr = err;
      }
    }

    if (!res || !res.data) {
      setError(lastErr?.response?.data?.message || lastErr?.message || "Gagal memuat data duplikat koperasi");
      setLoading(false);
      return;
    }

    try {
      const payload = res.data;
      let rows = [];
      let totalGroups = 0;

      if (payload.data?.rows) {
        rows = payload.data.rows;
        totalGroups = payload.data.total_duplikat ?? payload.data.total ?? payload.data.total_group ?? rows.length;
      } else if (Array.isArray(payload.data)) {
        rows = payload.data;
        totalGroups = rows.length;
      } else if (payload.rows) {
        rows = payload.rows;
        totalGroups = payload.total ?? rows.length;
      } else if (Array.isArray(payload)) {
        rows = payload;
        totalGroups = rows.length;
      } else {
        rows = payload.data ?? payload.rows ?? [];
        totalGroups = (payload.data && payload.data.total) ?? payload.total ?? rows.length;
      }

      setData(rows);
      setPagination({
        current_page: filters.page,
        per_page: filters.limit,
        total_group: Number(totalGroups) || rows.length,
      });
    } catch (err) {
      console.error("Normalize duplikat error:", err, res?.data);
      setError("Format response duplikat tidak dikenali");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // keep filters in sync if querystring changed externally
    setFilters({ page: qsPage, limit: qsLimit });
  }, [qsPage, qsLimit]);

  const handleNext = () => setFilters((p) => ({ ...p, page: p.page + 1 }));
  const handlePrev = () => setFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }));

  // Handler: clean NIK then navigate to details route
  const handleViewDetails = (nik) => {
    console.log("Klik Lihat Detail, raw NIK:", nik);
    if (!nik) {
      alert("NIK tidak tersedia untuk grup ini.");
      return;
    }

    // bersihkan kutip tunggal/dobel yang kadang muncul seperti "'3215..."
    const clean = String(nik).trim().replace(/^'+|'+$/g, "").replace(/^"+|"+$/g, "");
    console.log("Navigasi ke details dengan NIK:", clean);

    // navigate to details route (App.jsx should have /duplikat-koperasi/details)
    navigate(`/duplikat-koperasi/details?nik=${encodeURIComponent(clean)}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-indigo-700">🔎 Duplikat Koperasi (Berdasarkan NIK)</h1>
        <div className="flex items-center gap-3">
          {/* Ubah: jangan menggunakan navigate(-1) yang bergantung pada history.
              Arahkan langsung ke route dashboard koperasi (KoperasiSummary.jsx) */}
          <button
            onClick={() => {
              // ganti '/dashboard/koperasi' dengan path yang sesuai jika route Anda berbeda
              navigate("/koperasi", { replace: true });
            }}
            className="px-3 py-2 bg-gray-200 rounded"
          >
            ⬅ Kembali
          </button>
          <button
            onClick={() => {
              setFilters((f) => ({ ...f, page: 1 }));
              fetchData();
            }}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center mt-8">🔄 Memuat data duplikat...</p>
      ) : error ? (
        <p className="text-red-500 text-center mt-8">{error}</p>
      ) : (
        <>
          <DuplikatTableKoperasi data={data} onViewDetails={handleViewDetails} />

          {pagination.total_group > 1 && (
            <div className="flex justify-center items-center mt-6 gap-4">
              <button onClick={handlePrev} disabled={filters.page === 1} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">⬅️ Prev</button>
              <span className="text-gray-700 font-medium">
                Halaman {pagination.current_page} dari {Math.max(1, Math.ceil(pagination.total_group / pagination.per_page))}
              </span>
              <button onClick={handleNext} disabled={data.length < pagination.per_page} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Next ➡️</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
