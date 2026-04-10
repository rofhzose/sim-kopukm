import React, { useEffect, useState } from "react";
import { User, Hash, Users, Save, X, AlertCircle, ArrowLeft, Briefcase, MapPin, Calendar, GraduationCap, BookOpen, School, Award, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PENDIDIKAN_OPTIONS = ["SD", "SMP", "SMA", "SMK", "D1", "D2", "D3", "D4", "S1", "S2", "S3", "Lainnya"];
const STATUS_PEGAWAI_OPTIONS = ["Administrator / PNS", "Eselon II JPT / PNS", "Eselon III.a / PNS", "JF - PNS", "JF - PPPK PENUH WAKTU", "PELAKSANA - PNS", "Pelaksana - PPPK", "PNS", "PPPK PARUH WAKTU", "PPPK PENUH WAKTU", "THL"];
const KELAS_OPTIONS = ["1", "2", "3", "5", "6", "7", "8", "9", "11", "12", "14", "IX"];

const kelasToNum = (k) => {
  if (!k) return 0;
  if (String(k) === "IX") return 15;
  const n = parseInt(String(k));
  return isNaN(n) ? 0 : n;
};

// ✅ PINDAHKAN Field KE LUAR komponen agar tidak di-recreate tiap render
const Field = ({ label, icon: FieldIcon, error, required, children }) => (
  <div>
    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
      {FieldIcon && <FieldIcon size={14} className="text-blue-500" />}
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <div className="flex items-center gap-1.5 mt-2 text-red-600 text-xs">
        <AlertCircle size={13} />
        <span>{error}</span>
      </div>
    )}
  </div>
);

export default function FormPegawai({ initialData = {}, onSubmit, isEdit = false, pegawaiList = [], jabatanList = [] }) {
  const [form, setForm] = useState({
    nama_lengkap: "",
    nip: "",
    kelas_jabatan: "",
    id_atasan: "0",
    id_jabatan: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    golongan_ruang: "",
    pendidikan_formal: "",
    nama_sekolah: "",
    jurusan: "",
    tahun_lulus: "",
    status_pegawai: "",
    kelas_pegawai: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit && initialData && Object.keys(initialData).length > 0) {
      const matchedJabatan = jabatanList.find((j) => j.id_jabatan?.toString() === initialData.jabatan_definitif?.toString());
      const kelasDariJabatan = matchedJabatan?.kelas_jabatan ? String(matchedJabatan.kelas_jabatan) : initialData.kelas_jabatan ? String(initialData.kelas_jabatan) : "";

      setForm({
        nama_lengkap: initialData.nama_lengkap || "",
        nip: initialData.nip || "",
        kelas_jabatan: kelasDariJabatan,
        id_atasan: initialData.id_atasan != null && initialData.id_atasan !== "" ? initialData.id_atasan.toString() : "0",
        id_jabatan: initialData.jabatan_definitif?.toString() || "",
        tempat_lahir: initialData.tempat_lahir || "",
        tanggal_lahir: initialData.tanggal_lahir ? initialData.tanggal_lahir.split("T")[0] : "",
        golongan_ruang: initialData.golongan_ruang || "",
        pendidikan_formal: initialData.pendidikan_formal || "",
        nama_sekolah: initialData.nama_sekolah || "",
        jurusan: initialData.jurusan || "",
        tahun_lulus: initialData.tahun_lulus || "",
        status_pegawai: initialData.status_pegawai || "",
        kelas_pegawai: initialData.kelas_pegawai || "",
      });
    }
  }, [initialData, isEdit, jabatanList]);

  // ✅ FIX filter atasan: normalisasi ke String sebelum compare
  // Filter atasan berdasarkan kelas_pegawai (kolom di tabel pegawai)
  const atasanFiltered = pegawaiList
    .filter((p) => {
      if (!form.kelas_pegawai) return false; // ← pakai kelas_pegawai form
      if (isEdit && String(p.id_pegawai) === String(initialData.id_pegawai)) return false;

      // Ambil kelas_pegawai calon atasan (dari tabel pegawai langsung)
      const atasanKelasRaw = p.kelas_pegawai;
      if (atasanKelasRaw == null || atasanKelasRaw === "") return false;

      const atasanNum = kelasToNum(String(atasanKelasRaw));
      const pegawaiNum = kelasToNum(String(form.kelas_pegawai)); // ← pakai kelas_pegawai form

      return atasanNum >= pegawaiNum;
    })
    .sort((a, b) => {
      const ka = a.kelas_pegawai ?? "";
      const kb = b.kelas_pegawai ?? "";
      return kelasToNum(String(kb)) - kelasToNum(String(ka));
    });

  const handleChange = (field, value) => {
    if (field === "nip") value = value.replace(/[^0-9]/g, "").slice(0, 18);
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (submitError) setSubmitError("");
  };

  const handleJabatanChange = (selectedId) => {
    const selectedJabatan = jabatanList.find((j) => j.id_jabatan.toString() === selectedId);
    const kelasFromJabatan = selectedJabatan?.kelas_jabatan != null ? String(selectedJabatan.kelas_jabatan) : "";
    setForm((prev) => ({
      ...prev,
      id_jabatan: selectedId,
      kelas_jabatan: kelasFromJabatan, // hanya untuk display badge
      id_atasan: "0",
    }));
    if (errors.id_jabatan) setErrors((prev) => ({ ...prev, id_jabatan: "" }));
    if (submitError) setSubmitError("");
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitSuccess(false);

    const newErrors = {};
    if (!form.nama_lengkap.trim()) newErrors.nama_lengkap = "Nama lengkap wajib diisi";
    if (!form.nip.trim()) newErrors.nip = "NIP wajib diisi";
    else if (form.nip.length !== 18) newErrors.nip = "NIP harus tepat 18 digit";
    if (!form.id_jabatan) newErrors.id_jabatan = "Jabatan definitif wajib dipilih";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        nama_lengkap: form.nama_lengkap.trim(),
        nip: form.nip.trim() || null,
        level: form.kelas_jabatan || null,
        id_jabatan: form.id_jabatan || null,
        id_atasan: form.id_atasan !== "0" ? form.id_atasan : null,
        tempat_lahir: form.tempat_lahir.trim() || null,
        tanggal_lahir: form.tanggal_lahir || null,
        golongan_ruang: form.golongan_ruang.trim() || null,
        pendidikan_formal: form.pendidikan_formal || null,
        nama_sekolah: form.nama_sekolah.trim() || null,
        jurusan: form.jurusan.trim() || null,
        tahun_lulus: form.tahun_lulus || null,
        status_pegawai: form.status_pegawai || null,
        kelas_pegawai: form.kelas_pegawai || null,
      };

      await onSubmit(payload);
      setSubmitSuccess(true);
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError(err?.response?.data?.message || "Gagal menyimpan data. Silakan coba lagi.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = "w-full px-4 py-3 rounded-xl bg-white/70 border text-gray-800 placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200";
  const inputNormal = `${inputBase} border-blue-200 focus:ring-blue-400`;
  const inputError = `${inputBase} border-red-300 focus:ring-red-400`;

  const selectedJabatanInfo = jabatanList.find((j) => j.id_jabatan?.toString() === form.id_jabatan);
  const selectedAtasanInfo = pegawaiList.find((p) => p.id_pegawai?.toString() === form.id_atasan);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 text-gray-900 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 bg-blue-300" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 bg-cyan-300" />
      </div>

      <div className="relative z-10">
        <header className="backdrop-blur-xl bg-white/40 border-b border-blue-200/50 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 shadow-md shadow-blue-500/30">
                    <User size={20} className="text-white" />
                  </div>
                  <h1 className="text-4xl font-bold bg-linear-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">{isEdit ? "Perbarui Data Pegawai" : "Registrasi Pegawai Baru"}</h1>
                </div>
                <p className="text-gray-600 text-sm pl-1">Pastikan data hierarki sesuai dengan struktur organisasi terbaru.</p>
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

        <main className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
          <div className="space-y-4">
            {submitError && (
              <div className="rounded-2xl border border-red-300 bg-linear-to-br from-red-50 to-red-100/50 p-4 flex items-center gap-4 shadow-lg">
                <div className="p-2 rounded-lg bg-red-200/50 shrink-0">
                  <AlertCircle size={20} className="text-red-600" />
                </div>
                <div>
                  <p className="text-red-800 font-semibold text-sm">Gagal Menyimpan</p>
                  <p className="text-red-700 text-xs mt-0.5">{submitError}</p>
                </div>
              </div>
            )}

            {submitSuccess && (
              <div className="rounded-2xl border border-emerald-300 bg-linear-to-br from-emerald-50 to-emerald-100/50 p-4 flex items-center gap-4 shadow-lg">
                <div className="p-2 rounded-lg bg-emerald-200/50 shrink-0">
                  <Save size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-emerald-800 font-semibold text-sm">Data berhasil disimpan!</p>
                  <p className="text-emerald-700 text-xs mt-0.5">Mengalihkan...</p>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-blue-200/70 bg-linear-to-br from-white/80 to-blue-50/80 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="h-1 w-full bg-linear-to-r from-blue-500 to-cyan-400" />
              <div className="p-6 sm:p-8 space-y-8">
                {/* Data Pokok */}
                <div>
                  <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">Data Pokok</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <Field label="Nama Lengkap" icon={User} error={errors.nama_lengkap} required>
                        <input type="text" placeholder="Contoh: Aditiya Wijaya" value={form.nama_lengkap} onChange={(e) => handleChange("nama_lengkap", e.target.value)} className={errors.nama_lengkap ? inputError : inputNormal} />
                      </Field>
                    </div>

                    <Field label="NIP" icon={Hash} error={errors.nip} required>
                      <input type="text" placeholder="18 digit angka" value={form.nip} onChange={(e) => handleChange("nip", e.target.value)} maxLength="18" className={errors.nip ? inputError : inputNormal} />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{form.nip.length}/18 digit</span>
                        {form.nip.length === 18 && (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            NIP lengkap
                          </span>
                        )}
                      </div>
                    </Field>

                    <Field label="Status Pegawai" icon={Award}>
                      <select value={form.status_pegawai} onChange={(e) => handleChange("status_pegawai", e.target.value)} className={`${inputNormal} appearance-none cursor-pointer`}>
                        <option value="">— Pilih Status —</option>
                        {STATUS_PEGAWAI_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Golongan / Ruang" icon={Award}>
                      <input type="text" placeholder="Contoh: III/a" value={form.golongan_ruang} onChange={(e) => handleChange("golongan_ruang", e.target.value)} className={inputNormal} />
                    </Field>

                    <Field label="Kelas Pegawai" icon={Layers}>
                      <select value={form.kelas_pegawai} onChange={(e) => handleChange("kelas_pegawai", e.target.value)} className={`${inputNormal} appearance-none cursor-pointer`}>
                        <option value="">— Pilih Kelas Pegawai —</option>
                        {KELAS_OPTIONS.map((k) => (
                          <option key={k} value={k}>
                            Kelas {k}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>

                <div className="border-t border-blue-100" />

                {/* Data Pribadi */}
                <div>
                  <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">Data Pribadi</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Tempat Lahir" icon={MapPin}>
                      <input type="text" placeholder="Contoh: Jakarta" value={form.tempat_lahir} onChange={(e) => handleChange("tempat_lahir", e.target.value)} className={inputNormal} />
                    </Field>
                    <Field label="Tanggal Lahir" icon={Calendar}>
                      <input type="date" value={form.tanggal_lahir} onChange={(e) => handleChange("tanggal_lahir", e.target.value)} className={inputNormal} />
                    </Field>
                  </div>
                </div>

                <div className="border-t border-blue-100" />

                {/* Pendidikan */}
                <div>
                  <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">Riwayat Pendidikan</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Pendidikan Formal" icon={GraduationCap}>
                      <select value={form.pendidikan_formal} onChange={(e) => handleChange("pendidikan_formal", e.target.value)} className={`${inputNormal} appearance-none cursor-pointer`}>
                        <option value="">— Pilih Pendidikan —</option>
                        {PENDIDIKAN_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Tahun Lulus" icon={Calendar}>
                      <input type="number" placeholder="Contoh: 2010" min="1970" max="2099" value={form.tahun_lulus} onChange={(e) => handleChange("tahun_lulus", e.target.value)} className={inputNormal} />
                    </Field>
                    <Field label="Nama Sekolah / Perguruan Tinggi" icon={School}>
                      <input type="text" placeholder="Contoh: Universitas Indonesia" value={form.nama_sekolah} onChange={(e) => handleChange("nama_sekolah", e.target.value)} className={inputNormal} />
                    </Field>
                    <Field label="Jurusan / Program Studi" icon={BookOpen}>
                      <input type="text" placeholder="Contoh: Teknik Informatika" value={form.jurusan} onChange={(e) => handleChange("jurusan", e.target.value)} className={inputNormal} />
                    </Field>
                  </div>
                </div>

                <div className="border-t border-blue-100" />

                {/* Struktur Organisasi */}
                <div>
                  <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">Struktur Organisasi</h2>
                  <div className="grid grid-cols-1 gap-5">
                    <Field label="Jabatan Definitif" icon={Briefcase} error={errors.id_jabatan} required>
                      <select value={form.id_jabatan} onChange={(e) => handleJabatanChange(e.target.value)} className={`${errors.id_jabatan ? inputError : inputNormal} appearance-none cursor-pointer`}>
                        <option value="">— Pilih Jabatan —</option>
                        {jabatanList.map((j) => (
                          <option key={j.id_jabatan} value={j.id_jabatan.toString()}>
                            {j.nama_jabatan}
                            {j.kelas_jabatan != null ? ` (Kelas ${j.kelas_jabatan})` : ""}
                          </option>
                        ))}
                      </select>
                      {selectedJabatanInfo && (
                        <div className="mt-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center gap-2">
                          <Briefcase size={11} />
                          <span className="font-semibold">Dipilih:</span>
                          <span>{selectedJabatanInfo.nama_jabatan}</span>
                          {form.kelas_jabatan && <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 font-bold text-[10px]">Kelas {form.kelas_jabatan}</span>}
                        </div>
                      )}
                    </Field>

                    <Field label="Atasan" icon={Users}>
                      <select value={form.id_atasan} onChange={(e) => handleChange("id_atasan", e.target.value)} disabled={!form.id_jabatan} className={`${inputNormal} appearance-none cursor-pointer disabled:opacity-50`}>
                        <option value="0">— Tidak Ada (Pimpinan Tertinggi) —</option>
                        {atasanFiltered.map((p) => {
                          const kelasAtasan = p.kelas_jabatan ?? p.kelas_pegawai ?? "-";
                          return (
                            <option key={p.id_pegawai} value={p.id_pegawai.toString()}>
                              {p.nama_lengkap?.trim()} — Kelas {kelasAtasan} — {p.nama_jabatan || "Tanpa Jabatan"}
                            </option>
                          );
                        })}
                      </select>

                      {/* Debug info */}
                      {form.id_jabatan && (
                        <p className="text-xs text-gray-400 mt-1">
                          Kelas pegawai: <strong>{form.kelas_pegawai || "belum dipilih"}</strong>
                          {" · "}calon atasan tersedia: <strong>{atasanFiltered.length}</strong>
                        </p>
                      )}
                      {/* Warning tidak ada atasan */}
                      {form.id_jabatan && form.kelas_pegawai && atasanFiltered.length === 0 && (
                        <div className="mt-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs flex items-center gap-2">
                          <AlertCircle size={11} />
                          <span>
                            Tidak ada pegawai dengan kelas lebih tinggi dari kelas {form.kelas_pegawai}.{kelasToNum(String(form.kelas_pegawai)) >= 15 ? " Pegawai ini adalah pimpinan tertinggi." : ""}
                          </span>
                        </div>
                      )}

                      {selectedAtasanInfo && form.id_atasan !== "0" && (
                        <div className="mt-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center gap-2">
                          <Users size={11} />
                          <span className="font-semibold">Atasan:</span>
                          <span>
                            {selectedAtasanInfo.nama_lengkap?.trim()} (Kelas {selectedAtasanInfo.kelas_jabatan ?? selectedAtasanInfo.kelas_pegawai ?? "-"})
                          </span>
                        </div>
                      )}
                    </Field>
                  </div>
                </div>

                <div className="border-t border-blue-100" />

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-lg bg-white/60 hover:bg-white/80 border border-blue-200 text-gray-700 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <X size={15} />
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-lg bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 disabled:from-blue-300 disabled:to-cyan-300 font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:shadow-none flex items-center justify-center gap-2 text-white disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        {isEdit ? "Simpan Perubahan" : "Daftarkan Pegawai"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-200/70 bg-linear-to-br from-white/60 to-blue-50/60 backdrop-blur-sm flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-blue-100 shrink-0 mt-0.5">
                <AlertCircle size={14} className="text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Pilih <strong>Jabatan Definitif</strong> terlebih dahulu — kelas jabatan akan terisi otomatis. Dropdown atasan hanya menampilkan pegawai dengan kelas jabatan lebih tinggi.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
