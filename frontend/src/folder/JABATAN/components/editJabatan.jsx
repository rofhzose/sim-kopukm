import React, { useEffect, useState } from "react";
import { CheckCircle, ArrowLeft, AlertCircle, PencilLine, RotateCcw, PlusCircle, Trash2, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getJabatanById, updateJabatan } from "@/services/jabatanService";

const DEFAULT_STATUS_LIST = ["Administrator / PNS", "Eselon II JPT / PNS", "Eselon III.a / PNS", "JF - PNS", "JF - PPPK PENUH WAKTU", "PELAKSANA - PNS", "Pelaksana - PPPK", "PNS", "PPPK PARUH WAKTU", "PPPK PENUH WAKTU", "THL"];

export default function EditJabatan() {
  const [namaJabatan, setNamaJabatan] = useState("");
  const [kelasJabatan, setKelasJabatan] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [originalNama, setOriginalNama] = useState("");
  const [originalKelas, setOriginalKelas] = useState("");
  const [originalKeterangan, setOriginalKeterangan] = useState("");

  // Status list state
  const [statusList, setStatusList] = useState(DEFAULT_STATUS_LIST);
  const [newStatus, setNewStatus] = useState("");
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchJabatan = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getJabatanById(id);
        const jabatan = response.data.data;
        setNamaJabatan(jabatan.nama_jabatan || "");
        setKelasJabatan(jabatan.kelas_jabatan || "");
        setKeterangan(jabatan.keterangan || "");
        setOriginalNama(jabatan.nama_jabatan || "");
        setOriginalKelas(jabatan.kelas_jabatan || "");
        setOriginalKeterangan(jabatan.keterangan || "");
      } catch (error) {
        setError(error.response?.data?.message || "Gagal memuat data jabatan");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchJabatan();
  }, [id]);

  const isChanged = (namaJabatan !== originalNama || kelasJabatan !== originalKelas || keterangan !== originalKeterangan) && namaJabatan.trim() !== "";

  const handleSimpan = async () => {
    setError("");
    setSuccess(false);
    if (!namaJabatan.trim()) return setError("Nama jabatan harus diisi");
    if (!isChanged) return setError("Tidak ada perubahan data");

    try {
      setIsSaving(true);
      const response = await updateJabatan(id, {
        nama_jabatan: namaJabatan.trim(),
        kelas_jabatan: kelasJabatan || null,
        keterangan: keterangan.trim() || null,
      });
      if (response.data.success) {
        setSuccess(true);
        setOriginalNama(namaJabatan);
        setOriginalKelas(kelasJabatan);
        setOriginalKeterangan(keterangan);
        setTimeout(() => navigate(-1), 1500);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setNamaJabatan(originalNama);
    setKelasJabatan(originalKelas);
    setKeterangan(originalKeterangan);
    setError("");
    setSuccess(false);
  };

  const handleAddStatus = () => {
    const trimmed = newStatus.trim();
    if (!trimmed) return setStatusError("Label tidak boleh kosong");
    if (statusList.includes(trimmed)) return setStatusError("Status sudah ada dalam daftar");
    setStatusList((prev) => [...prev, trimmed]);
    setNewStatus("");
    setIsAddingStatus(false);
    setStatusError("");
  };

  const handleDeleteStatus = (label) => {
    if (!window.confirm(`Hapus "${label}" dari daftar?`)) return;
    setStatusList((prev) => prev.filter((s) => s !== label));
    if (kelasJabatan === label) setKelasJabatan("");
  };

  const inputClass = (hasError = false) =>
    `w-full px-4 py-3 rounded-xl bg-white/70 border text-gray-800 placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 disabled:opacity-60 ${
      hasError ? "border-red-300 focus:ring-red-400" : "border-blue-200 focus:ring-blue-400"
    }`;

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
                    <PencilLine size={20} className="text-white" />
                  </div>
                  <h1 className="text-4xl font-bold bg-linear-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">Edit Jabatan</h1>
                </div>
                <p className="text-gray-600 text-sm pl-1">Perbarui informasi jabatan dalam organisasi Anda</p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="self-start md:self-auto px-4 py-2.5 rounded-lg bg-white/60 hover:bg-white/80 border border-blue-200 text-gray-700 font-medium text-sm transition-all duration-200 flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                <span>Kembali</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-2xl mx-auto px-4 sm:px-8 py-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-cyan-400 animate-spin" />
              </div>
              <p className="text-gray-600 font-medium">Memuat data jabatan...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Success */}
              {success && (
                <div className="rounded-2xl border border-emerald-300 bg-linear-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-sm p-4 shadow-lg flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-emerald-200/50">
                    <CheckCircle size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-emerald-800 font-semibold text-sm">Data berhasil diperbarui!</p>
                    <p className="text-emerald-700 text-xs mt-0.5">Mengalihkan ke halaman sebelumnya...</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-2xl border border-red-300 bg-linear-to-br from-red-50 to-red-100/50 backdrop-blur-sm p-4 shadow-lg flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-red-200/50">
                    <AlertCircle size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-red-800 font-semibold text-sm">Terjadi Kesalahan</p>
                    <p className="text-red-700 text-xs mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Form Card */}
              <div className="rounded-2xl border border-blue-200/70 bg-linear-to-br from-white/80 to-blue-50/80 backdrop-blur-sm shadow-xl overflow-hidden">
                <div className="h-1 w-full bg-linear-to-r from-blue-500 to-cyan-400" />

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Data saat ini */}
                  {originalNama && (
                    <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/70 space-y-2 text-sm">
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Data Saat Ini</p>
                      <div className="flex gap-2">
                        <span className="text-gray-500 w-32 shrink-0">Nama Jabatan</span>
                        <span className="text-gray-800 font-medium">{originalNama}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-500 w-32 shrink-0">Keterangan</span>
                        <span className="text-gray-800">{originalKeterangan || <i className="text-gray-300">kosong</i>}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-500 w-32 shrink-0">Kelas Jabatan</span>
                        <span className="text-gray-800">{originalKelas || <i className="text-gray-300">kosong</i>}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-5">
                    {/* Nama Jabatan */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <PencilLine size={14} className="text-blue-500" />
                        Nama Jabatan <span className="text-red-400 ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Kepala Bidang Perdagangan"
                        value={namaJabatan}
                        onChange={(e) => {
                          setNamaJabatan(e.target.value);
                          if (error) setError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleSimpan()}
                        disabled={isSaving}
                        className={inputClass(!!error && !namaJabatan.trim())}
                      />
                      <span className="text-xs text-gray-400 mt-1 block">{namaJabatan.length} karakter</span>
                    </div>

                    {/* Keterangan */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <PencilLine size={14} className="text-blue-500" />
                        Keterangan <span className="text-gray-400 text-xs font-normal ml-1">(opsional)</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Deskripsi singkat jabatan ini..."
                        value={keterangan}
                        onChange={(e) => {
                          setKeterangan(e.target.value);
                          if (error) setError("");
                        }}
                        disabled={isSaving}
                        className={`${inputClass(false)} resize-none`}
                      />
                    </div>

                    {/* Kelas Jabatan — dropdown dinamis */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                          <PencilLine size={14} className="text-blue-500" />
                          Kelas Jabatan <span className="text-gray-400 text-xs font-normal ml-1">(opsional)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingStatus((v) => !v);
                            setStatusError("");
                            setNewStatus("");
                          }}
                          className="text-xs text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors"
                        >
                          {isAddingStatus ? (
                            <>
                              <X size={12} />
                              Batal
                            </>
                          ) : (
                            <>
                              <PlusCircle size={12} />
                              Tambah Item
                            </>
                          )}
                        </button>
                      </div>

                      {/* Form tambah item baru */}
                      {isAddingStatus && (
                        <div className="mb-3 p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                          <p className="text-xs font-semibold text-blue-600">Tambah Item Baru ke Daftar</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Contoh: Honorer"
                              value={newStatus}
                              onChange={(e) => {
                                setNewStatus(e.target.value);
                                setStatusError("");
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddStatus();
                                if (e.key === "Escape") setIsAddingStatus(false);
                              }}
                              autoFocus
                              className="flex-1 px-3 py-2 rounded-lg bg-white border border-blue-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button onClick={handleAddStatus} className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors">
                              Tambah
                            </button>
                          </div>
                          {statusError && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                              <AlertCircle size={11} />
                              {statusError}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Dropdown */}
                      <select
                        value={kelasJabatan}
                        onChange={(e) => {
                          setKelasJabatan(e.target.value);
                          if (error) setError("");
                        }}
                        disabled={isSaving}
                        className={`${inputClass(false)} appearance-none cursor-pointer`}
                      >
                        <option value="">— Tanpa Kelas —</option>
                        {statusList.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      {kelasJabatan && <p className="text-xs text-blue-600 mt-1">Dipilih: {kelasJabatan}</p>}

                      {/* Kelola list */}
                      <div className="mt-3 rounded-xl border border-blue-100 overflow-hidden">
                        <div className="px-3 py-2 bg-blue-50 border-b border-blue-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kelola Daftar ({statusList.length} item)</p>
                        </div>
                        <div className="max-h-44 overflow-y-auto divide-y divide-blue-50">
                          {statusList.map((s) => (
                            <div key={s} className={`flex items-center justify-between px-3 py-2 group transition-colors ${kelasJabatan === s ? "bg-blue-50" : "bg-white/70 hover:bg-blue-50/40"}`}>
                              <span className="text-xs text-gray-700 flex items-center gap-2">
                                {kelasJabatan === s && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shrink-0" />}
                                {s}
                              </span>
                              <button onClick={() => handleDeleteStatus(s)} className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Hapus dari daftar">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-blue-100" />

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleReset}
                      disabled={isSaving || !isChanged}
                      className="px-5 py-2.5 rounded-lg bg-white/60 hover:bg-white/80 border border-blue-200 text-gray-700 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <RotateCcw size={15} />
                      Reset
                    </button>
                    <button
                      onClick={() => navigate(-1)}
                      disabled={isSaving}
                      className="px-5 py-2.5 rounded-lg bg-white/60 hover:bg-white/80 border border-blue-200 text-gray-700 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      <ArrowLeft size={15} />
                      Batal
                    </button>
                    <button
                      onClick={handleSimpan}
                      disabled={isSaving || !isChanged}
                      className="flex-1 px-5 py-2.5 rounded-lg bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 disabled:from-blue-300 disabled:to-cyan-300 font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:shadow-none flex items-center justify-center gap-2 text-white disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={15} />
                      {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="p-4 rounded-xl border border-blue-200/70 bg-linear-to-br from-white/60 to-blue-50/60 backdrop-blur-sm flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-blue-100 shrink-0 mt-0.5">
                  <AlertCircle size={14} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">Tips</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Nama jabatan wajib diisi. Keterangan dan kelas jabatan bersifat opsional. Gunakan tombol <strong>Tambah Item</strong> untuk menambah pilihan baru ke daftar, atau arahkan kursor ke item untuk menghapusnya.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="backdrop-blur-xl bg-white/40 border-t border-blue-200/50 mt-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-600">
              <p>© 2026 Management System v2.0</p>
              <span>Mode: Edit Jabatan</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
