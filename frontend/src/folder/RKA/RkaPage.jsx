import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import InputRKA from "./components/InputRKA";
import BelanjaSection from "./components/BelanjaSection";
import RkaTreeTable from "./components/RkaTable";
import DashboardSuper from "./components/DashboardSuper";

export default function RkaPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const years = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

  const [showInputModal, setShowInputModal] = useState(false);
  const [showBelanjaStep, setShowBelanjaStep] = useState(false);

  const [currentRkaDetail, setCurrentRkaDetail] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [rkaForm, setRkaForm] = useState({
    program_id: "",
    kegiatan_id: "",
    subkegiatan_id: "",
    penanggungjawab_id: "",
    pelaksana_id: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    tw_mulai: "",
    mg_mulai: "",
    tw_selesai: "",
    mg_selesai: "",
    target_sub: "",
    jenis_pagu: "1", // Default ke Pagu Murni
    satuan_id: ""
  });

  const [options, setOptions] = useState({
    programs: [],
    kegiatan: [],
    subkegiatan: [],
    pegawai: [],
    pagu: [],
    satuan: [],
  });

  useEffect(() => {
    loadInitialMaster();
  }, []);

  useEffect(() => {
    fetchList();
  }, [selectedYear]);
  useEffect(() => {
    if (rkaForm.tanggal_mulai && rkaForm.tanggal_selesai) {
      const startDate = new Date(rkaForm.tanggal_mulai);
      const endDate = new Date(rkaForm.tanggal_selesai);

      const startMonth = startDate.getMonth(); 
      const endMonth = endDate.getMonth();

      // Hitung Triwulan (1, 2, 3, 4)
      const startQ = Math.floor(startMonth / 3) + 1;
      const endQ = Math.floor(endMonth / 3) + 1;

      // Hitung Minggu Ke- (1 - 5) dalam bulan tersebut
      const startW = Math.ceil(startDate.getDate() / 7);
      const endW = Math.ceil(endDate.getDate() / 7);

      setRkaForm(prev => ({ 
        ...prev, 
        tw_mulai: startQ,
        mg_mulai: startW,
        tw_selesai: endQ,
        mg_selesai: endW
      }));
    }
  }, [rkaForm.tanggal_mulai, rkaForm.tanggal_selesai]);

  
  async function fetchList() {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/rka?tahun=${selectedYear}`);
      setList(res.data || []);
    } catch (err) {
      console.error("Gagal fetch list RKA:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadInitialMaster() {
    try {
      const [p, pg, pa, sa] = await Promise.all([
        axiosInstance.get("/master/programs"),
        axiosInstance.get("/master/pegawai"),
        axiosInstance.get("/master/pagu"),
        axiosInstance.get("/master/satuan")
      ]);
      setOptions(prev => ({
        ...prev,
        programs: p.data,
        pegawai: pg.data,
        pagu: pa.data,
        satuan: sa.data
      }));
    } catch (err) { console.error(err); }
  }

  const fetchKegiatan = async (programId) => {
    if (!programId) return;
    try {
      const res = await axiosInstance.get(`/master/kegiatan?program_id=${programId}`);
      setOptions((prev) => ({ ...prev, kegiatan: res.data, subkegiatan: [] }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubKegiatan = async (kegiatanId) => {
    if (!kegiatanId) return;
    try {
      const res = await axiosInstance.get(`/master/sub-kegiatan?kegiatan_id=${kegiatanId}`);
      setOptions((prev) => ({ ...prev, subkegiatan: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  // Tambahkan paguId dengan nilai default "1" di parameternya
  const handleEdit = async (row, paguId = "1") => {
    setLoading(true);
    try {
      // 1. Tentukan id_rka SPESIFIK berdasarkan jenis pagu yang diklik
      let specificId = null;
      if (paguId === "1") specificId = row.id_murni;
      if (paguId === "2") specificId = row.id_p1;
      if (paguId === "3") specificId = row.id_p2;
      if (paguId === "4") specificId = row.id_efs;
      if (paguId === "5") specificId = row.id_ubah;

      // 2. Set mode: Jika sudah ada id-nya -> Edit. Jika belum (diklik dari nol) -> Buat Baru
      if (specificId) {
        setIsEditMode(true);
        setEditingId(specificId);
      } else {
        setIsEditMode(false);
        setEditingId(null);
      }

      // Pre-load kegiatan & sub untuk form dropdown
      await Promise.all([
        fetchKegiatan(row.program_id),
        fetchSubKegiatan(row.kegiatan_id)
      ]);

      // 3. Pre-fill Form (meskipun pagu baru, struktur Program/Kegiatan tetap di-load otomatis)
      setRkaForm({
        program_id: row.program_id,
        kegiatan_id: row.kegiatan_id,
        subkegiatan_id: row.subkegiatan_id,
        penanggungjawab_id: row.penanggungjawab_id || row.id_pj,
        pelaksana_id: row.pelaksana_id || row.id_pelaksana,
        tanggal_selesai: row.tanggal_selesai ? row.tanggal_selesai.split('T')[0] : "",
        tw_mulai: row.tw_mulai || "",
        mg_mulai: row.mg_mulai || "",
        tw_selesai: row.tw_selesai || "",
        mg_selesai: row.mg_selesai || "",
        target_sub: row.target_angka,
        jenis_pagu: String(paguId), // Kunci pagu aktif
        satuan_id: row.target_satuan || row.satuan_id
      });

      setCurrentRkaDetail({
        program_name: row.program_name,
        kegiatan_name: row.kegiatan_name,
        subkegiatan_name: row.subkegiatan_name,
        pj_nama: row.pj_nama || row.penanggungjawab_nama,
        pelaksana_nama: row.pelaksana_nama || row.nama_pelaksana,
        pj_jabatan: row.pj_jabatan,
        pelaksana_jabatan: row.pelaksana_jabatan
      });

      setShowBelanjaStep(true);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat rincian edit");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBelanja = async (belanjaRows) => {
    try {
      let rkaId = editingId;

      // PAYLOAD DIPERKUAT: Mengakomodasi penamaan lama dan nama kolom DB dari visual FK constraint
      const headerPayload = {
        // Penamaan default
        subkegiatan_id: rkaForm.subkegiatan_id,
        penanggungjawab_id: rkaForm.penanggungjawab_id,
        pelaksana_id: rkaForm.pelaksana_id,
        jenis_pagu: rkaForm.jenis_pagu,

        // Mapping langsung ke nama kolom database agar aman dari FK Error
        id_sub_kegiatan: rkaForm.subkegiatan_id,
        id_pj: rkaForm.penanggungjawab_id,
        id_pelaksana: rkaForm.pelaksana_id,
        pagu_id: rkaForm.jenis_pagu,

        tanggal_mulai: rkaForm.tanggal_mulai,
        tanggal_selesai: rkaForm.tanggal_selesai,
        tw_mulai: rkaForm.tw_mulai,
        mg_mulai: rkaForm.mg_mulai,
        tw_selesai: rkaForm.tw_selesai,
        mg_selesai: rkaForm.mg_selesai,
        target_sub: rkaForm.target_sub,
        satuan: rkaForm.satuan_id,
        tahun: selectedYear,
      };

      if (isEditMode) {
        await axiosInstance.put(`/rka/${editingId}`, headerPayload);
      } else {
        const res = await axiosInstance.post("/rka", headerPayload);
        rkaId = res.data.id_rka || res.data.id;
      }

      await axiosInstance.post(`/rka/${rkaId}/belanja`, {
        items: belanjaRows,
        jenis_pagu: rkaForm.jenis_pagu
      });

      alert("Data Berhasil Disimpan!");
      handleCloseAll();
      fetchList();

    } catch (err) {
      console.error("Save Error:", err.response?.data || err.message);
      alert("Gagal menyimpan: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCloseAll = () => {
    setShowInputModal(false);
    setShowBelanjaStep(false);
    setIsEditMode(false);
    setEditingId(null);
    setRkaForm({
      program_id: "", kegiatan_id: "", subkegiatan_id: "",
      penanggungjawab_id: "", pelaksana_id: "",
      tanggal_mulai: "", tanggal_selesai: "",
      target_sub: "", jenis_pagu: "1", satuan_id: ""
    });
  };

  if (loading && !showBelanjaStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-slate-400 text-xs tracking-widest uppercase">Sinkronisasi Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      {!showBelanjaStep ? (
        <>
          <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">RKA</h1>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-black tracking-widest border border-blue-200">
                  TA {selectedYear}
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium">Manajemen Rencana Kerja Anggaran</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm hover:border-blue-400 transition-all">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 px-4 cursor-pointer outline-none"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>TA {y}</option>
                  ))}
                </select>
              </div>
 
              <button
                onClick={() => setShowInputModal(true)}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="text-xl">+</span>
                INPUT RKA
              </button>
            </div>
          </header>

          <DashboardSuper data={list} />

          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <RkaTreeTable data={list} onEdit={handleEdit} onDeleteSuccess={fetchList} />
          </div>
        </>
      ) : (
        <BelanjaSection
          currentRkaDetail={currentRkaDetail}
          rkaForm={{ ...rkaForm, tahun: selectedYear }}
          onSave={handleSaveBelanja}
          onCancel={handleCloseAll}
          isEditMode={isEditMode}
          editingId={editingId}
        />
      )}

      {showInputModal && (
        <InputRKA
          setShowInputModal={setShowInputModal}
          rkaForm={{ ...rkaForm, tahun: selectedYear }}
          onChangeForm={(key, value) => {
            setRkaForm((prev) => ({ ...prev, [key]: value }));

            if (key === "program_id") {
              setRkaForm((p) => ({ ...p, kegiatan_id: "", subkegiatan_id: "" }));
              fetchKegiatan(value);
            }
            if (key === "kegiatan_id") {
              setRkaForm((p) => ({ ...p, subkegiatan_id: "" }));
              fetchSubKegiatan(value);
            }
            if (key === "subkegiatan_id") {
              const selectedSub = options.subkegiatan.find((s) => s.id == value);
              if (selectedSub?.satuan) {
                setRkaForm((p) => ({ ...p, satuan_id: selectedSub.satuan }));
              }
            }
          }}
          handleSubmitRka={() => {
            const prog = options.programs.find((p) => p.id == rkaForm.program_id);
            const keg = options.kegiatan.find((k) => k.id == rkaForm.kegiatan_id);
            const sub = options.subkegiatan.find((s) => s.id == rkaForm.subkegiatan_id);

            // CARI DATA PEGAWAI BERDASARKAN ID
            // Menyesuaikan apakah ID pegawai di DB bernama 'id' atau 'id_pegawai'
            const pj = options.pegawai.find((p) => p.id == rkaForm.penanggungjawab_id || p.id_pegawai == rkaForm.penanggungjawab_id);
            const pelaksana = options.pegawai.find((p) => p.id == rkaForm.pelaksana_id || p.id_pegawai == rkaForm.pelaksana_id);

            // MAPPING DETAIL UNTUK BELANJA SECTION SAAT TAMBAH BARU
            setCurrentRkaDetail({
              program_name: prog?.nama_program || prog?.name || "N/A",
              kegiatan_name: keg?.nama_kegiatan || keg?.name || "N/A",
              subkegiatan_name: sub?.nama_sub || sub?.name || "N/A",
              pj_nama: pj?.nama_pegawai || pj?.nama || "-",
              pj_jabatan: pj?.jabatan || "Pejabat Struktural",
              pelaksana_nama: pelaksana?.nama_pegawai || pelaksana?.nama || "-",
              pelaksana_jabatan: pelaksana?.jabatan || "Staf Pelaksana",
              target: `${rkaForm.target_sub} ${rkaForm.satuan_id}`
            });

            setShowInputModal(false);
            setShowBelanjaStep(true);
          }}
          renstraPrograms={options.programs}
          kegiatanOptions={options.kegiatan}
          subkegiatanOptions={options.subkegiatan}
          pegawaiList={options.pegawai}
          paguOptions={options.pagu}
          satuanOptions={options.satuan}
        />
      )}
    </div>
  );
}
