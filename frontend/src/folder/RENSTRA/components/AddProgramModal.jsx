import React, { useState } from "react";
import { createPortal } from "react-dom";
import axiosInstance from "@/utils/axiosInstance";
import { X, Save, Loader2, ClipboardList } from "lucide-react";

export default function AddProgramModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    kodering: "",
    nama_program: "",
    output_program: "",
    indikator_program: "",
    keterangan: ""
  });

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post("/renstra/program", form);
      setForm({ kodering: "", nama_program: "", output_program: "", indikator_program: "", keterangan: "" });
      onSuccess();
      onClose();
    } catch (err) {
      alert("Gagal: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
              <ClipboardList size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Tambah Program</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Form Input Program Baru</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Kodering</label>
              <input
                required
                placeholder="Contoh: 1.01.01"
                value={form.kodering}
                onChange={(e) => setForm({ ...form, kodering: e.target.value })}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nama Program *</label>
              <input
                required
                placeholder="Masukkan nama program..."
                value={form.nama_program}
                onChange={(e) => setForm({ ...form, nama_program: e.target.value })}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Output Program</label>
            <input
              required
              placeholder="Masukkan output capaian..."
              value={form.output_program}
              onChange={(e) => setForm({ ...form, output_program: e.target.value })}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Indikator Program</label>
            <textarea
              required
              rows="3"
              placeholder="Masukkan indikator capaian..."
              value={form.indikator_program}
              onChange={(e) => setForm({ ...form, indikator_program: e.target.value })}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Keterangan</label>
            <input
              placeholder="Masukkan keterangan..."
              value={form.keterangan}
              onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold"
            />
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-sm hover:bg-slate-200 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 px-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              Simpan Program
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}