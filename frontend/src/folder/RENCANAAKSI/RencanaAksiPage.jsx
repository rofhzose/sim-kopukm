import React, { useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import RencanaAksiTable from "./components/RencanaAksiTable";

export default function RencanaAksiPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const years = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

  const handleTampilkanData = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      // Sesuaikan URL endpoint ini jika berbeda dengan router yang Anda daftarkan di server.js
      const res = await axiosInstance.get(`/rencana-aksi?tahun=${selectedYear}`);
      setList(res.data || []);
    } catch (err) {
      console.error("Gagal menarik data Rencana Aksi:", err);
      alert("Gagal memuat data dari server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 font-sans">
      
      {/* HEADER & FILTER CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              Rencana Aksi
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Laporan Target Kinerja dan Pelaksanaan Program</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto bg-slate-50 p-2 rounded-xl border border-slate-100">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 rounded-lg px-4 py-2.5 outline-none w-full md:w-32 cursor-pointer shadow-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>TA {y}</option>
              ))}
            </select>

            <button 
              onClick={handleTampilkanData}
              disabled={loading}
              className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
            >
              {loading ? "Memuat..." : "Tampilkan Data"}
            </button>
          </div>
        </div>
      </div>

      {/* RENDER TABLE JIKA SUDAH MENEKAN TOMBOL TAMPILKAN */}
      {hasSearched && (
        <RencanaAksiTable data={list} />
      )}

    </div>
  );
}