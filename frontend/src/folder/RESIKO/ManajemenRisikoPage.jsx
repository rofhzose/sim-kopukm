import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  Filter,
  ShieldCheck,
  TrendingUp,
  Printer,
  Info,
  Calendar,
  Layers,
  ChevronDown
} from "lucide-react";

export default function ManajemenRisikoPage() {
  const navigate = useNavigate();

  // Mock Pre-filled Government Risks for Dinas Koperasi & UKM
  const [risks, setRisks] = useState([
    {
      id: 1,
      sasaran: "Meningkatkan kontribusi UMKM terhadap PDRB daerah",
      kejadian: "Penyaluran dana bantuan UMKM tidak tepat sasaran / duplikasi penerima",
      penyebab: "Database UMKM belum terintegrasi secara faktual dan sinkron dengan NIK",
      dampak: "Temuan pemeriksaan BPK, anggaran negara tidak efektif, kecemburuan sosial",
      likelihood: 3,
      impact: 4,
      mitigasi: "Sinkronisasi data pelaku usaha dengan sistem Dukcapil dan validasi NIK otomatis di SIM-KOPUKM",
      owner: "Bidang Pemberdayaan UMKM",
      jadwal: "Triwulan II",
      status: "Berjalan"
    },
    {
      id: 2,
      sasaran: "Meningkatkan kesehatan dan kemandirian koperasi daerah",
      kejadian: "Koperasi tidak aktif bertambah dan mengalami kebangkrutan tanpa pembinaan",
      penyebab: "Minimnya penyuluhan kelembagaan, diklat kepengurusan, dan fasilitasi sertifikasi",
      dampak: "Penurunan kepercayaan masyarakat terhadap koperasi, kerugian modal anggota",
      likelihood: 4,
      impact: 3,
      mitigasi: "Penyelenggaraan pelatihan sertifikasi pengurus koperasi secara rutin dan fasilitasi kemitraan pasar",
      owner: "Bidang Kelembagaan Koperasi",
      jadwal: "Triwulan I & II",
      status: "Selesai"
    },
    {
      id: 3,
      sasaran: "Mengoptimalkan serapan dan efisiensi anggaran belanja DPA dinas",
      kejadian: "Realisasi anggaran Program Kerja Renstra/DPA terlambat (silpa tinggi)",
      penyebab: "Keterlambatan verifikasi berkas pertanggungjawaban dan pengajuan administrasi keuangan",
      dampak: "Penurunan nilai evaluasi SAKIP dinas, tertundanya pembangunan sarana fisik koperasi",
      likelihood: 3,
      impact: 3,
      mitigasi: "Penyusunan milestone bulanan ketat, digitalisasi pengajuan berkas pertanggungjawaban belanja",
      owner: "Sekretariat Dinas",
      jadwal: "Triwulan III & IV",
      status: "Berjalan"
    },
    {
      id: 4,
      sasaran: "Menjaga keamanan data pelaku usaha mikro daerah",
      kejadian: "Kebocoran data rahasia/identitas pelaku usaha UMKM dan koperasi",
      penyebab: "Belum diterapkannya enkripsi berkas digital sensitif dan lemahnya firewall sistem",
      dampak: "Tuntutan hukum privasi, menurunnya reputasi dan kredibilitas sistem informasi dinas",
      likelihood: 2,
      impact: 4,
      mitigasi: "Implementasi sertifikat keamanan SSL, enkripsi database, dan otentikasi berlapis (MFA)",
      owner: "Subbagian Umum (IT)",
      jadwal: "Triwulan I",
      status: "Selesai"
    },
    {
      id: 5,
      sasaran: "Meningkatkan akuntabilitas pengelolaan barang milik daerah (KIB)",
      kejadian: "Kerusakan berkas fisik atau kehilangan pelacakan aset KIB B & E",
      penyebab: "Penyimpanan dokumen kepemilikan aset masih didominasi arsip kertas manual",
      dampak: "Temuan audit fisik aset daerah, kesulitan klaim kepemilikan legal aset negara",
      likelihood: 1,
      impact: 3,
      mitigasi: "Digitalisasi arsip KIB B & E menggunakan kode QR terpusat dengan backup cloud berkala",
      owner: "Pengurus Barang Daerah",
      jadwal: "Triwulan IV",
      status: "Berjalan"
    }
  ]);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
    sasaran: "",
    kejadian: "",
    penyebab: "",
    dampak: "",
    likelihood: 3,
    impact: 3,
    mitigasi: "",
    owner: "Bidang Pemberdayaan UMKM",
    jadwal: "Triwulan I",
    status: "Berjalan"
  });

  // Selected Heatmap Coordinates for Filtering
  const [selectedCell, setSelectedCell] = useState(null); // { l: Number, i: Number }

  // Helpers to define risk level color
  const getRiskLevel = (l, i) => {
    const score = l * i;
    if (score >= 15) return { label: "Ekstrim (High)", color: "bg-red-500 text-white", textClass: "text-red-600", borderClass: "border-red-200", bgLight: "bg-red-50" };
    if (score >= 8) return { label: "Tinggi (Medium-High)", color: "bg-amber-500 text-white", textClass: "text-amber-600", borderClass: "border-amber-200", bgLight: "bg-amber-50" };
    if (score >= 4) return { label: "Sedang (Medium)", color: "bg-yellow-400 text-slate-800", textClass: "text-yellow-600", borderClass: "border-yellow-200", bgLight: "bg-yellow-50" };
    return { label: "Rendah (Low)", color: "bg-emerald-500 text-white", textClass: "text-emerald-600", borderClass: "border-emerald-200", bgLight: "bg-emerald-50" };
  };

  // Stats
  const stats = useMemo(() => {
    const total = risks.length;
    let extreme = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    let completed = 0;

    risks.forEach(r => {
      const score = r.likelihood * r.impact;
      if (score >= 15) extreme++;
      else if (score >= 8) high++;
      else if (score >= 4) medium++;
      else low++;

      if (r.status === "Selesai") completed++;
    });

    return { 
      total, 
      extreme, 
      high, 
      medium, 
      low, 
      progress: total ? Math.round((completed / total) * 100) : 0 
    };
  }, [risks]);

  // Filtered Risks based on Heatmap selection
  const filteredRisks = useMemo(() => {
    if (!selectedCell) return risks;
    return risks.filter(r => r.likelihood === selectedCell.l && r.impact === selectedCell.i);
  }, [risks, selectedCell]);

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "likelihood" || name === "impact" ? Number(value) : value
    }));
  };

  // Handle Submit (Create & Update)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setRisks(prev => prev.map(r => r.id === currentId ? { ...formData, id: currentId } : r));
    } else {
      setRisks(prev => [...prev, { ...formData, id: Date.now() }]);
    }
    closeModal();
  };

  // Open Add Modal
  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      sasaran: "",
      kejadian: "",
      penyebab: "",
      dampak: "",
      likelihood: 3,
      impact: 3,
      mitigasi: "",
      owner: "Bidang Pemberdayaan UMKM",
      jadwal: "Triwulan I",
      status: "Berjalan"
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (risk) => {
    setIsEditing(true);
    setCurrentId(risk.id);
    setFormData({ ...risk });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentId(null);
  };

  // Handle Delete
  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus identifikasi risiko ini?")) {
      setRisks(prev => prev.filter(r => r.id !== id));
      if (selectedCell) setSelectedCell(null);
    }
  };

  // Helper to count risks in cell (Heatmap grid count helper)
  const getCellCount = (l, i) => {
    return risks.filter(r => r.likelihood === l && r.impact === i).length;
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-16">
      {/* HEADER */}
      <div className="bg-white px-8 py-6 shadow-sm border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-50 print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            title="Kembali"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="text-emerald-600 w-8 h-8" />
              Manajemen Risiko (MR-SPIP)
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Daftar Register Risiko & Rencana Tindak Pengendalian (RTP) Dinas Koperasi & UKM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 h-[38px] w-full justify-center md:w-auto"
          >
            <Plus size={16} />
            Identifikasi Risiko Baru
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 h-[38px] w-full justify-center md:w-auto"
          >
            <Printer size={16} />
            Cetak Register
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        
        {/* EXPLANATORY HERO */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden print:hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
            <ShieldCheck size={300} />
          </div>
          <div className="max-w-3xl space-y-4">
            <span className="px-3 py-1 bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-widest rounded-full inline-flex items-center gap-1.5">
              <ShieldCheck size={12} /> Pengawasan Intern Pemerintah (SPIP)
            </span>
            <h2 className="text-3xl font-black tracking-tight leading-tight">
              Manajemen Risiko Instansi Pemerintah
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              Sesuai dengan standar Badan Pengawasan Keuangan dan Pembangunan (BPKP), Manajemen Risiko di Dinas Koperasi & UKM bertujuan memetakan hambatan pencapaian sasaran strategis daerah. Dengan mengidentifikasi akar penyebab dan merumuskan Rencana Tindak Pengendalian (RTP), kita memitigasi penyimpangan tata kelola keuangan, inefisiensi aset, dan kebocoran pelayanan publik.
            </p>
          </div>
        </div>

        {/* COUNTER GRID */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:hidden">
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm text-center">
            <div className="text-2xl font-black text-slate-800">{stats.total}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Total Risiko</div>
          </div>
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm text-center border-l-4 border-l-red-500">
            <div className="text-2xl font-black text-red-600">{stats.extreme}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Risiko Ekstrim</div>
          </div>
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm text-center border-l-4 border-l-amber-500">
            <div className="text-2xl font-black text-amber-600">{stats.high}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Risiko Tinggi</div>
          </div>
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm text-center border-l-4 border-l-yellow-400">
            <div className="text-2xl font-black text-yellow-600">{stats.medium}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Risiko Sedang</div>
          </div>
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm text-center">
            <div className="text-2xl font-black text-emerald-600">{stats.progress}%</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">RTP Selesai</div>
          </div>
        </div>

        {/* RISK MATRIX HEATMAP (5x5 GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm space-y-4 print:hidden">
            <div>
              <h3 className="font-black text-slate-800 text-sm tracking-tight">Matriks Peta Risiko (Heatmap 5x5)</h3>
              <p className="text-[11px] text-slate-400 font-medium">Klik pada koordinat kotak warna untuk memfilter tabel di bawah</p>
            </div>

            {/* Matrix View */}
            <div className="flex flex-col items-center">
              {/* Y Axis Label (Dampak) */}
              <div className="flex w-full">
                <div className="w-8 shrink-0 flex items-center justify-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest -rotate-90 origin-center whitespace-nowrap">
                    Kemungkinan (L)
                  </span>
                </div>
                
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((lVal) => (
                    <div key={lVal} className="flex gap-1 items-center h-10">
                      {/* Label Row */}
                      <span className="w-5 text-[10px] font-black text-slate-400 text-right pr-1.5">{lVal}</span>
                      
                      {/* 5 columns */}
                      {[1, 2, 3, 4, 5].map((iVal) => {
                        const score = lVal * iVal;
                        let cellBg = "bg-emerald-500";
                        if (score >= 15) cellBg = "bg-red-500";
                        else if (score >= 8) cellBg = "bg-amber-500";
                        else if (score >= 4) cellBg = "bg-yellow-400";
                        
                        const count = getCellCount(lVal, iVal);
                        const isSelected = selectedCell && selectedCell.l === lVal && selectedCell.i === iVal;
                        
                        return (
                          <button
                            key={iVal}
                            onClick={() => {
                              if (isSelected) setSelectedCell(null);
                              else setSelectedCell({ l: lVal, i: iVal });
                            }}
                            className={`flex-1 h-full rounded-md relative flex items-center justify-center font-black text-xs transition-all hover:scale-105 ${cellBg} ${
                              isSelected ? "ring-4 ring-slate-800 shadow-md scale-105" : "text-white/60 hover:text-white"
                            }`}
                            title={`L: ${lVal}, I: ${iVal} (Score: ${score})`}
                          >
                            {count > 0 ? (
                              <span className="bg-white text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-sm animate-bounce">
                                {count}
                              </span>
                            ) : (
                              <span className="text-[8px] opacity-40">{score}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                  
                  {/* X Axis Labels (Kemungkinan) */}
                  <div className="flex gap-1 pt-1 pl-5">
                    {[1, 2, 3, 4, 5].map((iVal) => (
                      <span key={iVal} className="flex-1 text-[10px] font-black text-slate-400 text-center">{iVal}</span>
                    ))}
                  </div>
                  <div className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest pt-1">
                    Dampak (I)
                  </div>
                </div>
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="grid grid-cols-4 gap-2 pt-2 text-[8px] font-bold text-center border-t border-slate-100">
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 bg-red-500 rounded mb-0.5"></span>
                <span className="text-slate-400">15-25 Ekstrim</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 bg-amber-500 rounded mb-0.5"></span>
                <span className="text-slate-400">8-12 Tinggi</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 bg-yellow-400 rounded mb-0.5"></span>
                <span className="text-slate-400">4-6 Sedang</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 bg-emerald-500 rounded mb-0.5"></span>
                <span className="text-slate-400">1-3 Rendah</span>
              </div>
            </div>
          </div>

          {/* MATRIKS PENETAPAN KRITERIA DAMPAK & KEMUNGKINAN */}
          <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm space-y-4 print:hidden">
            <div>
              <h3 className="font-black text-slate-800 text-sm tracking-tight flex items-center gap-2">
                <Layers className="text-indigo-500 w-5 h-5" />
                Matriks Skala Penetapan Kriteria BPKP
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Acuan standardisasi penilaian risiko lingkungan instansi daerah</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-600 leading-relaxed">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <strong className="text-slate-800 block border-b border-slate-200 pb-1.5 uppercase text-[10px] tracking-wider text-indigo-600">Skala Kemungkinan (L)</strong>
                <ul className="space-y-1 text-[11px]">
                  <li><strong className="text-slate-800">5. Hampir Pasti:</strong> Terjadi &gt; 12 kali dalam 1 tahun terakhir.</li>
                  <li><strong className="text-slate-800">4. Sering:</strong> Terjadi 6 - 12 kali dalam 1 tahun terakhir.</li>
                  <li><strong className="text-slate-800">3. Sedang:</strong> Terjadi 3 - 5 kali dalam 1 tahun terakhir.</li>
                  <li><strong className="text-slate-800">2. Jarang:</strong> Terjadi 1 - 2 kali dalam 1 tahun terakhir.</li>
                  <li><strong className="text-slate-800">1. Sangat Jarang:</strong> Tidak pernah terjadi dalam 2 tahun terakhir.</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <strong className="text-slate-800 block border-b border-slate-200 pb-1.5 uppercase text-[10px] tracking-wider text-indigo-600">Skala Dampak Kerugian (I)</strong>
                <ul className="space-y-1 text-[11px]">
                  <li><strong className="text-slate-800">5. Sangat Berat:</strong> Kegagalan pelayanan fatal, kerugian APBD besar.</li>
                  <li><strong className="text-slate-800">4. Berat:</strong> Pemeriksaan hukum eksternal, kegagalan target strategis dinas.</li>
                  <li><strong className="text-slate-800">3. Sedang:</strong> Pengaduan publik meluas, target dinas terhambat &lt; 3 bulan.</li>
                  <li><strong className="text-slate-800">2. Ringan:</strong> Penanganan internal dinas, efisiensi sedikit terganggu.</li>
                  <li><strong className="text-slate-800">1. Sangat Ringan:</strong> Kerugian operasional minor yang cepat diatasi.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* REGISTER TABLE */}
        <div className="bg-white border border-slate-200/60 rounded-[2rem] shadow-sm overflow-hidden">
          
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-black text-slate-800 tracking-tight text-base flex items-center gap-2">
                Daftar Registrasi Risiko (Risk Register)
                {selectedCell && (
                  <span className="px-2.5 py-0.5 bg-slate-800 text-white text-[9px] font-black uppercase rounded-full tracking-wider flex items-center gap-1">
                    Filter L:{selectedCell.l} I:{selectedCell.i}
                    <button onClick={() => setSelectedCell(null)} className="hover:text-red-300 font-bold ml-1 font-mono">×</button>
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Buku mitigasi risiko SAKIP Dinas Koperasi & UKM</p>
            </div>
            
            {selectedCell && (
              <button
                onClick={() => setSelectedCell(null)}
                className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-all flex items-center gap-1"
              >
                <Filter size={12} /> Reset Filter Heatmap
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[1200px]">
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                  <th className="p-4 w-12 text-center">No</th>
                  <th className="p-4 w-56">Sasaran Kerja Renstra</th>
                  <th className="p-4 w-52 text-red-600">Kejadian Risiko</th>
                  <th className="p-4 w-44">Penyebab Root Cause</th>
                  <th className="p-4 w-44">Dampak Negatif</th>
                  <th className="p-4 w-28 text-center">Analisis (L x I)</th>
                  <th className="p-4 w-60 text-emerald-700">Mitigasi Pengendalian (RTP)</th>
                  <th className="p-4 w-40">Pengampu Owner</th>
                  <th className="p-4 w-24 text-center">Jadwal</th>
                  <th className="p-4 w-28 text-center">Status</th>
                  <th className="p-4 w-28 text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRisks.map((risk, index) => {
                  const score = risk.likelihood * risk.impact;
                  const level = getRiskLevel(risk.likelihood, risk.impact);
                  
                  return (
                    <tr key={risk.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 font-bold text-slate-400 text-center">{index + 1}</td>
                      <td className="p-4 text-slate-700 font-medium leading-relaxed">{risk.sasaran}</td>
                      <td className="p-4 font-bold text-slate-800 leading-relaxed bg-red-50/10">{risk.kejadian}</td>
                      <td className="p-4 text-slate-500 leading-relaxed">{risk.penyebab}</td>
                      <td className="p-4 text-slate-500 leading-relaxed">{risk.dampak}</td>
                      
                      {/* Analysis score cell */}
                      <td className="p-4 text-center">
                        <div className="space-y-1">
                          <div className="font-black text-slate-800 text-xs">{risk.likelihood} × {risk.impact} = {score}</div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider block ${level.color}`}>
                            {level.label}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4 font-medium text-slate-700 leading-relaxed bg-emerald-50/10">{risk.mitigasi}</td>
                      <td className="p-4 font-bold text-slate-600">{risk.owner}</td>
                      <td className="p-4 text-center font-bold text-slate-500 whitespace-nowrap">{risk.jadwal}</td>
                      
                      {/* Status */}
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider inline-block ${
                          risk.status === "Selesai" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {risk.status}
                        </span>
                      </td>

                      {/* CRUD Buttons */}
                      <td className="p-4 text-center print:hidden">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(risk)}
                            className="p-1.5 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-colors"
                            title="Edit identifikasi risiko"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(risk.id)}
                            className="p-1.5 bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors"
                            title="Hapus identifikasi risiko"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredRisks.length === 0 && (
                  <tr>
                    <td colSpan="11" className="p-12 text-center text-slate-400 font-bold italic">
                      Tidak ada identifikasi risiko terdaftar pada tingkat penilaian ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <ShieldCheck className="text-emerald-400" />
                  {isEditing ? "Edit Penilaian Risiko" : "Registrasi Identifikasi Risiko"}
                </h3>
                <p className="text-xs text-slate-400 font-medium">Buku Register Risiko & RTP Dinas Koperasi & UKM</p>
              </div>
              <button 
                onClick={closeModal}
                className="text-slate-400 hover:text-white font-mono text-xl font-bold p-1"
              >
                ×
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Sasaran Strategis Renstra</label>
                <textarea
                  name="sasaran"
                  value={formData.sasaran}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Meningkatkan pertumbuhan wirausaha mikro naik kelas..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none min-h-[60px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-red-500">Kejadian Risiko (Risk Event)</label>
                <textarea
                  name="kejadian"
                  value={formData.kejadian}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Adanya duplikasi data penerima bantuan hibah modal usaha..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Penyebab (Root Cause)</label>
                  <textarea
                    name="penyebab"
                    value={formData.penyebab}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: Proses verifikasi dokumen usaha masih manual..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none min-h-[60px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Dampak Negatif</label>
                  <textarea
                    name="dampak"
                    value={formData.dampak}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: Kerugian efisiensi anggaran negara, pengaduan publik..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none min-h-[60px]"
                  />
                </div>
              </div>

              {/* LIKELIHOOD AND IMPACT SELECTORS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Skala Kemungkinan (L)</label>
                  <select
                    name="likelihood"
                    value={formData.likelihood}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none"
                  >
                    <option value={1}>1. Sangat Jarang</option>
                    <option value={2}>2. Jarang</option>
                    <option value={3}>3. Sedang</option>
                    <option value={4}>4. Sering</option>
                    <option value={5}>5. Hampir Pasti</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Skala Dampak (I)</label>
                  <select
                    name="impact"
                    value={formData.impact}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none"
                  >
                    <option value={1}>1. Sangat Ringan</option>
                    <option value={2}>2. Ringan</option>
                    <option value={3}>3. Sedang</option>
                    <option value={4}>4. Berat</option>
                    <option value={5}>5. Sangat Berat</option>
                  </select>
                </div>
                
                {/* Dynamically calculated score badge */}
                <div className="flex flex-col justify-center items-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Tingkat Risiko</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-800">{formData.likelihood * formData.impact}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      getRiskLevel(formData.likelihood, formData.impact).color
                    }`}>
                      {getRiskLevel(formData.likelihood, formData.impact).label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-emerald-700">Mitigasi Pengendalian (RTP)</label>
                <textarea
                  name="mitigasi"
                  value={formData.mitigasi}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Menerapkan validasi berkas izin digital berbasis QR dan audit mendadak..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 outline-none min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Pengampu (Owner)</label>
                  <select
                    name="owner"
                    value={formData.owner}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:border-indigo-500 outline-none"
                  >
                    <option value="Bidang Pemberdayaan UMKM">Bidang Pemberdayaan UMKM</option>
                    <option value="Bidang Kelembagaan Koperasi">Bidang Kelembagaan Koperasi</option>
                    <option value="Sekretariat Dinas">Sekretariat Dinas</option>
                    <option value="Subbagian Umum (IT)">Subbagian Umum (IT)</option>
                    <option value="Pengurus Barang Daerah">Pengurus Barang Daerah</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Jadwal Pelaksanaan</label>
                  <select
                    name="jadwal"
                    value={formData.jadwal}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:border-indigo-500 outline-none"
                  >
                    <option value="Triwulan I">Triwulan I</option>
                    <option value="Triwulan II">Triwulan II</option>
                    <option value="Triwulan III">Triwulan III</option>
                    <option value="Triwulan IV">Triwulan IV</option>
                    <option value="Triwulan I & II">Triwulan I & II</option>
                    <option value="Triwulan III & IV">Triwulan III & IV</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:border-indigo-500 outline-none"
                  >
                    <option value="Berjalan">Berjalan</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  {isEditing ? "Simpan Perubahan" : "Simpan Registrasi"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PRINT STYLES */}
      <style>
        {`
          @media print {
            @page {
              size: landscape;
              margin: 10mm;
            }

            body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .print\\:hidden,
            nav,
            footer,
            header,
            [class*="navbar"],
            [class*="footer"] {
              display: none !important;
            }

            .max-w-7xl {
              max-width: 100% !important;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }

            table {
              width: 100% !important;
              border-collapse: collapse !important;
            }

            th, td {
              border: 1px solid #000 !important;
              padding: 6px !important;
              font-size: 8px !important;
              color: black !important;
            }

            th {
              background: #f1f5f9 !important;
            }

            span {
              color: black !important;
              background: transparent !important;
              border: none !important;
              font-weight: bold !important;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>
    </div>
  );
}
