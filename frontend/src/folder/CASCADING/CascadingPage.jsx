import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Award, 
  Briefcase, 
  Shield, 
  Info, 
  Search, 
  Printer, 
  Target,
  FileSpreadsheet,
  CheckCircle2,
  Users,
  GitCommit,
  ArrowLeft
} from "lucide-react";

export default function CascadingPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("hierarchical"); // 'hierarchical' | 'matrix'
  
  // State for expanded levels in accordion
  const [expandedLevels, setExpandedLevels] = useState({});

  useEffect(() => {
    fetchCascadingData();
  }, []);

  const fetchCascadingData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/pohon-kinerja");
      setData(res.data || []);
    } catch (err) {
      console.error("Error fetching cascading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle accordion nodes
  const toggleNode = (nodeId) => {
    setExpandedLevels(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Expand / collapse all nodes
  const toggleAllNodes = (expand = true) => {
    const newExpanded = {};
    if (expand) {
      treeData.forEach(top => {
        const topKey = `top-${top.sasaran}`;
        newExpanded[topKey] = true;
        
        top.programs.forEach(prog => {
          const progKey = `prog-${prog.id}`;
          newExpanded[progKey] = true;
          
          prog.kegiatans.forEach(keg => {
            const kegKey = `keg-${keg.id}`;
            newExpanded[kegKey] = true;
          });
        });
      });
    }
    setExpandedLevels(newExpanded);
  };

  // ==========================================
  // HIERARCHICAL TREE MAPPING
  // ==========================================
  const treeData = useMemo(() => {
    const map = {};

    data.forEach((item) => {
      const sasaran = item.sasaran_daerah || "Meningkatkan Akuntabilitas & Kinerja Pemkab";
      const indikator = item.indikator_daerah || "Indeks Stabilitas Politik";
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
            if (!map[key].programs[pId].kegiatans[kId].subs[sId]) {
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

    // Convert internal objects into arrays for easy rendering
    return Object.values(map).map(top => ({
      ...top,
      programs: Object.values(top.programs).map(prog => ({
        ...prog,
        kegiatans: Object.values(prog.kegiatans).map(keg => ({
          ...keg,
          subs: Object.values(keg.subs)
        }))
      }))
    }));
  }, [data]);

  // Filtering data based on search query
  const filteredTreeData = useMemo(() => {
    if (!searchQuery.trim()) return treeData;
    
    const query = searchQuery.toLowerCase();
    
    return treeData.map(top => {
      const matchTop = top.sasaran.toLowerCase().includes(query) || top.indikator.toLowerCase().includes(query);
      
      const filteredProgs = top.programs.map(prog => {
        const matchProg = (prog.sasaran || "").toLowerCase().includes(query) || (prog.indikator || "").toLowerCase().includes(query) || (prog.nama || "").toLowerCase().includes(query);
        
        const filteredKegs = prog.kegiatans.map(keg => {
          const matchKeg = (keg.sasaran || "").toLowerCase().includes(query) || (keg.indikator || "").toLowerCase().includes(query) || (keg.nama || "").toLowerCase().includes(query);
          
          const filteredSubs = keg.subs.filter(sub => 
            (sub.nama || "").toLowerCase().includes(query) || (sub.sasaran || "").toLowerCase().includes(query) || (sub.indikator || "").toLowerCase().includes(query)
          );
          
          if (matchKeg || filteredSubs.length > 0) {
            return { ...keg, subs: filteredSubs, isMatch: true };
          }
          return null;
        }).filter(Boolean);
        
        if (matchProg || filteredKegs.length > 0) {
          return { ...prog, kegiatans: filteredKegs, isMatch: true };
        }
        return null;
      }).filter(Boolean);
      
      if (matchTop || filteredProgs.length > 0) {
        return { ...top, programs: filteredProgs, isMatch: true };
      }
      return null;
    }).filter(Boolean);
  }, [treeData, searchQuery]);

  // Count total stats
  const stats = useMemo(() => {
    let rpjmdCount = treeData.length;
    let renstraCount = 0;
    let programCount = 0;
    let kegiatanCount = 0;
    let subCount = 0;

    treeData.forEach(top => {
      renstraCount += 1; // 1:1 mapping with Strategic sasaran
      top.programs.forEach(prog => {
        programCount++;
        prog.kegiatans.forEach(keg => {
          kegiatanCount++;
          subCount += keg.subs.length;
        });
      });
    });

    return { rpjmdCount, renstraCount, programCount, kegiatanCount, subCount };
  }, [treeData]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-16">
      {/* HEADER BAR */}
      <div className="bg-white px-8 py-6 shadow-sm border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-50 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            title="Kembali"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
              <Layers className="text-indigo-600 w-7 h-7" />
              Cascading Kinerja (SAKIP)
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Penjabaran & Penyelarasan Kinerja Organisasi (Bupati → Kepala Dinas → Kabid → Subkoor → Pelaksana)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* View Toggles */}
          <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200 text-xs font-bold">
            <button 
              onClick={() => setViewMode("hierarchical")}
              className={`px-4 py-2 rounded-lg transition-all ${viewMode === "hierarchical" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              Hierarki Accordion
            </button>
            <button 
              onClick={() => setViewMode("matrix")}
              className={`px-4 py-2 rounded-lg transition-all ${viewMode === "matrix" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              Matriks Cascading
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 h-[38px]"
          >
            <Printer size={16} />
            Cetak PDF
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        
        {/* SAKIP EXPLANATION HERO CARD */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden print:hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
            <Layers size={320} />
          </div>
          <div className="max-w-3xl space-y-4">
            <span className="px-3 py-1 bg-indigo-500/25 border border-indigo-400/30 text-indigo-200 text-xs font-black uppercase tracking-widest rounded-full inline-flex items-center gap-1.5">
              <Award size={12} /> Sistem Akuntabilitas Kinerja (SAKIP)
            </span>
            <h2 className="text-3xl font-black tracking-tight leading-tight">
              Penyelarasan Kinerja Vertikal & Horisontal (Cascading)
            </h2>
            <p className="text-indigo-200/80 text-sm leading-relaxed font-medium">
              Cascading Kinerja memastikan setiap rupiah dan sasaran program strategis pemerintah daerah dijabarkan secara selaras ke tingkat bawah. Penyelarasan ini memetakan hubungan kausalitas (sebab-akibat) yang menghubungkan visi-misi Bupati hingga aktivitas harian staf pelaksana di Dinas Koperasi dan UKM.
            </p>
            <div className="pt-4 flex flex-wrap gap-6 text-xs text-indigo-100 font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-400 w-5 h-5" />
                <span>Eselon II memegang Sasaran Dinas (Renstra)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-400 w-5 h-5" />
                <span>Eselon III memegang Kinerja Program (Bidang)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-400 w-5 h-5" />
                <span>Eselon IV/Subkoor memegang Kinerja Kegiatan</span>
              </div>
            </div>
          </div>
        </div>

        {/* COUNTER STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:hidden">
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm text-center">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 font-black text-sm">R</div>
            <div className="text-2xl font-black text-slate-800">{stats.rpjmdCount}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Sasaran RPJMD</div>
          </div>
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm text-center">
            <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3 font-black text-sm">D</div>
            <div className="text-2xl font-black text-slate-800">{stats.renstraCount}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Sasaran Dinas</div>
          </div>
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm text-center">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 font-black text-sm">P</div>
            <div className="text-2xl font-black text-slate-800">{stats.programCount}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Sasaran Program</div>
          </div>
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm text-center">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3 font-black text-sm">K</div>
            <div className="text-2xl font-black text-slate-800">{stats.kegiatanCount}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Sasaran Kegiatan</div>
          </div>
          <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm text-center col-span-2 md:col-span-1">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 font-black text-sm">S</div>
            <div className="text-2xl font-black text-slate-800">{stats.subCount}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Kinerja Staf (Sub)</div>
          </div>
        </div>

        {/* SEARCH AND CONTROL BAR */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari indikator, sasaran, atau nama kegiatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-sm outline-none transition-all font-medium text-slate-600"
            />
          </div>
          {viewMode === "hierarchical" && (
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => toggleAllNodes(true)}
                className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Expand Semua
              </button>
              <button 
                onClick={() => toggleAllNodes(false)}
                className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Collapse Semua
              </button>
            </div>
          )}
        </div>

        {/* ==========================================
            VIEW MODE 1: HIERARCHICAL ACCORDION
            ========================================== */}
        {viewMode === "hierarchical" && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-20 text-slate-400 font-bold animate-pulse">
                Menyinkronkan Struktur Cascading Kinerja...
              </div>
            ) : filteredTreeData.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-bold border border-dashed border-slate-200 rounded-2xl bg-white">
                Tidak ada data cascading yang cocok dengan pencarian Anda.
              </div>
            ) : (
              filteredTreeData.map((top, topIdx) => {
                const topKey = `top-${top.sasaran}`;
                const isExpandedTop = !!expandedLevels[topKey];
                
                return (
                  <div key={`top-${topIdx}`} className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden transition-all">
                    
                    {/* LEVEL 1: RPJMD / BUPATI (Header) */}
                    <div 
                      onClick={() => toggleNode(topKey)}
                      className="p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/20 hover:bg-blue-50/80 transition-colors flex items-start gap-4 cursor-pointer"
                    >
                      <div className="mt-1 flex items-center justify-center w-8 h-8 rounded-xl bg-blue-100 text-blue-600 shrink-0 font-black text-xs">
                        R
                      </div>
                      
                      <div className="flex-1 text-left space-y-1">
                        <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest bg-blue-100/60 px-2.5 py-0.5 rounded-full inline-block">
                          LEVEL 1: SASARAN STRATEGIS DAERAH (RPJMD) - Bupati
                        </span>
                        <h3 className="text-base font-bold text-slate-800 leading-snug">{top.sasaran}</h3>
                        <p className="text-xs text-slate-500 font-medium">IKU Daerah: <strong className="text-slate-700">{top.indikator}</strong></p>
                      </div>

                      <div className="self-center">
                        {isExpandedTop ? <ChevronDown size={22} className="text-slate-400" /> : <ChevronRight size={22} className="text-slate-400" />}
                      </div>
                    </div>

                    {isExpandedTop && (
                      <div className="p-6 border-t border-slate-100 bg-slate-50/30 space-y-6">
                        
                        {/* LEVEL 2: RENSTRA / DINAS (Eselon II) */}
                        <div className="pl-6 border-l-2 border-dashed border-slate-300 space-y-6 relative">
                          <div className="absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                          
                          <div className="bg-white rounded-2xl border border-cyan-200/60 p-5 shadow-sm space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-100 text-cyan-600 shrink-0 font-black text-xs">D</div>
                              <div className="text-left space-y-0.5">
                                <span className="text-[9px] text-cyan-600 font-black uppercase tracking-widest bg-cyan-100/60 px-2 py-0.5 rounded-full inline-block">
                                  LEVEL 2: SASARAN STRATEGIS DINAS (RENSTRA) - Kepala Dinas (Eselon II)
                                </span>
                                <h4 className="text-sm font-bold text-slate-800 leading-snug">
                                  Meningkatkan Pemberdayaan Usaha Mikro dan Koperasi Sehat & Mandiri
                                </h4>
                                <p className="text-xs text-slate-500 font-medium">IKU Dinas: <strong className="text-slate-700">Persentase Koperasi Aktif dan UMKM Naik Kelas</strong></p>
                              </div>
                            </div>
                          </div>

                          {/* LEVEL 3: PROGRAM / BIDANG (Eselon III) */}
                          {top.programs.map((prog, pIdx) => {
                            const progKey = `prog-${prog.id}`;
                            const isExpandedProg = !!expandedLevels[progKey];

                            return (
                              <div key={`prog-${prog.id}`} className="pl-6 border-l-2 border-dashed border-indigo-200 space-y-4 relative">
                                <div className="absolute -left-[5px] top-6 w-2.5 h-2.5 rounded-full bg-indigo-300"></div>

                                <div 
                                  onClick={() => toggleNode(progKey)}
                                  className="bg-white rounded-2xl border border-indigo-100 hover:border-indigo-300 transition-colors p-5 shadow-sm flex items-start gap-3 cursor-pointer"
                                >
                                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 shrink-0 font-black text-xs">P</div>
                                  <div className="flex-1 text-left space-y-1">
                                    <span className="text-[9px] text-indigo-600 font-black uppercase tracking-widest bg-indigo-100/60 px-2 py-0.5 rounded-full inline-block">
                                      LEVEL 3: SASARAN PROGRAM (BIDANG) - Kepala Bidang (Eselon III)
                                    </span>
                                    <h5 className="text-sm font-bold text-slate-800 leading-snug">{prog.sasaran || prog.nama}</h5>
                                    <p className="text-xs text-slate-500 font-medium">Indikator Program (IKP): <strong className="text-indigo-700">{prog.indikator || "-"}</strong></p>
                                  </div>
                                  <div>
                                    {isExpandedProg ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                                  </div>
                                </div>

                                {isExpandedProg && (
                                  <div className="space-y-4">
                                    
                                    {/* LEVEL 4: KEGIATAN / SUBKOOR (Eselon IV) */}
                                    {prog.kegiatans.map((keg, kIdx) => {
                                      const kegKey = `keg-${keg.id}`;
                                      const isExpandedKeg = !!expandedLevels[kegKey];

                                      return (
                                        <div key={`keg-${keg.id}`} className="pl-6 border-l-2 border-dashed border-amber-200 space-y-3 relative">
                                          <div className="absolute -left-[5px] top-6 w-2.5 h-2.5 rounded-full bg-amber-300"></div>

                                          <div 
                                            onClick={() => toggleNode(kegKey)}
                                            className="bg-white rounded-xl border border-amber-100 hover:border-amber-300 transition-colors p-4 shadow-sm flex items-start gap-3 cursor-pointer"
                                          >
                                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-50 text-amber-600 shrink-0 font-black text-[10px]">K</div>
                                            <div className="flex-1 text-left space-y-0.5">
                                              <span className="text-[8px] text-amber-600 font-black uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full inline-block">
                                                LEVEL 4: SASARAN KEGIATAN (SEKSI/SUBKOOR) - Kepala Seksi (Eselon IV)
                                              </span>
                                              <h6 className="text-xs font-bold text-slate-700 leading-snug">{keg.sasaran || keg.nama}</h6>
                                              <p className="text-[11px] text-slate-500 font-medium">Indikator Kegiatan (IKK): <strong className="text-amber-700">{keg.indikator || "-"}</strong></p>
                                            </div>
                                            <div>
                                              {isExpandedKeg ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                                            </div>
                                          </div>

                                          {isExpandedKeg && (
                                            <div className="space-y-2">
                                              
                                              {/* LEVEL 5: SUB-KEGIATAN / STAFF (Pelaksana) */}
                                              {keg.subs.map((sub, sIdx) => (
                                                <div key={`sub-${sub.id}`} className="pl-6 relative">
                                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-[2px] bg-emerald-200"></div>
                                                  <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-4 text-left shadow-sm flex items-start gap-3">
                                                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 shrink-0 font-black text-[10px]">S</div>
                                                    <div className="space-y-0.5 flex-1">
                                                      <span className="text-[8px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                                                        LEVEL 5: SUB-KEGIATAN (AKTIVITAS INDIVIDU) - Pelaksana / Staff
                                                      </span>
                                                      <h6 className="text-xs font-bold text-slate-700 leading-snug">{sub.nama}</h6>
                                                      <p className="text-[11px] text-slate-500 font-medium">Output Individu: <strong className="text-emerald-700">{sub.indikator || sub.sasaran || "Dokumen Laporan Pelaksanaan"}</strong></p>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}

                                              {keg.subs.length === 0 && (
                                                <div className="pl-6 text-[10px] text-slate-400 italic">Belum ada penjabaran sub-kegiatan staf.</div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                    
                                    {prog.kegiatans.length === 0 && (
                                      <div className="pl-6 text-[10px] text-slate-400 italic">Belum ada penjabaran kegiatan program.</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ==========================================
            VIEW MODE 2: MATRIX SPREADSHEET TABLE
            ========================================== */}
        {viewMode === "matrix" && (
          <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">Matriks Keselarasan Kinerja Daerah & Organisasi</h4>
                <p className="text-xs text-slate-400 font-medium">Buku Matriks Penjabaran SAKIP Dinas Koperasi dan UKM</p>
              </div>
              <button 
                onClick={handlePrint}
                className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <FileSpreadsheet size={14} /> Cetak Lembar Kerja
              </button>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs min-w-[1500px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                    <th className="p-4 border-r border-slate-200 w-60">1. Sasaran Strategis Daerah (RPJMD)</th>
                    <th className="p-4 border-r border-slate-200 w-44">2. Indikator (IKU Daerah)</th>
                    <th className="p-4 border-r border-slate-200 w-60">3. Sasaran Strategis Dinas (Renstra)</th>
                    <th className="p-4 border-r border-slate-200 w-44">4. Indikator (IKU Dinas)</th>
                    <th className="p-4 border-r border-slate-200 w-60">5. Sasaran Program (Kabid)</th>
                    <th className="p-4 border-r border-slate-200 w-44">6. Indikator (IKP Program)</th>
                    <th className="p-4 border-r border-slate-200 w-60">7. Sasaran Kegiatan (Subkoor)</th>
                    <th className="p-4 border-r border-slate-200 w-44">8. Indikator (IKK Kegiatan)</th>
                    <th className="p-4 border-r border-slate-200 w-60">9. Sub Kegiatan (Pelaksana)</th>
                    <th className="p-4">10. Output Individu (Staff)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {treeData.map((top) => {
                    const programs = top.programs;
                    
                    if (programs.length === 0) {
                      return (
                        <tr key={top.sasaran} className="hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-800 border-r border-slate-200">{top.sasaran}</td>
                          <td className="p-4 text-slate-500 font-medium border-r border-slate-200">{top.indikator}</td>
                          <td className="p-4 font-bold text-cyan-700 border-r border-slate-200">Meningkatkan Kelembagaan Koperasi & UMKM</td>
                          <td className="p-4 text-slate-500 font-medium border-r border-slate-200">Persentase Koperasi Sehat</td>
                          <td colSpan="6" className="p-4 text-slate-400 italic text-center">Belum ada rincian cascading program & kegiatan.</td>
                        </tr>
                      );
                    }

                    return programs.map((prog, pIdx) => {
                      const kegiatans = prog.kegiatans;

                      if (kegiatans.length === 0) {
                        return (
                          <tr key={`${top.sasaran}-${prog.id}`} className="hover:bg-slate-50/50">
                            {pIdx === 0 && (
                              <>
                                <td rowSpan={programs.length} className="p-4 font-bold text-slate-800 border-r border-slate-200 align-top">{top.sasaran}</td>
                                <td rowSpan={programs.length} className="p-4 text-slate-500 font-medium border-r border-slate-200 align-top">{top.indikator}</td>
                                <td rowSpan={programs.length} className="p-4 font-bold text-cyan-700 border-r border-slate-200 align-top">Meningkatkan Kelembagaan Koperasi & UMKM</td>
                                <td rowSpan={programs.length} className="p-4 text-slate-500 font-medium border-r border-slate-200 align-top">Persentase Koperasi Sehat</td>
                              </>
                            )}
                            <td className="p-4 font-bold text-indigo-700 border-r border-slate-200">{prog.sasaran || prog.nama}</td>
                            <td className="p-4 text-slate-500 font-medium border-r border-slate-200">{prog.indikator || "-"}</td>
                            <td colSpan="4" className="p-4 text-slate-400 italic text-center">Belum ada rincian cascading kegiatan.</td>
                          </tr>
                        );
                      }

                      return kegiatans.map((keg, kIdx) => {
                        const subs = keg.subs;

                        if (subs.length === 0) {
                          return (
                            <tr key={`${top.sasaran}-${prog.id}-${keg.id}`} className="hover:bg-slate-50/50">
                              {pIdx === 0 && kIdx === 0 && (
                                <>
                                  <td rowSpan={programs.reduce((acc, curr) => acc + Math.max(1, curr.kegiatans.reduce((ac, cu) => ac + Math.max(1, cu.subs.length), 0)), 0)} className="p-4 font-bold text-slate-800 border-r border-slate-200 align-top">{top.sasaran}</td>
                                  <td rowSpan={programs.reduce((acc, curr) => acc + Math.max(1, curr.kegiatans.reduce((ac, cu) => ac + Math.max(1, cu.subs.length), 0)), 0)} className="p-4 text-slate-500 font-medium border-r border-slate-200 align-top">{top.indikator}</td>
                                  <td rowSpan={programs.reduce((acc, curr) => acc + Math.max(1, curr.kegiatans.reduce((ac, cu) => ac + Math.max(1, cu.subs.length), 0)), 0)} className="p-4 font-bold text-cyan-700 border-r border-slate-200 align-top">Meningkatkan Kelembagaan Koperasi & UMKM</td>
                                  <td rowSpan={programs.reduce((acc, curr) => acc + Math.max(1, curr.kegiatans.reduce((ac, cu) => ac + Math.max(1, cu.subs.length), 0)), 0)} className="p-4 text-slate-500 font-medium border-r border-slate-200 align-top">Persentase Koperasi Sehat</td>
                                </>
                              )}
                              {kIdx === 0 && (
                                <>
                                  <td rowSpan={kegiatans.reduce((ac, cu) => ac + Math.max(1, cu.subs.length), 0)} className="p-4 font-bold text-indigo-700 border-r border-slate-200 align-top">{prog.sasaran || prog.nama}</td>
                                  <td rowSpan={kegiatans.reduce((ac, cu) => ac + Math.max(1, cu.subs.length), 0)} className="p-4 text-slate-500 font-medium border-r border-slate-200 align-top">{prog.indikator || "-"}</td>
                                </>
                              )}
                              <td className="p-4 font-bold text-amber-700 border-r border-slate-200">{keg.sasaran || keg.nama}</td>
                              <td className="p-4 text-slate-500 font-medium border-r border-slate-200">{keg.indikator || "-"}</td>
                              <td colSpan="2" className="p-4 text-slate-400 italic text-center">Belum ada rincian sub-kegiatan.</td>
                            </tr>
                          );
                        }

                        return subs.map((sub, sIdx) => (
                          <tr key={`${top.sasaran}-${prog.id}-${keg.id}-${sub.id}`} className="hover:bg-slate-50/50">
                            {pIdx === 0 && kIdx === 0 && sIdx === 0 && (
                              <>
                                <td rowSpan={programs.reduce((acc, curr) => acc + Math.max(1, curr.kegiatans.reduce((ac, cu) => ac + Math.max(1, cu.subs.length), 0)), 0)} className="p-4 font-bold text-slate-800 border-r border-slate-200 align-top">{top.sasaran}</td>
                                <td rowSpan={programs.reduce((acc, curr) => acc + Math.max(1, curr.kegiatans.reduce((ac, cu) => ac + Math.max(1, cu.subs.length), 0)), 0)} className="p-4 text-slate-500 font-medium border-r border-slate-200 align-top">{top.indikator}</td>
                                <td rowSpan={programs.reduce((acc, curr) => acc + Math.max(1, curr.kegiatans.reduce((ac, cu) => ac + Math.max(1, cu.subs.length), 0)), 0)} className="p-4 font-bold text-cyan-700 border-r border-slate-200 align-top">Meningkatkan Kelembagaan Koperasi & UMKM</td>
                                <td rowSpan={programs.reduce((acc, curr) => acc + Math.max(1, curr.kegiatans.reduce((ac, cu) => ac + Math.max(1, cu.subs.length), 0)), 0)} className="p-4 text-slate-500 font-medium border-r border-slate-200 align-top">Persentase Koperasi Sehat</td>
                              </>
                            )}
                            {kIdx === 0 && sIdx === 0 && (
                              <>
                                <td rowSpan={kegiatans.reduce((ac, cu) => ac + Math.max(1, cu.subs.length), 0)} className="p-4 font-bold text-indigo-700 border-r border-slate-200 align-top">{prog.sasaran || prog.nama}</td>
                                <td rowSpan={kegiatans.reduce((ac, cu) => ac + Math.max(1, cu.subs.length), 0)} className="p-4 text-slate-500 font-medium border-r border-slate-200 align-top">{prog.indikator || "-"}</td>
                              </>
                            )}
                            {sIdx === 0 && (
                              <>
                                <td rowSpan={subs.length} className="p-4 font-bold text-amber-700 border-r border-slate-200 align-top">{keg.sasaran || keg.nama}</td>
                                <td rowSpan={subs.length} className="p-4 text-slate-500 font-medium border-r border-slate-200 align-top">{keg.indikator || "-"}</td>
                              </>
                            )}
                            <td className="p-4 font-bold text-emerald-700 border-r border-slate-200">{sub.nama}</td>
                            <td className="p-4 text-slate-500 font-medium">{sub.indikator || sub.sasaran || "Dokumen Laporan Pelaksanaan"}</td>
                          </tr>
                        ));
                      });
                    });
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* PRINT STYLESHEET */}
      <style>
        {`
          @media print {
            @page {
              size: landscape;
              margin: 10mm;
            }

            body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .print\\:hidden,
            nav,
            footer,
            header,
            [class*="navbar"],
            [class*="footer"] {
              display: none !important;
            }

            .max-w-7xl {
              max-width: 100% !important;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }

            table {
              width: 100% !important;
              border-collapse: collapse !important;
            }

            th, td {
              border: 1px solid #000 !important;
              padding: 6px !important;
              font-size: 8px !important;
              color: black !important;
            }

            h3, h4, h5, h6 {
              color: black !important;
              font-weight: bold !important;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>
    </div>
  );
}
