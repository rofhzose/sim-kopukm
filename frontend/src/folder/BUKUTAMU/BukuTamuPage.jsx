import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Users, UserCheck, Calendar, ClipboardList, Search, 
  Plus, Printer, FileDown, ArrowLeft, Trash2, 
  MapPin, Phone, Briefcase, Building, Clock, CheckCircle2, QrCode, X, Save
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import Swal from "sweetalert2";
import { QRCodeCanvas } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";

const StatCard = ({ icon: Icon, title, value, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-all">
    <div className={`p-4 rounded-2xl ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-black text-slate-800">{value}</p>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
    </div>
  </div>
);

// KOMPONEN KHUSUS CETAK (LAPORAN RESMI)
const BukuTamuPrint = React.forwardRef(({ data, filterBulan, filterTahun, months }, ref) => {
  const currentMonthLabel = months.find(m => m.val === filterBulan)?.label || "Semua Bulan";
  
  return (
    <div ref={ref} className="p-10 text-black bg-white font-serif print:p-8">
      {/* KOP SURAT */}
      <div className="flex items-center justify-center border-b-4 border-black pb-4 mb-6 gap-6 text-center">
        <div className="shrink-0">
          <img src="/logo-karawang.png" alt="Logo" className="w-24 h-24 object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold uppercase tracking-widest">Pemerintah Kabupaten Karawang</h2>
          <h1 className="text-2xl font-black uppercase tracking-widest">Dinas Koperasi dan Usaha Kecil Menengah</h1>
          <p className="text-sm font-medium italic">Jl. Surotokunto No. 1, Karawang Timur, Karawang, Jawa Barat</p>
          <p className="text-sm font-medium">Email: dinkopukm@karawangkab.go.id | Telp: (0267) 123456</p>
        </div>
      </div>

      {/* JUDUL LAPORAN */}
      <div className="text-center mb-8">
        <h3 className="text-lg font-bold uppercase underline decoration-2 underline-offset-4">Laporan Kunjungan Buku Tamu Digital</h3>
        <p className="text-sm mt-1 font-bold">Periode: {currentMonthLabel} {filterTahun}</p>
      </div>

      {/* TABEL LAPORAN */}
      <table className="w-full border-collapse border-2 border-black text-[11px]">
        <thead>
          <tr className="bg-slate-100">
            <th className="border-2 border-black px-2 py-3 text-center w-8 uppercase">No</th>
            <th className="border-2 border-black px-3 py-3 text-left uppercase">Nama Tamu</th>
            <th className="border-2 border-black px-3 py-3 text-left uppercase">Instansi / Jabatan</th>
            <th className="border-2 border-black px-3 py-3 text-center uppercase">Kontak</th>
            <th className="border-2 border-black px-3 py-3 text-left uppercase">Keperluan / Kegiatan</th>
            <th className="border-2 border-black px-3 py-3 text-center uppercase">Waktu Hadir</th>
            <th className="border-2 border-black px-3 py-3 text-center uppercase">Ket</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" className="border-2 border-black px-3 py-10 text-center italic">Tidak ada data kunjungan pada periode ini</td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr key={item.id} className="break-inside-avoid">
                <td className="border-2 border-black px-2 py-2 text-center">{idx + 1}</td>
                <td className="border-2 border-black px-3 py-2 font-bold uppercase">{item.nama_tamu}</td>
                <td className="border-2 border-black px-3 py-2">
                  <div className="font-bold">{item.instansi || "-"}</div>
                  <div className="text-[10px] italic">{item.jabatan || "-"}</div>
                </td>
                <td className="border-2 border-black px-3 py-2 text-center">{item.kontak || "-"}</td>
                <td className="border-2 border-black px-3 py-2">
                  <div className="font-bold">{item.kegiatan || "-"}</div>
                  <div className="text-[10px] italic">Lokasi: {item.lokasi}</div>
                </td>
                <td className="border-2 border-black px-3 py-2 text-center">
                  {new Date(item.waktu_hadir).toLocaleString('id-ID', { 
                    day: '2-digit', month: '2-digit', year: 'numeric', 
                    hour: '2-digit', minute: '2-digit' 
                  })}
                </td>
                <td className="border-2 border-black px-3 py-2 text-center text-[9px] uppercase font-bold">{item.metode}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* TANDA TANGAN */}
      <div className="mt-12 flex justify-end">
        <div className="text-center w-64 space-y-20">
          <div className="space-y-1">
            <p className="text-sm">Karawang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="text-sm font-bold uppercase">Petugas Penerima Tamu</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold border-b border-black inline-block px-8 uppercase">................................................</p>
            <p className="text-xs font-medium">NIP. ........................................</p>
          </div>
        </div>
      </div>

      {/* FOOTER PRINT */}
      <div className="fixed bottom-0 left-0 right-0 text-[8px] text-slate-400 italic text-center print:block hidden">
        Dicetak otomatis melalui Sistem Informasi Buku Tamu Digital - {new Date().toLocaleString()}
      </div>
    </div>
  );
});

export default function BukuTamuPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, unik: 0, kegiatan: 0, hadir: 0 });
  const [kegiatanList, setKegiatanList] = useState([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBulan, setFilterBulan] = useState("Semua");
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear().toString());
  const [filterKegiatan, setFilterKegiatan] = useState("Semua");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [form, setForm] = useState({
    nama_tamu: "", instansi: "", jabatan: "", kontak: "", 
    kegiatan: "", keperluan: "", lokasi: "Dinas Koperasi dan UKM", 
    kategori: "", metode: "Manual"
  });

  // Refs
  const printRef = useRef(null);

  // Print Function
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan_Buku_Tamu_${filterBulan}_${filterTahun}`,
  });

  // Export Excel Function
  const handleExportExcel = () => {
    if (data.length === 0) {
      Swal.fire("Info", "Tidak ada data untuk di-export", "info");
      return;
    }

    // Header Laporan
    const currentMonthLabel = months.find(m => m.val === filterBulan)?.label || "Semua Bulan";
    const headerInfo = [
      ["LAPORAN KUNJUNGAN BUKU TAMU DIGITAL"],
      ["DINAS KOPERASI DAN USAHA KECIL MENENGAH KABUPATEN KARAWANG"],
      [`Periode: ${currentMonthLabel} ${filterTahun}`],
      [""], // Baris kosong
      ["No", "Nama Tamu", "Instansi", "Jabatan", "Kontak", "Keperluan / Kegiatan", "Lokasi", "Waktu Hadir", "Status", "Metode"]
    ];

    const bodyData = data.map((item, idx) => [
      idx + 1,
      item.nama_tamu?.toUpperCase(),
      item.instansi || "-",
      item.jabatan || "-",
      item.kontak || "-",
      item.kegiatan || "-",
      item.lokasi || "-",
      new Date(item.waktu_hadir).toLocaleString('id-ID'),
      item.status,
      item.metode
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([...headerInfo, ...bodyData]);
    
    // Styling Sederhana (Meratakan Kolom)
    const wscols = [
      { wch: 5 },  // No
      { wch: 30 }, // Nama
      { wch: 25 }, // Instansi
      { wch: 20 }, // Jabatan
      { wch: 15 }, // Kontak
      { wch: 40 }, // Keperluan
      { wch: 25 }, // Lokasi
      { wch: 20 }, // Waktu
      { wch: 10 }, // Status
      { wch: 10 }, // Metode
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Buku Tamu");
    XLSX.writeFile(workbook, `Laporan_Buku_Tamu_${filterBulan}_${filterTahun}.xlsx`);
  };

  const years = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];
  const months = [
    { val: "Semua", label: "Semua Bulan" },
    { val: "1", label: "Januari" }, { val: "2", label: "Februari" },
    { val: "3", label: "Maret" }, { val: "4", label: "April" },
    { val: "5", label: "Mei" }, { val: "6", label: "Juni" },
    { val: "7", label: "Juli" }, { val: "8", label: "Agustus" },
    { val: "9", label: "September" }, { val: "10", label: "Oktober" },
    { val: "11", label: "November" }, { val: "12", label: "Desember" }
  ];

  useEffect(() => {
    fetchData();
    fetchStats();
    fetchKegiatans();
  }, [filterBulan, filterTahun, filterKegiatan, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/buku-tamu", {
        params: { search: searchTerm, bulan: filterBulan, tahun: filterTahun, kegiatan: filterKegiatan }
      });
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get("/buku-tamu/stats");
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchKegiatans = async () => {
    try {
      const res = await axiosInstance.get("/buku-tamu/kegiatan-list");
      setKegiatanList(res.data || []);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/buku-tamu", form);
      Swal.fire("Berhasil", "Data tamu telah disimpan", "success");
      setShowAddModal(false);
      setForm({
        nama_tamu: "", instansi: "", jabatan: "", kontak: "", 
        kegiatan: "", keperluan: "", lokasi: "Dinas Koperasi dan UKM", 
        kategori: "", metode: "Manual"
      });
      fetchData();
      fetchStats();
      fetchKegiatans();
    } catch (err) {
      Swal.fire("Gagal", "Gagal menyimpan data tamu", "error");
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Hapus data tamu?",
      text: "Data yang dihapus tidak dapat dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus!"
    });

    if (res.isConfirmed) {
      try {
        await axiosInstance.delete(`/buku-tamu/${id}`);
        Swal.fire("Terhapus", "Data tamu telah dihapus", "success");
        fetchData();
        fetchStats();
      } catch (err) {
        Swal.fire("Gagal", "Gagal menghapus data tamu", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8 font-sans">
      
      {/* HEADER BAR */}
      <div className="space-y-4">
        <header className="bg-emerald-100/50 border border-emerald-200 p-4 rounded-2xl flex justify-between items-center backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
              <ClipboardList className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Buku Tamu Digital</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm transition-all">
              <ArrowLeft size={18} /> Kembali
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-100 transition-all">
            <Plus size={18} /> Tambah Tamu
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-100 transition-all">
            <Printer size={18} /> Cetak
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-100 transition-all">
            <FileDown size={18} /> Export
          </button>
          </div>
        </header>

        {/* QR CODE SECTION (NON-FLOATING) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 animate-in slide-in-from-top-2 duration-500">
          <div className="bg-white p-4 rounded-3xl border-2 border-slate-50 shadow-inner shrink-0">
            <QRCodeCanvas
              value={`${window.location.origin}/buku-tamu/check-in`}
              size={140}
              level={"H"}
              includeMargin={false}
            />
          </div>
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
              <QrCode size={12} /> Scan QR Check-in Mandiri
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Check-in Digital Lebih Cepat</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xl">
              Tamu dapat mengisi buku tamu secara mandiri melalui ponsel dengan memindai kode QR di samping. Hasil input akan otomatis muncul pada daftar tamu di bawah ini secara real-time.
            </p>
            <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Scan Kamera HP
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Tanpa Download Aplikasi
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Kunjungan" value={stats.total} icon={Users} colorClass="bg-blue-50 text-blue-600" />
        <StatCard title="Tamu Unik" value={stats.unik} icon={UserCheck} colorClass="bg-emerald-50 text-emerald-600" />
        <StatCard title="Kegiatan" value={stats.kegiatan} icon={Calendar} colorClass="bg-amber-50 text-amber-600" />
        <StatCard title="Hadir" value={stats.hadir} icon={CheckCircle2} colorClass="bg-rose-50 text-rose-600" />
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kegiatan</label>
          <select 
            value={filterKegiatan} 
            onChange={(e) => setFilterKegiatan(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400"
          >
            <option value="Semua">-- Semua Kegiatan --</option>
            {kegiatanList.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bulan</label>
          <select 
            value={filterBulan} 
            onChange={(e) => setFilterBulan(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400"
          >
            {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tahun</label>
          <select 
            value={filterTahun} 
            onChange={(e) => setFilterTahun(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pencarian</label>
          <div className="relative">
            <Search className="absolute left-4 top-3 text-slate-400 w-4 h-4" />
            <input 
              placeholder="Nama, instansi, jabatan, no HP..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-blue-50/30">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">Daftar Tamu</h2>
          </div>
          <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full shadow-md shadow-blue-100">{data.length} Tamu</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-12">No</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Tamu</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Instansi</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Jabatan</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Kontak</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Kegiatan</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Hadir</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">Metode</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-20 text-center text-slate-400 italic font-bold">Memuat data buku tamu...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-20 text-center text-slate-400 italic font-bold">Belum ada data kunjungan tamu</td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-black text-slate-700 uppercase">{item.nama_tamu}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{item.instansi || "-"}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{item.jabatan || "-"}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                      <div className="flex items-center gap-2">
                        <Phone size={14} /> {item.kontak || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800">{item.kegiatan || "Daftar Hadir"}</span>
                        <span className="text-[10px] flex items-center gap-1"><MapPin size={10} /> {item.lokasi}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-slate-500">
                      {new Date(item.waktu_hadir).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100 flex items-center justify-center gap-1 w-fit mx-auto">
                        <CheckCircle2 size={12} /> {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.metode === 'QR' ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-600'}`}>
                        {item.metode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ADD GUEST */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-blue-50 p-6 border-b border-blue-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Plus className="text-white w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Form Kunjungan Tamu</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1"><Users size={12} /> Nama Tamu *</label>
                  <input 
                    required placeholder="Masukkan nama lengkap" 
                    value={form.nama_tamu} onChange={e => setForm({...form, nama_tamu: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1"><Phone size={12} /> No HP</label>
                  <input 
                    placeholder="08xxxxxxxxxx" 
                    value={form.kontak} onChange={e => setForm({...form, kontak: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1"><Building size={12} /> Instansi</label>
                  <input 
                    placeholder="Nama Instansi/Perusahaan" 
                    value={form.instansi} onChange={e => setForm({...form, instansi: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1"><Briefcase size={12} /> Jabatan</label>
                  <input 
                    placeholder="Jabatan tamu" 
                    value={form.jabatan} onChange={e => setForm({...form, jabatan: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1"><Calendar size={12} /> Kegiatan / Keperluan *</label>
                  <input 
                    required placeholder="Tujuan kunjungan" 
                    value={form.kegiatan} onChange={e => setForm({...form, kegiatan: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1"><MapPin size={12} /> Lokasi</label>
                  <input 
                    placeholder="Lokasi pertemuan" 
                    value={form.lokasi} onChange={e => setForm({...form, lokasi: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 text-slate-500 font-black text-sm uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Batal</button>
                <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-100 transition-all">
                  <Save size={18} /> Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HIDDEN PRINT COMPONENT */}
      <div className="hidden">
        <BukuTamuPrint 
          ref={printRef} 
          data={data} 
          filterBulan={filterBulan} 
          filterTahun={filterTahun} 
          months={months} 
        />
      </div>

      {/* QR ZOOM MODAL FOR SELF CHECK-IN */}
      {showQrModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setShowQrModal(false)}
        >
          <div 
            className="bg-white p-8 rounded-[40px] shadow-2xl max-w-md w-full text-center animate-in zoom-in-95 duration-300 relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500"></div>
            
            <button 
              onClick={() => setShowQrModal(false)}
              className="absolute top-6 right-6 p-2.5 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <QrCode size={40} className="text-blue-600" />
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Scan QR Check-in</h3>
            <p className="text-sm text-slate-500 font-medium mb-8">Tamu dapat mengisi buku tamu secara mandiri dengan memindai kode QR ini</p>

            <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-inner inline-block mb-8">
              <QRCodeCanvas
                value={`${window.location.origin}/buku-tamu/check-in`}
                size={220}
                level={"H"}
                includeMargin={true}
              />
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Petunjuk Penggunaan</p>
              <p className="text-xs text-slate-600 font-bold leading-relaxed italic">
                Arahkan kamera ponsel Anda ke QR Code untuk membuka formulir kunjungan tamu digital.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
