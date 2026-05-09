import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/utils/axiosInstance";

export default function PohonKinerjaPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPohonKinerja();
  }, []);

  const fetchPohonKinerja = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/pohon-kinerja");
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // PRINT PDF
  // =========================
  const handlePrint = () => {
    window.print();
  };

  // =========================
  // TREE MAPPING
  // =========================
  const treeData = useMemo(() => {
    const map = {};

    data.forEach((item) => {
      const sasaran =
        item.sasaran_daerah ||
        "Meningkatkan Akuntabilitas & Kinerja Pemkab";

      const indikator =
        item.indikator_daerah || "Indeks Stabilitas Politik";

      const key = `${sasaran}||${indikator}`;

      if (!map[key]) {
        map[key] = {
          sasaran,
          indikator,
          programs: {},
        };
      }

      const pId = item.id_program;

      if (pId) {
        if (!map[key].programs[pId]) {
          map[key].programs[pId] = {
            id: pId,
            nama: item.nama_program,
            sasaran: item.sasaran_program,
            indikator: item.indikator_program,
            kegiatans: {},
          };
        }

        const kId = item.id_kegiatan;

        if (kId) {
          if (!map[key].programs[pId].kegiatans[kId]) {
            map[key].programs[pId].kegiatans[kId] = {
              id: kId,
              nama: item.nama_kegiatan,
              sasaran: item.sasaran_kegiatan,
              indikator: item.indikator_kegiatan,
              subs: {},
            };
          }

          const sId = item.id_sub;

          if (sId) {
            if (
              !map[key].programs[pId].kegiatans[kId].subs[sId]
            ) {
              map[key].programs[pId].kegiatans[kId].subs[sId] = {
                id: sId,
                nama: item.nama_sub,
                sasaran: item.sasaran_sub,
                indikator: item.indikator_sub,
              };
            }
          }
        }
      }
    });

    return Object.values(map);
  }, [data]);

  // =========================
  // CARD
  // =========================
  const BoxCard = ({
    level,
    sasaran,
    indikator,
    pengampu,
    bgColor,
  }) => (
    <div className="w-[280px] bg-white rounded-xl border border-slate-200 shadow-md shrink-0 flex flex-col overflow-hidden relative z-10 transition-transform hover:-translate-y-1">
      <div
        className={`px-4 py-2.5 text-white text-[10px] font-black uppercase tracking-wider ${bgColor}`}
      >
        {level}
      </div>

      <div className="p-4 space-y-3 text-left">
        <div>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
            Sasaran
          </span>

          <div className="font-bold text-slate-700 leading-snug text-[13px]">
            {sasaran || "-"}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
            Indikator
          </span>

          <div className="font-medium text-slate-600 leading-snug text-[12px]">
            {indikator || "-"}
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
          </div>

          <div>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block">
              Pengampu
            </span>

            <div className="font-black text-slate-800 text-[11px]">
              {pengampu}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* HEADER */}
      <div className="bg-white px-8 py-6 shadow-sm border-b border-slate-200 flex justify-between items-center sticky top-0 z-50 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <svg
              className="w-7 h-7 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>

            Pohon Kinerja
          </h1>

          <p className="text-slate-500 text-sm font-medium mt-1">
            Struktur Keselarasan Kinerja (Top-Down)
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>

          Cetak PDF
        </button>
      </div>

      {loading ? (
        <div className="text-center p-20 text-slate-500 font-bold animate-pulse">
          Memuat Bagan Pohon Kinerja...
        </div>
      ) : (
        <div className="p-10 overflow-x-auto overflow-y-auto max-h-[85vh]">
          <div className="min-w-max pb-32">
            {treeData.map((top, idx) => {
              const programs = Object.values(top.programs);

              return (
                <div
                  key={`rpjmd-${idx}`}
                  className="flex flex-col items-center mb-24 relative"
                >
                  {/* LEVEL 1 */}
                  <BoxCard
                    level="SASARAN STRATEGIS RPJMD"
                    sasaran={top.sasaran}
                    indikator={top.indikator}
                    pengampu="Bupati / Kepala Daerah"
                    bgColor="bg-blue-600"
                  />

                  <div className="w-[2px] h-8 bg-slate-300"></div>

                  {/* LEVEL 2 */}
                  <BoxCard
                    level="SASARAN STRATEGIS RENSTRA"
                    sasaran={top.sasaran}
                    indikator={top.indikator}
                    pengampu="Kepala Dinas"
                    bgColor="bg-cyan-600"
                  />

                  {programs.length > 0 && (
                    <>
                      <div className="w-[2px] h-8 bg-slate-300"></div>

                      <div className="flex items-start justify-center relative">
                        {programs.map((prog, pIdx) => {
                          const isFirstP = pIdx === 0;
                          const isLastP =
                            pIdx === programs.length - 1;

                          const isOnlyP =
                            programs.length === 1;

                          const kegiatans = Object.values(
                            prog.kegiatans
                          );

                          return (
                            <div
                              key={`prog-${prog.id}`}
                              className="flex flex-col items-center relative px-4"
                            >
                              {!isOnlyP && (
                                <div
                                  className={`absolute top-0 h-[2px] bg-slate-300 ${
                                    isFirstP
                                      ? "left-1/2 right-0"
                                      : isLastP
                                      ? "left-0 right-1/2"
                                      : "left-0 right-0"
                                  }`}
                                ></div>
                              )}

                              <div className="w-[2px] h-8 bg-slate-300"></div>

                              {/* LEVEL 3 */}
                              <BoxCard
                                level="SASARAN PROGRAM"
                                sasaran={
                                  prog.sasaran || prog.nama
                                }
                                indikator={prog.indikator}
                                pengampu="Kepala Bidang / Eselon III"
                                bgColor="bg-indigo-600"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRINT STYLE */}
      <style>
        {`
          @media print {

            @page {
              size: landscape;
              margin: 15mm;
            }

            body {
              background: white !important;
            }

            .print\\:hidden {
              display: none !important;
            }

            .overflow-x-auto,
            .overflow-y-auto {
              overflow: visible !important;
              max-height: unset !important;
            }

            .min-w-max {
              min-width: 100% !important;
            }

            .shadow-md,
            .shadow-xl,
            .shadow-sm {
              box-shadow: none !important;
            }

            .hover\\:-translate-y-1:hover {
              transform: none !important;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .bg-blue-600,
            .bg-cyan-600,
            .bg-indigo-600,
            .bg-amber-500,
            .bg-emerald-600 {
              color: white !important;
            }
          }
        `}
      </style>
    </div>
  );
}