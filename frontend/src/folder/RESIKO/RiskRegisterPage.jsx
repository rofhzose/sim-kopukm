import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  Calendar,
  Building,
  AlertTriangle,
  Award,
  Search
} from "lucide-react";

export default function RiskRegisterPage() {
  const navigate = useNavigate();

  // Shared pre-populated risks data with synchronized context
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
      jadwal: "Triwulan I",
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
      jadwal: "Triwulan III",
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

  // Filter States
  const [filterOwner, setFilterOwner] = useState("Semua");
  const [filterJadwal, setFilterJadwal] = useState("Semua");
  const [filterLevel, setFilterLevel] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const getRiskLevelInfo = (l, i) => {
    const score = l * i;
    if (score >= 15) return { label: "Ekstrim", color: "bg-red-100 text-red-800 border-red-200" };
    if (score >= 8) return { label: "Tinggi", color: "bg-amber-100 text-amber-800 border-amber-200" };
    if (score >= 4) return { label: "Sedang", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    return { label: "Rendah", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  };

  // Toggle status inside row for monitoring
  const toggleRowStatus = (id) => {
    setRisks(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, status: r.status === "Selesai" ? "Berjalan" : "Selesai" };
      }
      return r;
    }));
  };

  // Filtered Risks
  const filteredRisks = useMemo(() => {
    return risks.filter(r => {
      const matchOwner = filterOwner === "Semua" || r.owner === filterOwner;
      const matchJadwal = filterJadwal === "Semua" || r.jadwal.includes(filterJadwal);
      
      const level = getRiskLevelInfo(r.likelihood, r.impact).label;
      const matchLevel = filterLevel === "Semua" || level === filterLevel;

      const query = searchQuery.toLowerCase();
      const matchSearch = !query || 
        r.sasaran.toLowerCase().includes(query) ||
        r.kejadian.toLowerCase().includes(query) ||
        r.mitigasi.toLowerCase().includes(query);

      return matchOwner && matchJadwal && matchLevel && matchSearch;
    });
  }, [risks, filterOwner, filterJadwal, filterLevel, searchQuery]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-16">
      
      {/* HEADER CONTROLS */}
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
              <FileSpreadsheet className="text-indigo-600 w-8 h-8" />
              Dokumen Risk Register Resmi
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Buku Log Registrasi Pengendalian Risiko Internal Instansi Pemkab
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 h-[38px] w-full justify-center md:w-auto"
        >
          <Printer size={16} />
          Cetak Register Resmi
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        
        {/* FILTERS PANEL */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-4 print:hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Filter className="text-indigo-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm">Filter Buku Registrasi</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search Box */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Cari Kata Kunci</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Cari kejadian, sasaran..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            {/* Filter Owner */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Unit Pengampu (Owner)</label>
              <select
                value={filterOwner}
                onChange={(e) => setFilterOwner(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
              >
                <option value="Semua">Semua Unit</option>
                <option value="Bidang Pemberdayaan UMKM">Bidang Pemberdayaan UMKM</option>
                <option value="Bidang Kelembagaan Koperasi">Bidang Kelembagaan Koperasi</option>
                <option value="Sekretariat Dinas">Sekretariat Dinas</option>
                <option value="Subbagian Umum (IT)">Subbagian Umum (IT)</option>
                <option value="Pengurus Barang Daerah">Pengurus Barang Daerah</option>
              </select>
            </div>

            {/* Filter Jadwal */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Jadwal Pelaksanaan</label>
              <select
                value={filterJadwal}
                onChange={(e) => setFilterJadwal(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
              >
                <option value="Semua">Semua Triwulan</option>
                <option value="Triwulan I">Triwulan I</option>
                <option value="Triwulan II">Triwulan II</option>
                <option value="Triwulan III">Triwulan III</option>
                <option value="Triwulan IV">Triwulan IV</option>
              </select>
            </div>

            {/* Filter Level */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tingkat Risiko</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
              >
                <option value="Semua">Semua Tingkatan</option>
                <option value="Ekstrim">Ekstrim</option>
                <option value="Tinggi">Tinggi</option>
                <option value="Sedang">Sedang</option>
                <option value="Rendah">Rendah</option>
              </select>
            </div>

          </div>
        </div>

        {/* OFFICIAL BOOK DOCUMENT PREVIEW */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-12 shadow-md space-y-8 relative overflow-hidden">
          
          {/* WATERMARK BACKGROUND (Visible in screen, hidden in print) */}
          <div className="absolute inset-0 opacity-[0.01] pointer-events-none flex items-center justify-center select-none print:hidden">
            <span className="text-[10vw] font-black tracking-widest text-slate-900 uppercase">DOKUMEN NEGARA</span>
          </div>

          {/* OFFICIAL KOP SURAT (GOVERNMENT LETTERHEAD) */}
          <div className="border-b-4 border-double border-slate-800 pb-6 flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
            {/* Logo Garuda / Pemkab Placeholder */}
            <div className="w-20 h-20 bg-slate-100 rounded-full border border-slate-300 flex items-center justify-center shrink-0">
              <Award className="text-slate-600 w-10 h-10" />
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-lg font-black tracking-wider text-slate-800 uppercase">Pemerintah Kabupaten / Kota</h2>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Dinas Koperasi dan Usaha Kecil Menengah</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">
                Jalan Pembangunan No. 12 Gedung SAKIP Utama, Jawa Barat | Telp: (022) 123456
              </p>
            </div>
          </div>

          {/* DOCUMENT TITLE BLOCK */}
          <div className="text-center space-y-2">
            <h3 className="text-base font-black uppercase text-slate-800 tracking-widest">
              Laporan Hasil Pemantauan Register Risiko (Risk Register)
            </h3>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex justify-center gap-4">
              <span>Tahun Anggaran: 2026</span>
              <span>•</span>
              <span>Dokumen Kode: MR-SPIP/DKUKM/2026</span>
            </div>
          </div>

          {/* TABLE LOG */}
          <div className="overflow-x-auto border border-slate-300 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 uppercase font-black tracking-wider text-[9px] border-b border-slate-300">
                  <th className="p-3 border-r border-slate-300 w-10 text-center">No</th>
                  <th className="p-3 border-r border-slate-300 w-44">Sasaran Program/Kegiatan</th>
                  <th className="p-3 border-r border-slate-300 w-48 text-red-700 bg-red-50/20">Identifikasi Kejadian Risiko</th>
                  <th className="p-3 border-r border-slate-300 w-44">Penyebab Kunci (Root Cause)</th>
                  <th className="p-3 border-r border-slate-300 w-20 text-center">Likelihood (L)</th>
                  <th className="p-3 border-r border-slate-300 w-16 text-center">Impact (I)</th>
                  <th className="p-3 border-r border-slate-300 w-24 text-center">Skor (L x I)</th>
                  <th className="p-3 border-r border-slate-300 w-52 text-emerald-800 bg-emerald-50/20">Rencana Tindak Pengendalian (RTP)</th>
                  <th className="p-3 border-r border-slate-300 w-36">Unit Penanggung Jawab</th>
                  <th className="p-3 border-r border-slate-300 w-20 text-center">Triwulan</th>
                  <th className="p-3 w-28 text-center">Status Mitigasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {filteredRisks.map((risk, index) => {
                  const score = risk.likelihood * risk.impact;
                  const level = getRiskLevelInfo(risk.likelihood, risk.impact);
                  
                  return (
                    <tr key={risk.id} className="hover:bg-slate-50/30">
                      <td className="p-3 border-r border-slate-300 text-center font-bold text-slate-400">{index + 1}</td>
                      <td className="p-3 border-r border-slate-300 text-slate-700 font-medium leading-relaxed">{risk.sasaran}</td>
                      <td className="p-3 border-r border-slate-300 font-bold text-slate-800 leading-relaxed">{risk.kejadian}</td>
                      <td className="p-3 border-r border-slate-300 text-slate-500 leading-relaxed">{risk.penyebab}</td>
                      <td className="p-3 border-r border-slate-300 text-center font-bold text-slate-700">{risk.likelihood}</td>
                      <td className="p-3 border-r border-slate-300 text-center font-bold text-slate-700">{risk.impact}</td>
                      
                      {/* Score cell */}
                      <td className="p-3 border-r border-slate-300 text-center">
                        <div className="space-y-1">
                          <div className="font-black text-slate-800">{score}</div>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider block border text-center ${level.color}`}>
                            {level.label}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 border-r border-slate-300 text-slate-600 leading-relaxed">{risk.mitigasi}</td>
                      <td className="p-3 border-r border-slate-300 font-bold text-slate-600">{risk.owner}</td>
                      <td className="p-3 border-r border-slate-300 text-center font-bold text-slate-500 whitespace-nowrap">{risk.jadwal}</td>
                      
                      {/* Interactive toggle for Triwulan status monitoring */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleRowStatus(risk.id)}
                          className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all print:border print:border-slate-400 ${
                            risk.status === "Selesai" 
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          }`}
                          title="Klik untuk mengubah status realisasi"
                        >
                          {risk.status}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredRisks.length === 0 && (
                  <tr>
                    <td colSpan="11" className="p-12 text-center text-slate-400 font-bold italic">
                      Tidak ada registrasi risiko terdaftar untuk pencarian atau filter saat ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* SIGNATURE BLOCK / LEMBAR PENGESAHAN (BPKP STANDARD) */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-8 text-xs font-semibold text-slate-700 leading-relaxed">
            
            {/* Preparer signature */}
            <div className="text-center w-60 space-y-16">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Disusun Oleh,</p>
                <p className="font-black text-slate-700">Koordinator Satgas SPIP Dinas</p>
              </div>
              <div className="space-y-0.5">
                <p className="font-bold underline text-slate-900 uppercase">MOH. HASAN BASRI, S.E., M.Si</p>
                <p className="text-slate-400 text-[10px]">NIP. 19820415 200812 1 003</p>
              </div>
            </div>

            {/* Approver signature */}
            <div className="text-center w-60 space-y-16">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Mengetahui & Menyetujui,</p>
                <p className="font-black text-slate-700">Kepala Dinas Koperasi & UKM</p>
              </div>
              <div className="space-y-0.5">
                <p className="font-bold underline text-slate-900 uppercase">H. SUPRIADINATA, S.H., M.Si</p>
                <p className="text-slate-400 text-[10px]">NIP. 19741022 199803 1 002</p>
              </div>
            </div>

          </div>

        </div>

      </div>

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

            .bg-white {
              border: none !important;
              box-shadow: none !important;
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
