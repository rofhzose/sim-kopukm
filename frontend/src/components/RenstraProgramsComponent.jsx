// src/components/RenstraProgramsComponent.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";

// Modal
function Modal({ title, open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg overflow-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="px-2 py-1 rounded border">Tutup</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function fmtRp(v) {
  if (v === null || v === undefined) return "-";
  const n = Number(v);
  if (isNaN(n)) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function RenstraProgramsComponent({ apiBase = "/programs" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add modals
  const [openAddProgram, setOpenAddProgram] = useState(false);
  const [openAddKegiatan, setOpenAddKegiatan] = useState(false);
  const [openAddSub, setOpenAddSub] = useState(false);

  // Edit modals
  const [openEditProgram, setOpenEditProgram] = useState(false);
  const [openEditKegiatan, setOpenEditKegiatan] = useState(false);
  const [openEditSub, setOpenEditSub] = useState(false);

  // forms for create
  const [formProgram, setFormProgram] = useState({ kodering: "", name: "", indikator: "", output: "", keterangan: "" });
  const [formKegiatan, setFormKegiatan] = useState({ program_id: null, kodering: "", name: "", indikator: "", output: "", keterangan: "" });
  const [formSub, setFormSub] = useState({ kegiatan_id: null, kodering: "", name: "", output: "", indikator: "", satuan: "", keterangan: "", rencana: {} });

  // forms for edit
  const [editProgram, setEditProgram] = useState(null);
  const [editKegiatan, setEditKegiatan] = useState(null);
  const [editSub, setEditSub] = useState(null);

  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [expandedKegiatans, setExpandedKegiatans] = useState({});

  // YEARS dynamic
  const startYear = new Date().getFullYear() + 1;
  const YEARS = Array.from({ length: 5 }, (_, i) => startYear + i);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(apiBase);
      setData(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleProgram(id) { setExpandedPrograms((s) => ({ ...s, [id]: !s[id] })); }
  function toggleKegiatan(id) { setExpandedKegiatans((s) => ({ ...s, [id]: !s[id] })); }

  // CREATE handlers
  async function submitProgram(e) {
    e.preventDefault();
    try {
      await axiosInstance.post(apiBase, formProgram);
      setOpenAddProgram(false);
      setFormProgram({ kodering: "", name: "", indikator: "", output: "", keterangan: "" });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }

  async function submitKegiatan(e) {
    e.preventDefault();
    try {
      await axiosInstance.post(`${apiBase}/kegiatans`, formKegiatan);
      setOpenAddKegiatan(false);
      setFormKegiatan({ program_id: null, kodering: "", name: "", indikator: "", output: "", keterangan: "" });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }

  async function submitSub(e) {
    e.preventDefault();
    try {
      // normalize rencana
      const r = {};
      YEARS.forEach((y) => {
        const entry = formSub.rencana?.[y] || {};
        r[y] = {
          target: entry.target === "" || entry.target === undefined ? null : Number(entry.target),
          pagu: entry.pagu === "" || entry.pagu === undefined ? null : Number(entry.pagu),
        };
      });

      await axiosInstance.post(`${apiBase}/subkegiatans`, { ...formSub, rencana: r });
      setOpenAddSub(false);
      setFormSub({ kegiatan_id: null, kodering: "", name: "", output: "", indikator: "", satuan: "", keterangan: "", rencana: {} });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }

  // EDIT handlers (PATCH)
  async function submitEditProgram(e) {
    e.preventDefault();
    try {
      const id = editProgram.id;
      const body = {
        kodering: editProgram.kodering,
        name: editProgram.name,
        indikator: editProgram.indikator,
        output: editProgram.output,
        keterangan: editProgram.keterangan,
      };
      await axiosInstance.patch(`${apiBase}/${id}`, body);
      setOpenEditProgram(false);
      setEditProgram(null);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }

  async function submitEditKegiatan(e) {
    e.preventDefault();
    try {
      const id = editKegiatan.id;
      const body = {
        kodering: editKegiatan.kodering,
        name: editKegiatan.name,
        indikator: editKegiatan.indikator,
        output: editKegiatan.output,
        keterangan: editKegiatan.keterangan,
      };
      await axiosInstance.patch(`${apiBase}/kegiatans/${id}`, body);
      setOpenEditKegiatan(false);
      setEditKegiatan(null);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }

  async function submitEditSub(e) {
    e.preventDefault();
    try {
      const id = editSub.id;
      // ensure rencana normalized
      const r = {};
      YEARS.forEach((y) => {
        const entry = editSub.rencana?.[y] || {};
        r[y] = {
          target: entry.target === "" || entry.target === undefined ? null : Number(entry.target),
          pagu: entry.pagu === "" || entry.pagu === undefined ? null : Number(entry.pagu),
        };
      });

      const body = {
        kodering: editSub.kodering,
        name: editSub.name,
        output: editSub.output,
        indikator: editSub.indikator,
        satuan: editSub.satuan,
        keterangan: editSub.keterangan,
        rencana: r,
      };
      await axiosInstance.patch(`${apiBase}/subkegiatans/${id}`, body);
      setOpenEditSub(false);
      setEditSub(null);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }

  // DELETE handlers
  async function deleteProgram(id) {
    if (!confirm("Hapus Program ini beserta semua kegiatan & sub-kegiatan?")) return;
    try {
      await axiosInstance.delete(`${apiBase}/${id}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }

  async function deleteKegiatan(id) {
    if (!confirm("Hapus Kegiatan ini beserta semua sub-kegiatan?")) return;
    try {
      await axiosInstance.delete(`${apiBase}/kegiatans/${id}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }

  async function deleteSub(id) {
    if (!confirm("Hapus SubKegiatan ini?")) return;
    try {
      await axiosInstance.delete(`${apiBase}/subkegiatans/${id}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }

  // helpers to open edit modals with prefilled data
  function openEditProgramModal(p) {
    setEditProgram({ ...p });
    setOpenEditProgram(true);
  }
  function openEditKegiatanModal(k) {
    setEditKegiatan({ ...k });
    setOpenEditKegiatan(true);
  }
  function openEditSubModal(s, parentKegiatan) {
    // s.rencana may be object; ensure it's present as editable object
    setEditSub({ ...s, rencana: s.rencana || {} });
    setOpenEditSub(true);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Renstra — Program / Kegiatan / SubKegiatan</h1>
        <div className="flex gap-2">
          <button onClick={() => setOpenAddProgram(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-green-600 text-white">
            <Plus size={14} /> Tambah Program
          </button>
          <button onClick={fetchAll} className="px-3 py-2 rounded border">Refresh</button>
        </div>
      </div>

      <div className="bg-white border rounded overflow-auto">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : error ? (
          <div className="p-4 text-red-600">Error: {error}</div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left bg-gray-50">
                <th rowSpan={2} className="px-4 py-2">Program / Kegiatan / SubKegiatan</th>
                <th rowSpan={2} className="px-4 py-2">Output</th>
                <th rowSpan={2} className="px-4 py-2">Indikator</th>
                <th rowSpan={2} className="px-4 py-2">Satuan</th>
                <th colSpan={YEARS.length * 2} className="px-4 py-2 text-center">Rencana Tahunan</th>
                <th rowSpan={2} className="px-4 py-2">Keterangan</th>
                <th rowSpan={2} className="px-4 py-2">Aksi</th>
              </tr>
              <tr className="text-left bg-gray-50">
                {YEARS.map((y) => (
                  <React.Fragment key={y}>
                    <th className="px-2 py-2 text-center">Tgt {y}</th>
                    <th className="px-4 py-2 text-center">Pagu {y}</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((p) => (
                <React.Fragment key={`p-${p.id}`}>
                  <tr className="border-t">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleProgram(p.id)} className="p-1 rounded hover:bg-gray-100">
                          {expandedPrograms[p.id] ? <ChevronDown /> : <ChevronRight />}
                        </button>
                        <div>
                          <div className="font-medium">{p.kodering ? `${p.kodering} — ${p.name}` : p.name}</div>
                          <div className="text-sm text-gray-500">Program</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">{p.output}</td>
                    <td className="px-4 py-3">{p.indikator}</td>
                    <td className="px-4 py-3">-</td>

                    {YEARS.map((y) => (
                      <React.Fragment key={y}>
                        <td className="px-2 py-3 text-center">{p.rencana?.[y]?.target ?? "-"}</td>
                        <td className="px-4 py-3 text-right">{fmtRp(p.rencana?.[y]?.pagu)}</td>
                      </React.Fragment>
                    ))}

                    <td className="px-4 py-3">{p.keterangan}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setFormKegiatan({ ...formKegiatan, program_id: p.id }); setOpenAddKegiatan(true); }} className="px-3 py-1 rounded border">Tambah Kegiatan</button>
                        <button onClick={() => openEditProgramModal(p)} className="px-3 py-1 rounded border">Edit</button>
                        <button onClick={() => deleteProgram(p.id)} className="px-3 py-1 rounded border text-red-600">Hapus</button>
                      </div>
                    </td>
                  </tr>

                  {expandedPrograms[p.id] && (p.kegiatans || []).map((k) => (
                    <React.Fragment key={`k-${k.id}`}>
                      <tr className="bg-gray-50">
                        <td className="px-8 py-2">
                          <div className="flex items-center gap-3">
                            <button onClick={() => toggleKegiatan(k.id)} className="p-1 rounded hover:bg-gray-100">
                              {expandedKegiatans[k.id] ? <ChevronDown /> : <ChevronRight />}
                            </button>
                            <div>
                              <div className="font-medium">{k.kodering ? `${k.kodering} — ${k.name}` : k.name}</div>
                              <div className="text-sm text-gray-500">Kegiatan</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-2">{k.output}</td>
                        <td className="px-4 py-2">{k.indikator}</td>
                        <td className="px-4 py-2">-</td>

                        {YEARS.map((y) => (
                          <React.Fragment key={y}>
                            <td className="px-2 py-2 text-center">{k.rencana?.[y]?.target ?? "-"}</td>
                            <td className="px-4 py-2 text-right">{fmtRp(k.rencana?.[y]?.pagu)}</td>
                          </React.Fragment>
                        ))}

                        <td className="px-4 py-2">{k.keterangan}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <button onClick={() => { setFormSub({ ...formSub, kegiatan_id: k.id }); setOpenAddSub(true); }} className="px-3 py-1 rounded border">Tambah Sub</button>
                            <button onClick={() => openEditKegiatanModal(k)} className="px-3 py-1 rounded border">Edit</button>
                            <button onClick={() => deleteKegiatan(k.id)} className="px-3 py-1 rounded border text-red-600">Hapus</button>
                          </div>
                        </td>
                      </tr>

                      {expandedKegiatans[k.id] && (k.subkegiatans || []).map((s) => (
                        <tr key={`s-${s.id}`}>
                          <td className="px-12 py-1">
                            <div>
                              <div className="font-medium">{s.kodering ? `${s.kodering} — ${s.name}` : s.name}</div>
                              <div className="text-sm text-gray-500">SubKegiatan</div>
                            </div>
                          </td>

                          <td className="px-4 py-1">{s.output}</td>
                          <td className="px-4 py-1">{s.indikator}</td>
                          <td className="px-4 py-1">{s.satuan || "-"}</td>

                          {YEARS.map((y) => (
                            <React.Fragment key={y}>
                              <td className="px-2 py-1 text-center">{s.rencana?.[y]?.target ?? "-"}</td>
                              <td className="px-4 py-1 text-right">{fmtRp(s.rencana?.[y]?.pagu)}</td>
                            </React.Fragment>
                          ))}

                          <td className="px-4 py-1">{s.keterangan}</td>
                          <td className="px-4 py-1">
                            <div className="flex gap-2">
                              <button onClick={() => openEditSubModal(s, k)} className="px-3 py-1 rounded border">Edit</button>
                              <button onClick={() => deleteSub(s.id)} className="px-3 py-1 rounded border text-red-600">Hapus</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- ADD MODALS (program/kegiatan/sub) --- */}
      <Modal title="Tambah Program" open={openAddProgram} onClose={() => setOpenAddProgram(false)}>
        <form onSubmit={submitProgram} className="space-y-3">
          <div><label className="block text-sm">Kodering</label><input value={formProgram.kodering} onChange={(e) => setFormProgram({ ...formProgram, kodering: e.target.value })} className="w-full border rounded p-2" /></div>
          <div><label className="block text-sm">Nama Program *</label><input required value={formProgram.name} onChange={(e) => setFormProgram({ ...formProgram, name: e.target.value })} className="w-full border rounded p-2" /></div>
          <div><label className="block text-sm">Indikator Program</label><textarea value={formProgram.indikator} onChange={(e) => setFormProgram({ ...formProgram, indikator: e.target.value })} className="w-full border rounded p-2" /></div>
          <div><label className="block text-sm">Output</label><input value={formProgram.output} onChange={(e) => setFormProgram({ ...formProgram, output: e.target.value })} className="w-full border rounded p-2" /></div>
          <div><label className="block text-sm">Keterangan</label><textarea value={formProgram.keterangan} onChange={(e) => setFormProgram({ ...formProgram, keterangan: e.target.value })} className="w-full border rounded p-2" /></div>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpenAddProgram(false)} className="px-3 py-2 rounded border">Batal</button><button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">Simpan</button></div>
        </form>
      </Modal>

      <Modal title="Tambah Kegiatan" open={openAddKegiatan} onClose={() => setOpenAddKegiatan(false)}>
        <form onSubmit={submitKegiatan} className="space-y-3">
          <div><label className="block text-sm">Program</label><input value={data.find(p => p.id === formKegiatan.program_id)?.name || ""} readOnly className="w-full border rounded p-2 bg-gray-100" /></div>
          <div><label className="block text-sm">Kodering</label><input value={formKegiatan.kodering} onChange={(e) => setFormKegiatan({ ...formKegiatan, kodering: e.target.value })} className="w-full border rounded p-2" /></div>
          <div><label className="block text-sm">Nama Kegiatan *</label><input required value={formKegiatan.name} onChange={(e) => setFormKegiatan({ ...formKegiatan, name: e.target.value })} className="w-full border rounded p-2" /></div>
          <div><label className="block text-sm">Output</label><input value={formKegiatan.output} onChange={(e) => setFormKegiatan({ ...formKegiatan, output: e.target.value })} className="w-full border rounded p-2" /></div>
          <div><label className="block text-sm">Indikator Kegiatan</label><textarea value={formKegiatan.indikator} onChange={(e) => setFormKegiatan({ ...formKegiatan, indikator: e.target.value })} className="w-full border rounded p-2" /></div>
          <div><label className="block text-sm">Keterangan</label><textarea value={formKegiatan.keterangan} onChange={(e) => setFormKegiatan({ ...formKegiatan, keterangan: e.target.value })} className="w-full border rounded p-2" /></div>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpenAddKegiatan(false)} className="px-3 py-2 rounded border">Batal</button><button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">Simpan</button></div>
        </form>
      </Modal>

      <Modal title="Tambah SubKegiatan" open={openAddSub} onClose={() => setOpenAddSub(false)}>
        <form onSubmit={submitSub} className="space-y-3">
          <div><label className="block text-sm">Kegiatan</label><input value={(() => { for (const p of data) { const k = (p.kegiatans || []).find(kk => kk.id === formSub.kegiatan_id); if (k) return `${p.kodering ? p.kodering + ' — ' : ''}${k.name}`; } return ""; })()} readOnly className="w-full border rounded p-2 bg-gray-100" /></div>
          <div><label className="block text-sm">Kodering</label><input value={formSub.kodering} onChange={(e) => setFormSub({ ...formSub, kodering: e.target.value })} className="w-full border rounded p-2" /></div>
          <div><label className="block text-sm">Nama SubKegiatan *</label><input required value={formSub.name} onChange={(e) => setFormSub({ ...formSub, name: e.target.value })} className="w-full border rounded p-2" /></div>
          <div><label className="block text-sm">Output</label><input value={formSub.output} onChange={(e) => setFormSub({ ...formSub, output: e.target.value })} className="w-full border rounded p-2" /></div>
          <div><label className="block text-sm">Indikator SubKegiatan</label><textarea value={formSub.indikator} onChange={(e) => setFormSub({ ...formSub, indikator: e.target.value })} className="w-full border rounded p-2" /></div>
          <div><label className="block text-sm">Satuan</label><input value={formSub.satuan} onChange={(e) => setFormSub({ ...formSub, satuan: e.target.value })} className="w-full border rounded p-2" /></div>

          <div className="grid grid-cols-1 gap-3">{YEARS.map((y) => (<div key={y} className="grid grid-cols-2 gap-2"><div><label className="block text-sm">Target {y} (0-100)</label><input type="number" min="0" max="100" value={formSub.rencana?.[y]?.target ?? ""} onChange={(e) => { const v = e.target.value; setFormSub(s => ({ ...s, rencana: { ...(s.rencana || {}), [y]: { ...(s.rencana?.[y] || {}), target: v === "" ? "" : Number(v) } } })); }} className="w-full border rounded p-2" /></div><div><label className="block text-sm">Pagu {y} (Rp)</label><input type="number" min="0" value={formSub.rencana?.[y]?.pagu ?? ""} onChange={(e) => { const v = e.target.value; setFormSub(s => ({ ...s, rencana: { ...(s.rencana || {}), [y]: { ...(s.rencana?.[y] || {}), pagu: v === "" ? "" : Number(v) } } })); }} className="w-full border rounded p-2" /></div></div>))}</div>

          <div><label className="block text-sm">Keterangan</label><textarea value={formSub.keterangan} onChange={(e) => setFormSub({ ...formSub, keterangan: e.target.value })} className="w-full border rounded p-2" /></div>

          <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpenAddSub(false)} className="px-3 py-2 rounded border">Batal</button><button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">Simpan</button></div>
        </form>
      </Modal>

      {/* --- EDIT MODALS (prefilled) --- */}
      <Modal title="Edit Program" open={openEditProgram} onClose={() => { setOpenEditProgram(false); setEditProgram(null); }}>
        {editProgram && (
          <form onSubmit={submitEditProgram} className="space-y-3">
            <div><label className="block text-sm">Kodering</label><input value={editProgram.kodering || ""} onChange={(e) => setEditProgram(p => ({ ...p, kodering: e.target.value }))} className="w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Nama Program *</label><input required value={editProgram.name || ""} onChange={(e) => setEditProgram(p => ({ ...p, name: e.target.value }))} className="w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Indikator Program</label><textarea value={editProgram.indikator || ""} onChange={(e) => setEditProgram(p => ({ ...p, indikator: e.target.value }))} className="w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Output</label><input value={editProgram.output || ""} onChange={(e) => setEditProgram(p => ({ ...p, output: e.target.value }))} className="w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Keterangan</label><textarea value={editProgram.keterangan || ""} onChange={(e) => setEditProgram(p => ({ ...p, keterangan: e.target.value }))} className="w-full border rounded p-2" /></div>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => { setOpenEditProgram(false); setEditProgram(null); }} className="px-3 py-2 rounded border">Batal</button><button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">Simpan</button></div>
          </form>
        )}
      </Modal>

      <Modal title="Edit Kegiatan" open={openEditKegiatan} onClose={() => { setOpenEditKegiatan(false); setEditKegiatan(null); }}>
        {editKegiatan && (
          <form onSubmit={submitEditKegiatan} className="space-y-3">
            <div><label className="block text-sm">Kodering</label><input value={editKegiatan.kodering || ""} onChange={(e) => setEditKegiatan(p => ({ ...p, kodering: e.target.value }))} className="w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Nama Kegiatan *</label><input required value={editKegiatan.name || ""} onChange={(e) => setEditKegiatan(p => ({ ...p, name: e.target.value }))} className="w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Indikator Kegiatan</label><textarea value={editKegiatan.indikator || ""} onChange={(e) => setEditKegiatan(p => ({ ...p, indikator: e.target.value }))} className="w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Output</label><input value={editKegiatan.output || ""} onChange={(e) => setEditKegiatan(p => ({ ...p, output: e.target.value }))} className="w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Keterangan</label><textarea value={editKegiatan.keterangan || ""} onChange={(e) => setEditKegiatan(p => ({ ...p, keterangan: e.target.value }))} className="w-full border rounded p-2" /></div>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => { setOpenEditKegiatan(false); setEditKegiatan(null); }} className="px-3 py-2 rounded border">Batal</button><button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">Simpan</button></div>
          </form>
        )}
      </Modal>

      <Modal title="Edit SubKegiatan" open={openEditSub} onClose={() => { setOpenEditSub(false); setEditSub(null); }}>
        {editSub && (
          <form onSubmit={submitEditSub} className="space-y-3">
            <div><label className="block text-sm">Kegiatan</label><input value={(() => { for (const p of data) { const k = (p.kegiatans || []).find(kk => kk.id === editSub.kegiatan_id); if (k) return `${p.kodering ? p.kodering + ' — ' : ''}${k.name}`; } return ""; })()} readOnly className="w-full border rounded p-2 bg-gray-100" /></div>
            <div><label className="block text-sm">Kodering</label><input value={editSub.kodering || ""} onChange={(e) => setEditSub(s => ({ ...s, kodering: e.target.value }))} className="w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Nama SubKegiatan *</label><input required value={editSub.name || ""} onChange={(e) => setEditSub(s => ({ ...s, name: e.target.value }))} className="w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Output</label><input value={editSub.output || ""} onChange={(e) => setEditSub(s => ({ ...s, output: e.target.value }))} className="w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Indikator SubKegiatan</label><textarea value={editSub.indikator || ""} onChange={(e) => setEditSub(s => ({ ...s, indikator: e.target.value }))} className="w-full border rounded p-2" /></div>
            <div><label className="block text-sm">Satuan</label><input value={editSub.satuan || ""} onChange={(e) => setEditSub(s => ({ ...s, satuan: e.target.value }))} className="w-full border rounded p-2" /></div>

            <div className="grid grid-cols-1 gap-3">{YEARS.map((y) => (<div key={y} className="grid grid-cols-2 gap-2"><div><label className="block text-sm">Target {y} (0-100)</label><input type="number" min="0" max="100" value={editSub.rencana?.[y]?.target ?? ""} onChange={(e) => { const v = e.target.value; setEditSub(s => ({ ...s, rencana: { ...(s.rencana || {}), [y]: { ...(s.rencana?.[y] || {}), target: v === "" ? "" : Number(v) } } })); }} className="w-full border rounded p-2" /></div><div><label className="block text-sm">Pagu {y} (Rp)</label><input type="number" min="0" value={editSub.rencana?.[y]?.pagu ?? ""} onChange={(e) => { const v = e.target.value; setEditSub(s => ({ ...s, rencana: { ...(s.rencana || {}), [y]: { ...(s.rencana?.[y] || {}), pagu: v === "" ? "" : Number(v) } } })); }} className="w-full border rounded p-2" /></div></div>))}</div>

            <div><label className="block text-sm">Keterangan</label><textarea value={editSub.keterangan || ""} onChange={(e) => setEditSub(s => ({ ...s, keterangan: e.target.value }))} className="w-full border rounded p-2" /></div>

            <div className="flex justify-end gap-2"><button type="button" onClick={() => { setOpenEditSub(false); setEditSub(null); }} className="px-3 py-2 rounded border">Batal</button><button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">Simpan</button></div>
          </form>
        )}
      </Modal>
    </div>
  );
}
