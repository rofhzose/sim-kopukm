import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { ChevronDown, RefreshCw, Edit3, Trash2, Plus } from "lucide-react";
import AddKegiatanModal from "./AddKegiatanModal";
import EditProgramModal from "./EditProgramModal";
import TabelKegiatan from "./TabelKegiatan";
import Swal from "sweetalert2";

export default function TabelProgram({ apiBase = "/renstra/program" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [kegiatanData, setKegiatanData] = useState({});
  const [isModalKegiatanOpen, setIsModalKegiatanOpen] = useState(false);
  const [activeProgram, setActiveProgram] = useState(null);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const YEARS = [2026, 2027, 2028, 2029, 2030];

  useEffect(() => { fetchData(); }, [apiBase]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(apiBase);
      setData(res.data || []);
    } catch (err) { 
      console.error("Gagal load program:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const toggleProgram = async (programId) => {
    const isExpanding = !expandedPrograms[programId];
    if (isExpanding && !kegiatanData[programId]) {
      try {
        const res = await axiosInstance.get(`/renstra/kegiatan?program_id=${programId}`);
        setKegiatanData(prev => ({ ...prev, [programId]: res.data }));
      } catch (err) {
        console.error("Gagal load data kegiatan:", err);
      }
    }
    setExpandedPrograms(s => ({ ...s, [programId]: isExpanding }));
  };

  const openEditProgram = (prog) => {
    setSelectedProgram(prog);
    setIsModalEditOpen(true);
  };

  const openAddKegiatan = (prog) => {
    setActiveProgram(prog);
    setIsModalKegiatanOpen(true);
  };

  const handleDelete = async (program) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: `Program "${program.nama_program}" akan dihapus permanen beserta seluruh kegiatan di bawahnya!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", 
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/renstra/program/${program.id}`);
          Swal.fire("Terhapus!", "Program telah berhasil dihapus.", "success");
          fetchData(); 
        } catch (err) {
          Swal.fire("Gagal!", err.response?.data?.message || "Terjadi kesalahan", "error");
        }
      }
    });
  };

  const refreshKegiatan = async (programId) => {
    try {
      const res = await axiosInstance.get(`/renstra/kegiatan?program_id=${programId}`);
      setKegiatanData(prev => ({ ...prev, [programId]: res.data }));
    } catch (err) {
      console.error("Gagal refresh data kegiatan:", err);
    }
  };

  return (
    <div className="w-full bg-white overflow-hidden flex flex-col h-full border border-slate-200 rounded-lg shadow-sm">
      <div className="overflow-x-auto overflow-y-auto max-h-[800px]">
        <table className="w-full border-separate border-spacing-0 min-w-[2000px]">
          <thead>
            <tr className="bg-slate-900 text-white text-sm">
              <th rowSpan={2} className="sticky left-0 z-50 w-[400px] px-6 py-4 text-left font-bold border-r border-slate-700 bg-slate-900 uppercase tracking-widest">Nomenklatur Perencanaan</th>
              <th rowSpan={2} className="w-[250px] px-4 py-4 text-left font-bold border-r border-slate-700 uppercase tracking-widest">Indikator</th>
              <th rowSpan={2} className="w-[250px] px-4 py-4 text-left font-bold border-r border-slate-700 uppercase tracking-widest">Output</th>
              <th rowSpan={2} className="w-[100px] px-4 py-4 text-center font-bold border-r border-slate-700 uppercase tracking-widest">Satuan</th>
              {YEARS.map(y => (
                <th key={y} colSpan={2} className="px-4 py-3 text-center font-bold border-b border-r border-slate-700 bg-slate-800 uppercase text-sm">Tahun {y}</th>
              ))}
              <th rowSpan={2} className="sticky right-0 z-50 w-[140px] bg-slate-900 px-4 py-4 text-center font-bold border-l border-slate-700 uppercase text-sm">Aksi</th>
            </tr>
            <tr className="bg-slate-800 text-slate-400 text-sm font-bold uppercase">
              {YEARS.map(y => (
                <React.Fragment key={`h-${y}`}>
                  <th className="px-3 py-3 text-center border-r border-slate-700 w-[80px]">Target</th>
                  <th className="px-3 py-3 text-center border-r border-slate-700 w-[150px]">Pagu (Rp)</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.map((p) => (
              <React.Fragment key={`p-${p.id}`}>
                <tr className="bg-blue-50 hover:bg-blue-100 transition-colors group text-sm">
                  <td className="sticky left-0 z-40 bg-blue-50 group-hover:bg-blue-100 px-6 py-4 border-b border-r border-slate-200 font-semibold text-blue-900 cursor-pointer" onClick={() => toggleProgram(p.id)}>
                    <div className="flex gap-3 items-start">
                      <div className={`mt-1 p-1 rounded-md border transition-all ${expandedPrograms[p.id] ? 'bg-blue-600 border-blue-600 text-white rotate-180' : 'bg-white border-blue-200 text-blue-600'}`}>
                        <ChevronDown size={16} />
                      </div>
                      <div>
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-sm uppercase mb-1 inline-block font-bold tracking-widest">Program</span>
                        <div className="leading-tight uppercase tracking-wide">
                            <span className="text-blue-600 mr-1 font-bold">{p.kodering}</span> {p.nama_program}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b border-r border-slate-200 font-medium text-blue-800 italic">{p.indikator_program || "-"}</td>
                  <td className="px-4 py-4 border-b border-r border-slate-200 font-medium text-slate-600 italic">{p.output_program || "-"}</td>
                  <td className="px-4 py-4 border-b border-r border-slate-200 text-center font-semibold text-slate-500">{p.satuan || "%"}</td>
                  {YEARS.map(y => {
                    const ang = p.anggaran?.find(a => Number(a.tahun) === Number(y));
                    return (
                      <React.Fragment key={`p-val-${y}`}>
                        <td className="px-3 py-4 border-b border-r border-slate-200 text-center font-semibold text-slate-700">{ang ? parseFloat(ang.target).toLocaleString('id-ID') : "0"}</td>
                        <td className="px-3 py-4 border-b border-r border-slate-200 text-right font-semibold text-blue-800 bg-blue-100/50">{ang ? Number(ang.pagu).toLocaleString('id-ID') : "0"}</td>
                      </React.Fragment>
                    );
                  })}
                  <td className="sticky right-0 z-40 bg-blue-50 group-hover:bg-blue-100 px-4 py-4 border-b border-l border-slate-200">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openAddKegiatan(p)} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all shadow-sm active:scale-95" title="Tambah Kegiatan"><Plus size={16} /></button>
                      <button onClick={() => openEditProgram(p)} className="p-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-all shadow-sm active:scale-95" title="Edit Program"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(p)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all shadow-sm active:scale-95" title="Hapus Program"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
                {expandedPrograms[p.id] && (
                  <TabelKegiatan kegiatans={kegiatanData[p.id] || []} YEARS={YEARS} onSuccess={() => refreshKegiatan(p.id)} />
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <AddKegiatanModal 
        open={isModalKegiatanOpen} 
        onClose={() => setIsModalKegiatanOpen(false)} 
        onSuccess={() => {
          if (activeProgram) {
            refreshKegiatan(activeProgram.id);
            if (!expandedPrograms[activeProgram.id]) {
               toggleProgram(activeProgram.id);
            }
          }
        }} 
        programId={activeProgram?.id} 
        programName={activeProgram?.nama_program} 
      />
      <EditProgramModal open={isModalEditOpen} onClose={() => setIsModalEditOpen(false)} onSuccess={fetchData} programData={selectedProgram} />
    </div>
  );
}