import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPegawai, updatePegawai } from "../../../services/pegawaiService";
import { getJabatanSortedByKelas } from "../../../services/jabatanService"; // ← ganti import
import FormPegawai from "./formPegawai";

export default function EditPegawai() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pegawai, setPegawai] = useState(null);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const pegawaiResponse = await getPegawai();
      const allPegawai = pegawaiResponse?.data?.data || [];
      const currentPegawai = allPegawai.find(
        (p) => p.id_pegawai.toString() === id.toString()
      );
      setPegawai(currentPegawai);
      setPegawaiList(allPegawai);

      const jabatanResponse = await getJabatanSortedByKelas(); // ← ganti
      setJabatanList(jabatanResponse?.data?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Gagal memuat data pegawai");
      navigate("/dokumen/pegawai");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updatePegawai(id, data);
      navigate("/dokumen/pegawai");
    } catch (error) {
      console.error("Gagal memperbarui pegawai:", error);
      alert(error?.response?.data?.message || "Gagal memperbarui pegawai");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-cyan-400 animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!pegawai) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100">
        <div className="text-center">
          <p className="text-red-600 mb-4 font-medium">Pegawai tidak ditemukan</p>
          <button
            onClick={() => navigate("/dokumen/pegawai")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <FormPegawai
      isEdit={true}
      initialData={pegawai}
      onSubmit={handleUpdate}
      pegawaiList={pegawaiList}
      jabatanList={jabatanList}
    />
  );
}