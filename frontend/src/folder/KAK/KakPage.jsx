// src/pages/SopPage.jsx
import React, { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import {
  Edit2,
  Trash2,
  UploadCloud,
  Plus,
  Search,
  RotateCcw,
  FileText,
  Eye,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FilePreviewModal from "@/LAYOUTS/FilePreviewModal";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4849",
});

export default function SopPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadingName, setUploadingName] = useState("");
  const [search, setSearch] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const endpoints = {
    list: "/api/dokumen/kak",
    upload: "/api/dokumen/kak/upload",
    update: (id) => `/api/dokumen/kak/${id}`,
    remove: (id) => `/api/dokumen/kak/${id}`,
  };

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await api.get(endpoints.list);
      if (res.data?.success) {
        setFiles(res.data.data || []);
        setFilteredFiles(res.data.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const handleSearch = () => {
    if (!search.trim()) return setFilteredFiles(files);
    const keyword = search.toLowerCase();
    setFilteredFiles(files.filter((f) => f.name?.toLowerCase().includes(keyword)));
  };

  const handleReset = () => {
    setSearch("");
    setFilteredFiles(files);
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
    setPreviewFile({
      name: file.name,
      mime: detectMime(file),
      url: `${api.defaults.baseURL}/api/dokumen/kak/${file.id}`,
    });
    setPreviewOpen(true);
  };

  const handleEdit = async (file) => {
    const newName = prompt("Ubah nama dokumen:", file.name);
    if (!newName?.trim()) return;
    try {
      const res = await api.put(endpoints.update(file.id), { name: newName });
      if (res.data?.success) await fetchList();
    } catch {
      alert("Gagal update dokumen");
    }
  };

  const handleDelete = async (file) => {
    if (!confirm(`Hapus dokumen "${file.name}" ?`)) return;
    try {
      const res = await api.delete(endpoints.remove(file.id));
      if (res.data?.success) await fetchList();
    } catch {
      alert("Gagal hapus dokumen");
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setUploadingFile(f);
    setUploadingName(f?.name || "");
    setUploadError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadingFile) { setUploadError("Pilih file terlebih dahulu"); return; }
    setUploadError("");
    setUploadSuccess(false);
    try {
      const fd = new FormData();
      fd.append("file", uploadingFile);
      fd.append("title", uploadingName);
      const res = await api.post(endpoints.upload, fd);
      if (res.data?.success) {
        await fetchList();
        setUploadingFile(null);
        setUploadingName("");
        setUploadSuccess(true);
        document.getElementById("kak-upload-input").value = "";
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch {
      setUploadError("Gagal upload file. Coba lagi.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
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
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 shadow-md shadow-blue-500/30">
                      <FileText size={20} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-linear-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Manajemen Dokumen KAK
                    </h1>
                  </div>
                  <p className="text-gray-600 text-sm pl-1">Dinas Koperasi dan Usaha Kecil Menengah</p>
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
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama dokumen KAK..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/70 border border-blue-200 text-gray-700 placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2.5 rounded-lg bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center gap-2 text-white"
                >
                  <Search size={16} />
                  <span className="hidden sm:inline">Cari</span>
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-lg bg-white/60 hover:bg-white/80 border border-blue-200 text-gray-700 font-medium text-sm transition-all duration-200 flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">

          {/* Upload section */}
          <div className="rounded-2xl border border-blue-200/70 bg-linear-to-br from-white/80 to-blue-50/80 backdrop-blur-sm shadow-xl overflow-hidden">
            <div className="h-1 w-full bg-linear-to-r from-blue-500 to-cyan-400" />
            <div className="p-6 sm:p-8">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-5">
                <div className="p-1.5 rounded-lg bg-linear-to-br from-blue-500 to-cyan-400">
                  <UploadCloud size={16} className="text-white" />
                </div>
                Upload Dokumen KAK
              </h3>

              {uploadSuccess && (
                <div className="mb-4 rounded-xl border border-emerald-300 bg-linear-to-br from-emerald-50 to-emerald-100/50 p-4 flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-200/50">
                    <UploadCloud size={16} className="text-emerald-600" />
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

              <form onSubmit={handleUpload} className="grid md:grid-cols-3 gap-3">
                <label className="relative cursor-pointer">
                  <input
                    id="kak-upload-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
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
                  placeholder="Nama dokumen KAK..."
                  value={uploadingName}
                  onChange={(e) => setUploadingName(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-white/70 border border-blue-200 text-gray-700 placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                />

                <button
                  type="submit"
                  className="px-4 py-3 rounded-xl bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 text-white"
                >
                  <Plus size={16} />
                  Upload
                </button>
              </form>
            </div>
          </div>

          {/* Table section */}
          <div className="space-y-3">
            {/* Stats */}
            <div className="p-4 rounded-xl border border-blue-200/70 bg-linear-to-br from-white/80 to-blue-50/80 backdrop-blur-sm hover:border-blue-300 transition-all duration-200 w-fit">
              <div className="flex items-center gap-3">
                <div className="text-blue-500">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Total Dokumen KAK</p>
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
                <p className="text-gray-600 font-medium">Memuat dokumen KAK...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-blue-300 rounded-3xl bg-linear-to-br from-blue-100/30 to-cyan-100/30">
                <div className="p-4 rounded-2xl bg-blue-100 border border-blue-200 mb-4">
                  <FileText size={48} className="text-blue-400" />
                </div>
                <p className="text-xl font-bold text-gray-800 mb-2">
                  {search ? "Tidak ada hasil pencarian" : "Belum ada dokumen KAK"}
                </p>
                <p className="text-gray-600 text-sm text-center max-w-sm">
                  {search ? "Coba ubah kata kunci pencarian" : "Upload dokumen KAK untuk memulai"}
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
                                <Edit2 size={15} />
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