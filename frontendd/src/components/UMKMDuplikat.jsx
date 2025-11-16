import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

export default function UMKMDuplikatSummary() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("/dashboard/umkm-duplikat-summary");
        if (res.data.success) {
          setData(res.data.data.indikasi || {});
        } else {
          setError("Gagal memuat data duplikat UMKM.");
        }
      } catch (err) {
        console.error("Error fetch UMKM duplikat:", err);
        setError("Tidak dapat terhubung ke API duplikat UMKM.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="text-gray-600 text-center mt-10 animate-pulse">
        🔄 Memuat data duplikat UMKM...
      </div>
    );

  if (error)
    return <div className="text-red-500 text-center mt-10">❌ {error}</div>;

  const renderCard = (title, info = {}, type) => (
    <div
      key={type}
      className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
    >
      <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">{info.keterangan || "-"}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-gray-600 text-sm">Grup Duplikat</p>
          <p className="text-2xl font-bold text-orange-600">
            {Number(info.total_duplikat_group || 0).toLocaleString("id-ID")}
          </p>
        </div>

        <div>
          <p className="text-gray-600 text-sm">Total Record</p>
          <p className="text-2xl font-bold text-red-600">
            {Number(info.total_record_duplikat || 0).toLocaleString("id-ID")}
          </p>
        </div>

        
      </div>

      <button
        onClick={() => navigate(`/duplikat?type=${type}`)}
        className="mt-2 w-full py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-all shadow-md"
      >
        🔍 Lihat Detail
      </button>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-2">
        Indikasi Duplikasi Data UMKM
      </h1>
      <p className="text-gray-500 mb-8 text-sm">
        Berikut ringkasan data yang terindikasi duplikat berdasarkan kategori:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-6xl">
        {renderCard(
          "🧩 Kombinasi Nama + Usaha + Wilayah",
          data.kombinasi_nama_usaha_wilayah,
          "kombinasi"
        )}
        {renderCard("👤 Nama Saja", data.nama_saja, "nama")}
        {renderCard("🏢 Nama Usaha Saja", data.nama_usaha_saja, "usaha")}
      </div>
    </div>
  );
}
