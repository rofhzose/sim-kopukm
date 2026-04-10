import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ArrowLeft, UserPlus, PencilLine, Trash2, GitGraph, ChevronRight, ChevronDown, ShieldCheck, Users, AlertCircle, BadgeCheck, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deletePegawai, getPegawai } from "../../../services/pegawaiService";

// Helper konversi kelas ke angka untuk sorting
const kelasToNum = (k) => {
  if (!k) return 0;
  if (String(k) === "IX") return 15;
  const n = parseInt(k);
  return isNaN(n) ? 0 : n;
};

export default function DaftarPegawai() {
  const [pegawai, setPegawai] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPegawai = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getPegawai();
      setPegawai(response.data.data || []);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      setError("Gagal memuat data pegawai. Silahkan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPegawai();
  }, []);

  const childrenMap = useMemo(() => {
    const map = {};
    const semuaId = new Set(pegawai.map((p) => String(p.id_pegawai)));

    pegawai.forEach((p) => {
      const noAtasan = p.id_atasan === null || p.id_atasan === undefined || String(p.id_atasan) === "0" || !semuaId.has(String(p.id_atasan)); // atasan tidak ada di dataset = root

      const parentId = noAtasan ? "root" : String(p.id_atasan);
      if (!map[parentId]) map[parentId] = [];
      map[parentId].push(p);
    });

    return map;
  }, [pegawai]);

  const pegawaiTanpaAtasan = useMemo(() => {
    const roots = childrenMap["root"] || [];
    if (roots.length <= 1) return [];

    // Cari kelas numerik tertinggi di antara semua root
    const maxKelasNum = Math.max(...roots.map((p) => kelasToNum(p.kelas_pegawai)));

    // Warning: root yang kelas_pegawainya BUKAN yang tertinggi
    return roots.filter((p) => kelasToNum(p.kelas_pegawai) < maxKelasNum);
  }, [childrenMap]);

  const toggleExpand = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus pegawai ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      await deletePegawai(id);
      fetchPegawai();
    } catch (error) {
      alert(error.response?.data?.message || "Terjadi kesalahan server.");
    }
  };

  const getAvatarColor = (index) => {
    const colors = ["from-blue-400 to-cyan-300", "from-violet-400 to-purple-300", "from-amber-400 to-orange-300", "from-emerald-400 to-teal-300", "from-rose-400 to-pink-300"];
    return colors[index % colors.length];
  };

  const getStatusBadgeStyle = (status) => {
    if (!status) return "bg-gray-100 text-gray-500 border-gray-200";
    if (status.includes("PNS")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (status.includes("PPPK")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status.includes("THL")) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
  };

  const renderPegawaiItem = (item, depth = 0, index = 0) => {
    if (!item) return null;

    const children = childrenMap[String(item.id_pegawai)] || [];
    const isExpanded = expandedIds.has(item.id_pegawai);
    const initials = (item.nama_lengkap || "")
      .split(" ")
      .filter((n) => n.length > 0)
      .slice(0, 2)
      .map((n) => n[0])
      .join("");

    return (
      <div key={item.id_pegawai} className="w-full">
        <style>{`
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .pegawai-card {
            animation: slideInUp 0.4s ease-out both;
            animation-delay: ${depth * 0.05 + index * 0.03}s;
          }
        `}</style>

        <div className="pegawai-card mb-2.5">
          <div className="relative overflow-hidden rounded-2xl border border-blue-200/70 bg-linear-to-br from-white/80 to-blue-50/70 backdrop-blur-sm shadow-md hover:shadow-lg hover:border-blue-300 transition-all duration-200 group">
            <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-15 blur-2xl bg-linear-to-br ${getAvatarColor(index)}`} />

            <div className="relative p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                {/* Left */}
                <div className="flex items-center gap-3 min-w-0">
                  {children.length > 0 ? (
                    <button onClick={() => toggleExpand(item.id_pegawai)} className="shrink-0 p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-all duration-200 text-blue-600">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  ) : (
                    <div className="w-9" />
                  )}

                  <div className={`shrink-0 w-10 h-10 rounded-xl bg-linear-to-br ${getAvatarColor(index)} flex items-center justify-center font-bold text-white text-sm shadow-md`}>{initials}</div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-800 truncate uppercase tracking-wide group-hover:text-blue-700 transition-colors">{item.nama_lengkap || "Nama Tidak Tersedia"}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 flex-wrap">
                      <span className="font-mono">{item.nip || "-"}</span>
                      <span className="hidden sm:inline text-gray-300">•</span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={11} className="text-blue-400" />
                        {item.nama_jabatan || "Tanpa Jabatan"}
                      </span>
                    </div>
                    {(item.status_pegawai || item.kelas_pegawai || item.golongan_ruang) && (
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {item.status_pegawai && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeStyle(item.status_pegawai)}`}>
                            <BadgeCheck size={9} />
                            {item.status_pegawai}
                          </span>
                        )}
                        {item.kelas_pegawai && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-violet-100 text-violet-700 border-violet-200">
                            <GraduationCap size={9} />
                            Kelas {item.kelas_pegawai}
                          </span>
                        )}
                        {item.golongan_ruang && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-cyan-100 text-cyan-700 border-cyan-200">Gol. {item.golongan_ruang}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.kelas_jabatan || item.kelas_pegawai ? <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">Kelas {item.kelas_jabatan || item.kelas_pegawai}</span> : null}
                  <button onClick={() => navigate(`/dokumen/pegawai/edit/${item.id_pegawai}`)} className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-all duration-200 text-blue-600 hover:text-blue-800" title="Edit">
                    <PencilLine size={15} />
                  </button>
                  <button onClick={() => handleDelete(item.id_pegawai)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-all duration-200 text-red-500 hover:text-red-700" title="Hapus">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isExpanded && children.length > 0 && <div className="ml-3 sm:ml-8 pl-4 sm:pl-6 border-l-2 border-blue-200 flex flex-col gap-1 mt-1 mb-3">{children.map((child, idx) => renderPegawaiItem(child, depth + 1, idx))}</div>}
      </div>
    );
  };

  const roots = childrenMap["root"] || [];

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
                    <GitGraph size={20} className="text-white" />
                  </div>
                  <h1 className="text-4xl font-bold bg-linear-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">Struktur Tim</h1>
                </div>
                <p className="text-gray-600 text-sm pl-1">Kelola hierarki organisasi dan data pegawai dengan mudah</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="px-4 py-2.5 rounded-lg bg-white/60 hover:bg-white/80 border border-blue-200 text-gray-700 font-medium text-sm transition-all duration-200 flex items-center gap-2">
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">Kembali</span>
                </button>
                <button
                  onClick={() => navigate("/dokumen/pegawai/tambah-pegawai")}
                  className="px-4 py-2.5 rounded-lg bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center gap-2 text-white"
                >
                  <UserPlus size={16} />
                  <span className="hidden sm:inline">Pegawai Baru</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Warning: struktur terpecah */}
        {!isLoading && pegawaiTanpaAtasan.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
            <div className="rounded-2xl border border-amber-300 bg-linear-to-br from-amber-50 to-amber-100/50 backdrop-blur-sm p-4 sm:p-5 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="shrink-0 p-2 rounded-lg bg-amber-200/50">
                  <AlertCircle size={20} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-amber-800 mb-1">Struktur Organisasi Terpecah</h3>
                  <p className="text-xs text-amber-700 mb-3">Pegawai berikut belum terhubung ke hierarki utama. Silahkan set atasan mereka.</p>
                  <ul className="space-y-2">
                    {pegawaiTanpaAtasan.map((p) => (
                      <li key={p.id_pegawai} className="text-sm text-amber-800 flex items-center justify-between gap-4">
                        <span>
                          <span className="font-semibold">{p.nama_lengkap || "Nama Tidak Tersedia"}</span>
                          <span className="text-amber-600"> ({p.nama_jabatan || "Tanpa Jabatan"})</span>
                          {(p.kelas_jabatan || p.kelas_pegawai) && <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-semibold">Kelas {p.kelas_jabatan || p.kelas_pegawai}</span>}
                        </span>
                        <button onClick={() => navigate(`/dokumen/pegawai/edit/${p.id_pegawai}`)} className="shrink-0 px-3 py-1 rounded-lg bg-amber-200/70 hover:bg-amber-300 text-amber-800 font-medium text-xs transition-all duration-200">
                          Set Atasan
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
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
                <button onClick={fetchPegawai} className="shrink-0 px-3 py-1 rounded-lg bg-red-200/70 hover:bg-red-300 text-red-700 font-medium text-xs transition-all duration-200">
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-cyan-400 animate-spin" />
              </div>
              <p className="text-gray-600 font-medium">Mengolah data hierarki...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {[
                  { label: "Total Pegawai", value: pegawai.length, icon: Users },
                  { label: "Jumlah Cabang", value: roots.length, icon: GitGraph },
                  { label: "Perlu Perhatian", value: pegawaiTanpaAtasan.length, icon: AlertCircle },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="p-4 rounded-xl border border-blue-200/70 bg-linear-to-br from-white/80 to-blue-50/80 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={idx === 2 && stat.value > 0 ? "text-amber-500" : "text-blue-500"} />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
                          <p className={`text-xl font-bold ${idx === 2 && stat.value > 0 ? "text-amber-600" : "text-gray-800"}`}>{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tree */}
              {roots.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-blue-300 rounded-3xl bg-linear-to-br from-blue-100/30 to-cyan-100/30">
                  <div className="p-4 rounded-2xl bg-blue-100 border border-blue-200 mb-4">
                    <Users size={48} className="text-blue-400" />
                  </div>
                  <p className="text-xl font-bold text-gray-800 mb-2">Data Pegawai Kosong</p>
                  <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">Belum ada data pegawai. Tambahkan pegawai pertama untuk memulai.</p>
                  <button
                    onClick={() => navigate("/dokumen/pegawai/tambah-pegawai")}
                    className="px-6 py-3 rounded-lg bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/30 text-white"
                  >
                    Tambah Sekarang
                  </button>
                </div>
              ) : (
                (() => {
                  // Set id pegawai yang masuk warning — tidak perlu ditampilkan di tree
                  const tanpaAtasanIds = new Set(pegawaiTanpaAtasan.map((p) => String(p.id_pegawai)));
                  const rootsValid = roots.filter((p) => !tanpaAtasanIds.has(String(p.id_pegawai)));

                  return rootsValid.length > 0 ? (
                    rootsValid.map((rootPegawai, idx) => renderPegawaiItem(rootPegawai, 0, idx))
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-amber-300 rounded-3xl bg-linear-to-br from-amber-50/40 to-orange-50/40">
                      <div className="p-4 rounded-2xl bg-amber-100 border border-amber-200 mb-4">
                        <AlertCircle size={48} className="text-amber-400" />
                      </div>
                      <p className="text-xl font-bold text-gray-800 mb-2">Hierarki Belum Terbentuk</p>
                      <p className="text-gray-500 text-sm text-center max-w-sm">Semua pegawai belum terhubung ke pimpinan tertinggi. Cek daftar peringatan di atas.</p>
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
