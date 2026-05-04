import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, Building2, Calendar, Lock, 
  Lightbulb, CheckCircle2, ChevronDown, PlusCircle 
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const SkmCreatePage = () => {
  const navigate = useNavigate();
  const [tahun] = useState(new Date().getFullYear());
  const [rkaList, setRkaList] = useState([]);
  const [selectedRka, setSelectedRka] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ambil daftar RKA untuk dropdown
  useEffect(() => {
    const fetchRka = async () => {
      try {
        const res = await axiosInstance.get("/skm/rka-list");
        setRkaList(res.data);
      } catch (err) {
        console.error("Gagal mengambil data RKA", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRka();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRka) return;

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/skm/create-session", {
        rka_id: selectedRka,
        tahun: tahun
      });
      
      // Redirect ke halaman detail (input responden) dengan ID yang baru dibuat
      navigate(`/skm/detail/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal membuat sesi survei");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-jakarta">
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* BACK LINK */}
        <Link to="/skm" className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm mb-8 hover:text-slate-900 transition-all group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Laporan SKM
        </Link>

        {/* PAGE HEADER */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-2 text-sky-500 font-bold text-[10px] tracking-widest uppercase mb-3">
            <div className="w-8 h-[3px] bg-sky-500 rounded-full"></div> 
            Survei Kepuasan Masyarakat
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Tambah <span className="text-sky-500">Survey Baru</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Pilih unit layanan yang akan disurvei, lalu lanjutkan untuk mengisi data responden.
          </p>
        </div>

        {/* STEP INDICATOR */}
        <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-4 mb-8 flex items-center shadow-sm">
          <Step num={<PlusCircle size={18}/>} label="Pilih Layanan" active />
          <div className="flex-1 h-[2px] bg-slate-100 mx-4"></div>
          <Step num="2" label="Input Responden" />
          <div className="flex-1 h-[2px] bg-slate-100 mx-4"></div>
          <Step num="3" label="Lihat Laporan" />
        </div>

        {/* MAIN FORM CARD */}
        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-sky-500"></div>
          
          <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 uppercase text-sm tracking-tight">Formulir Survey SKM</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Setup unit layanan yang akan dinilai</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* SELECT LAYANAN */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <Building2 size={14} className="text-sky-500" /> Pilih Unit Layanan <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <select 
                  required
                  disabled={loading}
                  className={`w-full p-4 rounded-2xl border-2 transition-all outline-none font-bold text-sm appearance-none cursor-pointer
                    ${selectedRka ? 'border-emerald-500 bg-emerald-50/30 text-emerald-900' : 'border-slate-100 bg-slate-50 text-slate-500 focus:border-sky-500'}
                  `}
                  value={selectedRka}
                  onChange={(e) => setSelectedRka(e.target.value)}
                >
                  <option value="">{loading ? "Memuat data..." : "— Pilih unit layanan —"}</option>
                  {rkaList.map(r => (
                    <option key={r.id} value={r.id}>{r.uraian}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>

            {/* TAHUN DISPLAY */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                <Calendar size={14} className="text-sky-500" /> Periode Tahun
              </label>
              <div className="bg-slate-100 border-2 border-slate-200 rounded-2xl p-4 flex items-center gap-4">
                <div className="text-3xl font-black text-slate-800 font-mono">{tahun}</div>
                <div className="flex-1 border-l border-slate-300 pl-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Tahun Aktif</p>
                  <p className="text-xs font-bold text-slate-600 italic">Otomatis menggunakan tahun berjalan</p>
                </div>
                <div className="p-2 bg-white rounded-lg text-slate-300 shadow-sm">
                  <Lock size={16} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                <CheckCircle2 size={14} className="text-emerald-500" /> Data akan diarahkan ke form responden
              </div>
              <button 
                type="submit"
                disabled={isSubmitting || !selectedRka}
                className={`px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all
                  ${selectedRka ? 'bg-slate-900 text-white hover:bg-sky-600 shadow-lg shadow-sky-200' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                `}
              >
                {isSubmitting ? "MENYIMPAN..." : "SIMPAN & INPUT RESPONDEN"}
                <CheckCircle2 size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* INFO CARD */}
        <div className="mt-8 bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-6 flex gap-5 animate-fade-in-up delay-200">
          <div className="w-12 h-12 bg-white text-indigo-500 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <Lightbulb size={24} />
          </div>
          <div>
            <h4 className="font-black text-indigo-900 text-sm uppercase mb-1">Cara Pengisian</h4>
            <p className="text-indigo-700/80 text-xs font-medium leading-relaxed">
              Setelah menyimpan, sistem akan membuat sesi survei baru. Anda akan diarahkan ke halaman 
              input responden untuk memasukkan penilaian 9 unsur pelayanan (U1–U9) dengan skala 1–4. 
              Hasil akan dikalkulasi secara real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component Step
const Step = ({ num, label, active }) => (
  <div className="flex items-center gap-3">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all
      ${active ? 'bg-sky-500 text-white ring-4 ring-sky-100' : 'bg-slate-100 text-slate-400'}
    `}>
      {num}
    </div>
    <span className={`text-[10px] font-black uppercase tracking-wider hidden sm:block ${active ? 'text-sky-600' : 'text-slate-400'}`}>
      {label}
    </span>
  </div>
);

export default SkmCreatePage;