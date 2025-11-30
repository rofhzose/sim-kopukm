// src/pages/SotkPage.jsx
import React, { useEffect, useState } from "react";
import {
  FileText,
  Eye,
  Edit2,
  Trash2,
  UploadCloud,
  Plus,
  XCircle
} from "lucide-react";
import axios from "axios";
import axiosInstance from "../utils/axiosInstance"; // gunakan instance jika ada
import FilePreviewModal from "../components/FilePreviewModal";

// fallback jika axiosInstance belum ada
const api = axiosInstance || axios.create({ baseURL: process.env.REACT_APP_API_URL || "http://localhost:4849" });

export default function SotkPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadingName, setUploadingName] = useState("");
  const [error, setError] = useState("");

  // Modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // helper to compute endpoints depending on baseURL
  const prefixHasApi = !!(api.defaults && api.defaults.baseURL && api.defaults.baseURL.includes("/api"));
  const endpoints = {
    list: prefixHasApi ? "/dokumen/sotk" : "/api/dokumen/sotk",
    upload: prefixHasApi ? "/dokumen/sotk/upload" : "/api/dokumen/sotk/upload",
    update: (id) => (prefixHasApi ? `/dokumen/sotk/${id}` : `/api/dokumen/sotk/${id}`),
    remove: (id) => (prefixHasApi ? `/dokumen/sotk/${id}` : `/api/dokumen/sotk/${id}`)
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchList() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(endpoints.list);
      if (res.data && res.data.success) {
        setFiles(res.data.data || []);
      } else {
        setFiles([]);
      }
    } catch (e) {
      console.error(e);
      setError("Gagal memuat daftar file.");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  const buildFileUrl = (filePath) => {
    const baseRaw = (api.defaults && api.defaults.baseURL) ? api.defaults.baseURL.replace(/\/$/, "") : "";
    // remove trailing "/api" if present, because uploads served at root /uploads
    const base = baseRaw.endsWith("/api") ? baseRaw.slice(0, -4) : baseRaw;
    if (!filePath) return null;
    return filePath.startsWith("/") ? `${base}${filePath}` : `${base}/${filePath}`;
  };

  const handlePreview = (file) => {
    const url = buildFileUrl(file.path);
    setPreviewFile({
      name: file.name,
      mime: file.mime,
      url,
    });
    setPreviewOpen(true);
  };

  const handleEdit = async (file) => {
    const newName = prompt("Ubah nama file:", file.name);
    if (!newName || newName.trim() === "") return;
    try {
      const res = await api.put(endpoints.update(file.id), { name: newName });
      if (res.data && res.data.success) {
        setFiles((p) => p.map((f) => (f.id === file.id ? res.data.data : f)));
      } else {
        alert("Gagal mengubah nama");
      }
    } catch (e) {
      console.error(e);
      alert("Gagal mengubah nama (server).");
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Hapus file "${file.name}"?`)) return;
    try {
      const res = await api.delete(endpoints.remove(file.id));
      if (res.data && res.data.success) {
        setFiles((p) => p.filter((f) => f.id !== file.id));
      } else {
        alert("Gagal menghapus file");
      }
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus file (server).");
    }
  };

  const MAX_FILE_BYTES = 25 * 1024 * 1024; // same limit as server (adjust if needed)

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > MAX_FILE_BYTES) {
      alert(`File terlalu besar. Maksimum ${Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB.`);
      e.target.value = "";
      setUploadingFile(null);
      setUploadingName("");
      return;
    }
    setUploadingFile(f);
    setUploadingName(f ? f.name : "");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadingFile) {
      alert("Pilih file terlebih dahulu.");
      return;
    }
    const fd = new FormData();
    fd.append("file", uploadingFile);
    fd.append("title", uploadingName);

    try {
      const res = await api.post(endpoints.upload, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data && res.data.success) {
        setFiles((p) => [res.data.data, ...p]);
        setUploadingFile(null);
        setUploadingName("");
        const input = document.getElementById("sotk-upload-input");
        if (input) input.value = "";
      } else {
        alert("Upload gagal.");
      }
    } catch (err) {
      console.error(err);
      alert("Upload gagal (server).");
    }
  };

  const ORG_IMAGE_PATH = "/public/SOTK_DINKOPUKM.jpeg";
  const [orgImageUrl, setOrgImageUrl] = useState(ORG_IMAGE_PATH);

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header centered */}
        <header className="mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center">
            <h1 className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
              Peraturan Bupati Karawang Nomor 68 Tahun 2021 tentang Kedudukan, Susunan Organisasi, Tugas, Fungsi dan Tata Kerja Dinas Koperasi, Usaha Kecil dan Menengah Kabupaten Karawang
            </h1>
          </div>
        </header>
      {/* Struktur Organisasi */}
      <section className="mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 max-w-5xl mx-auto">
          <h3 className="text-md font-semibold text-gray-800 mb-3">
            Struktur Organisasi
          </h3>

          <p className="text-sm text-gray-600 mb-3">
            Klik gambar untuk memperbesar.
          </p>

          <div className="rounded-lg overflow-hidden border border-gray-100">
            <button
              type="button"
              onClick={() => {
                setPreviewFile({
                  name: "Struktur Organisasi",
                  mime: "image/png",
                  url: orgImageUrl
                });
                setPreviewOpen(true);
              }}
              className="w-full"
            >
              <img
                src={orgImageUrl}
                alt="Struktur Organisasi"
                className="w-full h-auto object-contain max-h-[360px]"
                style={{ display: "block" }}
              />
            </button>
          </div>
        </div>
      </section>

        {/* Section: Table */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-md">
                <FileText className="w-5 h-5 text-blue-700" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">📄 SK & Lampiran SOTK</h2>
            </div>
            <div className="text-sm text-gray-500">Jumlah: {files.length}</div>
          </div>

          {error && (
            <div className="mb-4 text-red-600 font-medium flex items-center gap-2">
              <XCircle className="w-5 h-5" /> {error}
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-gray-500">Memuat...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-gray-600 border-b">
                    <th className="py-3 w-1/2">Nama File</th>
                    <th className="py-3 w-1/6">Tanggal</th>
                    <th className="py-3 w-1/3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id} className="border-b last:border-b-0">
                      <td className="py-3">
                        <div className="font-medium text-gray-800">{file.name}</div>
                        <div className="text-xs text-gray-500">Tipe: {file.mime || "—"}</div>
                      </td>
                      <td className="py-3 text-sm text-gray-600">{(file.created_at || file.date || "").slice(0, 10)}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePreview(file)}
                            className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            Lihat Dokumen
                          </button>
                          <button
                            onClick={() => handleEdit(file)}
                            className="flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100 text-sm"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(file)}
                            className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 text-sm"
                          >
                            <Trash2 className="w-4 h-4" /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {files.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-gray-500">Belum ada file.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Upload form */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-md font-semibold mb-3 flex items-center gap-2"><UploadCloud className="w-5 h-5 text-sky-600" /> Upload Dokumen</h3>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <input id="sotk-upload-input" type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleFileChange}
                className="col-span-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-slate-100 file:text-sm file:font-semibold" />
              <input type="text" placeholder="Nama file / judul (optional)" value={uploadingName} onChange={(e)=>setUploadingName(e.target.value)} className="p-2 rounded-md border border-gray-200 w-full" />
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"><Plus className="w-4 h-4" /> Upload</button>
              <div className="text-sm text-gray-500">Maks 10MB. Tipe: PDF, DOC, JPG, PNG.</div>
            </div>
          </form>
        </section>
      </div>

      {/* File preview modal */}
      <FilePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        file={previewFile}
      />
    </div>
  );
}
