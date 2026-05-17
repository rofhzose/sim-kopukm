import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Edit3,
  Printer,
  Loader2,
  X,
  ArrowLeft,
  Eye,
  QrCode,
  List,
  ClipboardList,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import axiosInstance from "@/utils/axiosInstance";
import Swal from "sweetalert2";
import formatIdr from "@/utils/formatIdr";
import AddKibEModal from "./components/AddKibEModal";
import EditKibEModal from "./components/EditKibEModal";
import KibEDashboard from "./components/KibEDashboard";

export default function KibEPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQr, setSelectedQr] = useState(null);
  const [activeTab, setActiveTab] = useState("daftar"); // "daftar" or "ceklis"

  // FILTER
  const [filterKondisi, setFilterKondisi] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleResetChecklist = async () => {
    Swal.fire({
      title: "Riset Status Ceklis?",
      text: "Semua data ceklis aset KIB E akan dikembalikan ke status 'Belum Dicek'!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Riset!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.post("/kib-e/reset-checklist");
          Swal.fire("Selesai!", "Status ceklis telah diriset.", "success");
          fetchData();
        } catch (err) {
          Swal.fire("Gagal!", "Gagal meriset status ceklis.", "error");
        }
      }
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/kib-e");
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Hapus Data?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/kib-e/${id}`);
          Swal.fire("Terhapus!", "Data telah dihapus.", "success");
          fetchData();
        } catch (err) {
          Swal.fire("Gagal!", "Gagal menghapus data.", "error");
        }
      }
    });
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.nama_barang
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.kode_barang
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesKondisi =
      filterKondisi === "" || item.kondisi === filterKondisi;

    const matchesTahun =
      filterTahun === "" ||
      String(item.tahun_perolehan) === filterTahun;

    return matchesSearch && matchesKondisi && matchesTahun;
  });

  const yearsOptions = [
    ...new Set(data.map((item) => String(item.tahun_perolehan))),
  ].sort((a, b) => b - a);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleExportPDF = () => {
    if (activeTab === "ceklis") {
      localStorage.setItem("printCeklisData", JSON.stringify(filteredData));
      window.open("/print-checklist-kib-e", "_blank");
    } else {
      localStorage.setItem("printData", JSON.stringify(filteredData));
      window.open("/print-table-kib-e", "_blank");
    }
  };

  // NAVIGASI QR
  const handleGoToScanE = () => {
    window.location.href = "/hasilscanqre";
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 space-y-6">

      {/* BACK BUTTON */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => (window.location.href = "/dokumen/inventaris")}
          className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
          Kembali ke Inventaris
        </h2>
      </div>

      {/* DASHBOARD */}
      <KibEDashboard
        data={data}
        onAdd={() => setShowAddModal(true)}
        onExportPDF={handleExportPDF}
        onGoToScanE={handleGoToScanE}
      />

      {/* TABS */}
      <div className="flex gap-2 p-1 bg-slate-200/60 rounded-2xl w-fit self-start border border-slate-200">
        <button
          onClick={() => setActiveTab("daftar")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
            activeTab === "daftar"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <List size={16} />
          Daftar Aset KIB E
        </button>
        <button
          onClick={() => setActiveTab("ceklis")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
            activeTab === "ceklis"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <ClipboardList size={16} />
          Tabel Ceklis Aset
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">

        <div className="flex justify-between items-center gap-4">

          {/* SEARCH */}
          <div className="flex items-center gap-3 w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={20} className="text-slate-400" />

            <input
              placeholder="Cari nama barang atau kode..."
              className="bg-transparent border-none outline-none w-full text-sm font-semibold text-slate-700 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* ACTION BUTTON */}
          <div className="flex gap-2">

            {/* REFRESH */}
            <button
              onClick={fetchData}
              className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
              title="Refresh"
            >
              <RefreshCw
                size={20}
                className={loading ? "animate-spin" : ""}
              />
            </button>

            {/* FILTER */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl transition-colors ${
                showFilters
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              title="Filter"
            >
              <Filter size={20} />
            </button>

            {/* EXPORT PDF */}
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors font-bold text-sm"
              title="Export PDF"
            >
              <Printer size={18} />
              Export PDF
            </button>

            {/* RESET CEKLIS */}
            {activeTab === "ceklis" && (
              <button
                onClick={handleResetChecklist}
                className="flex items-center gap-2 px-4 py-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors font-bold text-sm border border-rose-100"
                title="Reset Semua Ceklis"
              >
                <RefreshCw size={18} />
                Reset Ceklis
              </button>
            )}

          </div>
        </div>

        {/* FILTER PANEL */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Filter Kondisi
              </label>

              <select
                value={filterKondisi}
                onChange={(e) => setFilterKondisi(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none"
              >
                <option value="">Semua Kondisi</option>
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Filter Tahun
              </label>

              <select
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none"
              >
                <option value="">Semua Tahun</option>

                {yearsOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end pb-0.5">
              <button
                onClick={() => {
                  setFilterKondisi("");
                  setFilterTahun("");
                  setSearchTerm("");
                }}
                className="text-xs font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest flex items-center gap-1.5"
              >
                <X size={14} />
                Reset Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">

        {activeTab === "daftar" ? (
          <>
            <div className="overflow-x-auto flex-1 custom-scrollbar">
              <table className="w-full">

                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">No</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Kode</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Nama Barang</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Tahun</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Kondisi</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-wider">Harga</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-wider">QR</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {loading ? (
                    <tr>
                      <td colSpan="9" className="p-12 text-center text-slate-400 font-medium">
                        <Loader2 className="animate-spin mx-auto mb-2" />
                        Memuat data...
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-12 text-center text-slate-400 font-medium">
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">

                        <td className="px-6 py-4 text-sm font-bold text-slate-400">
                          {index + 1}
                        </td>

                        <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                          {item.kode_barang}
                        </td>

                        <td className="px-6 py-4 text-sm font-bold text-slate-700">
                          <div>{item.nama_barang}</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            Reg: {item.nomor_register}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center text-sm font-bold text-slate-500">
                          {item.tahun_perolehan}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                              item.kondisi === "Baik"
                                ? "bg-emerald-100 text-emerald-600"
                                : item.kondisi === "Rusak Ringan"
                                ? "bg-amber-100 text-amber-600"
                                : "bg-rose-100 text-rose-600"
                            }`}
                          >
                            {item.kondisi}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">
                          {formatIdr(item.harga)}
                        </td>

                        <td className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {item.status}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div
                            className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm inline-block cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => setSelectedQr(item)}
                          >
                            <QRCodeCanvas
                              value={`${window.location.origin}/verifikasi-aset-e/${item.id}`}
                              size={48}
                              level={"H"}
                              includeMargin={false}
                            />
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">

                            <button
                              onClick={() =>
                                (window.location.href = `/verifikasi-aset-e/${item.id}`)
                              }
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))
                  )}

                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium text-center">
              Menampilkan {filteredData.length} data
            </div>
          </>
        ) : (
          <>
            <div className="overflow-x-auto flex-1 custom-scrollbar">
              <table className="w-full">

                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">No</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Kode</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Nama Barang</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Aksi</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-wider">Waktu Cek</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Keterangan</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">
                        <Loader2 className="animate-spin mx-auto mb-2" />
                        Memuat data...
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">

                        <td className="px-6 py-4 text-sm font-bold text-slate-400">
                          {index + 1}
                        </td>

                        <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                          {item.kode_barang}
                        </td>

                        <td className="px-6 py-4 text-sm font-bold text-slate-700">
                          <div>{item.nama_barang}</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            Reg: {item.nomor_register}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">

                            <button
                              onClick={() => setSelectedQr(item)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                            >
                              <QrCode size={14} />
                              Pindai QR
                            </button>

                            <button
                              onClick={() =>
                                (window.location.href = `/verifikasi-aset-e/${item.id}`)
                              }
                              className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              <Eye size={14} />
                            </button>

                          </div>
                        </td>

                        <td className="px-6 py-4 text-center text-sm font-bold text-slate-500">
                          {item.is_checked && item.checked_at
                            ? new Date(item.checked_at).toLocaleString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }) + " WIB"
                            : "-"}
                        </td>

                        <td className="px-6 py-4 text-sm font-black text-emerald-600">
                          {item.is_checked ? "✓ BARANG ADA" : ""}
                        </td>

                      </tr>
                    ))
                  )}

                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium text-center">
              Menampilkan {filteredData.length} data ceklis
            </div>
          </>
        )}

      </div>

      {/* MODAL */}
      <AddKibEModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchData}
      />

      <EditKibEModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchData}
        data={selectedItem}
      />

      {/* QR MODAL */}
      {selectedQr && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          onClick={() => setSelectedQr(null)}
        >
          <div
            className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedQr(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase">
              Kode QR KIB E
            </h3>

            <p className="text-sm text-slate-500 font-bold mb-6">
              {selectedQr.nama_barang}
            </p>

            <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-inner inline-block mb-6">
              <QRCodeCanvas
                value={`${window.location.origin}/verifikasi-aset-e/${selectedQr.id}`}
                size={250}
                level={"H"}
                includeMargin={true}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                KODE BARANG
              </p>

              <p className="text-lg font-black text-indigo-600 bg-indigo-50 py-2 rounded-xl">
                {selectedQr.kode_barang}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}