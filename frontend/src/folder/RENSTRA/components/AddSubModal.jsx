import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Loader2, Layers, Calculator, FileText } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import Swal from "sweetalert2";

export default function AddSubModal({ open, onClose, onSuccess, kegiatanId, kegiatanName }) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    kodering: "",
    nama_sub: "",
    output_sub: "",
    indikator_sub: "",
    satuan: "",
    keterangan: "",
  });

  const [anggaranList, setAnggaranList] = useState([
    { tahun_id: 1, tahun_label: "2026", target: "", pagu: "" },
    { tahun_id: 2, tahun_label: "2027", target: "", pagu: "" },
    { tahun_id: 3, tahun_label: "2028", target: "", pagu: "" },
    { tahun_id: 4, tahun_label: "2029", target: "", pagu: "" },
    { tahun_id: 5, tahun_label: "2030", target: "", pagu: "" },
  ]);

  useEffect(() => {
    if (!open) {
      // Reset form saat modal ditutup
      setFormData({
        kodering: "",
        nama_sub: "",
        output_sub: "",
        indikator_sub: "",
        satuan: "",
        keterangan: "",
      });
      setAnggaranList([
        { tahun_id: 1, tahun_label: "2026", target: "", pagu: "" },
        { tahun_id: 2, tahun_label: "2027", target: "", pagu: "" },
        { tahun_id: 3, tahun_label: "2028", target: "", pagu: "" },
        { tahun_id: 4, tahun_label: "2029", target: "", pagu: "" },
        { tahun_id: 5, tahun_label: "2030", target: "", pagu: "" },
      ]);
    }
  }, [open]);

  if (!open) return null;

  const handleAnggaranChange = (index, field, value) => {
    const newAnggaran = [...anggaranList];
    newAnggaran[index][field] = value;
    setAnggaranList(newAnggaran);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const subPayload = { ...formData, kegiatan_id: kegiatanId };
      const resSub = await axiosInstance.post("/renstra/sub-kegiatan", subPayload);
      const newSubId = resSub.data.id; 

      const anggaranPayload = {
        sub_kegiatan_id: newSubId,
        anggaran_list: anggaranList.map(({ tahun_id, target, pagu }) => ({
          tahun_id,
          target: parseFloat(target) || 0,
          pagu: parseInt(pagu) || 0
        }))
      };

      await axiosInstance.post("/renstra/sub-kegiatan-anggaran", anggaranPayload);

      Swal.fire("Berhasil!", "Sub Kegiatan & Anggaran telah disimpan.", "success");
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal!", err.response?.data?.message || "Terjadi kesalahan sistem", "error");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl my-8 overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center sticky top-0 z-10 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight leading-none">TAMBAH SUB-KEGIATAN</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">KEGIATAN: {kegiatanName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              {/* DATA FORM (KIRI) */}
              <div className="lg:col-span-7 p-8 space-y-6 bg-white border-r border-slate-100">
                 <div className="flex items-center gap-2 border-b pb-2">
                    <FileText className="text-emerald-600" size={18} />
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Informasi Dokumen</h4>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Kodering</label>
                      <input required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-800" 
                        placeholder="5.01.01..." value={formData.kodering}
                        onChange={(e) => setFormData({ ...formData, kodering: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Satuan</label>
                      <input required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-800" 
                        placeholder="Persen/Dokumen" value={formData.satuan}
                        onChange={(e) => setFormData({ ...formData, satuan: e.target.value })} />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nama Sub-Kegiatan</label>
                    <textarea required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-800 min-h-[80px]" 
                      placeholder="Masukkan nama lengkap sub-kegiatan..." value={formData.nama_sub}
                      onChange={(e) => setFormData({ ...formData, nama_sub: e.target.value })} />
                 </div>
                 
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Output Kinerja</label>
                    <textarea required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-800 min-h-[80px]" 
                      placeholder="Apa output keberhasilannya?..." value={formData.output_sub}
                      onChange={(e) => setFormData({ ...formData, output_sub: e.target.value })} />
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Indikator Kinerja</label>
                    <textarea required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-800 min-h-[80px]" 
                      placeholder="Apa indikator keberhasilannya?..." value={formData.indikator_sub}
                      onChange={(e) => setFormData({ ...formData, indikator_sub: e.target.value })} />
                 </div>

              </div>

              {/* DATA ANGGARAN (KANAN) */}
              <div className="lg:col-span-5 p-8 bg-slate-50 space-y-4 h-full border-l border-slate-100">
                 <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-emerald-600">
                    <Calculator size={18} />
                    <h4 className="text-xs font-black uppercase tracking-widest">Target & Anggaran</h4>
                 </div>

                 <div className="space-y-3">
                    {anggaranList.map((item, index) => (
                      <div key={item.tahun_id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 group hover:border-emerald-300 transition-all">
                        <div className="bg-emerald-600 text-white font-black px-3 py-2 rounded-xl text-xs shadow-md w-14 text-center">
                          {item.tahun_label}
                        </div>
                        <div className="flex-1 space-y-1">
                           <input type="number" step="any" placeholder="Target" className="w-full bg-transparent border-b border-slate-100 outline-none font-bold text-sm focus:border-emerald-500 p-1"
                             value={item.target} onChange={(e) => handleAnggaranChange(index, "target", e.target.value)} />
                        </div>
                        <div className="flex-[2] space-y-1">
                           <input type="number" placeholder="Pagu (Rp)" className="w-full bg-transparent border-b border-slate-100 outline-none font-bold text-sm focus:border-emerald-500 text-right text-emerald-700 p-1"
                             value={item.pagu} onChange={(e) => handleAnggaranChange(index, "pagu", e.target.value)} />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-6 bg-white border-t border-slate-100 flex gap-4 sticky bottom-0 z-10">
            <button type="button" onClick={onClose} className="flex-1 py-4 px-6 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-sm hover:bg-slate-200 transition-all">
              Batalkan
            </button>
            <button type="submit" disabled={loading} className="flex-[2] py-4 px-6 bg-emerald-600 text-white rounded-2xl font-black uppercase text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Simpan Data Sub-Kegiatan
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