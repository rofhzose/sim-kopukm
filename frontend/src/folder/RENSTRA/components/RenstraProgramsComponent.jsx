import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { Plus, ChevronDown, ChevronRight, X, Save, RefreshCw, Trash2, Calendar } from "lucide-react";

// --- REUSABLE MODAL COMPONENT ---
function Modal({ title, open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b bg-slate-50">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

function fmtRp(v) {
  if (v === null || v === undefined || v === "") return "0";
  const n = Number(v);
  if (isNaN(n)) return "0";
  return new Intl.NumberFormat("id-ID").format(n);
}

export default function RenstraProgramsComponent({ apiBase = "/programs" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [openAddProgram, setOpenAddProgram] = useState(false);
  const [openAddKegiatan, setOpenAddKegiatan] = useState(false);
  const [openAddSub, setOpenAddSub] = useState(false);
  const [openEditProgram, setOpenEditProgram] = useState(false);
  const [openEditKegiatan, setOpenEditKegiatan] = useState(false);
  const [openEditSub, setOpenEditSub] = useState(false);

  // Form States
  const [formProgram, setFormProgram] = useState({ kodering: "", name: "", indikator: "", output: "", keterangan: "" });
  const [formKegiatan, setFormKegiatan] = useState({ program_id: null, kodering: "", name: "", indikator: "", output: "", keterangan: "" });
  const [formSub, setFormSub] = useState({ kegiatan_id: null, kodering: "", name: "", output: "", indikator: "", satuan: "", keterangan: "", rencana: {} });

  const [editProgram, setEditProgram] = useState(null);
  const [editKegiatan, setEditKegiatan] = useState(null);
  const [editSub, setEditSub] = useState(null);

  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [expandedKegiatans, setExpandedKegiatans] = useState({});

  // WAJIB MULAI 2025
  const YEARS = [2026, 2027, 2028, 2029, 2030];

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await axiosInstance.get(apiBase);
      setData(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  const toggleProgram = (id) => setExpandedPrograms(s => ({ ...s, [id]: !s[id] }));
  const toggleKegiatan = (id) => setExpandedKegiatans(s => ({ ...s, [id]: !s[id] }));

  // --- HANDLERS (LOGIC TETAP SAMA) ---
  async function submitProgram(e) {
    e.preventDefault();
    try {
      await axiosInstance.post(apiBase, formProgram);
      setOpenAddProgram(false);
      setFormProgram({ kodering: "", name: "", indikator: "", output: "", keterangan: "" });
      fetchAll();
    } catch (err) { alert(err.message); }
  }

  async function submitKegiatan(e) {
    e.preventDefault();
    try {
      await axiosInstance.post(`${apiBase}/kegiatans`, formKegiatan);
      setOpenAddKegiatan(false);
      setFormKegiatan({ program_id: null, kodering: "", name: "", indikator: "", output: "", keterangan: "" });
      fetchAll();
    } catch (err) { alert(err.message); }
  }

  async function submitSub(e) {
    e.preventDefault();
    try {
      const r = {};
      YEARS.forEach(y => {
        const entry = formSub.rencana?.[y] || {};
        r[y] = { 
          target: entry.target ? Number(entry.target) : 0, 
          pagu: entry.pagu ? Number(entry.pagu) : 0 
        };
      });
      await axiosInstance.post(`${apiBase}/subkegiatans`, { ...formSub, rencana: r });
      setOpenAddSub(false);
      setFormSub({ kegiatan_id: null, kodering: "", name: "", output: "", indikator: "", satuan: "", keterangan: "", rencana: {} });
      fetchAll();
    } catch (err) { alert(err.message); }
  }

  async function handleDelete(type, id) {
    if (!confirm("Hapus data ini?")) return;
    try {
      const url = type === 'p' ? `${apiBase}/${id}` : type === 'k' ? `${apiBase}/kegiatans/${id}` : `${apiBase}/subkegiatans/${id}`;
      await axiosInstance.delete(url);
      fetchAll();
    } catch (err) { alert(err.message); }
  }

  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden border border-slate-300 shadow-2xl">
      {/* TOOLBAR */}
      <div className="p-6 bg-slate-50 border-b border-slate-300 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                <Calendar size={24} />
            </div>
            <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Matriks Renstra 2026 - 2030</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dinkopukm Kabupaten Karawang</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchAll} className="p-3 bg-white border border-slate-300 rounded-2xl hover:bg-slate-100 transition-all">
                <RefreshCw size={20} className={loading ? "animate-spin text-blue-600" : "text-slate-600"} />
            </button>
            <button onClick={() => setOpenAddProgram(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                <Plus size={20} /> TAMBAH PROGRAM
            </button>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[750px]">
        <table className="w-full border-separate border-spacing-0 min-w-[1800px]">
          <thead>
            <tr className="bg-slate-900 text-white">
              {/* STICKY COLUMN */}
              <th rowSpan={2} className="sticky left-0 z-40 w-[450px] px-6 py-4 text-left font-black border-r border-slate-700 bg-slate-900 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">NOMENKLATUR PERENCANAAN</th>
              <th rowSpan={2} className="w-[250px] px-4 py-4 text-left font-black border-r border-slate-700">INDIKATOR / OUTPUT</th>
              <th rowSpan={2} className="w-[100px] px-4 py-4 text-center font-black border-r border-slate-700">SATUAN</th>
              {YEARS.map(y => (
                <th key={y} colSpan={2} className="px-4 py-3 text-center font-black border-b border-r border-slate-700 bg-slate-800 uppercase tracking-widest text-[11px]">TAHUN {y}</th>
              ))}
              <th rowSpan={2} className="sticky right-0 z-40 w-[120px] bg-slate-900 px-4 py-4 text-center font-black border-l border-slate-700 shadow-[-2px_0_5px_rgba(0,0,0,0.1)]">AKSI</th>
            </tr>
            <tr className="bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-tighter">
              {YEARS.map(y => (
                <React.Fragment key={`h-${y}`}>
                  <th className="px-3 py-3 text-center border-r border-slate-700 w-[80px]">Target</th>
                  <th className="px-3 py-3 text-center border-r border-slate-700 w-[150px]">Pagu (Rp)</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody className="text-sm">
            {data.map(p => (
              <React.Fragment key={`p-${p.id}`}>
                {/* ROW PROGRAM */}
                <tr className="bg-blue-50/50 hover:bg-blue-100/80 transition-colors group">
                  <td className="sticky left-0 z-30 bg-inherit px-6 py-5 border-b border-r border-slate-300 font-black text-blue-900 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    <div className="flex gap-3 items-start">
                      <button onClick={() => toggleProgram(p.id)} className={`mt-1 p-1.5 rounded-xl border-2 transition-all ${expandedPrograms[p.id] ? 'bg-blue-600 border-blue-600 text-white rotate-180' : 'bg-white border-blue-200 text-blue-600'}`}>
                        <ChevronDown size={14} />
                      </button>
                      <div>
                        <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded uppercase tracking-[0.2em] mb-1 inline-block">Program</span>
                        <div className="leading-tight uppercase tracking-tight">{p.kodering} {p.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 border-b border-r border-slate-300 text-xs font-bold text-slate-600">
                    <div className="italic text-blue-700 mb-1">Ind: {p.indikator || "-"}</div>
                    <div className="text-slate-500 font-medium italic">Out: {p.output || "-"}</div>
                  </td>
                  <td className="px-4 py-5 border-b border-r border-slate-300 text-center font-black text-slate-400">-</td>
                  {YEARS.map(y => (
                    <React.Fragment key={y}>
                      <td className="px-3 py-5 border-b border-r border-slate-300 text-center font-black text-slate-700">{p.rencana?.[y]?.target || "0"}</td>
                      <td className="px-3 py-5 border-b border-r border-slate-300 text-right font-black text-blue-700 bg-blue-50/30">
                        <span className="text-[10px] text-blue-400 mr-1 font-normal">Rp</span>{fmtRp(p.rencana?.[y]?.pagu)}
                      </td>
                    </React.Fragment>
                  ))}
                  <td className="sticky right-0 z-30 bg-inherit px-4 py-5 border-b border-l border-slate-300 shadow-[-2px_0_5px_rgba(0,0,0,0.02)] text-center">
                    <div className="flex gap-1 justify-center">
                        <button onClick={() => { setFormKegiatan({ ...formKegiatan, program_id: p.id }); setOpenAddKegiatan(true); }} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"><Plus size={14} /></button>
                        <button onClick={() => handleDelete('p', p.id)} className="p-2 bg-white text-red-500 border border-red-200 rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>

                {/* ROW KEGIATAN */}
                {expandedPrograms[p.id] && (p.kegiatans || []).map(k => (
                  <React.Fragment key={`k-${k.id}`}>
                    <tr className="bg-white hover:bg-slate-50 transition-colors group">
                      <td className="sticky left-0 z-30 bg-inherit pl-16 pr-6 py-4 border-b border-r border-slate-300 font-bold text-slate-700 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3 items-start">
                          <button onClick={() => toggleKegiatan(k.id)} className={`mt-1 p-1 rounded-lg border transition-all ${expandedKegiatans[k.id] ? 'bg-amber-500 border-amber-500 text-white rotate-180' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                            <ChevronDown size={12} />
                          </button>
                          <div>
                            <span className="text-[8px] border border-amber-300 text-amber-600 px-1.5 py-0.5 rounded uppercase font-black mb-1 inline-block">Kegiatan</span>
                            <div className="leading-tight text-sm uppercase">{k.kodering} {k.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 border-b border-r border-slate-300 text-[11px] text-slate-500">
                         <div className="italic mb-1">Ind: {k.indikator || "-"}</div>
                         <div className="italic">Out: {k.output || "-"}</div>
                      </td>
                      <td className="px-4 py-4 border-b border-r border-slate-300 text-center font-bold text-slate-400">-</td>
                      {YEARS.map(y => (
                        <React.Fragment key={y}>
                          <td className="px-3 py-4 border-b border-r border-slate-300 text-center font-bold text-slate-600">{k.rencana?.[y]?.target || "0"}</td>
                          <td className="px-3 py-4 border-b border-r border-slate-300 text-right font-bold text-slate-800 bg-slate-50/50">{fmtRp(k.rencana?.[y]?.pagu)}</td>
                        </React.Fragment>
                      ))}
                      <td className="sticky right-0 z-30 bg-inherit px-4 py-4 border-b border-l border-slate-300 shadow-[-2px_0_5px_rgba(0,0,0,0.02)] text-center">
                         <button onClick={() => { setFormSub({ ...formSub, kegiatan_id: k.id }); setOpenAddSub(true); }} className="p-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition-all"><Plus size={14} /></button>
                      </td>
                    </tr>

                    {/* ROW SUB-KEGIATAN */}
                    {expandedKegiatans[k.id] && (k.subkegiatans || []).map(s => (
                      <tr key={`s-${s.id}`} className="bg-emerald-50/20 hover:bg-emerald-50/50 transition-colors group">
                        <td className="sticky left-0 z-30 bg-inherit pl-28 pr-6 py-3 border-b border-r border-slate-300 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                            <span className="text-[8px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded uppercase font-black mb-1 inline-block tracking-tighter">Sub-Kegiatan</span>
                            <div className="text-xs font-black text-emerald-900 uppercase tracking-tighter leading-tight">{s.kodering} {s.name}</div>
                        </td>
                        <td className="px-4 py-3 border-b border-r border-slate-300 text-[10px] text-slate-500 italic">
                            {s.indikator || "-"}
                        </td>
                        <td className="px-4 py-3 border-b border-r border-slate-300 text-center text-[10px] font-black text-emerald-700 uppercase">{s.satuan || "-"}</td>
                        {YEARS.map(y => (
                          <React.Fragment key={y}>
                            <td className="px-3 py-3 border-b border-r border-slate-300 text-center text-xs font-medium text-slate-600">{s.rencana?.[y]?.target || "0"}</td>
                            <td className="px-3 py-3 border-b border-r border-slate-300 text-right text-xs font-black text-emerald-800 bg-emerald-50/50">{fmtRp(s.rencana?.[y]?.pagu)}</td>
                          </React.Fragment>
                        ))}
                        <td className="sticky right-0 z-30 bg-inherit px-4 py-3 border-b border-l border-slate-300 shadow-[-2px_0_5px_rgba(0,0,0,0.02)] text-center">
                            <button onClick={() => { setEditSub({...s}); setOpenEditSub(true); }} className="p-2 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"><ChevronRight size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
 
      {/* --- MODAL ADD PROGRAM --- */}
      <Modal title="Tambah Program Baru" open={openAddProgram} onClose={() => setOpenAddProgram(false)}>
        <form onSubmit={submitProgram} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1"><label className="block text-xs font-black text-slate-500 uppercase mb-1">Kodering</label><input placeholder="Contoh: 1.01.01" value={formProgram.kodering} onChange={(e) => setFormProgram({ ...formProgram, kodering: e.target.value })} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-blue-500 outline-none transition-all" /></div>
            <div className="col-span-2"><label className="block text-xs font-black text-slate-500 uppercase mb-1">Nama Program *</label><input required value={formProgram.name} onChange={(e) => setFormProgram({ ...formProgram, name: e.target.value })} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-blue-500 outline-none transition-all" /></div>
            <div className="col-span-2"><label className="block text-xs font-black text-slate-500 uppercase mb-1">Indikator</label><textarea rows="2" value={formProgram.indikator} onChange={(e) => setFormProgram({ ...formProgram, indikator: e.target.value })} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-blue-500 outline-none transition-all"></textarea></div>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={() => setOpenAddProgram(false)} className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all">Batal</button>
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100"><Save size={18} /> Simpan Program</button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL ADD KEGIATAN --- */}
      <Modal title="Tambah Kegiatan" open={openAddKegiatan} onClose={() => setOpenAddKegiatan(false)}>
        <form onSubmit={submitKegiatan} className="space-y-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100 mb-4 uppercase tracking-wider">Program: {data.find(p => p.id === formKegiatan.program_id)?.name}</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1"><label className="block text-xs font-black text-slate-500 uppercase mb-1">Kodering</label><input value={formKegiatan.kodering} onChange={(e) => setFormKegiatan({ ...formKegiatan, kodering: e.target.value })} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-blue-500 outline-none transition-all" /></div>
            <div className="col-span-2"><label className="block text-xs font-black text-slate-500 uppercase mb-1">Nama Kegiatan *</label><input required value={formKegiatan.name} onChange={(e) => setFormKegiatan({ ...formKegiatan, name: e.target.value })} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-blue-500 outline-none transition-all" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={() => setOpenAddKegiatan(false)} className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all">Batal</button>
            <button type="submit" className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-100">Simpan Kegiatan</button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL ADD SUB-KEGIATAN --- */}
      <Modal title="Detail Rencana Sub-Kegiatan" open={openAddSub} onClose={() => setOpenAddSub(false)}>
        <form onSubmit={submitSub} className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-xs font-black text-slate-500 uppercase mb-1">Nama Sub-Kegiatan</label><input required value={formSub.name} onChange={(e) => setFormSub({ ...formSub, name: e.target.value })} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-blue-500 outline-none transition-all" /></div>
              <div className="col-span-1"><label className="block text-xs font-black text-slate-500 uppercase mb-1">Kodering</label><input value={formSub.kodering} onChange={(e) => setFormSub({ ...formSub, kodering: e.target.value })} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-blue-500 outline-none transition-all" /></div>
              <div className="col-span-1"><label className="block text-xs font-black text-slate-500 uppercase mb-1">Satuan</label><input placeholder="Contoh: Paket, Dokumen, Orang" value={formSub.satuan} onChange={(e) => setFormSub({ ...formSub, satuan: e.target.value })} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-blue-500 outline-none transition-all" /></div>
           </div>

           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
             <h4 className="text-sm font-black text-slate-800 uppercase mb-4 tracking-tighter">Pagu & Target 5 Tahun</h4>
             <div className="space-y-4">
                {YEARS.map(y => (
                  <div key={y} className="grid grid-cols-5 gap-3 items-center">
                    <div className="col-span-1 text-sm font-bold text-slate-500">{y}</div>
                    <div className="col-span-2"><input placeholder="Target" type="number" value={formSub.rencana[y]?.target || ""} onChange={(e) => setFormSub({ ...formSub, rencana: { ...formSub.rencana, [y]: { ...formSub.rencana[y], target: e.target.value } } })} className="w-full border rounded-lg p-2 text-sm" /></div>
                    <div className="col-span-2"><input placeholder="Pagu Rp" type="number" value={formSub.rencana[y]?.pagu || ""} onChange={(e) => setFormSub({ ...formSub, rencana: { ...formSub.rencana, [y]: { ...formSub.rencana[y], pagu: e.target.value } } })} className="w-full border rounded-lg p-2 text-sm" /></div>
                  </div>
                ))}
             </div>
           </div>

           <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setOpenAddSub(false)} className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all">Batal</button>
            <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100">Simpan Rencana</button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL EDIT PROGRAM --- */}
      <Modal title="Edit Program" open={openEditProgram} onClose={() => { setOpenEditProgram(false); setEditProgram(null); }}>
        {editProgram && (
          <form onSubmit={submitEditProgram} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-xs font-black text-slate-500 uppercase mb-1">Nama Program</label><input required value={editProgram.name || ""} onChange={(e) => setEditProgram({ ...editProgram, name: e.target.value })} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-blue-500 outline-none transition-all" /></div>
                <div className="col-span-2"><label className="block text-xs font-black text-slate-500 uppercase mb-1">Indikator</label><textarea rows="3" value={editProgram.indikator || ""} onChange={(e) => setEditProgram({ ...editProgram, indikator: e.target.value })} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-blue-500 outline-none transition-all"></textarea></div>
             </div>
             <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                <button type="button" onClick={() => setOpenEditProgram(false)} className="px-5 py-2.5 text-slate-400 font-bold">Batal</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Update Program</button>
             </div>
          </form>
        )}
      </Modal>

      {/* --- MODAL EDIT KEGIATAN --- */}
      <Modal title="Edit Kegiatan" open={openEditKegiatan} onClose={() => { setOpenEditKegiatan(false); setEditKegiatan(null); }}>
        {editKegiatan && (
          <form onSubmit={submitEditKegiatan} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-xs font-black text-slate-500 uppercase mb-1">Nama Kegiatan</label><input required value={editKegiatan.name || ""} onChange={(e) => setEditKegiatan({ ...editKegiatan, name: e.target.value })} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-blue-500 outline-none transition-all" /></div>
                <div className="col-span-2"><label className="block text-xs font-black text-slate-500 uppercase mb-1">Indikator</label><textarea rows="3" value={editKegiatan.indikator || ""} onChange={(e) => setEditKegiatan({ ...editKegiatan, indikator: e.target.value })} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-blue-500 outline-none transition-all"></textarea></div>
             </div>
             <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                <button type="button" onClick={() => setOpenEditKegiatan(false)} className="px-5 py-2.5 text-slate-400 font-bold">Batal</button>
                <button type="submit" className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl shadow-lg">Update Kegiatan</button>
             </div>
          </form>
        )}
      </Modal>

      {/* --- MODAL EDIT SUB-KEGIATAN --- */}
      <Modal title="Edit Sub-Kegiatan" open={openEditSub} onClose={() => { setOpenEditSub(false); setEditSub(null); }}>
        {editSub && (
          <form onSubmit={submitEditSub} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-xs font-black text-slate-500 uppercase mb-1">Nama Sub-Kegiatan</label><input required value={editSub.name || ""} onChange={(e) => setEditSub({ ...editSub, name: e.target.value })} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-blue-500 outline-none transition-all" /></div>
                <div className="col-span-1"><label className="block text-xs font-black text-slate-500 uppercase mb-1">Satuan</label><input value={editSub.satuan || ""} onChange={(e) => setEditSub({ ...editSub, satuan: e.target.value })} className="w-full border-2 border-slate-100 rounded-lg p-2.5 focus:border-blue-500 outline-none transition-all" /></div>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl">
               <h4 className="text-xs font-black text-slate-500 uppercase mb-3">Update Target & Pagu</h4>
               {YEARS.map(y => (
                  <div key={y} className="grid grid-cols-5 gap-2 items-center mb-2">
                    <div className="text-xs font-bold">{y}</div>
                    <div className="col-span-2"><input type="number" value={editSub.rencana?.[y]?.target || ""} onChange={(e) => setEditSub({ ...editSub, rencana: { ...editSub.rencana, [y]: { ...editSub.rencana?.[y], target: e.target.value } } })} className="w-full p-2 text-xs border rounded" placeholder="Target" /></div>
                    <div className="col-span-2"><input type="number" value={editSub.rencana?.[y]?.pagu || ""} onChange={(e) => setEditSub({ ...editSub, rencana: { ...editSub.rencana, [y]: { ...editSub.rencana?.[y], pagu: e.target.value } } })} className="w-full p-2 text-xs border rounded" placeholder="Pagu" /></div>
                  </div>
               ))}
             </div>
             <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setOpenEditSub(false)} className="px-5 py-2.5 text-slate-400 font-bold">Batal</button>
                <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg">Update Rencana</button>
             </div>
          </form>
        )}
      </Modal>

    </div>
  );
}