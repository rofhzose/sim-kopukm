import React, { useMemo } from "react";
import { TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Calendar, FileText, Plus, Package, QrCode } from "lucide-react";
import formatIdr from "@/utils/formatIdr";

export default function KibEDashboard({ data, onAdd, onExportPDF }) {
  const handlePrintAllQR = () => {
    // Membuka halaman khusus print QR KIB E di tab baru
    window.open('/print-qr-kib-e', '_blank');
  };

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalAset = data.reduce((acc, item) => acc + Number(item.harga), 0);
    const totalUnit = data.length;
    
    const kondisiBaik = data.filter(item => item.kondisi === "Baik").length;
    const kondisiLain = data.filter(item => item.kondisi !== "Baik").length;
    const persenBaik = totalUnit > 0 ? ((kondisiBaik / totalUnit) * 100).toFixed(1) : 0;

    // Trend Perolehan (Top 3 Recent Years)
    const trendMap = data.reduce((acc, item) => {
      const year = item.tahun_perolehan || "Unknown";
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});
    
    const trendList = Object.entries(trendMap)
      .sort((a, b) => b[0] - a[0])
      .slice(0, 3);

    // Oldest & Highest Value
    const sortedByYear = [...data].sort((a, b) => a.tahun_perolehan - b.tahun_perolehan);
    const oldestItem = sortedByYear[0];
    
    const sortedByPrice = [...data].sort((a, b) => Number(b.harga) - Number(a.harga));
    const mostExpensiveItem = sortedByPrice[0];

    // Maintenance Estimation
    const totalNilaiBaik = data
      .filter(item => item.kondisi === "Baik")
      .reduce((acc, item) => acc + Number(item.harga), 0);
      
    const totalNilaiKurang = data
      .filter(item => item.kondisi !== "Baik")
      .reduce((acc, item) => acc + Number(item.harga), 0);

    const preventiveCost = totalNilaiBaik * 0.02;
    const correctiveCost = totalNilaiKurang * 0.15;
    const totalRecommendation = preventiveCost + correctiveCost;

    return {
      totalAset,
      totalUnit,
      kondisiBaik,
      kondisiLain,
      persenBaik,
      trendList,
      oldestItem,
      mostExpensiveItem,
      preventiveCost,
      correctiveCost,
      totalRecommendation,
      totalNilaiBaik,
      totalNilaiKurang
    };
  }, [data]);

  return (
    <div className="space-y-6">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Data Inventaris KIB E</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Aset Tetap Lainnya (Buku, Perpustakaan, Kesenian, Kebudayaan)</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={onExportPDF} className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-100 transition-colors border border-rose-100">
            <FileText size={18} /> Export PDF
          </button>
          <button onClick={handlePrintAllQR} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors border border-slate-200">
            <QrCode size={18} /> Print All QR
          </button>
          <button onClick={onAdd} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
            <Plus size={18} /> Tambah Data
          </button>
        </div>
      </div>

      {/* TOP CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* TOTAL NILAI ASET */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">TOTAL NILAI ASET</h3>
            <p className="text-2xl font-black text-blue-600 tracking-tight">{formatIdr(stats.totalAset)}</p>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mt-4 bg-slate-50 p-2 rounded-xl w-fit">
            <Package size={14} /> Total {stats.totalUnit} unit barang
          </div>
        </div>

        {/* KONDISI ASET */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-emerald-500 flex flex-col justify-between h-full">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">KONDISI ASET</h3>
            <span className="text-emerald-600 font-black text-sm bg-emerald-50 px-2 py-1 rounded-lg">{stats.persenBaik}% Baik</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden">
            <div className="bg-emerald-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${stats.persenBaik}%` }}></div>
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Baik: {stats.kondisiBaik}</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Rusak: {stats.kondisiLain}</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Berat: 0</div>
          </div>
        </div>

        {/* TREN PEROLEHAN */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">TREN PEROLEHAN (TERBARU)</h3>
          <div className="space-y-2">
            {stats.trendList.map(([year, count]) => (
              <div key={year} className="flex justify-between items-center bg-slate-50 p-2 px-3 rounded-xl">
                <span className="text-sm font-bold text-slate-600">Tahun {year}</span>
                <span className="bg-blue-100 text-blue-600 text-xs font-black px-2 py-0.5 rounded-md">{count}</span>
              </div>
            ))}
            {stats.trendList.length === 0 && <p className="text-xs text-slate-400 italic">Belum ada data</p>}
          </div>
        </div>

        {/* ANALISA RISIKO & USIA */}
        <div className="bg-slate-800 p-6 rounded-3xl shadow-lg shadow-slate-300 text-white h-full flex flex-col justify-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 blur-[50px] opacity-20 rounded-full"></div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest z-10">ANALISA RISIKO & USIA</h3>
          
          <div className="z-10">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-400">Tertua: Tahun {stats.oldestItem?.tahun_perolehan || "-"}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-rose-400" />
              <span className="text-xs font-bold text-rose-400">Nilai Tertinggi:</span>
            </div>
            <p className="text-sm font-bold truncate text-slate-200">{stats.mostExpensiveItem?.nama_barang || "-"}</p>
            <p className="text-lg font-black text-white tracking-tight">{formatIdr(stats.mostExpensiveItem?.harga || 0)}</p>
          </div>
        </div>

      </div>

      {/* ESTIMASI ANGGARAN */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-600" size={20} />
            <h3 className="text-lg font-black text-slate-800">Estimasi Anggaran Pemeliharaan (Tahun {new Date().getFullYear() + 1})</h3>
          </div>
          <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">System Projection</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: VALUES */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">Pemeliharaan Rutin (Preventive)</p>
              <h4 className="text-2xl font-black text-slate-800 tracking-tight">{formatIdr(stats.preventiveCost)}</h4>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 mb-1">
                <div className="bg-emerald-500 h-1.5 rounded-full w-3/4"></div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">2% dari nilai aset kondisi Baik</p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">Perbaikan (Corrective)</p>
              <h4 className="text-2xl font-black text-rose-600 tracking-tight">{formatIdr(stats.correctiveCost)}</h4>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 mb-1">
                <div className="bg-amber-500 h-1.5 rounded-full w-1/2"></div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">15% dari nilai aset kondisi Kurang Baik (Qty: {stats.kondisiLain} item)</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">TOTAL REKOMENDASI</p>
              <h3 className="text-2xl font-black text-blue-600 tracking-tight">{formatIdr(stats.totalRecommendation)}</h3>
            </div>
          </div>

          {/* MIDDLE COLUMN: FORMULA */}
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 lg:col-span-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">RUMUS PERHITUNGAN</h4>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs font-bold text-slate-600">Preventive:</p>
                <code className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">0.02 × Total Nilai Aset (Baik)</code>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-600">Corrective:</p>
                <code className="text-xs font-mono text-rose-600 bg-rose-50 px-2 py-1 rounded">0.15 × Total Nilai Aset (Kurang Baik)</code>
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">DASAR PENETAPAN PERSENTASE</h4>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="text-xs font-bold text-slate-700">2% (Preventive)</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Untuk aset kondisi baik. Mencakup pembersihan, inspeksi berkala, kalibrasi, & penggantian minor. (Praktik umum: 1-3% nilai perolehan).</p>
                </div>
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="text-xs font-bold text-slate-700">15% (Corrective)</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Untuk aset kondisi kurang baik. Buffer anggaran untuk suku cadang, servis teknis, atau penggantian komponen. (Praktik umum: 10-25% nilai perolehan).</p>
                </div>
              </li>
            </ul>

            <div className="mt-4 flex gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100">
              <div className="text-blue-500 mt-0.5">ℹ️</div>
              <p className="text-[10px] text-blue-600 font-medium leading-tight">
                Catatan Sistem: Persentase ini adalah parameter proyeksi dan dapat dikalibrasi berdasarkan realisasi tahun sebelumnya.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: SIMULATION TABLE */}
          <div className="lg:col-span-1">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">SIMULASI REAL DATA</h4>
             
             <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                  <div className="text-xs">
                    <p className="font-bold text-slate-600">Nilai Aset Baik:</p>
                    <p className="font-medium text-emerald-600">Hitung (2%):</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold text-slate-600">{formatIdr(stats.totalNilaiBaik)}</p>
                    <p className="font-bold text-emerald-600">{formatIdr(stats.preventiveCost)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                  <div className="text-xs">
                    <p className="font-bold text-slate-600">Nilai Aset Kurang:</p>
                    <p className="font-medium text-rose-600">Hitung (15%):</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold text-slate-600">{formatIdr(stats.totalNilaiKurang)}</p>
                    <p className="font-bold text-rose-600">{formatIdr(stats.correctiveCost)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <p className="text-xs font-black text-slate-800">Total:</p>
                  <p className="text-sm font-black text-blue-600">{formatIdr(stats.totalRecommendation)}</p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
