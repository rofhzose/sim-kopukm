"use client";
import { useEffect, useState } from "react";

export default function UmkmTidakBantuanTable() {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/data/umkm/bantuan/tidak")
      .then((res) => res.json())
      .then((res) => {
        setSummary(res.summary);
        setData(res.data);
      })
      .catch((err) => console.error("Gagal ambil data tidak bantuan:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mb-8">
      <h2 className="text-2xl font-semibold text-yellow-600 mb-3">
        🟨 UMKM yang Belum Mendapat Bantuan
      </h2>

      {summary && (
        <p className="text-sm text-gray-600 mb-4">
          Total: <b>{summary.total_tidak_mendapat_bantuan}</b> dari{" "}
          {summary.total_umkm} UMKM ({summary.persentase_tidak_mendapat_bantuan})
        </p>
      )}

      {loading ? (
        <p className="text-gray-600">Loading data...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-yellow-500 text-white">
              <tr>
                <th className="px-3 py-2 text-left">Nama Pemilik</th>
                <th className="px-3 py-2 text-left">Nama Usaha</th>
                <th className="px-3 py-2 text-left">Jenis Bantuan</th>
                <th className="px-3 py-2 text-left">Fasilitas</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 50).map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{item.nama_pemilik}</td>
                  <td className="px-3 py-2">{item.nama_usaha || "-"}</td>
                  <td className="px-3 py-2">{item.jenis_bantuan || "-"}</td>
                  <td className="px-3 py-2">{item.fasilitas_alat_bantu || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
