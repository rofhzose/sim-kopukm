import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Loader2, Edit3, ClipboardList } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import Swal from "sweetalert2";

export default function EditKegiatanModal({ open, onClose, onSuccess, kegiatanData }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    kodering: "",
    nama_kegiatan: "",
    output_kegiatan: "",
    indikator_kegiatan: "",
    keterangan: "",
  });

  useEffect(() => {
    if (kegiatanData) {
      setFormData({
        kodering: kegiatanData.kodering || "",
        nama_kegiatan: kegiatanData.nama_kegiatan || "",
        output_kegiatan: kegiatanData.output_kegiatan || "",
        indikator_kegiatan: kegiatanData.indikator_kegiatan || "",
        keterangan: kegiatanData.keterangan || "",
      });
    }
  }, [kegiatanData, open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put(`/renstra/kegiatan/${kegiatanData.id}`, {
        ...formData,
        program_id: kegiatanData.program_id
      });
      
      Swal.fire("Berhasil!", "Data kegiatan telah diperbarui.", "success");
      onSuccess(); 
      onClose();   
    } catch (err) {
      Swal.fire("Gagal!", err.response?.data?.message || "Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20">
              <ClipboardList size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Edit Kegiatan</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">ID: {kegiatanData?.kodering}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Kodering</label>
              <input required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 outline-none font-bold"
                value={formData.kodering} onChange={(e) => setFormData({ ...formData, kodering: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nama Kegiatan</label>
              <input required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 outline-none font-bold"
                value={formData.nama_kegiatan} onChange={(e) => setFormData({ ...formData, nama_kegiatan: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Output</label>
            <input required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 outline-none font-bold"
              value={formData.output_kegiatan} onChange={(e) => setFormData({ ...formData, output_kegiatan: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Indikator</label>
            <textarea required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 outline-none font-bold min-h-[100px]"
              value={formData.indikator_kegiatan} onChange={(e) => setFormData({ ...formData, indikator_kegiatan: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Keterangan</label>
            <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 outline-none font-bold"
              value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} />
          </div>
          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 px-6 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-sm hover:bg-slate-200 transition-all">Batal</button>
            <button type="submit" disabled={loading} className="flex-[2] py-4 px-6 bg-amber-600 text-white rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 uppercase text-sm hover:bg-amber-700 transition-all">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Simpan
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}