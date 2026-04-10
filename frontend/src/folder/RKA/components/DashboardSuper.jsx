import React, { useMemo } from "react";
import SummaryCards from "./SummaryCards";
import SerapanGauge from "./SerapanGauge";
import RealisasiChart from "./RealisasiChart";
import RankingProgram from "./RankingProgram";
import HeatmapKegiatan from "./HeatmapKegiatan";
import RealisasiBulanan from "./RealisasiBulanan";
import TimelineKegiatan from "./TimelineKegiatan";
import AlertSerapan from "./AlertSerapan";

export default function DashboardSuper({ data = [] }) {

  // 1. MAPPING ADAPTER
  const nestedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    const programsMap = {};

    data.forEach(item => {
      const pId = item.program_id || "p_default";
      const kId = item.kegiatan_id || "k_default";

      if (!programsMap[pId]) {
        programsMap[pId] = {
          name: item.program_name || "Program Belum Ditentukan",
          kegiatans: {}
        };
      }

      if (!programsMap[pId].kegiatans[kId]) {
        programsMap[pId].kegiatans[kId] = {
          name: item.kegiatan_name || "Kegiatan Belum Ditentukan",
          nama: item.kegiatan_name || "Kegiatan Belum Ditentukan", 
          subs: []
        };
      }

      // ==========================================
      // PERBAIKAN LOGIKA PAGU AKTIF
      // Pagu hanya dianggap aktif jika memiliki rincian (Nominal > 0)
      // Jika kosong (0), otomatis mundur ke pagu sebelumnya
      // ==========================================
      let totalAnggaran = 0;
      
      const valUbah = Number(item.perubahan || 0);
      const valP2 = Number(item.pergeseran_ii || 0);
      const valP1 = Number(item.pergeseran_i || 0);
      const valMurni = Number(item.murni || 0);

      if (valUbah > 0) {
        totalAnggaran = valUbah;
      } else if (valP2 > 0) {
        totalAnggaran = valP2;
      } else if (valP1 > 0) {
        totalAnggaran = valP1;
      } else {
        // Fallback terakhir selalu ke Murni (meskipun murni 0)
        totalAnggaran = valMurni; 
      }

      programsMap[pId].kegiatans[kId].subs.push({
        rka: {
          belanja: [
            {
              murni: totalAnggaran, 
              realisasi: Number(item.realisasi || 0)
            }
          ]
        }
      });
    });

    return Object.values(programsMap).map(p => ({
      ...p,
      kegiatans: Object.values(p.kegiatans)
    }));
  }, [data]);


  // 2. Perhitungan Grand Total
  const totals = useMemo(() => {
    let anggaran = 0;
    let realisasi = 0;

    nestedData.forEach(p => {
      (p?.kegiatans || []).forEach(k => {
        (k?.subs || []).forEach(s => {
          (s?.rka?.belanja || []).forEach(b => {
            anggaran += Number(b.murni || 0);
            realisasi += Number(b.realisasi || 0);
          });
        });
      });
    });

    return { anggaran, realisasi };
  }, [nestedData]);


  return (
    <div id="dashboard" className="space-y-6">
      <AlertSerapan data={nestedData} />

      <SummaryCards
        anggaran={totals.anggaran}
        realisasi={totals.realisasi}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SerapanGauge
          anggaran={totals.anggaran}
          realisasi={totals.realisasi}
        />
        <RankingProgram data={nestedData} />
        <HeatmapKegiatan data={nestedData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealisasiChart data={nestedData} />
        <RealisasiBulanan data={nestedData} />
      </div>

      <TimelineKegiatan data={nestedData} />
    </div>
  );
}