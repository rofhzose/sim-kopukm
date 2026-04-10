import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Box, Printer, Camera, MapPin, Calendar, Tag } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import moment from "moment";
import "moment/locale/id";

export default function VerificationPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/kib-b/${id}`);
        setData(res.data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Box className="text-red-500" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Data Tidak Ditemukan</h2>
        <p className="text-slate-500 mt-2">QR Code tidak valid atau data aset telah dihapus.</p>
        <Link to="/" className="mt-6 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const currentDate = moment().format("MMMM YYYY");
  const scanTime = moment().format("DD MMM YYYY, HH:mm");

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans flex justify-center items-start">
      <div className="w-full max-w-md space-y-6">
        
        {/* HEADER APP LIKE */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Box className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 leading-tight">Detail Barang</h1>
            <p className="text-xs text-slate-500 font-medium">Kartu Inventaris Barang B</p>
          </div>
        </div>

        {/* STATUS CARD */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <div className="bg-emerald-100 p-1.5 rounded-full mt-0.5">
            <CheckCircle2 className="text-emerald-600" size={20} />
          </div>
          <div>
            <h3 className="text-emerald-800 font-black text-sm">Verifikasi Berhasil</h3>
            <p className="text-emerald-600 text-xs font-medium mt-0.5">
              Status: <span className="font-bold">ADA</span> (Bulan {currentDate})
            </p>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100 relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="p-8 pb-4 text-center border-b border-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">KODE BARANG</p>
            <h2 className="text-2xl font-black text-indigo-600 tracking-tight">{data.kode_barang}</h2>
          </div>

          <div className="p-8 space-y-6">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Tag size={14} />
                <label className="text-[10px] font-bold uppercase tracking-widest">NAMA BARANG</label>
              </div>
              <p className="text-lg font-bold text-slate-800">{data.nama_barang}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">MERK/TYPE</label>
                <p className="text-sm font-bold text-slate-700 uppercase">{data.merk_type || "-"}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Calendar size={14} />
                  <label className="text-[10px] font-bold uppercase tracking-widest">TAHUN</label>
                </div>
                <p className="text-sm font-bold text-slate-700">{data.tahun_perolehan}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">KONDISI</label>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide inline-block ${
                data.kondisi === 'Baik' ? 'bg-emerald-100 text-emerald-700' :
                data.kondisi === 'Rusak Ringan' ? 'bg-amber-100 text-amber-700' :
                'bg-rose-100 text-rose-700'
              }`}>
                {data.kondisi}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <MapPin size={14} />
                <label className="text-[10px] font-bold uppercase tracking-widest">STATUS ASET</label>
              </div>
              <p className="text-sm font-bold text-slate-700">{data.status_aset || "Di Kantor"}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">KETERANGAN</label>
              <p className="text-sm font-medium text-slate-600 italic">
                {data.keterangan || "Tidak ada keterangan tambahan."}
              </p>
            </div>

            <div className="pt-4 text-center">
              <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                <span>🕒</span> Terakhir dipindai: {scanTime} WIB
              </p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="space-y-3 print:hidden">
          <button onClick={() => window.location.href = '/dokumen/kib-b'} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2">
            <Camera size={20} />
            Scan Barang Lain
          </button>
          
          <button onClick={handlePrint} className="w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <Printer size={20} />
            Cetak Detail
          </button>
        </div>

        <div className="text-center pt-4 print:hidden">
           <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">SIM KOPUKM ASET SYSTEM</p>
        </div>

      </div>
    </div>
  );
}
