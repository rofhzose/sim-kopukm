// src/components/EditableHirarkiCRUD.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

function SmallBtn({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-2 py-1 text-sm rounded ${className}`}
    >
      {children}
    </button>
  );
}

function ArrayEditor({ label, values = [], onChange }) {
  const add = () => onChange([...(values || []), ""]);
  const setAt = (i, v) => onChange(values.map((it, idx) => (idx === i ? v : it)));
  const removeAt = (i) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="font-medium">{label}</div>
        <SmallBtn onClick={add} className="border bg-white">
          <Plus size={14} />
          Tambah
        </SmallBtn>
      </div>
      <div className="space-y-2">
        {(values || []).map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={v}
              onChange={(e) => setAt(i, e.target.value)}
              className="flex-1 rounded border p-2"
            />
            <SmallBtn onClick={() => removeAt(i)} className="border text-red-600">
              <Trash2 size={14} />
            </SmallBtn>
          </div>
        ))}
      </div>
    </div>
  );
}

function NestedListEditor({ label, items = [], onChange }) {
  const addItem = () => onChange([...(items || []), { nama: "", indikator: [] }]);
  const setItem = (i, obj) => onChange(items.map((it, idx) => (idx === i ? obj : it)));
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">{label}</div>
        <SmallBtn onClick={addItem} className="border bg-white">
          <Plus size={14} /> Tambah
        </SmallBtn>
      </div>

      <div className="space-y-3">
        {(items || []).map((it, i) => (
          <div key={i} className="border rounded p-3">
            <div className="flex items-start gap-2">
              <input
                value={it.nama}
                onChange={(e) => setItem(i, { ...it, nama: e.target.value })}
                className="flex-1 rounded border p-2"
                placeholder="Nama"
              />
              <SmallBtn onClick={() => removeItem(i)} className="border text-red-600">
                <Trash2 size={14} />
              </SmallBtn>
            </div>

            <div className="mt-2">
              <ArrayEditor
                label="Indikator"
                values={it.indikator || []}
                onChange={(newArr) => setItem(i, { ...it, indikator: newArr })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EditableHirarkiCRUD() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingItem, setEditingItem] = useState(null); // object being edited or null
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/hirarki"); // sesuaikan ke /api/hirarki jika perlu
      const raw = res.data || [];

      // normalize each row into a consistent shape: top-level keys (visi, misi, etc.)
      const normalized = raw.map((r) => {
        let payload = {};
        if (r.data && typeof r.data === "object") {
          payload = r.data;
        } else if (r.data && typeof r.data === "string") {
          try { payload = JSON.parse(r.data); } catch { payload = {}; }
        } else {
          // if backend already returned top-level keys
          payload = { ...r };
          delete payload.id;
          delete payload.title;
          delete payload.created_at;
          delete payload.updated_at;
          delete payload.created_by;
        }

        return {
          id: r.id,
          title: r.title ?? payload.title ?? `Hirarki #${r.id}`,
          created_at: r.created_at ?? r.createdAt,
          updated_at: r.updated_at ?? r.updatedAt,
          created_by: r.created_by ?? r.createdBy,
          visi: payload.visi || [],
          misi: payload.misi || [],
          tujuan_rpjmd: payload.tujuan_rpjmd || payload.tujuan || [],
          sasaran_strategis: payload.sasaran_strategis || payload.sasaran || [],
          tujuan_pd: payload.tujuan_pd || payload.tujuan_perangkat_daerah || [],
          // NEW: sasaran_perangkat_daerah
          sasaran_pd: payload.sasaran_pd || payload.sasaranPerangkatDaerah || [],
          // keep original data object
          data: payload,
        };
      });

      setList(normalized);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingItem({
      title: "",
      visi: [""],
      misi: [""],
      tujuan_rpjmd: [""],
      sasaran_strategis: [],
      tujuan_pd: [],
      sasaran_pd: [], // NEW
    });
  }

  function openEdit(item) {
    // clone to avoid mutating state
    setEditingItem(JSON.parse(JSON.stringify(item)));
  }

  function closeEditor() {
    setEditingItem(null);
  }

  async function handleSave() {
    const payload = { ...editingItem };
    // backend expects payload.data OR top-level shape depending on controller.
    // We'll send payload as { title, data: { ... } } to be safe.
    const body = {
      title: payload.title ?? null,
      data: {
        visi: payload.visi || [],
        misi: payload.misi || [],
        tujuan_rpjmd: payload.tujuan_rpjmd || [],
        sasaran_strategis: payload.sasaran_strategis || [],
        tujuan_pd: payload.tujuan_pd || [],
        sasaran_pd: payload.sasaran_pd || [], // NEW: include sasaran_pd
      },
    };

    try {
      if (payload.id) {
        await axiosInstance.put(`/hirarki/${payload.id}`, body);
      } else {
        await axiosInstance.post(`/hirarki`, body);
      }
      closeEditor();
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus item ini?")) return;
    try {
      await axiosInstance.delete(`/hirarki/${id}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Hirarki (Editable)</h2>
        <div className="flex gap-2">
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-green-600 text-white">
            <Plus size={14} /> Tambah Baru
          </button>
          <button onClick={fetchAll} className="inline-flex items-center gap-2 px-3 py-2 rounded border">
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white border rounded">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : error ? (
          <div className="p-4 text-red-600">Error: {error}</div>
        ) : list.length === 0 ? (
          <div className="p-4">Belum ada data. Klik "Tambah Baru" untuk membuat.</div>
        ) : (
          <div className="divide-y">
            {list.map((it) => (
              <div key={it.id} className="p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedId(expandedId === it.id ? null : it.id)}
                      className="p-2 rounded hover:bg-gray-100"
                    >
                      {expandedId === it.id ? <ChevronDown /> : <ChevronRight />}
                    </button>
                    <div>
                      <div className="font-medium">{it.title || `Hirarki #${it.id}`}</div>
                      <div className="text-sm text-gray-500">Visi: {(it.visi || []).slice(0, 2).join("; ")}</div>
                    </div>
                  </div>

                  {expandedId === it.id && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <div className="font-semibold">Visi</div>
                        <ul className="list-disc ml-5 text-sm">{(it.visi || []).map((v, idx) => <li key={idx}>{v}</li>)}</ul>
                      </div>

                      <div>
                        <div className="font-semibold">Misi</div>
                        <ul className="list-disc ml-5 text-sm">{(it.misi || []).map((v, idx) => <li key={idx}>{v}</li>)}</ul>
                      </div>

                      <div>
                        <div className="font-semibold">Sasaran Strategis</div>
                        <div className="ml-2">
                          {(it.sasaran_strategis || []).map((s, si) => (
                            <div key={si} className="mb-2">
                              <div className="font-medium">{s.nama || s.title || `Sasaran #${si + 1}`}</div>
                              <ul className="list-disc ml-5 text-sm">{(s.indikator || []).map((ind, ii) => <li key={ii}>{ind}</li>)}</ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold">Tujuan Perangkat Daerah</div>
                        <div className="ml-2">
                          {(it.tujuan_pd || []).map((t, ti) => (
                            <div key={ti} className="mb-2">
                              <div className="font-medium">{t.nama || t.title || `Tujuan #${ti + 1}`}</div>
                              <ul className="list-disc ml-5 text-sm">{(t.indikator || []).map((ind, ii) => <li key={ii}>{ind}</li>)}</ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* NEW: Sasaran Perangkat Daerah (read-only display) */}
                      <div>
                        <div className="font-semibold">Sasaran Perangkat Daerah</div>
                        <div className="ml-2">
                          {(it.sasaran_pd || []).map((s, si) => (
                            <div key={si} className="mb-2">
                              <div className="font-medium">{s.nama || s.title || `Sasaran PD #${si + 1}`}</div>
                              <ul className="list-disc ml-5 text-sm">{(s.indikator || []).map((ind, ii) => <li key={ii}>{ind}</li>)}</ul>
                            </div>
                          ))}
                          {(it.sasaran_pd || []).length === 0 && (
                            <div className="text-sm text-gray-500">Belum ada sasaran perangkat daerah.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-none flex items-center gap-2">
                  <button onClick={() => openEdit(it)} className="p-2 rounded border">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(it.id)} className="p-2 rounded border text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor drawer/modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 grid place-items-end">
          <div className="w-full md:w-3/4 lg:w-2/3 bg-white border-l shadow-lg h-full overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">{editingItem.id ? "Edit Hirarki" : "Buat Hirarki Baru"}</div>
              <div className="flex items-center gap-2">
                <button onClick={closeEditor} className="p-2 rounded border">
                  <X />
                </button>
                <button onClick={handleSave} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white">
                  <Save size={14} /> Simpan
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Label / Judul</label>
                <input
                  value={editingItem.title || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full rounded border p-2"
                  placeholder="Contoh: RPJMD 2024-2028"
                />
              </div>

              <ArrayEditor
                label="Visi"
                values={editingItem.visi}
                onChange={(newArr) => setEditingItem({ ...editingItem, visi: newArr })}
              />

              <ArrayEditor
                label="Misi"
                values={editingItem.misi}
                onChange={(newArr) => setEditingItem({ ...editingItem, misi: newArr })}
              />

              <ArrayEditor
                label="Tujuan RPJMD"
                values={editingItem.tujuan_rpjmd}
                onChange={(newArr) => setEditingItem({ ...editingItem, tujuan_rpjmd: newArr })}
              />

              <NestedListEditor
                label="Sasaran Strategis"
                items={editingItem.sasaran_strategis}
                onChange={(newItems) => setEditingItem({ ...editingItem, sasaran_strategis: newItems })}
              />

              <NestedListEditor
                label="Tujuan Perangkat Daerah"
                items={editingItem.tujuan_pd}
                onChange={(newItems) => setEditingItem({ ...editingItem, tujuan_pd: newItems })}
              />

              {/* NEW: editable Sasaran Perangkat Daerah */}
              <NestedListEditor
                label="Sasaran Perangkat Daerah"
                items={editingItem.sasaran_pd}
                onChange={(newItems) => setEditingItem({ ...editingItem, sasaran_pd: newItems })}
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={closeEditor} className="px-4 py-2 rounded border">Batal</button>
              <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
