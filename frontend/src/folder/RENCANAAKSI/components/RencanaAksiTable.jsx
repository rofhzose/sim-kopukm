import React, { useMemo } from "react";

function fmtIdr(v) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(v || 0));
}

// Fungsi untuk mengecek apakah sebuah bulan termasuk dalam rentang Triwulan Pelaksanaan
function isMonthActive(monthIdx, twMulai, twSelesai) {
  if (!twMulai || !twSelesai) return false;
  // tw 1 = bulan 1,2,3 | tw 2 = bulan 4,5,6 | tw 3 = bulan 7,8,9 | tw 4 = bulan 10,11,12
  const twForMonth = Math.ceil(monthIdx / 3);
  return twForMonth >= twMulai && twForMonth <= twSelesai;
}

export default function RencanaAksiTable({ data = [] }) {
  
  // LOGIKA ADAPTER: Mengubah Flat Data menjadi Struktur RowSpan (Merge Cell) Matriks SAKIP
  const tableRows = useMemo(() => {
    const map = {};

    // 1. Grouping Data (Hierarki Sasaran -> Indikator -> Program -> Kegiatan -> Sub Kegiatan)
    data.forEach((item) => {
      const sName = item.sasaran_nama || "Belum Dipetakan ke Sasaran";
      const iName = item.indikator_sasaran_nama || "Belum Ada Indikator";
      const pId = item.program_id || "prog_null";
      const kId = item.kegiatan_id || "keg_null";

      if (!map[sName]) map[sName] = { name: sName, indikators: {} };
      if (!map[sName].indikators[iName]) map[sName].indikators[iName] = { name: iName, programs: {} };

      if (!map[sName].indikators[iName].programs[pId]) {
        map[sName].indikators[iName].programs[pId] = {
          id: pId, 
          code: item.prog_kode, 
          name: item.program_nama, 
          // Placeholder Target RPJMD per TW (Nanti diambil dari backend RencanaAksiController)
          targetTw1: item.target_rpjmd_tw1 || "-",
          targetTw2: item.target_rpjmd_tw2 || "-",
          targetTw3: item.target_rpjmd_tw3 || "-",
          targetTw4: item.target_rpjmd_tw4 || "-",
          kegiatans: {} 
        };
      }

      if (!map[sName].indikators[iName].programs[pId].kegiatans[kId]) {
        map[sName].indikators[iName].programs[pId].kegiatans[kId] = {
          id: kId, code: item.keg_kode, name: item.kegiatan_nama, subKegiatans: []
        };
      }

      // Cari Pagu Aktif
      let activePagu = 0;
      const vUbah = Number(item.ubah || 0);
      const vP2 = Number(item.p2 || 0);
      const vP1 = Number(item.p1 || 0);
      const vMurni = Number(item.murni || 0);

      if (vUbah > 0) activePagu = vUbah;
      else if (vP2 > 0) activePagu = vP2;
      else if (vP1 > 0) activePagu = vP1;
      else activePagu = vMurni;

      map[sName].indikators[iName].programs[pId].kegiatans[kId].subKegiatans.push({
        ...item,
        anggaran_aktif: activePagu
      });
    });

    // 2. Flatten menjadi Baris dengan perhitungan RowSpan
    const rows = [];
    let sasaranNo = 1;

    Object.values(map).forEach((sasaran) => {
      // Hitung rowspan untuk Sasaran
      let sasaranRowSpan = 0;
      Object.values(sasaran.indikators).forEach(ind => {
        Object.values(ind.programs).forEach(prog => {
          Object.values(prog.kegiatans).forEach(keg => {
            sasaranRowSpan += keg.subKegiatans.length;
          });
        });
      });

      let isFirstSasaran = true;

      Object.values(sasaran.indikators).forEach((ind) => {
        let indRowSpan = 0;
        Object.values(ind.programs).forEach(prog => {
          Object.values(prog.kegiatans).forEach(keg => {
            indRowSpan += keg.subKegiatans.length;
          });
        });

        let isFirstIndikator = true;

        Object.values(ind.programs).forEach((prog) => {
          let progRowSpan = 0;
          Object.values(prog.kegiatans).forEach(keg => {
            progRowSpan += keg.subKegiatans.length;
          });

          let isFirstProg = true;

          Object.values(prog.kegiatans).forEach((keg) => {
            let kegRowSpan = keg.subKegiatans.length;
            let isFirstKeg = true;

            keg.subKegiatans.forEach((sub) => {
              // PUSH ROW FINAL TRANSAKSIONAL (1 Baris = 1 Sub Kegiatan)
              rows.push({
                no: isFirstSasaran ? sasaranNo : null,
                sasaranName: sasaran.name,
                sasaranRowSpan: isFirstSasaran ? sasaranRowSpan : 0,

                indikatorName: ind.name,
                indikatorRowSpan: isFirstIndikator ? indRowSpan : 0,

                progCode: prog.code,
                progName: prog.name,
                progTw1: prog.targetTw1,
                progTw2: prog.targetTw2,
                progTw3: prog.targetTw3,
                progTw4: prog.targetTw4,
                progRowSpan: isFirstProg ? progRowSpan : 0,

                kegCode: keg.code,
                kegName: keg.name,
                kegRowSpan: isFirstKeg ? kegRowSpan : 0,

                subData: sub,
              });

              isFirstSasaran = false;
              isFirstIndikator = false;
              isFirstProg = false;
              isFirstKeg = false;
            });
          });
        });
      });
      sasaranNo++;
    });

    return rows;
  }, [data]);


  // STYLING VARIABLES
  const thStyle = "px-2 py-3 text-[10px] font-black text-white uppercase tracking-wider bg-[#1e293b] border border-slate-600 align-middle text-center";
  const thSubStyle = "px-1.5 py-2 text-[9px] font-bold text-white uppercase tracking-wider bg-slate-700 border border-slate-600 align-middle text-center whitespace-nowrap";
  const thBlnStyle = "px-1 py-1.5 text-[8px] font-semibold text-slate-300 uppercase tracking-tighter bg-slate-800 border border-slate-600 align-middle text-center w-8";
  
  const tdStyle = "p-2.5 border border-slate-300 align-top text-slate-700";

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-300 overflow-hidden mt-6 animate-in fade-in duration-500">
      <div className="overflow-x-auto max-h-[85vh]">
        <table className="min-w-full text-left border-collapse">
          
          {/* HEADER 3 TINGKAT SESUAI GAMBAR REFERENSI */}
          <thead className="sticky top-0 z-30 shadow-md">
            {/* TINGKAT 1 */}
            <tr>
              <th rowSpan={3} className={`${thStyle} w-10`}>NO</th>
              <th rowSpan={3} className={`${thStyle} min-w-[180px]`}>SASARAN STRATEGIS</th>
              <th rowSpan={3} className={`${thStyle} min-w-[200px]`}>INDIKATOR KINERJA<br/>SASARAN</th>
              <th colSpan={4} className={`${thStyle}`}>TARGET KINERJA RPJMD</th>
              <th rowSpan={3} className={`${thStyle} min-w-[180px]`}>PROGRAM</th>
              <th rowSpan={3} className={`${thStyle} min-w-[200px]`}>KEGIATAN</th>
              <th rowSpan={3} className={`${thStyle} min-w-[220px]`}>SUB KEGIATAN</th>
              <th rowSpan={3} className={`${thStyle} min-w-[180px]`}>INDIKATOR KINERJA<br/><span className="text-[8px] font-normal text-slate-400">(Prog/Keg/Sub)</span></th>
              <th rowSpan={3} className={`${thStyle} w-20`}>TARGET</th>
              <th rowSpan={3} className={`${thStyle} w-32`}>ANGGARAN (Rp)</th>
              <th colSpan={12} className={`${thStyle}`}>PELAKSANAAN</th>
            </tr>
            {/* TINGKAT 2 */}
            <tr>
              <th rowSpan={2} className={thSubStyle}>I</th>
              <th rowSpan={2} className={thSubStyle}>II</th>
              <th rowSpan={2} className={thSubStyle}>III</th>
              <th rowSpan={2} className={thSubStyle}>IV</th>
              <th colSpan={3} className={thSubStyle}>TW I</th>
              <th colSpan={3} className={thSubStyle}>TW II</th>
              <th colSpan={3} className={thSubStyle}>TW III</th>
              <th colSpan={3} className={thSubStyle}>TW IV</th>
            </tr>
            {/* TINGKAT 3 */}
            <tr>
              <th className={thBlnStyle}>Jan</th><th className={thBlnStyle}>Feb</th><th className={thBlnStyle}>Mar</th>
              <th className={thBlnStyle}>Apr</th><th className={thBlnStyle}>Mei</th><th className={thBlnStyle}>Jun</th>
              <th className={thBlnStyle}>Jul</th><th className={thBlnStyle}>Ags</th><th className={thBlnStyle}>Sep</th>
              <th className={thBlnStyle}>Okt</th><th className={thBlnStyle}>Nov</th><th className={thBlnStyle}>Des</th>
            </tr>
          </thead>

          {/* BODY MATRIKS */}
          <tbody className="text-[11px]">
            {tableRows.length === 0 ? (
              <tr>
                <td colSpan={26} className="p-8 text-center text-slate-400 font-medium">Belum ada data Rencana Aksi untuk tahun ini.</td>
              </tr>
            ) : (
              tableRows.map((row, idx) => {
                const sub = row.subData;
                return (
                  <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                    
                    {/* SASARAN STRATEGIS */}
                    {row.sasaranRowSpan > 0 && (
                      <td rowSpan={row.sasaranRowSpan} className={`${tdStyle} text-center font-black`}>{row.no}</td>
                    )}
                    {row.sasaranRowSpan > 0 && (
                      <td rowSpan={row.sasaranRowSpan} className={`${tdStyle} font-bold`}>{row.sasaranName}</td>
                    )}

                    {/* INDIKATOR SASARAN */}
                    {row.indikatorRowSpan > 0 && (
                      <td rowSpan={row.indikatorRowSpan} className={`${tdStyle} text-blue-900 font-semibold`}>{row.indikatorName}</td>
                    )}

                    {/* TARGET RPJMD (TW 1 - 4) DI LEVEL PROGRAM */}
                    {row.progRowSpan > 0 && <td rowSpan={row.progRowSpan} className={`${tdStyle} text-center font-bold text-emerald-700 bg-emerald-50/30`}>{row.progTw1}</td>}
                    {row.progRowSpan > 0 && <td rowSpan={row.progRowSpan} className={`${tdStyle} text-center font-bold text-emerald-700 bg-emerald-50/30`}>{row.progTw2}</td>}
                    {row.progRowSpan > 0 && <td rowSpan={row.progRowSpan} className={`${tdStyle} text-center font-bold text-emerald-700 bg-emerald-50/30`}>{row.progTw3}</td>}
                    {row.progRowSpan > 0 && <td rowSpan={row.progRowSpan} className={`${tdStyle} text-center font-bold text-emerald-700 bg-emerald-50/30`}>{row.progTw4}</td>}

                    {/* PROGRAM */}
                    {row.progRowSpan > 0 && (
                      <td rowSpan={row.progRowSpan} className={`${tdStyle}`}>
                        <div className="text-[9px] font-mono text-slate-400 mb-0.5">{row.progCode}</div>
                        <div className="font-bold text-slate-800 leading-tight">{row.progName}</div>
                      </td>
                    )}

                    {/* KEGIATAN */}
                    {row.kegRowSpan > 0 && (
                      <td rowSpan={row.kegRowSpan} className={`${tdStyle}`}>
                        <div className="text-[9px] font-mono text-slate-400 mb-0.5">{row.kegCode}</div>
                        <div className="font-semibold text-slate-700 leading-tight">{row.kegName}</div>
                      </td>
                    )}

                    {/* SUB KEGIATAN (Setiap Baris) */}
                    <td className={`${tdStyle}`}>
                      <div className="text-[9px] font-mono text-slate-400 mb-0.5">{sub.sub_kode}</div>
                      <div className="text-slate-600 leading-tight">{sub.subkegiatan_nama}</div>
                    </td>

                    <td className={`${tdStyle} text-slate-600 leading-snug`}>{sub.indikator_sub || "-"}</td>
                    
                    <td className={`${tdStyle} text-center`}>
                      <span className="font-bold text-slate-800">{sub.target_sub}</span> <span className="text-[9px]">{sub.satuan_sub}</span>
                    </td>
                    
                    <td className={`${tdStyle} text-right font-mono font-bold text-slate-800`}>{fmtIdr(sub.anggaran_aktif)}</td>

                    {/* TIMELINE PELAKSANAAN (12 BULAN) */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                      <td 
                        key={`m-${month}`} 
                        className={`border border-slate-200 p-0 text-center align-middle ${isMonthActive(month, sub.tw_mulai, sub.tw_selesai) ? 'bg-blue-500' : 'bg-slate-50/50'}`}
                      >
                         {/* Optional: Bisa isi icon checkmark jika aktif */}
                         {isMonthActive(month, sub.tw_mulai, sub.tw_selesai) && (
                           <svg className="w-3 h-3 text-white mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                         )}
                      </td>
                    ))}

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}