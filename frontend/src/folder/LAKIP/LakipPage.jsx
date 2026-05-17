import React, { useEffect, useState, useCallback, useMemo } from "react";
import Footer from "@/components/Footer";
import { Plus, Search, PencilLine, Trash2, Eye, FileText, AlertCircle, ArrowLeft, UploadCloud, CheckCircle, BarChart2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FilePreviewModal from "@/LAYOUTS/FilePreviewModal";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:4849" });

const TRIWULAN_OPTIONS = [
  { value: "", label: "-- Pilih Triwulan --" },
  { value: "TW I", label: "Triwulan I" },
  { value: "TW II", label: "Triwulan II" },
  { value: "TW III", label: "Triwulan III" },
  { value: "TW IV", label: "Triwulan IV" },
  { value: "Tahunan", label: "Tahunan" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 5 + i);
const START_YEAR = 2021;
const REKAP_YEARS = Array.from(
  { length: CURRENT_YEAR - START_YEAR + 2 },
  (_, i) => START_YEAR + i,
);
const TW_KEY = { "TW I": "q1", "TW II": "q2", "TW III": "q3", "TW IV": "q4", Tahunan: "tahunan" };

function StatusBadge({ active, animating, isPast }) {
  if (active) {
    return (
      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold border border-emerald-200 shadow-sm transition-all duration-500 ${animating ? "scale-125 ring-2 ring-emerald-400 ring-offset-1" : ""}`}>
        ✓
      </span>
    );
  }
  if (isPast) {
    return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-500 text-xs font-bold border border-red-200 shadow-sm">✗</span>;
  }
  return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-300 text-xs font-bold border border-slate-200">–</span>;
}

export default function LakipPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadingTriwulan, setUploadingTriwulan] = useState("");
  const [uploadingTahun, setUploadingTahun] = useState(String(CURRENT_YEAR));
  const [search, setSearch] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [newCell, setNewCell] = useState(null);

  const generatedName = uploadingTriwulan && uploadingTahun ? `LAKIP - ${uploadingTriwulan} ${uploadingTahun}` : uploadingTahun ? `LAKIP - ${uploadingTahun}` : "LAKIP - ";

  const rekapData = useMemo(() => {
    const fileYears = files.map((f) => Number(f.tahun)).filter(Boolean);
    const allYears = Array.from(new Set([...REKAP_YEARS, ...fileYears])).sort((a, b) => a - b);
    return allYears.map((tahun) => {
      const yr = files.filter((f) => Number(f.tahun) === tahun);
      return {
        tahun,
        q1: yr.some((f) => f.triwulan === "TW I"),
        q2: yr.some((f) => f.triwulan === "TW II"),
        q3: yr.some((f) => f.triwulan === "TW III"),
        q4: yr.some((f) => f.triwulan === "TW IV"),
        tahunan: yr.some((f) => f.triwulan === "Tahunan"),
      };
    });
  }, [files]);

  const completionOf = (r) => {
    const vals = [r.q1, r.q2, r.q3, r.q4, r.tahunan];
    return Math.round((vals.filter(Boolean).length / vals.length) * 100);
  };

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/api/dokumen/lakip");
      if (res.data?.success) {
        setFiles(res.data.data || []);
        setFilteredFiles(res.data.data || []);
      }
    } catch {
      setError("Gagal memuat data LAKIP");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const handleSearch = (q) => {
    setSearch(q);
    if (!q.trim()) { setFilteredFiles(files); return; }
    setFilteredFiles(files.filter((f) => f.name?.toLowerCase().includes(q.toLowerCase())));
  };

  const handlePreview = (file) => {
    setPreviewFile({ name: file.name, mime: file.mime, url: `${api.defaults.baseURL}/api/dokumen/lakip/${file.id}` });
    setPreviewOpen(true);
  };

  const handleEdit = async (file) => {
    const n = prompt("Ubah nama dokumen:", file.name);
    if (!n?.trim()) return;
    try {
      const res = await api.put(`/api/dokumen/lakip/${file.id}`, { name: n.trim() });
      if (res.data?.success) {
        setFiles((p) => p.map((f) => (f.id === file.id ? res.data.data : f)));
        setFilteredFiles((p) => p.map((f) => (f.id === file.id ? res.data.data : f)));
      }
    } catch (err) { alert(err.response?.data?.message || "Gagal mengubah dokumen"); }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Hapus dokumen "${file.name}"?`)) return;
    try {
      const res = await api.delete(`/api/dokumen/lakip/${file.id}`);
      if (res.data?.success) {
        setFiles((p) => p.filter((f) => f.id !== file.id));
        setFilteredFiles((p) => p.filter((f) => f.id !== file.id));
      }
    } catch (err) { alert(err.response?.data?.message || "Gagal menghapus dokumen"); }
  };

  const handleFileChange = (e) => { setUploadingFile(e.target.files?.[0] || null); setUploadError(""); };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadingFile) { setUploadError("Pilih file terlebih dahulu"); return; }
    if (!uploadingTriwulan) { setUploadError("Pilih triwulan terlebih dahulu"); return; }
    if (!uploadingTahun) { setUploadError("Pilih tahun terlebih dahulu"); return; }

    const fd = new FormData();
    fd.append("file", uploadingFile);
    fd.append("title", generatedName);
    fd.append("triwulan", uploadingTriwulan);
    fd.append("tahun", uploadingTahun);

    try {
      setIsUploading(true);
      setUploadError("");
      const res = await api.post("/api/dokumen/lakip/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data?.success) {
        const uploaded = res.data.data;
        setFiles((prev) => [uploaded, ...prev]);
        setFilteredFiles((prev) => [uploaded, ...prev]);
        const cellKey = `${uploaded.tahun}-${TW_KEY[uploaded.triwulan]}`;
        setNewCell(cellKey);
        setTimeout(() => setNewCell(null), 1400);
        setUploadingFile(null);
        setUploadingTriwulan("");
        setUploadingTahun(String(CURRENT_YEAR));
        const el = document.getElementById("lakip-upload");
        if (el) el.value = "";
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch (err) { setUploadError(err.response?.data?.message || "Gagal mengupload file"); }
    finally { setIsUploading(false); }
  };

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" }) : "-");

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-cyan-50/40 text-gray-900 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.07] bg-linear-to-br from-blue-400 to-cyan-300 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.07] bg-linear-to-tl from-blue-500 to-indigo-300 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* ── Header (tanpa search) ── */}
        <header className="backdrop-blur-xl bg-white/70 border-b border-blue-100 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-400/30">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800 tracking-tight">Dokumen LAKIP</h1>
                  <p className="text-gray-400 text-xs mt-0.5">Laporan Akuntabilitas Kinerja Instansi Pemerintah</p>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="self-start md:self-auto px-4 py-2 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-gray-600 font-medium text-sm transition-all flex items-center gap-2 shadow-sm"
              >
                <ArrowLeft size={14} /> Kembali
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-5">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-red-600 text-sm flex-1">{error}</p>
              <button onClick={fetchList} className="px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 text-xs font-medium">Coba Lagi</button>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-7 space-y-6">

          {/* ── Rekapitulasi ── */}
          <div className="rounded-2xl border border-blue-100 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="h-1 w-full bg-linear-to-r from-blue-500 via-cyan-400 to-emerald-400" />
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-linear-to-br from-blue-500 to-cyan-400">
                    <BarChart2 size={14} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-sm">Rekapitulasi LAKIP</h2>
                    <p className="text-gray-400 text-xs">Diperbarui otomatis saat dokumen diupload atau dihapus</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 inline-flex items-center justify-center text-emerald-600 text-[9px] font-bold">✓</span>
                    Tersedia
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-red-100 border border-red-200 inline-flex items-center justify-center text-red-500 text-[9px] font-bold">✗</span>
                    Tidak ada (lewat)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 inline-flex items-center justify-center text-slate-300 text-[9px] font-bold">–</span>
                    Belum waktunya
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-blue-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-linear-to-r from-blue-50 to-cyan-50/60 border-b border-blue-100">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tahun</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">TW I</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">TW II</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">TW III</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">TW IV</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Tahunan</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Kelengkapan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekapData.map((r) => {
                      const pct = completionOf(r);
                      const isCurrent = r.tahun === CURRENT_YEAR;
                      const isPast = r.tahun < CURRENT_YEAR;
                      return (
                        <tr key={r.tahun} className={`border-b border-blue-50 transition-colors duration-200 ${isCurrent ? "bg-blue-50/40" : isPast && pct < 100 ? "bg-red-50/20" : "bg-white/50"} hover:bg-blue-50/60`}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-800">{r.tahun}</span>
                              {isCurrent && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 border border-blue-200 uppercase tracking-wide">Sekarang</span>}
                              {isPast && pct === 100 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 uppercase tracking-wide">Lengkap</span>}
                              {isPast && pct < 100 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-500 border border-red-200 uppercase tracking-wide">Tidak Lengkap</span>}
                            </div>
                          </td>
                          {[{ k: "q1", v: r.q1 }, { k: "q2", v: r.q2 }, { k: "q3", v: r.q3 }, { k: "q4", v: r.q4 }, { k: "tahunan", v: r.tahunan }].map(({ k, v }) => (
                            <td key={k} className="px-5 py-3.5 text-center">
                              <StatusBadge active={v} animating={newCell === `${r.tahun}-${k}`} isPast={isPast} />
                            </td>
                          ))}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? "bg-linear-to-r from-emerald-400 to-emerald-500" : isPast ? "bg-linear-to-r from-red-300 to-red-400" : pct >= 60 ? "bg-linear-to-r from-blue-400 to-cyan-400" : "bg-linear-to-r from-blue-300 to-blue-400"}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold w-9 text-right tabular-nums ${pct === 100 ? "text-emerald-600" : isPast ? "text-red-500" : "text-gray-500"}`}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Upload Section ── */}
          <div className="rounded-2xl border border-blue-100 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="h-1 w-full bg-linear-to-r from-blue-500 via-cyan-400 to-blue-400" />
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-1.5 rounded-lg bg-linear-to-br from-blue-500 to-cyan-400">
                  <UploadCloud size={14} className="text-white" />
                </div>
                <h2 className="font-bold text-gray-800 text-sm">Upload Dokumen LAKIP</h2>
              </div>

              {uploadSuccess && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-2.5">
                  <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                  <p className="text-emerald-700 text-sm font-semibold">Berhasil diupload! Rekapitulasi diperbarui secara otomatis.</p>
                </div>
              )}
              {uploadError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 flex items-center gap-2.5">
                  <AlertCircle size={15} className="text-red-500 shrink-0" />
                  <p className="text-red-600 text-sm">{uploadError}</p>
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="relative cursor-pointer">
                    <input id="lakip-upload" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    <div className={`w-full px-4 py-2.5 rounded-xl border text-sm flex items-center gap-2 transition-all ${uploadingFile ? "border-blue-400 bg-blue-50 text-blue-700" : "border-blue-200 bg-white/70 text-gray-500 hover:border-blue-400"}`}>
                      <FileText size={13} className="text-blue-400 shrink-0" />
                      <span className="truncate">{uploadingFile ? uploadingFile.name : "Pilih file..."}</span>
                    </div>
                  </label>

                  <select value={uploadingTriwulan} onChange={(e) => setUploadingTriwulan(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-white/70 border border-blue-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer transition-all">
                    {TRIWULAN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>

                  <select value={uploadingTahun} onChange={(e) => setUploadingTahun(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-white/70 border border-blue-200 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer transition-all">
                    {YEAR_OPTIONS.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-3 px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-50 to-cyan-50/60 border border-blue-200 text-sm flex items-center gap-2">
                    <span className="text-blue-400 font-bold text-[10px] uppercase tracking-widest shrink-0">Preview</span>
                    <span className="font-semibold text-blue-700 truncate">{generatedName}</span>
                  </div>
                  <button type="submit" disabled={isUploading}
                    className="px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 disabled:opacity-50 font-bold text-sm text-white shadow-lg shadow-blue-400/25 flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed">
                    <Plus size={15} />
                    {isUploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── Table Section ── */}
          <div className="space-y-3">

            {/* Total dokumen + Search (berdampingan) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="inline-flex items-center gap-3 p-3.5 rounded-xl border border-blue-100 bg-white/80 shadow-sm shrink-0">
                <FileText size={16} className="text-blue-500" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Total Dokumen</p>
                  <p className="text-lg font-bold text-gray-800 leading-tight">{files.length}</p>
                </div>
              </div>

              {/* Search — di bawah total dokumen (full width sisa) */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari dokumen LAKIP..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 border border-blue-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-sm"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative w-12 h-12 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-cyan-400 animate-spin" />
                </div>
                <p className="text-gray-400 text-sm">Memuat dokumen...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/20">
                <FileText size={36} className="text-blue-200 mb-3" />
                <p className="text-base font-bold text-gray-600 mb-1">{search ? "Tidak ada hasil" : "Belum ada dokumen LAKIP"}</p>
                <p className="text-gray-400 text-sm">{search ? "Coba ubah kata kunci" : "Upload dokumen di atas untuk memulai"}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-2xl border border-blue-100 shadow-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-linear-to-r from-blue-50 to-cyan-50/60 border-b border-blue-100">
                        <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest w-12">No</th>
                        <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Nama Dokumen</th>
                        <th className="px-5 py-3.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest w-28">Triwulan</th>
                        <th className="px-5 py-3.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest w-20">Tahun</th>
                        <th className="px-5 py-3.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest w-36">Upload</th>
                        <th className="px-5 py-3.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest w-28">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file, index) => (
                        <tr key={file.id} className="border-b border-blue-50 hover:bg-blue-50/40 transition-colors group bg-white/60">
                          <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{index + 1}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors shrink-0">
                                <FileText size={12} className="text-blue-500" />
                              </div>
                              <span className="text-sm text-gray-700 font-medium group-hover:text-blue-700 transition-colors truncate max-w-xs">{file.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">{file.triwulan || "-"}</span>
                          </td>
                          <td className="px-5 py-3.5 text-center text-sm font-semibold text-gray-600">{file.tahun || "-"}</td>
                          <td className="px-5 py-3.5 text-center text-xs text-gray-400">{fmtDate(file.created_at)}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex justify-center gap-1.5">
                              <button onClick={() => handlePreview(file)} className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 transition-all" title="Lihat"><Eye size={13} /></button>
                              <button onClick={() => handleEdit(file)} className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-500 transition-all" title="Edit"><PencilLine size={13} /></button>
                              <button onClick={() => handleDelete(file)} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-all" title="Hapus"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Menampilkan {filteredFiles.length} dari {files.length} dokumen
                </p>
              </>
            )}
          </div>
        </main>

        {/* <Footer /> */}
      </div>

      <FilePreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} file={previewFile} />
    </div>
  );
}