import React, { useEffect, useState, useCallback } from "react";
import {
  Users, Activity, ClipboardList, Info,
  Trophy, AlertTriangle, ChevronDown, ChevronUp, Plus,
  BarChart3, Layers, GraduationCap, Briefcase, UserCircle, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const colorPalette = [
  'bg-sky-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-red-500'
];

const UNSUR_KEYS = ["u1","u2","u3","u4","u5","u6","u7","u8","u9"];

const avg = (arr) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;

const ikmPredikat = (val) => {
  if (val >= 3.5324) return { label: "Sangat Baik", cls: "bg-emerald-100 text-emerald-700" };
  if (val >= 2.5076) return { label: "Baik", cls: "bg-blue-100 text-blue-700" };
  if (val >= 1.7652) return { label: "Kurang Baik", cls: "bg-amber-100 text-amber-700" };
  return { label: "Tidak Baik", cls: "bg-red-100 text-red-700" };
};

const ratingChipClass = {
  1: "bg-red-100 text-red-700",
  2: "bg-amber-100 text-amber-700",
  3: "bg-blue-100 text-blue-700",
  4: "bg-emerald-100 text-emerald-700",
};

const SkmPage = () => {
  const navigate = useNavigate();
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [data, setData] = useState({ layanan: [], statistik: {}, demografi: [] });
  const [loading, setLoading] = useState(true);
  const [openDetail, setOpenDetail] = useState(null);

  const fetchSkmData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/skm/dashboard", { params: { tahun } });
      const raw = res.data;

      const fixed = {
        ...raw,
        layanan: (raw.layanan || []).map(item => ({
          ...item,
          total_responden: Number(item.total_responden) || 0,
          rata_rata: Number(item.rata_rata) || 0,
          nilai_skm: Number(item.nilai_skm) || 0,
        })),
        statistik: {
          populasi: Number(raw.statistik?.populasi) || 0,
          sampel_min: Number(raw.statistik?.sampel_min) || 0,
          total_responden: Number(raw.statistik?.total_responden) || 0,
          capaian: Number(raw.statistik?.capaian) || 0,
        },
        demografi: raw.demografi || [],
      };

      setData(fixed);
    } catch (err) {
      console.error("Gagal memuat data SKM", err);
    } finally {
      setLoading(false);
    }
  }, [tahun]);

  useEffect(() => {
    fetchSkmData();
  }, [fetchSkmData]);

  const getTier = (score) => {
    if (score >= 88.31) return { class: "tier-a", label: "Sangat Baik", letter: "A", icon: <Trophy className="text-sky-600" /> };
    if (score >= 76.61) return { class: "tier-b", label: "Baik", letter: "B", icon: <Activity className="text-emerald-600" /> };
    if (score >= 65.00) return { class: "tier-c", label: "Cukup", letter: "C", icon: <ClipboardList className="text-amber-600" /> };
    return { class: "tier-d", label: "Kurang", letter: "D", icon: <AlertTriangle className="text-red-600" /> };
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-jakarta text-slate-900">
      <style>{`
        .tier-a { border-left: 6px solid #0ea5e9 !important; }
        .tier-a-bg { background-color: #e0f2fe; }
        .tier-a-pill { background-color: #e0f2fe; color: #0369a1; }
        .tier-b { border-left: 6px solid #10b981 !important; }
        .tier-b-bg { background-color: #d1fae5; }
        .tier-b-pill { background-color: #d1fae5; color: #065f46; }
        .tier-c { border-left: 6px solid #f59e0b !important; }
        .tier-c-bg { background-color: #fef3c7; }
        .tier-c-pill { background-color: #fef3c7; color: #92400e; }
        .tier-d { border-left: 6px solid #ef4444 !important; }
        .tier-d-bg { background-color: #fee2e2; }
        .tier-d-pill { background-color: #fee2e2; color: #991b1b; }
      `}</style>

      <div className="max-w-[1800px] mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b-2 border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-sky-500 font-bold text-[10px] tracking-widest uppercase mb-1">
              <div className="w-6 h-[3px] bg-sky-500 rounded-full"></div> Laporan Survei Kepuasan Masyarakat
            </div>
            <h1 className="text-3xl font-black tracking-tight italic text-slate-900">
              Hasil SKM — <span className="text-sky-500">{tahun}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3">
              <span className="text-[10px] font-black uppercase text-slate-400">Tahun</span>
              <select
                className="font-bold text-sm outline-none bg-transparent cursor-pointer"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
              >
                {[2026, 2025, 2024].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button
              onClick={() => navigate("/survei-layanan")}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus size={18} /> Tambah Survey
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center font-bold text-slate-400">Memuat Laporan...</div>
        ) : (
          <>
            {/* Kartu per Layanan */}
            <div className="space-y-6">
              {data.layanan?.map((item, idx) => {
                const tier = getTier(item.nilai_skm);
                const isDetailOpen = openDetail === item.nama_layanan;
                return (
                  <div key={item.nama_layanan} className={`bg-white rounded-[2rem] border-2 shadow-sm overflow-hidden transition-all duration-300 ${tier.class}`}>
                    
                    {/* Judul + tombol */}
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <h2 className="text-lg font-black text-slate-800">{item.nama_layanan}</h2>
                      </div>
                      <button
                        onClick={() => setOpenDetail(isDetailOpen ? null : item.nama_layanan)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-100 font-bold text-xs text-slate-500 hover:bg-slate-50 transition-all"
                      >
                        <BarChart3 size={14} />
                        {isDetailOpen ? "Tutup Data" : "Lihat Data"}
                        {isDetailOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {/* Metric grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 border-t border-slate-100">
                      <MetricCell
                        icon={<Users size={16} className="text-sky-500" />}
                        label="Responden"
                        value={item.total_responden}
                        sub="pengisi survey"
                      />
                      <MetricCell
                        icon={<Activity size={16} className="text-violet-500" />}
                        label="Rata-rata"
                        value={item.rata_rata.toFixed(2)}
                        sub="dari skala 4.00"
                        progress={(item.rata_rata / 4) * 100}
                        color="bg-violet-500"
                      />
                      <MetricCell
                        icon={<Activity size={16} className="text-amber-500" />}
                        label="Nilai SKM"
                        value={item.nilai_skm.toFixed(2)}
                        sub="skala 0-100"
                        progress={item.nilai_skm}
                        color="bg-amber-500"
                      />
                      <div className="p-8 flex items-center gap-5 bg-slate-50/30">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-inner ${tier.class}-bg`}>
                          {tier.icon}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori</p>
                          <div className={`px-4 py-1.5 rounded-full font-black text-sm flex items-center gap-2 ${tier.class}-pill`}>
                            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-black">{tier.letter}</span>
                            {tier.label}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ✅ Accordion detail data */}
                    {isDetailOpen && (
                      <DetailTable namaLayanan={item.nama_layanan} />
                    )}

                  </div>
                );
              })}

              {data.layanan?.length === 0 && (
                <div className="py-16 text-center text-slate-400 font-bold">
                  Belum ada data layanan untuk tahun {tahun}.
                </div>
              )}
            </div>

            {/* Bawah: Statistik & Demografi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
              <div className="space-y-8">

                {/* Keterangan Unsur */}
                <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                    <div className="p-3 bg-slate-800 text-white rounded-xl"><Info size={20} /></div>
                    <h3 className="font-black text-slate-800 uppercase text-sm">Keterangan Unsur</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {[
                      { u: "U1", d: "Kesesuaian Persyaratan" },
                      { u: "U2", d: "Kemudahan Prosedur" },
                      { u: "U3", d: "Kecepatan Waktu" },
                      { u: "U4", d: "Kewajaran Biaya" },
                      { u: "U5", d: "Kompetensi Petugas" },
                      { u: "U6", d: "Sikap Perilaku" },
                      { u: "U7", d: "Kualitas Sarpras" },
                      { u: "U8", d: "Penanganan Pengaduan" },
                      { u: "U9", d: "Produk Spesifikasi" },
                    ].map(item => (
                      <div key={item.u} className="flex items-center gap-3 text-[13px] font-bold text-slate-600 border-b border-slate-50 pb-2">
                        <span className="bg-slate-100 px-2 py-1 rounded font-mono text-[10px] text-slate-500">{item.u}</span>
                        <span className="truncate">{item.d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analisis Statistik */}
                <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 overflow-hidden shadow-sm flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-sky-500 text-white rounded-xl"><Activity size={20} /></div>
                      <h3 className="font-black text-slate-800 uppercase text-sm">Analisis Statistik</h3>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">Representatif</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-100">
                    <StatBox label="Populasi" value={data.statistik?.populasi || 0} />
                    <StatBox label="Sampel Min" value={data.statistik?.sampel_min || 0} />
                    <StatBox label="Aktual" value={data.statistik?.total_responden || 0} />
                    <StatBox label="Capaian" value={(data.statistik?.capaian || 0) + "%"} />
                  </div>
                  <div className="p-8 mt-auto bg-slate-50/50">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-3">
                      <span>Krejcie & Morgan 95%</span>
                      <span>{data.statistik?.total_responden || 0} / {data.statistik?.sampel_min || 0}</span>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${Math.min(data.statistik?.capaian || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Karakteristik Responden */}
              <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 overflow-hidden shadow-sm h-fit">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500 text-white rounded-xl"><Users size={20} /></div>
                    <h3 className="font-black text-slate-800 uppercase text-sm">Karakteristik Responden</h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400 italic">n = {data.statistik?.total_responden || 0}</span>
                </div>

                <div className="flex flex-col pb-4">
                  {data.demografi?.map((section, sIdx) => {
                    const getShortCat = (cat) => {
                      if (cat === "Jenis Kelamin") return "Kelamin";
                      if (cat === "Pendidikan") return "Pend.";
                      if (cat === "Pekerjaan") return "Kerja";
                      return cat;
                    };
                    return (
                      <div key={sIdx}>
                        <div className="bg-slate-50 px-6 py-2 text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 border-y border-slate-100">
                          {section.category === "Jenis Kelamin" ? <UserCircle size={14} /> : section.category === "Pendidikan" ? <GraduationCap size={14} /> : <Briefcase size={14} />}
                          {section.category}
                        </div>
                        {section.items?.map((row, rIdx) => (
                          <GridRow
                            key={rIdx}
                            no={rIdx + 1}
                            cat={rIdx === 0 ? getShortCat(section.category) : ""}
                            label={row.label}
                            count={Number(row.count) || 0}
                            percent={Number(row.percent) || 0}
                            color={colorPalette[rIdx % colorPalette.length]}
                          />
                        ))}
                      </div>
                    );
                  })}

                  <div>
                    <div className="bg-slate-50 px-6 py-2 text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 border-y border-slate-100">
                      <Layers size={14} /> Jenis Layanan
                    </div>
                    {data.layanan?.map((item, lIdx) => (
                      <GridRow
                        key={item.nama_layanan}
                        no={lIdx + 1}
                        cat={lIdx === 0 ? "Layanan" : ""}
                        label={item.nama_layanan}
                        count={item.total_responden}
                        percent={
                          data.statistik?.total_responden
                            ? Number(((item.total_responden / data.statistik.total_responden) * 100).toFixed(1))
                            : 0
                        }
                        color={colorPalette[(lIdx + 3) % colorPalette.length]}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Sub-komponen ────────────────────────────────────────────

const DetailTable = ({ namaLayanan }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get("/skm/survey");
        const all = res.data?.data || res.data || [];
        setRows(all.filter(r => r.nama_layanan === namaLayanan));
      } catch {
        setError("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [namaLayanan]);

  if (loading) return (
    <div className="flex items-center justify-center gap-2 py-8 text-slate-400 border-t border-slate-100">
      <Loader2 size={16} className="animate-spin" />
      <span className="text-xs font-bold">Memuat data...</span>
    </div>
  );

  if (error) return (
    <div className="py-6 text-center text-red-400 text-xs font-bold border-t border-slate-100">{error}</div>
  );

  if (rows.length === 0) return (
    <div className="py-6 text-center text-slate-400 text-xs font-bold border-t border-slate-100">
      Belum ada data responden.
    </div>
  );

  const avgPerUnsur = UNSUR_KEYS.map(k => {
    const vals = rows.map(r => Number(r[k]) || 0).filter(v => v > 0);
    return vals.length ? avg(vals) : 0;
  });
  const globalAvg = avg(avgPerUnsur.filter(v => v > 0));
  const ikm = globalAvg * 25;
  const predikat = ikmPredikat(globalAvg);

  return (
    <div className="border-t-2 border-slate-100">

      {/* Mini summary */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-slate-50/50 border-b border-slate-100">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Responden</p>
          <p className="text-2xl font-black text-slate-800">{rows.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rata-rata</p>
          <p className="text-2xl font-black text-slate-800">{globalAvg.toFixed(2)}</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block mt-1 ${predikat.cls}`}>
            {predikat.label}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nilai IKM</p>
          <p className="text-2xl font-black text-slate-800">{ikm.toFixed(2)}</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block mt-1 ${predikat.cls}`}>
            {predikat.label}
          </span>
        </div>
      </div>

      {/* Tabel data responden */}
      <div className="overflow-x-auto">
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">#</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">JK</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Pendidikan</th>
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Pekerjaan</th>
              {UNSUR_KEYS.map(k => (
                <th key={k} className="px-3 py-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {k.toUpperCase()}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Rata-rata
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const ra = avg(UNSUR_KEYS.map(k => Number(row[k]) || 0));
              return (
                <tr key={row.id || i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-400 font-bold">{i + 1}</td>
                  <td className="px-4 py-3 text-slate-600 font-medium">
                    {row.jenis_kelamin === "Laki-laki" ? "L" : "P"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.pendidikan}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.pekerjaan}</td>
                  {UNSUR_KEYS.map(k => {
                    const val = Number(row[k]) || 0;
                    return (
                      <td key={k} className="px-3 py-3 text-center">
                        {val > 0 ? (
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-black ${ratingChipClass[val]}`}>
                            {val}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black ${ikmPredikat(ra).cls}`}>
                      {ra.toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })}

            {/* Baris rata-rata per unsur */}
            <tr className="bg-emerald-50 border-t-2 border-emerald-200">
              <td colSpan={4} className="px-4 py-3 text-right text-[11px] font-black text-emerald-700 uppercase tracking-widest">
                Rata-rata per Unsur →
              </td>
              {avgPerUnsur.map((val, i) => (
                <td key={i} className="px-3 py-3 text-center text-[11px] font-black text-emerald-700">
                  {val.toFixed(2)}
                </td>
              ))}
              <td className="px-4 py-3 text-center">
                <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-200 text-emerald-800">
                  {globalAvg.toFixed(2)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const GridRow = ({ no, cat, label, count, percent, color }) => (
  <div className="grid grid-cols-[32px_90px_1fr_40px_50px] md:grid-cols-[32px_120px_1fr_52px_68px] items-center border-b border-slate-50 hover:bg-slate-50/50 transition-colors min-h-[42px]">
    <div className="text-center font-mono text-[10px] text-slate-400">{no}</div>
    <div className="px-3 py-2 text-[10px] font-bold tracking-widest uppercase text-slate-500 border-r border-slate-50 h-full flex items-center">
      {cat}
    </div>
    <div className="px-4 py-2 flex items-center gap-3">
      <span className="text-[13px] font-bold text-slate-700 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[30px]">
        <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
    <div className="text-right px-2 font-mono text-[13px] font-black text-slate-800">{count}</div>
    <div className="text-right px-3 font-mono text-[11px] font-bold text-slate-400">{percent}%</div>
  </div>
);

const MetricCell = ({ icon, label, value, sub, progress, color }) => (
  <div className="p-8 border-r border-slate-100">
    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{icon} {label}</div>
    <div className="text-4xl font-black text-slate-800 mb-1">{value}</div>
    <div className="text-[10px] font-bold text-slate-300 uppercase">{sub}</div>
    {progress !== undefined && (
      <div className="mt-4 h-1.5 bg-slate-50 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-1000 ${color}`} style={{ width: `${progress}%` }}></div>
      </div>
    )}
  </div>
);

const StatBox = ({ label, value }) => (
  <div className="p-8 text-center border-r border-slate-100 last:border-r-0">
    <div className="text-3xl font-black text-slate-800 mb-1">{value}</div>
    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
  </div>
);

export default SkmPage;