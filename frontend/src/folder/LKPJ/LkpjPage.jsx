import React, { useEffect, useState, useCallback } from "react";
import Footer from "@/components/Footer";
import {
  Plus,
  Search,
  Eye,
  PencilLine,
  Trash2,
  FileText,
  AlertCircle,
  ArrowLeft,
  UploadCloud,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FilePreviewModal from "@/LAYOUTS/FilePreviewModal";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:4849" });

export default function LkpjPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadingName, setUploadingName] = useState("");
  const [search, setSearch] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const endpoints = {
    list: "/api/dokumen/lkpj",
    upload: "/api/dokumen/lkpj/upload",
    update: (id) => `/api/dokumen/lkpj/${id}`,
    remove: (id) => `/api/dokumen/lkpj/${id}`,
    preview: (id) => `/api/dokumen/lkpj/${id}`,
  };

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(endpoints.list);
      if (res.data?.success) {
        setFiles(res.data.data || []);
        setFilteredFiles(res.data.data || []);
      }
    } catch {
      setError("Gagal memuat data LKPJ");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const handleSearch = (query) => {
    setSearch(query);
    if (!query.trim()) { setFilteredFiles(files); return; }
    const keyword = query.toLowerCase();
    setFilteredFiles(files.filter((f) => f.name?.toLowerCase().includes(keyword)));
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
    setPreviewFile({ name: file.name, mime: detectMime(file), url: `${api.defaults.baseURL}${endpoints.preview(file.id)}` });
    setPreviewOpen(true);
  };

  const handleEdit = async (file) => {
    const newName = prompt("Ubah nama dokumen:", file.name);
    if (!newName?.trim()) return;
    try {
      const res = await api.put(endpoints.update(file.id), { name: newName.trim() });
      if (res.data?.success) {
        setFiles((p) => p.map((f) => (f.id === file.id ? res.data.data : f)));
        setFilteredFiles((p) => p.map((f) => (f.id === file.id ? res.data.data : f)));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengubah dokumen");
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Hapus dokumen "${file.name}"?`)) return;
    try {
      const res = await api.delete(endpoints.remove(file.id));
      if (res.data?.success) {
        setFiles((p) => p.filter((f) => f.id !== file.id));
        setFilteredFiles((p) => p.filter((f) => f.id !== file.id));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus dokumen");
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setUploadingFile(f || null);
    setUploadingName(f?.name?.replace(/\.[^/.]+$/, "") || "");
    setUploadError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadingFile) { setUploadError("Pilih file terlebih dahulu"); return; }
    if (!uploadingName.trim()) { setUploadError("Masukkan nama dokumen"); return; }

    const fd = new FormData();
    fd.append("file", uploadingFile);
    fd.append("title", uploadingName.trim());

    try {
      setIsUploading(true);
      setUploadError("");
      const res = await api.post(endpoints.upload, fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data?.success) {
        setFiles((p) => [res.data.data, ...p]);
        setFilteredFiles((p) => [res.data.data, ...p]);
        setUploadingFile(null);
        setUploadingName("");
        const fileInput = document.getElementById("lkpj-upload-input");
        if (fileInput) fileInput.value = "";
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        setUploadError(res.data?.message || "Upload gagal");
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || "Terjadi kesalahan saat upload");
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 text-gray-900 overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 bg-blue-300" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 bg-cyan-300" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/40 border-b border-blue-200/50 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 shadow-md shadow-blue-500/30">
                      <FileText size={20} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-linear-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Dokumen LKPJ
                    </h1>
                  </div>
                  <p className="text-gray-600 text-sm pl-1">Laporan Keterangan Pertanggungjawaban — Kelola dokumen dengan mudah</p>
                </div>

                <button
                  onClick={() => navigate(-1)}
                  className="self-start md:self-auto px-4 py-2.5 rounded-lg bg-white/60 hover:bg-white/80 border border-blue-200 text-gray-700 font-medium text-sm transition-all duration-200 flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  <span>Kembali</span>
                </button>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama dokumen LKPJ..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/70 border border-blue-200 text-gray-700 placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Error Box */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
            <div className="rounded-2xl border border-red-300 bg-linear-to-br from-red-50 to-red-100/50 backdrop-blur-sm p-4 sm:p-5 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="shrink-0 p-2 rounded-lg bg-red-200/50">
                  <AlertCircle size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-red-700">{error}</p>
                </div>
                <button
                  onClick={fetchList}
                  className="shrink-0 px-3 py-1 rounded-lg bg-red-200/70 hover:bg-red-300 text-red-700 font-medium text-xs transition-all duration-200"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">

          {/* Upload section */}
          <div className="rounded-2xl border border-blue-200/70 bg-linear-to-br from-white/80 to-blue-50/80 backdrop-blur-sm shadow-xl overflow-hidden">
            <div className="h-1 w-full bg-linear-to-r from-blue-500 to-cyan-400" />
            <div className="p-6 sm:p-8">
              <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-5">
                <div className="p-1.5 rounded-lg bg-linear-to-br from-blue-500 to-cyan-400">
                  <UploadCloud size={16} className="text-white" />
                </div>
                Upload Dokumen LKPJ
              </h2>

              {uploadSuccess && (
                <div className="mb-4 rounded-xl border border-emerald-300 bg-linear-to-br from-emerald-50 to-emerald-100/50 p-4 flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-200/50">
                    <CheckCircle size={16} className="text-emerald-600" />
                  </div>
                  <p className="text-emerald-800 text-sm font-semibold">Dokumen berhasil diupload!</p>
                </div>
              )}
              {uploadError && (
                <div className="mb-4 rounded-xl border border-red-300 bg-linear-to-br from-red-50 to-red-100/50 p-4 flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-red-200/50">
                    <AlertCircle size={16} className="text-red-600" />
                  </div>
                  <p className="text-red-700 text-sm">{uploadError}</p>
                </div>
              )}

              <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <label className="relative cursor-pointer md:col-span-1">
                  <input
                    id="lkpj-upload-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <div className="w-full px-4 py-3 rounded-xl bg-white/70 border border-blue-200 text-gray-500 text-sm backdrop-blur-sm hover:border-blue-400 transition-all duration-200 flex items-center gap-2 truncate">
                    <FileText size={15} className="text-blue-400 shrink-0" />
                    <span className="truncate">{uploadingFile ? uploadingFile.name : "Pilih file..."}</span>
                  </div>
                </label>

                <input
                  type="text"
                  placeholder="Contoh: LKPJ Tahun 2024"
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
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </form>
            </div>
          </div>

          {/* Table section */}
          <div className="space-y-3">
            {/* Stats */}
            <div className="p-4 rounded-xl border border-blue-200/70 bg-linear-to-br from-white/80 to-blue-50/80 backdrop-blur-sm hover:border-blue-300 transition-all duration-200 w-fit">
              <div className="flex items-center gap-3">
                <div className="text-blue-500"><FileText size={20} /></div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Total Dokumen LKPJ</p>
                  <p className="text-2xl font-bold text-gray-800">{files.length}</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-cyan-400 animate-spin" />
                </div>
                <p className="text-gray-600 font-medium">Memuat dokumen LKPJ...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-blue-300 rounded-3xl bg-linear-to-br from-blue-100/30 to-cyan-100/30">
                <div className="p-4 rounded-2xl bg-blue-100 border border-blue-200 mb-4">
                  <FileText size={48} className="text-blue-400" />
                </div>
                <p className="text-xl font-bold text-gray-800 mb-2">
                  {search ? "Tidak ada hasil pencarian" : "Belum ada dokumen LKPJ"}
                </p>
                <p className="text-gray-600 text-sm text-center max-w-sm">
                  {search ? "Coba ubah kata kunci pencarian" : "Upload dokumen LKPJ untuk memulai"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-2xl border border-blue-200/70 shadow-xl">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-linear-to-r from-blue-50 to-cyan-50 border-b border-blue-200/70">
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wide w-12">No</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wide">Nama Dokumen</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wide w-36">Tanggal Upload</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wide w-44">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file, index) => (
                        <tr
                          key={file.id}
                          className="border-b border-blue-100/70 hover:bg-blue-50/50 transition-all duration-200 group bg-white/50"
                        >
                          <td className="px-6 py-4 text-sm text-gray-600 font-mono">{index + 1}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FileText size={15} className="text-blue-400 shrink-0" />
                              <span className="text-sm text-gray-800 font-medium group-hover:text-blue-700 transition-colors">
                                {file.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">
                            {formatDate(file.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handlePreview(file)}
                                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-all duration-200 text-blue-600 hover:text-blue-800"
                                title="Lihat"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => handleEdit(file)}
                                className="p-2 rounded-lg bg-amber-100 hover:bg-amber-200 transition-all duration-200 text-amber-600 hover:text-amber-800"
                                title="Edit"
                              >
                                <PencilLine size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(file)}
                                className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-all duration-200 text-red-600 hover:text-red-800"
                                title="Hapus"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-xs text-gray-600 text-center mt-2">
                  Menampilkan {filteredFiles.length} dari {files.length} dokumen
                </div>
              </>
            )}
          </div>
        </main>

        {/* Footer */}
        <Footer>
          <span>Total Dokumen: {files.length}</span>
        </Footer>
      </div>

      <FilePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        file={previewFile}
      />
    </div>
  );
}