// src/pages/RenstraPage.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import HirarkiComponents from "../components/HirarkiComponents";
import EditableHirarkiCRUD from "../components/EditableHirarkiCRUD";
import RenstraProgramsComponent from "../components/RenstraProgramsComponent";

export default function RenstraPage() {
  const [list, setList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSelected, setLoadingSelected] = useState(false);
  const [error, setError] = useState(null);
  const [showEditable, setShowEditable] = useState(false);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/hirarki"); // sesuaikan ke /api/hirarki jika server pakai prefix
      const raw = res.data || [];

      // normalize response into consistent shape
      const unified = raw.map((r) => {
        let payload = {};
        if (r.data && typeof r.data === "object") {
          payload = r.data;
        } else if (r.data && typeof r.data === "string") {
          try { payload = JSON.parse(r.data); } catch { payload = {}; }
        } else {
          payload = { ...r };
          delete payload.id;
          delete payload.title;
          delete payload.created_at;
          delete payload.updated_at;
          delete payload.created_by;
        }

        return {
          id: r.id,
          title: r.title ?? payload.title ?? r.title,
          created_at: r.created_at ?? r.createdAt,
          updated_at: r.updated_at ?? r.updatedAt,
          created_by: r.created_by ?? r.createdBy,
          ...payload,
          data: payload,
        };
      });

      setList(unified);

      if (unified.length > 0) {
        setSelectedId(unified[0].id);
        setSelectedData(unified[0]);
      } else {
        setSelectedId(null);
        setSelectedData(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function onSelectChange(id) {
    if (!id) {
      setSelectedId(null);
      setSelectedData(null);
      return;
    }
    setSelectedId(id);
    setSelectedData(null);
    setLoadingSelected(true);
    try {
      const item = list.find((it) => Number(it.id) === Number(id));
      if (item) {
        setSelectedData(item);
      } else {
        const res = await axiosInstance.get(`/hirarki/${id}`);
        const r = res.data;
        let payload = {};
        if (r.data && typeof r.data === "object") payload = r.data;
        else if (r.data && typeof r.data === "string") {
          try { payload = JSON.parse(r.data); } catch { payload = {}; }
        } else payload = { ...r };

        setSelectedData({
          id: r.id,
          title: r.title ?? payload.title,
          ...payload,
          data: payload,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoadingSelected(false);
    }
  }

  if (loading) return <div className="p-6">Loading data hirarki...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header + selector */}
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-2xl font-semibold">Renstra</h1>

        <div>
          <label className="block text-sm text-gray-600">Pilih Hirarki</label>
          <select
            value={selectedId ?? ""}
            onChange={(e) => onSelectChange(e.target.value ? Number(e.target.value) : null)}
            className="border rounded p-2"
          >
            <option value="">-- pilih --</option>
            {list.map((it) => (
              <option key={it.id} value={it.id}>
                {it.title || `Hirarki #${it.id}`}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={fetchList} className="px-3 py-2 rounded border">
            Refresh
          </button>
          <button
            onClick={() => setShowEditable((s) => !s)}
            className="px-3 py-2 rounded bg-blue-600 text-white"
          >
            {showEditable ? "Sembunyikan Editor" : "Buka Editor"}
          </button>
        </div>
      </div>

      {/* Hirarki read-only area */}
      <div className="bg-white p-4 rounded shadow">
        {loadingSelected ? (
          <div>Memuat data terpilih...</div>
        ) : selectedData ? (
          <HirarkiComponents data={selectedData.data ?? selectedData} />
        ) : (
          <div>Silakan pilih hirarki.</div>
        )}
      </div>

      {/* Editable Hirarki (drawer) */}
      {showEditable && (
        <div className="mt-2">
          <EditableHirarkiCRUD />
        </div>
      )}

      {/* Programs / Kegiatan / SubKegiatan table component */}
      <div className="mt-6">
        {/* apiBase: gunakan '/api/programs' jika backend terdaftar di '/api' */}
        <RenstraProgramsComponent apiBase="/programs" />
      </div>
    </div>
  );
}
