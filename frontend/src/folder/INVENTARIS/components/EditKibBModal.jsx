import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Save, Loader2, Package } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import Swal from "sweetalert2";

export default function EditKibBModal({ open, onClose, onSuccess, data }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    kode_barang: "",
    id_barang: "",
    id_awal: "",
    registrasi: "",
    nama_barang: "",
    merk_type: "",
    bahan: "",
    ukuran_cc: "",
    pabrik: "",
    no_rangka: "",
    no_mesin: "",
    no_polisi: "",
    no_bpkb: "",
    tahun_perolehan: new Date().getFullYear(),
    cara_perolehan: "",
    sumber_dana: "",
    harga: "",
    jumlah: "",
    kondisi: "Baik",
    tgl_buku: "",
    no_bast: "",
    tgl_bast: "",
    status_aset: "",
    keterangan: ""
  });

  useEffect(() => {
    if (data) {
      setFormData({
        kode_barang: data.kode_barang || "",
        id_barang: data.id_barang || "",
        id_awal: data.id_awal || "",
        registrasi: data.registrasi || "",
        nama_barang: data.nama_barang || "",
        merk_type: data.merk_type || "",
        bahan: data.bahan || "",
        ukuran_cc: data.ukuran_cc || "",
        pabrik: data.pabrik || "",
        no_rangka: data.no_rangka || "",
        no_mesin: data.no_mesin || "",
        no_polisi: data.no_polisi || "",
        no_bpkb: data.no_bpkb || "",
        tahun_perolehan: data.tahun_perolehan || new Date().getFullYear(),
        cara_perolehan: data.cara_perolehan || "",
        sumber_dana: data.sumber_dana || "",
        harga: data.harga || "",
        jumlah: data.jumlah || "",
        kondisi: data.kondisi || "Baik",
        tgl_buku: data.tgl_buku ? data.tgl_buku.split('T')[0] : "",
        no_bast: data.no_bast || "",
        tgl_bast: data.tgl_bast ? data.tgl_bast.split('T')[0] : "",
        status_aset: data.status_aset || "",
        keterangan: data.keterangan || ""
      });
    }
  }, [data, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put(`/kib-b/${data.id}`, formData);
      Swal.fire("Berhasil!", "Data KIB B berhasil diperbarui.", "success");
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
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Package className="text-slate-700" size={24} />
            <div>
              <h3 className="text-xl font-bold text-slate-800">Edit Data KIB B</h3>
              <p className="text-slate-500 text-xs">Peralatan dan Mesin</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          
          {/* IDENTITAS BARANG */}
          <section className="space-y-4">
            <h4 className="text-blue-600 font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
              Identitas Barang
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Kode Barang</label>
                <input name="kode_barang" value={formData.kode_barang} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" placeholder="Contoh: 1.3.05.01.02.001" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">ID Barang</label>
                <input name="id_barang" value={formData.id_barang} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">ID Awal</label>
                <input name="id_awal" value={formData.id_awal} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Registrasi</label>
                <input name="registrasi" value={formData.registrasi} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-500">Nama Barang</label>
                <input name="nama_barang" value={formData.nama_barang} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Merk / Type</label>
                <input name="merk_type" value={formData.merk_type} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Bahan</label>
                <input name="bahan" value={formData.bahan} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
            </div>
          </section>

          {/* SPESIFIKASI & TEKNIS */}
          <section className="space-y-4 border-t border-slate-100 pt-6">
            <h4 className="text-blue-600 font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
              Spesifikasi & Teknis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Ukuran / CC</label>
                <input name="ukuran_cc" value={formData.ukuran_cc} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Pabrik</label>
                <input name="pabrik" value={formData.pabrik} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">No. Rangka</label>
                <input name="no_rangka" value={formData.no_rangka} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">No. Mesin</label>
                <input name="no_mesin" value={formData.no_mesin} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">No. Polisi</label>
                <input name="no_polisi" value={formData.no_polisi} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">No. BPKB</label>
                <input name="no_bpkb" value={formData.no_bpkb} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
            </div>
          </section>

          {/* DATA PEROLEHAN */}
          <section className="space-y-4 border-t border-slate-100 pt-6">
            <h4 className="text-blue-600 font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
              Data Perolehan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Tahun Perolehan</label>
                <input type="number" name="tahun_perolehan" value={formData.tahun_perolehan} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Cara Perolehan</label>
                <input name="cara_perolehan" value={formData.cara_perolehan} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Sumber Dana</label>
                <input name="sumber_dana" value={formData.sumber_dana} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Harga (Rp)</label>
                <input type="number" name="harga" value={formData.harga} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Jumlah</label>
                <input type="number" name="jumlah" value={formData.jumlah} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
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
            </div>
          </section>

          {/* ADMINISTRASI */}
          <section className="space-y-4 border-t border-slate-100 pt-6">
            <h4 className="text-blue-600 font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
              Administrasi
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Tgl Buku</label>
                <input type="date" name="tgl_buku" value={formData.tgl_buku} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">No. BAST</label>
                <input name="no_bast" value={formData.no_bast} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Tgl BAST</label>
                <input type="date" name="tgl_bast" value={formData.tgl_bast} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Status Aset</label>
                <input name="status_aset" value={formData.status_aset} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-500">Keterangan</label>
                <textarea name="keterangan" value={formData.keterangan} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none min-h-[80px]" />
              </div>
            </div>
          </section>

        </form>

        {/* FOOTER ACTIONS */}
        <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-10 flex gap-3">
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Simpan Perubahan
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