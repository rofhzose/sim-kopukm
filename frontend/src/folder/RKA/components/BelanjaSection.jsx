import React, { useMemo, useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";

/** Formatter Mata Uang IDR */
function fmtIdr(v) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(v || 0));
}

export default function BelanjaSection({ currentRkaDetail, rkaForm, onSave, onCancel, isEditMode, editingId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nama: "", koef: "", perhitungan: 1, harga_satuan: "" });

  // State untuk Modal Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  /** Identifikasi Jenis Pagu Aktif dari Dropdown Header */
  const currentPaguType = String(rkaForm?.jenis_pagu || "1");

  useEffect(() => {
    if (isEditMode && editingId) {
      fetchExistingBelanja();
    }
  }, [isEditMode, editingId, currentPaguType]); // Tambahkan currentPaguType di dependency array

  async function fetchExistingBelanja() {
    setLoading(true);
    try {
      // PERBAIKAN: Kirim query parameter pagu_id ke backend
      const res = await axiosInstance.get(`/rka/${editingId}/belanja?pagu_id=${currentPaguType}`);
      
      const mappedRows = res.data.map(item => {
        const totalNilai = Number(item.total || 0);
        // Pastikan paguId diambil dari data, atau fallback ke currentPaguType
        const paguId = String(item.pagu_id || currentPaguType);

        return {
          id: item.id || Math.random(),
          belanja: item.belanja,
          koef: item.koef || "",
          perhitungan: Number(item.perhitungan || 0),
          harga_satuan: Number(item.harga_satuan || 0),
          pagu_id: paguId,
          murni: paguId === "1" ? totalNilai : 0,
          pergeseran_i: paguId === "2" ? totalNilai : 0,
          pergeseran_ii: paguId === "3" ? totalNilai : 0,
          efisiensi: paguId === "4" ? totalNilai : 0,
          perubahan: paguId === "5" ? totalNilai : 0,
        };
      });
      setRows(mappedRows);
    } catch (err) {
      console.error("Gagal mengambil rincian belanja:", err);
    } finally {
      setLoading(false);
    }
  }

  function addRow(e) {
    e?.preventDefault?.();
    if (!form.nama) return;

    const vol = Number(form.perhitungan || 0);
    const harga = Number(form.harga_satuan || 0);
    const total = vol * harga;

    const newRow = {
      id: Date.now(),
      belanja: form.nama,
      koef: form.koef,
      perhitungan: vol,
      harga_satuan: harga,
      pagu_id: currentPaguType,
      murni: currentPaguType === "1" ? total : 0,
      pergeseran_i: currentPaguType === "2" ? total : 0,
      pergeseran_ii: currentPaguType === "3" ? total : 0,
      efisiensi: currentPaguType === "4" ? total : 0,
      perubahan: currentPaguType === "5" ? total : 0,
    };

    setRows(prev => [...prev, newRow]);
    setForm({ nama: "", koef: "", perhitungan: 1, harga_satuan: "" });
  }

  function deleteRow(id) {
    if (confirm("Hapus item belanja ini?")) {
      setRows(prev => prev.filter(r => r.id !== id));
    }
  }

  // ---- Fungsi untuk Modal Edit ----
  function handleEditClick(row) {
    setEditItem({ ...row });
    setShowEditModal(true);
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editItem) return;

    const vol = Number(editItem.perhitungan || 0);
    const harga = Number(editItem.harga_satuan || 0);
    const total = vol * harga;
    const paguId = String(editItem.pagu_id || currentPaguType);

    const updatedRow = {
      ...editItem,
      perhitungan: vol,
      harga_satuan: harga,
      murni: paguId === "1" ? total : 0,
      pergeseran_i: paguId === "2" ? total : 0,
      pergeseran_ii: paguId === "3" ? total : 0,
      efisiensi: paguId === "4" ? total : 0,
      perubahan: paguId === "5" ? total : 0,
    };

    setRows(prev => prev.map(r => r.id === editItem.id ? updatedRow : r));
    setShowEditModal(false);
    setEditItem(null);
  }

  const totals = useMemo(() => {
    return rows.reduce((acc, r) => ({
      murni: acc.murni + Number(r.murni || 0),
      p1: acc.p1 + Number(r.pergeseran_i || 0),
      p2: acc.p2 + Number(r.pergeseran_ii || 0),
      efs: acc.efs + Number(r.efisiensi || 0),
      ubah: acc.ubah + Number(r.perubahan || 0),
    }), { murni: 0, p1: 0, p2: 0, efs: 0, ubah: 0 });
  }, [rows]);

  return (
    <section className="animate-in fade-in duration-500 pb-32 max-w-7xl mx-auto font-sans relative">
      
      {/* 1. KARTU HEADER: Program, Kegiatan, Sub Kegiatan */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 space-y-4">
        {/* Program */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 w-48 text-slate-700 font-bold text-sm">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Program
          </div>
          <div className="flex-1 flex gap-3 items-center">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">8.01.01</span>
            <span className="text-slate-600 text-sm font-medium">{currentRkaDetail?.program_name || currentRkaDetail?.program?.name || "-"}</span>
          </div>
        </div>

        {/* Kegiatan */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 w-48 text-slate-700 font-bold text-sm">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            Kegiatan
          </div>
          <div className="flex-1 flex gap-3 items-center">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">8.01.01.2.01</span>
            <span className="text-slate-600 text-sm font-medium">{currentRkaDetail?.kegiatan_name || currentRkaDetail?.kegiatan?.name || "-"}</span>
          </div>
        </div>

        {/* Sub Kegiatan */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 w-48 text-slate-700 font-bold text-sm">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            Sub Kegiatan
          </div>
          <div className="flex-1 flex gap-3 items-center">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">8.01.01.2.01.0001</span>
            <span className="text-slate-800 text-sm font-bold uppercase">{currentRkaDetail?.subkegiatan_name || currentRkaDetail?.subkegiatan?.name || "-"}</span>
          </div>
        </div>
      </div>

      {/* 2. PELAKSANA KEGIATAN */}
      <div className="mb-8">
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          Pelaksana Kegiatan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col justify-center">
            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
              Penanggung Jawab
            </div>
            <div className="font-bold text-slate-800 uppercase">{currentRkaDetail?.pj_nama || "-"}</div>
            <div className="text-xs text-emerald-700 mt-0.5">{currentRkaDetail?.pj_jabatan || "Pejabat Struktural"}</div>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col justify-center">
            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
              Pelaksana
            </div>
            <div className="font-bold text-slate-800 uppercase">{currentRkaDetail?.pelaksana_nama || currentRkaDetail?.pelaksana?.nama || "-"}</div>
            <div className="text-xs text-emerald-700 mt-0.5">{currentRkaDetail?.pelaksana_jabatan || "Staf Pelaksana"}</div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
           <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
              Waktu Pelaksanaan
            </div>
            <div className="font-bold text-slate-800">
              {rkaForm?.tanggal_mulai ? new Date(rkaForm.tanggal_mulai).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}) : "01 Jan 2026"} 
              {" — "} 
              {rkaForm?.tanggal_selesai ? new Date(rkaForm.tanggal_selesai).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}) : "31 Dec 2026"}
            </div>
        </div>
      </div>

      {/* 3. FORM TAMBAH BELANJA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Tambah Belanja (Masuk ke Pagu: {currentPaguType === "1" ? "Murni" : `Pergeseran/Perubahan`})
        </h3>
        <form onSubmit={addRow} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-4">
            <input 
              value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
              className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-400" 
              placeholder="Nama Belanja" required 
            />
          </div>
          <div className="md:col-span-2">
            <input 
              value={form.koef} onChange={e => setForm(f => ({ ...f, koef: e.target.value }))}
              className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-400" 
              placeholder="Koefisien" 
            />
          </div>
          <div className="md:col-span-2">
            <input 
              type="number" value={form.perhitungan} onChange={e => setForm(f => ({ ...f, perhitungan: e.target.value }))}
              className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors" 
              placeholder="Volume" min="1"
            />
          </div>
          <div className="md:col-span-2">
            <input 
              type="number" value={form.harga_satuan} onChange={e => setForm(f => ({ ...f, harga_satuan: e.target.value }))}
              className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-400" 
              placeholder="Harga Satuan" 
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              Tambah
            </button>
          </div>
        </form>
      </div>

      {/* 4. TABEL BELANJA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-purple-100 text-purple-700 font-bold border-b border-purple-200">
              <tr>
                <th className="px-6 py-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Belanja
                </th>
                <th className="px-4 py-4">$ Murni</th>
                <th className="px-4 py-4">→ Pergeseran I</th>
                <th className="px-4 py-4">→ Pergeseran II</th>
                <th className="px-4 py-4">📉 Efisiensi</th>
                <th className="px-4 py-4">📈 Perubahan</th>
                <th className="px-4 py-4 text-center">⚙ Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 font-medium">{loading ? 'Memuat data...' : 'Belum ada rincian belanja.'}</td>
                </tr>
              ) : (
                rows.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {r.belanja}
                      <div className="text-xs text-slate-400 font-normal mt-0.5">
                        {r.koef || "-"} x {r.perhitungan} @ {fmtIdr(r.harga_satuan)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{fmtIdr(r.murni)}</td>
                    <td className="px-4 py-4 text-slate-600">{fmtIdr(r.pergeseran_i)}</td>
                    <td className="px-4 py-4 text-slate-600">{fmtIdr(r.pergeseran_ii)}</td>
                    <td className="px-4 py-4 text-slate-600">{fmtIdr(r.efisiensi)}</td>
                    <td className="px-4 py-4 text-slate-600">{fmtIdr(r.perubahan)}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {/* Tombol Edit */}
                        <button onClick={() => handleEditClick(r)} className="p-1.5 bg-blue-50 text-blue-500 rounded-md hover:bg-blue-100 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        {/* Tombol Delete */}
                        <button onClick={() => deleteRow(r.id)} className="p-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {/* TOTAL ROW */}
              <tr className="bg-orange-50 font-bold text-orange-600 border-t border-orange-200">
                <td className="px-6 py-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Total
                </td>
                <td className="px-4 py-4">{fmtIdr(totals.murni)}</td>
                <td className="px-4 py-4">{fmtIdr(totals.p1)}</td>
                <td className="px-4 py-4">{fmtIdr(totals.p2)}</td>
                <td className="px-4 py-4">{fmtIdr(totals.efs)}</td>
                <td className="px-4 py-4">{fmtIdr(totals.ubah)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. STICKY ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 flex justify-between items-center z-40">
        <button onClick={onCancel} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-all">
          Kembali
        </button>
        <button 
          onClick={() => onSave(rows)}
          className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-md transition-all active:scale-95"
        >
          {isEditMode ? "Simpan Perubahan" : "Simpan Belanja"}
        </button>
      </div>

      {/* 6. MODAL EDIT ITEM BELANJA */}
      {showEditModal && editItem && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">EDIT ITEM BELANJA</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Penyesuaian koefisien dan harga satuan</p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Belanja</label>
                <input 
                  value={editItem.belanja} 
                  onChange={e => setEditItem({...editItem, belanja: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Koefisien</label>
                  <input 
                    value={editItem.koef} 
                    onChange={e => setEditItem({...editItem, koef: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Volume (Perhitungan)</label>
                  <input 
                    type="number" min="0" 
                    value={editItem.perhitungan} 
                    onChange={e => setEditItem({...editItem, perhitungan: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Harga Satuan (Rp)</label>
                <input 
                  type="number" min="0" 
                  value={editItem.harga_satuan} 
                  onChange={e => setEditItem({...editItem, harga_satuan: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
                  required 
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)} 
                  className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}