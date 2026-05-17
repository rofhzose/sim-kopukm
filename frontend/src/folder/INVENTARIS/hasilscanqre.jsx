import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Hash,
  Layers,
  Info,
  CheckCircle,
  CalendarDays,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";

export default function HasilScanQRE() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // AMBIL DATA ASET BERDASARKAN ID QR
      const res = await axiosInstance.get(`/kib-e/${id}`);

      setData(res.data);

      // SIMPAN LAPORAN SCAN
      await axiosInstance.post("/laporan-scan", {
        aset_id: res.data.id,
        kode_barang: res.data.kode_barang,
        nama_barang: res.data.nama_barang,
        tahun: new Date().getFullYear(),
        waktu_scan: new Date(),
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin" size={40} />
          <span className="font-bold">Memuat Data QR...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Info className="text-rose-500" size={40} />
          </div>

          <h1 className="text-2xl font-black text-slate-800 mb-2 uppercase">
            QR Tidak Valid
          </h1>

          <p className="text-slate-500 font-medium text-sm">
            Data aset tidak ditemukan atau QR sudah tidak berlaku.
          </p>

          <button
            onClick={() => window.history.back()}
            className="mt-6 px-5 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-700 transition-all"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8 flex justify-center">
      <div className="max-w-md w-full space-y-6">

        {/* BACK */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-slate-500 font-bold text-sm"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>

        {/* CARD */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-emerald-100/50 overflow-hidden border border-slate-100">

          {/* HEADER */}
          <div className="bg-emerald-600 p-8 text-center text-white relative">

            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase">
              KIB E
            </div>

            <div className="w-20 h-20 bg-white/20 rounded-3xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
              <BookOpen size={40} />
            </div>

            <h1 className="text-2xl font-black uppercase tracking-tight">
              Detail Koleksi Aset
            </h1>

            <p className="text-emerald-100 text-sm font-medium mt-1">
              ID Aset: {data.kode_barang}
            </p>
          </div>

          {/* CONTENT */}
          <div className="p-8 space-y-6">

            <div className="space-y-5">

              <DetailRow
                icon={<Layers size={18} />}
                color="text-emerald-500"
                label="Jenis Aset"
                value={data.jenis_aset || "Buku Perpustakaan"}
              />

              <DetailRow
                icon={<Hash size={18} />}
                color="text-emerald-500"
                label="Nama Barang"
                value={data.nama_barang}
              />

              <DetailRow
                icon={<CalendarDays size={18} />}
                color="text-emerald-500"
                label="Tahun Perolehan"
                value={data.tahun_perolehan}
              />

              <DetailRow
                icon={<Info size={18} />}
                color="text-emerald-500"
                label="Kondisi"
                value={data.kondisi}
              />

              <DetailRow
                icon={<ShieldCheck size={18} />}
                color="text-emerald-500"
                label="Status"
                value={data.status}
              />

              {/* STATUS VALID */}
              <div className="flex items-center gap-2 bg-emerald-50 p-4 rounded-2xl text-emerald-700 border border-emerald-100">
                <CheckCircle size={18} />

                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-wider">
                    QR Valid & Terdaftar
                  </span>

                  <span className="text-[11px] font-semibold text-emerald-600">
                    Scan berhasil dicatat ke laporan tahun {new Date().getFullYear()}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DetailRow = ({ icon, label, value, color }) => (
  <div className="flex items-start gap-4">
    <div className={`${color} mt-1`}>
      {icon}
    </div>

    <div>
      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
        {label}
      </span>

      <span className="text-slate-700 font-bold text-base">
        {value}
      </span>
    </div>
  </div>
);