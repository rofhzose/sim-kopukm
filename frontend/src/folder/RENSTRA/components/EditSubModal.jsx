import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Loader2, Target, Wallet, Layers } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import Swal from "sweetalert2";

export default function EditSubModal({ open, onClose, onSuccess, subData, YEARS }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    kodering: "",
    nama_sub: "",
    output_sub: "",
    indikator_sub: "",
    satuan: "",
    keterangan: "",
  });

  const [anggaranList, setAnggaranList] = useState([]);

  useEffect(() => {
    if (subData && open) {
      setFormData({
        kodering: subData.kodering || "",
        nama_sub: subData.nama_sub || "",
        output_sub: subData.output_sub || "",
        indikator_sub: subData.indikator_sub || "",
        satuan: subData.satuan || "",
        keterangan: subData.keterangan || "",
      });

      const mappedAnggaran = YEARS.map((tahun, index) => {
        const existing = subData.anggaran?.find((a) => Number(a.tahun) === Number(tahun));
        return {
          id: existing?.id || null,
          tahun_id: existing?.tahun_id || (index + 1),
          tahun: tahun,
          target: existing?.target || 0,
          pagu: existing?.pagu || 0,
        };
      });
      setAnggaranList(mappedAnggaran);
    }
  }, [subData, open, YEARS]);

  const handleAnggaranChange = (index, field, value) => {
    const updated = [...anggaranList];
    updated[index][field] = value;
    setAnggaranList(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        kegiatan_id: Number(subData.kegiatan_id),
        anggaran_list: anggaranList.map(a => ({
          id: a.id,
          tahun_id: Number(a.tahun_id),
          target: parseFloat(a.target) || 0,
          pagu: parseInt(a.pagu) || 0
        }))
      };

      await axiosInstance.put(`/renstra/sub-kegiatan-anggaran/update-all/${subData.id}`, payload);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data Sub & Anggaran 5 Tahun diperbarui sekaligus.",
        timer: 1500,
        showConfirmButton: false
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal sinkronisasi data.";
      Swal.fire("Gagal!", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Edit Sub Kegiatan</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">ID Sub: {subData.id} • Mode: Update Komplit</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-xl transition-colors"><X size={24} /></button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Identitas Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Kodering</label>
              <input required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none text-sm font-bold"
                value={formData.kodering} onChange={(e) => setFormData({ ...formData, kodering: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nama Sub Kegiatan</label>
              <input required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none text-sm font-bold"
                value={formData.nama_sub} onChange={(e) => setFormData({ ...formData, nama_sub: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Indikator Kinerja</label>
              <textarea required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none text-sm font-bold min-h-[80px]"
                value={formData.indikator_sub} onChange={(e) => setFormData({ ...formData, indikator_sub: e.target.value })} />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Output Kinerja</label>
               <textarea required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none text-sm font-bold min-h-[80px]"
                 value={formData.output_sub} onChange={(e) => setFormData({ ...formData, output_sub: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Satuan</label>
             <input required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none text-sm font-bold"
               value={formData.satuan} onChange={(e) => setFormData({ ...formData, satuan: e.target.value })} />
          </div>

          {/* Table Section */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h4 className="text-[11px] font-black text-slate-500 uppercase mb-4 flex items-center gap-2">
              <Target size={16} /> Matriks Anggaran 5 Tahun
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[10px] text-slate-400 uppercase font-black">
                    <th className="text-left pl-2">Tahun</th>
                    <th className="text-left pl-2">Target</th>
                    <th className="text-left pl-2">Pagu Anggaran (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {anggaranList.map((item, idx) => (
                    <tr key={`edit-ang-${item.tahun}`}>
                      <td className="p-2">
                         <div className="bg-white border border-slate-200 p-3 rounded-xl text-xs font-black text-slate-600 text-center w-20">{item.tahun}</div>
                      </td>
                      <td className="p-2">
                        <input type="number" step="0.01" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-emerald-500 outline-none"
                          value={item.target} onChange={(e) => handleAnggaranChange(idx, 'target', e.target.value)} />
                      </td>
                      <td className="p-2">
                        <input type="number" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-emerald-600 focus:border-emerald-500 outline-none"
                          value={item.pagu} onChange={(e) => handleAnggaranChange(idx, 'pagu', e.target.value)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t border-slate-100 mt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 px-6 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-sm hover:bg-slate-200 transition-colors">Batal</button>
            <button type="submit" disabled={loading} className="flex-[2] py-4 px-6 bg-emerald-600 text-white rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 uppercase text-sm hover:bg-emerald-700 transition-all">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>,
    document.body
  );
}