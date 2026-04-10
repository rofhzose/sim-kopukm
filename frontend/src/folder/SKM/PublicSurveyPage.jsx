import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Building2, UserCircle, CheckCircle2, 
  Frown, Meh, Smile, Laugh, Send, Star, ClipboardList
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const PublicSurveyPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // State untuk data form
  const [formData, setFormData] = useState({
    nama_layanan: "", 
    jenis_kelamin: "",
    pendidikan: "",
    pekerjaan: "",
    tahun: new Date().getFullYear(),
    u1: 0, u2: 0, u3: 0, u4: 0, u5: 0, u6: 0, u7: 0, u8: 0, u9: 0
  });

  const questions = [
    { id: "u1", title: "Persyaratan", desc: "Kelengkapan dan kesesuaian persyaratan", color: "#6366f1" },
    { id: "u2", title: "Prosedur Pelayanan", desc: "Kemudahan alur dan mekanisme pelayanan", color: "#0ea5e9" },
    { id: "u3", title: "Waktu Penyelesaian", desc: "Ketepatan dan kecepatan waktu pelayanan", color: "#f59e0b" },
    { id: "u4", title: "Biaya / Tarif", desc: "Kewajaran dan keterbukaan biaya layanan", color: "#10b981" },
    { id: "u5", title: "Produk Jenis Layanan", desc: "Kesesuaian hasil dengan yang dijanjikan", color: "#ec4899" },
    { id: "u6", title: "Kompetensi Pelaksana", desc: "Kemampuan dan keahlian petugas layanan", color: "#8b5cf6" },
    { id: "u7", title: "Perilaku Pelaksana", desc: "Sikap, sopan santun dan keramahan petugas", color: "#14b8a6" },
    { id: "u8", title: "Penanganan Pengaduan", desc: "Responsivitas terhadap keluhan & masukan", color: "#f97316" },
    { id: "u9", title: "Sarana dan Prasarana", desc: "Kondisi fasilitas dan sarana pendukung", color: "#64748b" },
  ];

  const ratingOptions = [
    { val: 1, label: "Tidak Baik", icon: <Frown />, color: "bg-red-600", light: "bg-red-50", text: "text-red-600" },
    { val: 2, label: "Kurang Baik", icon: <Meh />, color: "bg-amber-600", light: "bg-amber-50", text: "text-amber-600" },
    { val: 3, label: "Baik", icon: <Smile />, color: "bg-blue-600", light: "bg-blue-50", text: "text-blue-600" },
    { val: 4, label: "Sangat Baik", icon: <Laugh />, color: "bg-emerald-600", light: "bg-emerald-50", text: "text-emerald-600" },
  ];

  const charFilled = [formData.nama_layanan, formData.jenis_kelamin, formData.pendidikan, formData.pekerjaan].filter(Boolean).length;
  const unsurFilled = questions.filter(q => formData[q.id] > 0).length;
  const totalFilled = charFilled + unsurFilled;
  const totalFields = 13;
  const progressPercent = Math.round((totalFilled / totalFields) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalFilled < totalFields) {
      alert("Mohon lengkapi pilihan layanan, data responden, dan semua penilaian!");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/skm/survey", formData);
      setSuccess(true);
    } catch (err) {
      alert("Gagal mengirim survey. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center max-w-sm border border-slate-100 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Terima Kasih!</h2>
          <p className="text-slate-500 mb-8 font-medium">Penilaian Anda telah tersimpan dan sangat berharga bagi kami.</p>
          <button onClick={() => window.location.reload()} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all">Selesai</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans">
      <div className="bg-slate-900 text-white pt-10 pb-16 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="flex items-center gap-3 text-sky-400 font-bold text-[10px] tracking-widest uppercase mb-3">
            <div className="w-8 h-[2px] bg-sky-400"></div> Portal Survei Kepuasan
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Form <span className="text-sky-400">Penilaian</span> SKM</h1>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Dinas Koperasi dan UKM Karawang</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-10 space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center gap-5 shadow-xl transition-all">
          <span className="text-3xl animate-bounce">{progressPercent === 100 ? '🎉' : '✍️'}</span>
          <div className="flex-1">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progres Pengisian</p>
                <p className="text-lg font-black text-slate-800">{progressPercent}% <span className="text-xs text-slate-400 font-bold">Lengkap</span></p>
              </div>
              <p className="text-[10px] font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full">{totalFilled} / {totalFields} Field</p>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
              <div 
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-700 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className={`bg-white border-2 rounded-[2.5rem] shadow-sm overflow-hidden transition-all ${formData.nama_layanan ? 'border-emerald-500' : 'border-slate-200'}`}>
          <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-sky-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-sky-100">
              <ClipboardList size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 uppercase text-sm tracking-tight">Jenis Layanan</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pilih layanan yang Anda terima</p>
            </div>
          </div>
          <div className="p-8">
            <select 
              required
              className={`w-full p-5 rounded-2xl border-2 transition-all outline-none text-base font-bold appearance-none cursor-pointer
                ${formData.nama_layanan ? 'border-emerald-500 bg-emerald-50/30 text-emerald-900' : 'border-slate-100 bg-slate-50 text-slate-400 focus:border-sky-500'}`}
              value={formData.nama_layanan}
              onChange={(e) => setFormData({...formData, nama_layanan: e.target.value})}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.5rem' }}
            >
              <option value="">— Klik untuk memilih layanan —</option>
              <option value="Pelayanan Koperasi">Pelayanan Kelembagaan Koperasi</option>
              <option value="Pelayanan UMKM">Penerbitan IUMK / Pemberdayaan UMKM</option>
              <option value="Pelayanan Umum">Pelayanan Administrasi Umum & Sekretariat</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <UserCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 uppercase text-sm tracking-tight">Data Responden</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Informasi demografis anda</p>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Jenis Kelamin', name: 'jenis_kelamin', options: ['Laki-laki', 'Perempuan'] },
              { label: 'Pendidikan', name: 'pendidikan', options: ['SD', 'SMP', 'SMA', 'Diploma', 'Sarjana', 'Magister', 'Doktoral'] },
              { label: 'Pekerjaan', name: 'pekerjaan', options: ['Pegawai Negeri', 'Swasta', 'Wiraswasta', 'Pelajar', 'Mahasiswa', 'Tidak Bekerja'] },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">{field.label}</label>
                <select 
                  className={`w-full p-4 rounded-2xl border-2 transition-all outline-none text-sm font-bold ${formData[field.name] ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-slate-50'}`}
                  value={formData[field.name]}
                  onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                >
                  <option value="">Pilih</option>
                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 p-5 bg-sky-600 text-white rounded-3xl shadow-xl shadow-sky-100">
          <Star size={24} className="fill-current" />
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider">Penilaian 9 Unsur Pelayanan</h3>
            <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Berikan nilai objektif anda</p>
          </div>
        </div>

        {questions.map((q) => (
          <div 
            key={q.id} 
            className={`bg-white border-2 rounded-[2.5rem] overflow-hidden transition-all duration-300 relative group
              ${formData[q.id] > 0 ? 'border-emerald-200 shadow-xl' : 'border-slate-100'}`}
          >
            <div className="absolute left-0 top-0 bottom-0 w-2.5" style={{ backgroundColor: formData[q.id] > 0 ? '#10b981' : q.color }}></div>
            
            <div className={`p-8 flex flex-col sm:flex-row sm:items-center gap-5 ${formData[q.id] > 0 ? 'bg-emerald-50/30' : ''}`}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-xs shadow-inner" style={{ backgroundColor: `${q.color}15`, color: q.color }}>
                {q.id.toUpperCase()}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-800 tracking-tight">{q.title}</h4>
                <p className="text-xs text-slate-500 font-medium">{q.desc}</p>
              </div>
              {formData[q.id] > 0 && (
                <div className="inline-flex self-start sm:self-auto items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-emerald-100 animate-in slide-in-from-right-4">
                  <CheckCircle2 size={12} /> {formData[q.id]} — {ratingOptions.find(o => o.val === formData[q.id])?.label}
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 border-t border-slate-50">
              {ratingOptions.map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setFormData({...formData, [q.id]: opt.val})}
                  className={`flex flex-col items-center gap-3 py-6 transition-all relative overflow-hidden group
                    ${formData[q.id] === opt.val ? `${opt.color} text-white shadow-inner` : `bg-white ${opt.text} hover:bg-slate-50`}
                  `}
                >
                  <span className={`text-3xl transition-all duration-300 ${formData[q.id] === opt.val ? 'scale-125 rotate-6' : 'group-hover:scale-110'}`}>
                    {opt.icon}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{opt.val}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 p-5 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-6">
          <div className="hidden md:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ringkasan Pengisian</p>
            <p className="font-black text-slate-800 text-sm italic">{totalFilled} dari {totalFields} data telah diisi</p>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading || totalFilled < totalFields}
            className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-12 py-5 rounded-[2rem] font-black text-sm transition-all tracking-wider
              ${totalFilled === totalFields ? 'bg-slate-900 hover:bg-black shadow-2xl shadow-slate-300 text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
            `}
          >
            {loading ? "MEMPROSES..." : "KIRIM PENILAIAN"} <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicSurveyPage;