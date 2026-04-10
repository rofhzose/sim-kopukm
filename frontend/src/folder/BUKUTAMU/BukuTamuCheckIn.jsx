import React, { useState } from "react";
import { 
  Users, UserCheck, Phone, Building, Briefcase, 
  Calendar, MapPin, Save, ArrowLeft, ClipboardList, CheckCircle2
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import Swal from "sweetalert2";

export default function BukuTamuCheckIn() {
  const [form, setForm] = useState({
    nama_tamu: "", instansi: "", jabatan: "", kontak: "", 
    kegiatan: "", keperluan: "", lokasi: "Dinas Koperasi dan UKM", 
    kategori: "Tamu Umum", metode: "QR"
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post("/buku-tamu", form);
      setSubmitted(true);
      Swal.fire({
        title: "Berhasil!",
        text: "Data kunjungan Anda telah tersimpan. Terima kasih.",
        icon: "success",
        confirmButtonColor: "#10b981"
      });
    } catch (err) {
      Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data", "error");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-md w-full text-center space-y-6 border border-slate-100 animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Terima Kasih!</h1>
            <p className="text-slate-500 font-medium">Data kunjungan Anda telah berhasil kami catat.</p>
          </div>
          <div className="pt-4">
            <button 
              onClick={() => setSubmitted(false)}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-200 transition-all uppercase tracking-widest text-sm"
            >
              Isi Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full space-y-8">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
            <ClipboardList className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Buku Tamu Digital</h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Kunjungan Mandiri</p>
          </div>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-blue-50/50 px-8 py-6 border-b border-blue-100 flex items-center gap-3">
            <UserCheck className="text-blue-600 w-5 h-5" />
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Formulir Kunjungan</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1"><Users size={12} /> Nama Tamu *</label>
                <input 
                  required placeholder="Masukkan nama lengkap" 
                  value={form.nama_tamu} onChange={e => setForm({...form, nama_tamu: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1"><Phone size={12} /> No HP</label>
                <input 
                  placeholder="08xxxxxxxxxx" 
                  value={form.kontak} onChange={e => setForm({...form, kontak: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1"><Building size={12} /> Instansi</label>
                <input 
                  placeholder="Nama Instansi/Perusahaan" 
                  value={form.instansi} onChange={e => setForm({...form, instansi: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1"><Briefcase size={12} /> Jabatan</label>
                <input 
                  placeholder="Jabatan tamu" 
                  value={form.jabatan} onChange={e => setForm({...form, jabatan: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1"><Calendar size={12} /> Keperluan Kunjungan *</label>
                <textarea 
                  required placeholder="Jelaskan tujuan kunjungan Anda..." 
                  value={form.kegiatan} onChange={e => setForm({...form, kegiatan: e.target.value})}
                  rows="3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-5 py-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1"><MapPin size={12} /> Lokasi</label>
                <input 
                  disabled value={form.lokasi}
                  className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-500 outline-none cursor-not-allowed"
                />
              </div>

            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black rounded-3xl shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm"
              >
                {loading ? "Menyimpan..." : (
                  <>
                    <Save size={20} /> Simpan Data
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Dinas Koperasi dan UKM &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
