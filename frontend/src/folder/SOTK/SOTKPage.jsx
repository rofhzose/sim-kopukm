import React, { useEffect, useState, useCallback } from "react";
import { 
  FileText, 
  PencilLine, 
  Trash2, 
  Plus, 
  AlertCircle, 
  ArrowLeft, 
  Eye, 
  UploadCloud, 
  CheckCircle,
  RotateCw,
  FlipHorizontal,
  RefreshCw,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import FilePreviewModal from "@/LAYOUTS/FilePreviewModal";

const api = axiosInstance || axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:4849" });

export default function SotkPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadingName, setUploadingName] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // States for interactive organizational structure image viewer (flip, rotate, zoom)
  const [rotation, setRotation] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [scale, setScale] = useState(1);

  const prefixHasApi = !!(api.defaults?.baseURL?.includes("/api"));
  const endpoints = {
    list:   prefixHasApi ? "/dokumen/sotk"         : "/api/dokumen/sotk",
    upload: prefixHasApi ? "/dokumen/sotk/upload"  : "/api/dokumen/sotk/upload",
    update: (id) => prefixHasApi ? `/dokumen/sotk/${id}` : `/api/dokumen/sotk/${id}`,
    remove: (id) => prefixHasApi ? `/dokumen/sotk/${id}` : `/api/dokumen/sotk/${id}`,
  };

  const ORG_IMAGE_PATH = "/public/SOTK_DINKOPUKM.jpeg";

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(endpoints.list);
      setFiles(res.data?.success ? res.data.data || [] : []);
    } catch { setError("Gagal memuat daftar dokumen."); setFiles([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const buildFileUrl = (filePath) => {
    const baseRaw = (api.defaults?.baseURL || "").replace(/\/$/, "");
    const base = baseRaw.endsWith("/api") ? baseRaw.slice(0, -4) : baseRaw;
    if (!filePath) return null;
    return filePath.startsWith("/") ? `${base}${filePath}` : `${base}/${filePath}`;
  };

  const detectMime = (file) => {
    if (file.mime) return file.mime;
    const name = file.name?.toLowerCase() || "";
    if (name.endsWith(".pdf")) return "application/pdf";
    if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
    if (name.endsWith(".png")) return "image/png";
    if (name.endsWith(".doc")) return "application/msword";
    if (name.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    return "application/octet-stream";
  };

  const handlePreview = (file) => {
    setPreviewFile({ name: file.name, mime: detectMime(file), url: buildFileUrl(file.path) });
    setPreviewOpen(true);
  };

  const handlePreviewOrgChart = () => {
    setPreviewFile({ name: "Struktur Organisasi DINKOPUKM", mime: "image/png", url: ORG_IMAGE_PATH });
    setPreviewOpen(true);
  };

  const handleEdit = async (file) => {
    const newName = prompt("Ubah nama dokumen:", file.name);
    if (!newName?.trim()) return;
    try {
      const res = await api.put(endpoints.update(file.id), { name: newName.trim() });
      if (res.data?.success) setFiles((p) => p.map((f) => (f.id === file.id ? res.data.data : f)));
      else alert(res.data?.message || "Gagal mengubah nama.");
    } catch (e) { alert(e.response?.data?.message || "Gagal mengubah dokumen."); }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Hapus dokumen "${file.name}"?`)) return;
    try {
      const res = await api.delete(endpoints.remove(file.id));
      if (res.data?.success) setFiles((p) => p.filter((f) => f.id !== file.id));
      else alert(res.data?.message || "Gagal menghapus.");
    } catch (e) { alert(e.response?.data?.message || "Gagal menghapus dokumen."); }
  };

  const MAX_FILE_BYTES = 25 * 1024 * 1024;
  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > MAX_FILE_BYTES) { alert("Ukuran file terlalu besar (maks 25MB)."); e.target.value = ""; return; }
    setUploadingFile(f);
    setUploadingName(f?.name?.replace(/\.[^/.]+$/, "") || "");
    setUploadError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadingFile) { setUploadError("Pilih file terlebih dahulu."); return; }
    if (!uploadingName.trim()) { setUploadError("Masukkan nama dokumen."); return; }
    const fd = new FormData();
    fd.append("file", uploadingFile);
    fd.append("title", uploadingName.trim());
    try {
      setIsUploading(true);
      setUploadError("");
      const res = await api.post(endpoints.upload, fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data?.success) {
        setFiles((p) => [res.data.data, ...p]);
        setUploadingFile(null);
        setUploadingName("");
        const el = document.getElementById("sotk-upload-input");
        if (el) el.value = "";
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } else { setUploadError(res.data?.message || "Upload gagal."); }
    } catch (e) { setUploadError(e.response?.data?.message || "Upload gagal (server)."); }
    finally { setIsUploading(false); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" }) : "-";

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 text-gray-900 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 bg-blue-300" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 bg-cyan-300" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/40 border-b border-blue-200/50 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 shadow-md shadow-blue-500/30">
                    <FileText size={20} className="text-white" />
                  </div>
                  <h1 className="text-4xl font-bold bg-linear-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    SOTK &amp; Dokumen
                  </h1>
                </div>
                <p className="text-gray-600 text-sm pl-1">Struktur Organisasi &amp; Tata Kerja — Kelola dokumen dengan mudah</p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="self-start md:self-auto px-4 py-2.5 rounded-lg bg-white/60 hover:bg-white/80 border border-blue-200 text-gray-700 font-medium text-sm transition-all duration-200 flex items-center gap-2"
              >
                <ArrowLeft size={16} /> Kembali
              </button>
            </div>
          </div>
        </header>

        {/* Error Box */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
            <div className="rounded-2xl border border-red-300 bg-linear-to-br from-red-50 to-red-100/50 p-4 sm:p-5 shadow-lg flex items-center gap-4">
              <div className="shrink-0 p-2 rounded-lg bg-red-200/50"><AlertCircle size={20} className="text-red-600" /></div>
              <div className="flex-1"><p className="text-red-700">{error}</p></div>
              <button onClick={fetchList} className="shrink-0 px-3 py-1 rounded-lg bg-red-200/70 hover:bg-red-300 text-red-700 font-medium text-xs transition-all duration-200">Coba Lagi</button>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">

          {/* Struktur Organisasi */}
          <div className="rounded-2xl border border-blue-200/70 bg-linear-to-br from-white/80 to-blue-50/80 backdrop-blur-sm shadow-xl overflow-hidden">
            <div className="h-1 w-full bg-linear-to-r from-blue-500 to-cyan-400" />
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-linear-to-br from-blue-500 to-cyan-400">
                      <FileText size={16} className="text-white" />
                    </div>
                    Struktur Organisasi Perangkat Daerah
                  </h2>
                  <p className="text-gray-500 text-xs mt-1 pl-1">Peraturan Bupati Karawang Nomor 68 Tahun 2021</p>
                </div>
                <span className="text-xs text-gray-400 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">Gunakan panel kontrol di bawah untuk memutar / zoom bagan</span>
              </div>

              {/* PANEL KONTROL INTERAKTIF (FLIP, ROTASI, ZOOM) */}
              <div className="flex flex-wrap justify-between items-center gap-3 mb-4 bg-blue-50/60 p-3.5 rounded-xl border border-blue-100/70 print:hidden">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation(r => (r + 90) % 360)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    title="Putar Bagan 90 Derajat Kanan"
                  >
                    <RotateCw size={14} /> Rotasi 90°
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFlipped(f => !f)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    title="Cerminkan Bagan Horizontal"
                  >
                    <FlipHorizontal size={14} /> Cermin (Flip)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScale(s => Math.min(s + 0.25, 3.0))}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    title="Perbesar Bagan (Zoom In)"
                  >
                    <ZoomIn size={14} /> Zoom In
                  </button>
                  <button
                    type="button"
                    onClick={() => setScale(s => Math.max(s - 0.25, 0.5))}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    title="Perkecil Bagan (Zoom Out)"
                  >
                    <ZoomOut size={14} /> Zoom Out
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRotation(0); setIsFlipped(false); setScale(1); }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                    title="Reset Posisi Awal"
                  >
                    <RefreshCw size={14} /> Reset View
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 font-bold flex gap-3">
                  <span>Rotasi: {rotation}°</span>
                  <span>Zoom: {Math.round(scale * 100)}%</span>
                  <span>Flip: {isFlipped ? "Ya" : "Tidak"}</span>
                </div>
              </div>

              {/* CONTAINER GAMBAR INTERAKTIF DENGAN SCROLL & TRANSFORMS */}
              <div className="w-full rounded-xl overflow-auto border border-blue-200/70 bg-slate-100/50 p-6 flex items-center justify-center min-h-[350px] relative group">
                <button
                  type="button"
                  onClick={handlePreviewOrgChart}
                  className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 shadow-sm transition-all duration-200 shrink-0 z-10 flex items-center gap-1 text-[11px] font-bold"
                  title="Perbesar Penuh Modal"
                >
                  <Eye size={14} /> Layar Penuh
                </button>
                <img
                  src={ORG_IMAGE_PATH}
                  alt="Struktur Organisasi"
                  className="max-w-full max-h-[500px] object-contain transition-all duration-300"
                  style={{
                    transform: `rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1}) scale(${scale})`,
                    transformOrigin: "center center"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="rounded-2xl border border-blue-200/70 bg-linear-to-br from-white/80 to-blue-50/80 backdrop-blur-sm shadow-xl overflow-hidden">
            <div className="h-1 w-full bg-linear-to-r from-blue-500 to-cyan-400" />
            <div className="p-6 sm:p-8">
              <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-linear-to-br from-blue-500 to-cyan-400">
                  <UploadCloud size={16} className="text-white" />
                </div>
                Upload Dokumen SOTK
              </h2>
              <p className="text-gray-500 text-xs mb-5 pl-1">Upload SK, Lampiran, atau dokumen pendukung SOTK (PDF/DOC/JPG/PNG). Maks. 25MB.</p>

              {uploadSuccess && (
                <div className="mb-4 rounded-xl border border-emerald-300 bg-linear-to-br from-emerald-50 to-emerald-100/50 p-3 flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-emerald-200/50"><CheckCircle size={15} className="text-emerald-600" /></div>
                  <p className="text-emerald-800 text-sm font-semibold">File berhasil diupload!</p>
                </div>
              )}
              {uploadError && (
                <div className="mb-4 rounded-xl border border-red-300 bg-linear-to-br from-red-50 to-red-100/50 p-3 flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-red-200/50"><AlertCircle size={15} className="text-red-600" /></div>
                  <p className="text-red-700 text-sm">{uploadError}</p>
                </div>
              )}

              <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <label className="relative cursor-pointer md:col-span-1">
                  <input id="sotk-upload-input" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  <div className="w-full px-4 py-3 rounded-xl bg-white/70 border border-blue-200 text-gray-500 text-sm backdrop-blur-sm hover:border-blue-400 transition-all duration-200 flex items-center gap-2 truncate">
                    <FileText size={15} className="text-blue-400 shrink-0" />
                    <span className="truncate">{uploadingFile ? uploadingFile.name : "Pilih file..."}</span>
                  </div>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SK Bupati No. 68 Tahun 2021"
                  value={uploadingName}
                  onChange={(e) => setUploadingName(e.target.value)}
                  className="md:col-span-2 px-4 py-3 rounded-xl bg-white/70 border border-blue-200 text-gray-700 placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-3 rounded-xl bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 disabled:from-blue-300 disabled:to-cyan-300 font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:shadow-none flex items-center justify-center gap-2 text-white disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                  {isUploading ? "Upload..." : "Upload"}
                </button>
              </form>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 rounded-xl border border-blue-200/70 bg-linear-to-br from-white/80 to-blue-50/80 backdrop-blur-sm w-fit">
            <div className="flex items-center gap-3">
              <div className="text-blue-500"><FileText size={20} /></div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Total Dokumen SOTK</p>
                <p className="text-2xl font-bold text-gray-800">{files.length}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-cyan-400 animate-spin" />
              </div>
              <p className="text-gray-600 font-medium">Memuat dokumen...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-blue-300 rounded-3xl bg-linear-to-br from-blue-100/30 to-cyan-100/30">
              <div className="p-4 rounded-2xl bg-blue-100 border border-blue-200 mb-4"><FileText size={48} className="text-blue-400" /></div>
              <p className="text-xl font-bold text-gray-800 mb-2">Belum ada dokumen SOTK</p>
              <p className="text-gray-600 text-sm text-center max-w-sm">Upload dokumen SOTK pertama Anda sekarang</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-blue-200/70 shadow-xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-linear-to-r from-blue-50 to-cyan-50 border-b border-blue-200/70">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wide w-12">No</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wide">Nama Dokumen</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wide w-28">Tipe</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wide w-36">Tanggal Upload</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wide w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, index) => (
                    <tr key={file.id} className="border-b border-blue-100/70 hover:bg-blue-50/50 transition-all duration-200 group bg-white/50">
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText size={15} className="text-blue-400 shrink-0" />
                          <span className="text-sm text-gray-800 font-medium group-hover:text-blue-700 transition-colors">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg">
                          {(file.mime || "-").split("/")[1]?.toUpperCase() || "FILE"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">{formatDate(file.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handlePreview(file)} className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-all duration-200 text-blue-600 hover:text-blue-800" title="Lihat"><Eye size={15} /></button>
                          <button onClick={() => handleEdit(file)} className="p-2 rounded-lg bg-amber-100 hover:bg-amber-200 transition-all duration-200 text-amber-600 hover:text-amber-800" title="Edit"><PencilLine size={15} /></button>
                          <button onClick={() => handleDelete(file)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-all duration-200 text-red-600 hover:text-red-800" title="Hapus"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="backdrop-blur-xl bg-white/40 border-t border-blue-200/50 mt-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-600">
              <p>© 2026 Management System v2.0</p>
              <span className="mt-4 sm:mt-0">Total Dokumen: {files.length}</span>
            </div>
          </div>
        </footer>
      </div>

      <FilePreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} file={previewFile} />
    </div>
  );
}