import React, { useEffect, useState, useMemo } from "react";
import { PlusCircle, ArrowLeft, PencilLine, Trash2, Search, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteJabatan, getAllJabatan } from "@/services/jabatanService";

const KELAS_COLORS = {
  3: "bg-red-100 text-red-700 border-red-200",
  5: "bg-purple-100 text-purple-700 border-purple-200",
  6: "bg-blue-100 text-blue-700 border-blue-200",
  7: "bg-cyan-100 text-cyan-700 border-cyan-200",
  8: "bg-teal-100 text-teal-700 border-teal-200",
  9: "bg-green-100 text-green-700 border-green-200",
  11: "bg-lime-100 text-lime-700 border-lime-200",
  12: "bg-amber-100 text-amber-700 border-amber-200",
  14: "bg-orange-100 text-orange-700 border-orange-200",
  IX: "bg-rose-100 text-rose-700 border-rose-200",
  null: "bg-gray-100 text-gray-600 border-gray-200",
};

const getKelasColor = (kelas) => KELAS_COLORS[kelas] ?? "bg-gray-100 text-gray-600 border-gray-200";
const getKelasLabel = (kelas) => (kelas != null ? `Kelas ${kelas}` : "Tanpa Kelas");

export default function DaftarJabatan() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchJabatan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAllJabatan();
      setData(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      setError("Gagal memuat data jabatan. Silahkan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJabatan();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((item) => item.nama_jabatan.toLowerCase().includes(q) || (item.keterangan && item.keterangan.toLowerCase().includes(q)) || getKelasLabel(item.kelas_jabatan).toLowerCase().includes(q));
  }, [data, searchQuery]);

  // Hitung jumlah per kelas
  const kelasStats = useMemo(() => {
    const stats = {};
    data.forEach((item) => {
      const k = item.kelas_jabatan ?? "—";
      stats[k] = (stats[k] || 0) + 1;
    });
    return stats;
  }, [data]);

  const sortedFilteredData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const ka = a.kelas_jabatan ?? 9999;
      const kb = b.kelas_jabatan ?? 9999;
      if (ka === kb) return a.nama_jabatan.localeCompare(b.nama_jabatan);
      return ka > kb ? 1 : -1;
    });
  }, [filteredData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus jabatan ini?")) return;
    try {
      await deleteJabatan(id);
      fetchJabatan();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menghapus data");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 text-gray-900 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 bg-blue-300" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 bg-cyan-300" />
      </div>

      <div className="relative z-10">
        <header className="backdrop-blur-xl bg-white/40 border-b border-blue-200/50 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-4xl font-bold bg-linear-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">Daftar Jabatan</h1>
                <p className="text-gray-600 text-sm">Kelola data jabatan dan posisi di organisasi</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="px-4 py-2.5 rounded-lg bg-white/60 hover:bg-white/80 border border-blue-200 text-gray-700 font-medium text-sm transition-all flex items-center gap-2">
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">Kembali</span>
                </button>
                <button
                  onClick={() => navigate("/dokumen/jabatan/create-jabatan-page")}
                  className="px-4 py-2.5 rounded-lg bg-linear-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center gap-2 text-white transition-all"
                >
                  <PlusCircle size={16} />
                  <span className="hidden sm:inline">Tambah Jabatan</span>
                </button>
              </div>
            </div>

            {/* Stats per kelas */}
            {Object.keys(kelasStats).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(kelasStats)
                  .sort()
                  .map(([kelas, count]) => (
                    <div key={kelas} className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${getKelasColor(kelas === "—" ? null : kelas)}`}>
                      {kelas === "—" ? "Tanpa Kelas" : `Kelas ${kelas}`}: {count}
                    </div>
                  ))}
              </div>
            )}

            <div className="relative">
              <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama jabatan, keterangan, atau kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/70 border border-blue-200 text-gray-700 placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </header>

        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
            <div className="rounded-2xl border border-red-300 bg-linear-to-br from-red-50 to-red-100/50 p-4 flex items-center gap-4 shadow-lg">
              <div className="p-2 rounded-lg bg-red-200/50">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <p className="flex-1 text-red-700">{error}</p>
              <button onClick={fetchJabatan} className="px-3 py-1 rounded-lg bg-red-200/70 hover:bg-red-300 text-red-700 font-medium text-xs">
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-cyan-400 animate-spin" />
              </div>
              <p className="text-gray-600 font-medium">Memuat data jabatan...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-blue-300 rounded-3xl bg-linear-to-br from-blue-100/30 to-cyan-100/30">
              <Search size={48} className="text-blue-400 mb-4" />
              <p className="text-xl font-bold text-gray-800 mb-2">{searchQuery ? "Tidak ada hasil" : "Data Jabatan Kosong"}</p>
              <p className="text-gray-600 text-sm mb-6 text-center max-w-sm">{searchQuery ? "Coba ubah kata kunci pencarian." : "Silahkan tambahkan jabatan baru."}</p>
              {!searchQuery && (
                <button onClick={() => navigate("/dokumen/jabatan/create-jabatan-page")} className="px-6 py-3 rounded-lg bg-linear-to-r from-blue-500 to-cyan-400 font-bold text-sm text-white shadow-lg shadow-blue-500/30">
                  Tambah Sekarang
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-blue-200/70 bg-linear-to-br from-white/80 to-blue-50/80 flex items-center gap-3">
                <PlusCircle size={20} className="text-blue-500" />
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Total Jabatan</p>
                  <p className="text-2xl font-bold text-gray-800">{data.length}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-blue-200/70 shadow-xl">
                <table className="w-full">
                  <thead>
                    <tr className="bg-linear-to-r from-blue-50 to-cyan-50 border-b border-blue-200/70">
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wide w-12">No</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wide">Nama Jabatan</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wide">Keterangan</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wide w-32">Kelas</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wide w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFilteredData.map((item, index) => (
                      <tr key={item.id_jabatan} className="border-b border-blue-100/70 bg-white/50 hover:bg-blue-50/50 transition-all group">
                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium group-hover:text-blue-700 transition-colors">{item.nama_jabatan}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{item.keterangan || <span className="italic text-gray-300">—</span>}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getKelasColor(item.kelas_jabatan)}`}>{getKelasLabel(item.kelas_jabatan)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => navigate(`/dokumen/jabatan/edit/${item.id_jabatan}`)} className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-800 transition-all" title="Edit">
                              <PencilLine size={16} />
                            </button>
                            <button onClick={() => handleDelete(item.id_jabatan)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition-all" title="Hapus">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Menampilkan {sortedFilteredData.length} dari {data.length} jabatan
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
