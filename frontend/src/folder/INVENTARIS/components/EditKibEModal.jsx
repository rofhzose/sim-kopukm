import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Loader2, Package, RefreshCw } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import Swal from "sweetalert2";

export default function EditKibEModal({ open, onClose, onSuccess, data }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    kode_barang: "",
    nama_barang: "",
    nomor_register: "",
    tahun_perolehan: new Date().getFullYear(),
    kondisi: "Baik",
    harga: "",
    status: "ASET TETAP",
    keterangan: ""
  });

  useEffect(() => {
    if (data) {
      setFormData({
        kode_barang: data.kode_barang || "",
        nama_barang: data.nama_barang || "",
        nomor_register: data.nomor_register || "",
        tahun_perolehan: data.tahun_perolehan || new Date().getFullYear(),
        kondisi: data.kondisi || "Baik",
        harga: data.harga || "",
        status: data.status || "ASET TETAP",
        keterangan: data.keterangan || ""
      });
    }
  }, [data]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put(`/kib-e/${data.id}`, formData);
      Swal.fire("Berhasil!", "Data KIB E berhasil diperbarui.", "success");
      onSuccess();
      onClose();
    } catch (err) {
      Swal.fire("Gagal!", err.response?.data?.message || "Terjadi kesalahan saat memperbarui data.", "error");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Package className="text-slate-700" size={24} />
            <div>
              <h3 className="text-xl font-bold text-slate-800">Edit Data KIB E</h3>
              <p className="text-slate-500 text-xs">Aset Tetap Lainnya (Buku, Kesenian, dll)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Kode Barang</label>
              <input name="kode_barang" value={formData.kode_barang} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Nomor Register</label>
              <input name="nomor_register" value={formData.nomor_register} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-500">Nama Barang</label>
              <input name="nama_barang" value={formData.nama_barang} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Tahun Perolehan</label>
              <input type="number" name="tahun_perolehan" value={formData.tahun_perolehan} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Harga (Rp)</label>
              <input type="number" name="harga" value={formData.harga} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Status</label>
              <input name="status" value={formData.status} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 mb-2 block">Kondisi</label>
              <div className="flex gap-4">
                {["Baik", "Rusak Ringan", "Rusak Berat"].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                    <input 
                      type="radio" 
                      name="kondisi" 
                      value={opt} 
                      checked={formData.kondisi === opt} 
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-500">Keterangan</label>
              <textarea name="keterangan" value={formData.keterangan} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none min-h-[80px]" />
            </div>
          </div>

        </form>

        {/* FOOTER ACTIONS */}
        <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-10 flex gap-3">
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Simpan Perubahan
          </button>
          <button onClick={onClose} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">
            Batal
          </button>
        </div>

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
