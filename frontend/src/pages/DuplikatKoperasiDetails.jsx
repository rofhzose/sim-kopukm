// src/pages/DuplikatKoperasiDetails.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

export default function DuplikatKoperasiDetails() {
  const [params] = useSearchParams();
  const nikParam = params.get("nik");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(Number(params.get("page") || 1));
  const [limit, setLimit] = useState(Number(params.get("limit") || 50));
  const [totalRows, setTotalRows] = useState(null);

  const navigate = useNavigate();

  // endpoints fallback (try without /api first because axiosInstance may already include /api)
  const endpoints = [
    "/dashboard/koperasi-duplikat/details",
    "/dashboard/koperasi-duplikat-details",
    "/api/dashboard/koperasi-duplikat/details",
    "/api/dashboard/koperasi-duplikat-details",
    "/api/koperasi-duplikat/details",
    "/koperasi-duplikat/details",
    "/api/koperasi-duplikat-details",
    "/koperasi-duplikat-details",
  ];

  // clean nik helper
  const cleanNik = (raw) => String(raw ?? "").trim().replace(/^'+|'+$/g, "").replace(/^"+|"+$/g, "");

  const fetchData = useCallback(async () => {
    const nik = cleanNik(nikParam);
    if (!nik) {
      setError("NIK tidak ditemukan.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    let lastErr = null;
    let res = null;

    for (const ep of endpoints) {
      try {
        // request with clean nik
        res = await axiosInstance.get(ep, { params: { nik, page, limit } });
        if (res?.data) break;
      } catch (err) {
        lastErr = err;
      }
    }

    if (!res || !res.data) {
      setError(lastErr?.response?.data?.message || lastErr?.message || "Gagal memuat detail duplikat dari server.");
      setLoading(false);
      return;
    }

    try {
      const payload = res.data;
      let resultRows = [];
      let total = null;
      let currentPage = page;
      let perPage = limit;

      if (payload.data?.rows) {
        resultRows = payload.data.rows;
        total = payload.data.total_rows ?? payload.data.total ?? payload.data.count ?? null;
        currentPage = payload.data.page ?? page;
        perPage = payload.data.limit ?? limit;
      } else if (payload.rows) {
        resultRows = payload.rows;
        total = payload.total_rows ?? payload.total ?? null;
      } else if (Array.isArray(payload.data)) {
        resultRows = payload.data;
        total = payload.data.length;
      } else if (Array.isArray(payload)) {
        resultRows = payload;
        total = payload.length;
      } else {
        resultRows = payload.data ?? [];
        total = payload.total ?? payload.data?.total ?? resultRows.length;
      }

      setRows(resultRows || []);
      setTotalRows(total ?? (resultRows.length || 0));
      setPage(currentPage);
      setLimit(perPage);
    } catch (err) {
      console.error("Normalize detail duplikat error:", err, res?.data);
      setError("Format response tidak dikenali.");
    } finally {
      setLoading(false);
    }
  }, [nikParam, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    if (!rows || !rows.length) return;
    const cols = Object.keys(rows[0]);
    const header = cols.map((c) => `"${c}"`).join(",");
    const lines = rows.map((r) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `duplikat_koperasi_${cleanNik(nikParam) || "unknown"}_page_${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => p + 1);

  if (loading) return <p className="text-center mt-10">🔄 Memuat detail...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">Detail Duplikat Koperasi</h1>
          <p className="text-sm text-gray-600 mt-1">NIK: <span className="font-mono">{cleanNik(nikParam) || "—"}</span></p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">⬅ Kembali</button>
          <button onClick={() => { setPage(1); fetchData(); }} className="px-3 py-2 bg-white border rounded hover:bg-gray-50">Refresh</button>
          <button onClick={handleExport} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={!rows || rows.length === 0}>Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 border">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left font-medium">No</th>
                <th className="px-4 py-3 text-left font-medium">Nama Koperasi</th>
                <th className="px-4 py-3 text-left font-medium">NIK</th>
                <th className="px-4 py-3 text-left font-medium">Jenis</th>
                <th className="px-4 py-3 text-left font-medium">Kecamatan</th>
                <th className="px-4 py-3 text-left font-medium">Kelurahan</th>
                <th className="px-4 py-3 text-left font-medium">Alamat</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id ?? r.nomor_induk_koperasi ?? i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 align-top">{(page - 1) * limit + i + 1}</td>
                  <td className="px-4 py-3">{r.nama_koperasi ?? r.nama ?? "—"}</td>
                  <td className="px-4 py-3 font-mono">{r.nomor_induk_koperasi ?? r.nik ?? "—"}</td>
                  <td className="px-4 py-3">{r.jenis_koperasi ?? "—"}</td>
                  <td className="px-4 py-3">{r.kecamatan ?? "—"}</td>
                  <td className="px-4 py-3">{r.kelurahan ?? r.desa ?? "—"}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={r.alamat_lengkap ?? r.alamat ?? ""}>{r.alamat_lengkap ?? r.alamat ?? "—"}</td>
                  <td className="px-4 py-3">{r.status_koperasi ?? "—"}</td>
                  <td className="px-4 py-3">{r.rade_koperasi ?? r.grade_koperasi ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">Menampilkan <strong>{rows.length}</strong> baris{totalRows != null && <span> dari <strong>{totalRows}</strong></span>}</div>

          <div className="flex items-center gap-2">
            <button onClick={handlePrev} disabled={page <= 1} className="px-3 py-2 bg-white border rounded disabled:opacity-50">Prev</button>
            <input type="number" className="w-16 px-2 py-2 border rounded-md text-sm" value={page} onChange={(e) => setPage(Math.max(1, Number(e.target.value || 1)))} />
            <button onClick={handleNext} disabled={rows.length < limit} className="px-3 py-2 bg-white border rounded">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
