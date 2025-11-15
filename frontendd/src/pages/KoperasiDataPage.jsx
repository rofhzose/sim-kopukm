import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";
import TableKoperasi from "../components/TableKoperasi";
import { Download, Search } from "lucide-react";

function toCSV(rows, columns) {
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const lines = rows.map((r) =>
    columns.map((c) => {
      const v = r[c.key] ?? "";
      // escape double quotes
      return `"${String(v).replace(/"/g, '""')}"`;
    }).join(",")
  );
  return [header, ...lines].join("\n");
}

export default function KoperasiDataPage() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  // columns same as TableKoperasi
  const columns = [
    { key: "nomor_induk_koperasi", label: "NIK" },
    { key: "nama_koperasi", label: "Nama Koperasi" },
    { key: "jenis_koperasi", label: "Jenis" },
    { key: "bentuk_koperasi", label: "Bentuk" },
    { key: "kelurahan", label: "Kelurahan/Desa" },
    { key: "kecamatan", label: "Kecamatan" },
    { key: "kelompok_koperasi", label: "Kelompok" },
    { key: "status_koperasi", label: "Status" },
    { key: "alamat_lengkap", label: "Alamat" },
    { key: "kode_pos", label: "Kode Pos" },
    { key: "email_koperasi", label: "Email" },
    { key: "kuk", label: "KUK" },
    { key: "rade_koperasi", label: "Grade" },
  ];

   // --- ganti endpointsToTry ---
  const endpointsToTry = [
    "/koperasi",                   // primary: getKoperasiList controller
    "/dashboard/koperasi",         // alt: if router mounted under /api
    "/dashboard/koperasi-data",    // alt name
    "/dashboard/koperasi",             // alt if mounted without /api
    "/koperasi"                        // fallback
  ];

  // --- ganti fetchData dengan ini ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    let lastErr = null;
    let res = null;

    for (const ep of endpointsToTry) {
      try {
        // pass query params: page, limit, q (search)
        res = await axiosInstance.get(ep, { params: { page, limit, q } });
        // expect res.data to exist. break when success === true or array returned
        if (res?.data && (res.data.success || Array.isArray(res.data) || res.data.rows || res.data.data)) {
          break;
        }
      } catch (err) {
        lastErr = err;
        // continue to next endpoint
      }
    }

    if (!res || !res.data) {
      setError(lastErr?.response?.data?.message || lastErr?.message || "Gagal memuat data koperasi");
      setLoading(false);
      return;
    }

    // Normalize several possible response shapes:
    // 1) { success:true, data:{ rows, total, page, limit } }
    // 2) { rows: [...], total: N, page, limit }
    // 3) array [...]
    const payload = res.data;

    if (payload.success && payload.data && Array.isArray(payload.data.rows)) {
      setData(payload.data.rows);
      setTotal(payload.data.total ?? payload.data.rows.length);
    } else if (Array.isArray(payload)) {
      setData(payload);
      setTotal(payload.length);
    } else if (payload.rows && Array.isArray(payload.rows)) {
      setData(payload.rows);
      setTotal(payload.total ?? payload.rows.length);
    } else if (payload.data && Array.isArray(payload.data)) {
      setData(payload.data);
      setTotal(payload.data.length);
    } else {
      // fallback: try payload.data.rows or payload.data
      const rows = payload.data?.rows ?? payload.rows ?? payload.data ?? [];
      setData(rows);
      setTotal(payload.total ?? payload.data?.total ?? rows.length);
    }

    setLoading(false);
  }, [page, limit, q]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportCsv = () => {
    const csv = toCSV(data, columns);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `koperasi_page_${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 pb-28">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">📋 Data Koperasi Lengkap</h1>
            <p className="text-sm text-gray-500">Tabel item koperasi — pencarian, paging, dan ekspor CSV.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border rounded-lg px-3 py-1">
              <Search className="w-4 h-4 text-gray-500 mr-2" />
              <input
                type="search"
                className="outline-none text-sm"
                placeholder="Cari (nama / NIK / kecamatan...)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(1);
                    fetchData();
                  }
                }}
              />
            </div>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white border rounded-lg px-3 py-2 text-sm"
            >
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
              <option value={200}>200 / page</option>
            </select>

            <button
              onClick={exportCsv}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 border-4 border-slate-100 rounded-full relative">
              <div className="w-16 h-16 border-4 border-slate-700 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="mt-3 text-gray-600 font-medium">Memuat data koperasi...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
            <p className="text-red-700 font-semibold">Gagal: {error}</p>
          </div>
        ) : (
          <>
            <TableKoperasi data={data} page={page} limit={limit} />

            {/* pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Menampilkan halaman <strong>{page}</strong>
                {total != null && (
                  <span>
                    {" "}
                    dari <strong>{Math.ceil(total / limit)}</strong> (total {total} baris)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-2 bg-white border rounded-md disabled:opacity-50"
                >
                  Prev
                </button>

                <input
                  type="number"
                  className="w-16 px-2 py-2 border rounded-md text-sm"
                  value={page}
                  onChange={(e) => setPage(Math.max(1, Number(e.target.value || 1)))}
                />

                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-2 bg-white border rounded-md"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
