import React, { useState } from "react";
import { Plus, ChevronDown, Edit3, Trash2 } from "lucide-react"; 
import AddSubModal from "./AddSubModal"; 
import EditKegiatanModal from "./EditKegiatanModal"; 
import TabelSub from "./TabelSub";
import Swal from "sweetalert2";
import axiosInstance from "@/utils/axiosInstance";

export default function TabelKegiatan({ kegiatans = [], YEARS = [], onSuccess }) {
  const [showSubModal, setShowSubModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); 
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [expandedKegiatans, setExpandedKegiatans] = useState({});
  const [subRefreshKeys, setSubRefreshKeys] = useState({});

  const toggleKegiatan = (kegiatanId) => {
    setExpandedKegiatans(prev => ({ ...prev, [kegiatanId]: !prev[kegiatanId] }));
  };

  const handleOpenAddSub = (e, kegiatan) => {
    e.stopPropagation();
    setSelectedKegiatan(kegiatan);
    setShowSubModal(true);
  };

  const handleOpenEdit = (e, kegiatan) => {
    e.stopPropagation();
    setSelectedKegiatan(kegiatan);
    setShowEditModal(true);
  };

  const handleSubSuccess = (kegiatanId) => {
    // Trigger refresh for TabelSub by incrementing key
    setSubRefreshKeys(prev => ({ ...prev, [kegiatanId]: (prev[kegiatanId] || 0) + 1 }));
    // Also call parent refresh to update anggaran totals if needed
    onSuccess();
  };

  const handleDelete = async (e, kegiatan) => {
    e.stopPropagation();
    Swal.fire({
      title: "Hapus Kegiatan?",
      text: `Menghapus "${kegiatan.nama_kegiatan}" akan menghapus seluruh Sub-Kegiatan di dalamnya!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus!",
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/renstra/kegiatan/${kegiatan.id}`);
          Swal.fire("Terhapus!", "Kegiatan telah dihapus.", "success");
          onSuccess(); 
        } catch (err) {
          Swal.fire("Gagal!", "Gagal menghapus data.", "error");
        }
      }
    });
  };

  return (
    <>
      {kegiatans.map((k) => (
        <React.Fragment key={`group-keg-${k.id}`}>
          <tr 
            className="bg-amber-50 hover:bg-amber-100 transition-colors group cursor-pointer text-sm" 
            onClick={() => toggleKegiatan(k.id)}
          >
            {/* STICKY LEFT: Background harus SOLID (Putih atau Amber Solid) */}
            <td className="sticky left-0 z-30 bg-amber-50 group-hover:bg-amber-100 pl-12 pr-6 py-4 border-b border-r border-slate-200 font-semibold text-slate-700">
              <div className="flex gap-3 items-start">
                <div className={`mt-1 p-1 rounded transition-all border ${expandedKegiatans[k.id] ? 'bg-amber-500 border-amber-500 text-white rotate-180' : 'bg-white border-amber-200 text-amber-500'}`}>
                   <ChevronDown size={14} />
                </div>
                <div>
                  <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-sm uppercase mb-1 inline-block font-bold tracking-wider">Kegiatan</span>
                  <div className="leading-tight uppercase tracking-wide">
                    <span className="text-amber-600 font-bold mr-1">{k.kodering}</span> {k.nama_kegiatan}
                  </div>
                </div>
              </div>
            </td>

            <td className="px-4 py-4 border-b border-r border-slate-200 font-medium text-amber-700 italic">
              {k.indikator_kegiatan || "-"}
            </td>
            <td className="px-4 py-4 border-b border-r border-slate-200 font-medium text-slate-500 italic">
              {k.output_kegiatan || "-"}
            </td>
            <td className="px-4 py-4 border-b border-r border-slate-200 text-center font-semibold text-slate-500">{k.satuan || "%"}</td>
            
            {YEARS.map(y => {
                const ang = k.anggaran?.find(a => Number(a.tahun) === Number(y));
                return (
                    <React.Fragment key={`v-keg-${y}-${k.id}`}>
                        <td className="px-3 py-4 border-b border-r border-slate-200 text-center font-semibold text-slate-600">
                          {ang ? parseFloat(ang.target).toLocaleString('id-ID') : "0"}
                        </td>
                        <td className="px-3 py-4 border-b border-r border-slate-200 text-right font-semibold text-amber-700 bg-amber-100/50">
                          {ang ? Number(ang.pagu).toLocaleString('id-ID') : "0"}
                        </td>
                    </React.Fragment>
                )
            })}

            {/* STICKY RIGHT: Background harus SOLID */}
            <td className="sticky right-0 z-30 bg-amber-50 group-hover:bg-amber-100 px-4 py-4 border-b border-l border-slate-200">
                <div className="flex items-center justify-center gap-2">
                    <button onClick={(e) => handleOpenAddSub(e, k)} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-all active:scale-95" title="Tambah Sub">
                        <Plus size={14} />
                    </button>
                    <button onClick={(e) => handleOpenEdit(e, k)} className="p-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 shadow-sm transition-all active:scale-95" title="Edit Kegiatan">
                        <Edit3 size={14} />
                    </button>
                    <button onClick={(e) => handleDelete(e, k)} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 shadow-sm transition-all active:scale-95" title="Hapus Kegiatan">
                        <Trash2 size={14} />
                    </button>
                </div>
            </td>
          </tr>

          {expandedKegiatans[k.id] && (
             <TabelSub kegiatanId={k.id} YEARS={YEARS} key={`sub-list-${k.id}`} refreshKey={subRefreshKeys[k.id] || 0} />
          )}
        </React.Fragment>
      ))}

      <AddSubModal 
        open={showSubModal} 
        onClose={() => setShowSubModal(false)} 
        onSuccess={() => {
          if (selectedKegiatan) {
             handleSubSuccess(selectedKegiatan.id);
             setExpandedKegiatans(prev => ({ ...prev, [selectedKegiatan.id]: true }));
          }
        }} 
        kegiatanId={selectedKegiatan?.id} 
        kegiatanName={selectedKegiatan?.nama_kegiatan} 
      />
      
      <EditKegiatanModal 
        open={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        onSuccess={onSuccess} 
        kegiatanData={selectedKegiatan} 
      />
    </>
  );
}