import React from "react";
import { FileText, Award, ClipboardCheck, Layers, ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PerjanjianKinerjaPage() {
  const navigate = useNavigate();

  const menus = [
    {
      title: "Cover Perjanjian Kinerja",
      desc: "Halaman sampul dokumen PK",
      icon: <FileText size={26} />,
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/30",
      bg: "from-blue-50 to-blue-100/60",
      border: "border-blue-200",
      path: "/dokumen/cetak-cover",
      number: "01",
    },
    {
      title: "Perjanjian Kinerja Eselon II",
      desc: "Dokumen PK tingkat eselon II",
      icon: <Award size={26} />,
      gradient: "from-red-400 to-rose-500",
      shadow: "shadow-red-400/30",
      bg: "from-red-50 to-rose-100/60",
      border: "border-red-200",
      path: "/dokumen/PKEselonII",
      number: "02",
    },
    {
      title: "Perjanjian Kinerja Eselon III",
      desc: "Dokumen PK tingkat eselon III",
      icon: <ClipboardCheck size={26} />,
      gradient: "from-indigo-500 to-violet-500",
      shadow: "shadow-indigo-500/30",
      bg: "from-indigo-50 to-violet-100/60",
      border: "border-indigo-200",
      path: "/dokumen/PKEselonIII",
      number: "03",
    },
    {
      title: "Perjanjian Kinerja Eselon IV",
      desc: "Dokumen PK tingkat eselon IV",
      icon: <Layers size={26} />,
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/30",
      bg: "from-emerald-50 to-teal-100/60",
      border: "border-emerald-200",
      path: "/dokumen/PKEselonIV",
      number: "04",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 text-gray-900 overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 bg-blue-300" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 bg-cyan-300" />
        <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full blur-3xl opacity-10 bg-blue-400" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/40 border-b border-blue-200/50 sticky top-0 z-20 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 shadow-md shadow-blue-500/30">
                    <FileText size={20} className="text-white" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Perjanjian Kinerja
                  </h1>
                </div>
                <p className="text-gray-600 text-sm pl-1">
                  Dokumen Kinerja — Pilih jenis dokumen yang ingin dicetak
                </p>
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

        <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10">

          {/* Intro badge */}
          <div className="mb-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-linear-to-r from-transparent to-blue-200" />
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
              4 Jenis Dokumen Tersedia
            </span>
            <div className="h-px flex-1 bg-linear-to-l from-transparent to-blue-200" />
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {menus.map((menu, index) => (
              <button
                key={index}
                onClick={() => navigate(menu.path)}
                className={`group relative overflow-hidden rounded-2xl border ${menu.border} bg-linear-to-br ${menu.bg} backdrop-blur-sm shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left p-6`}
              >
                {/* Number watermark */}
                <span className="absolute top-4 right-5 text-5xl font-black text-gray-900/5 select-none leading-none">
                  {menu.number}
                </span>

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`shrink-0 p-3 rounded-xl bg-linear-to-br ${menu.gradient} shadow-lg ${menu.shadow} text-white group-hover:scale-110 transition-transform duration-300`}>
                    {menu.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="font-bold text-gray-800 text-base leading-snug group-hover:text-blue-700 transition-colors">
                      {menu.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">{menu.desc}</p>
                  </div>

                  {/* Arrow */}
                  <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-gray-400">
                    <ChevronRight size={18} />
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-linear-to-r ${menu.gradient} transition-all duration-500`} />
              </button>
            ))}
          </div>

          {/* Info card */}
          <div className="mt-8 rounded-2xl border border-blue-200/70 bg-linear-to-br from-white/80 to-blue-50/80 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="h-1 w-full bg-linear-to-r from-blue-500 to-cyan-400" />
            <div className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 shadow-md shadow-blue-500/30 shrink-0">
                <FileText size={18} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Sistem Manajemen Perjanjian Kinerja</p>
                <p className="text-gray-500 text-xs mt-0.5">Badan Kesatuan Bangsa dan Politik • Dinkopukm Karawang</p>
              </div>
            </div>
          </div>
        </main>
       
      </div>
    </div>
  );
}