"use client";
import { useEffect, useState } from "react";

export default function UmkmGandaBantuanTable() {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/data/umkm/bantuan/ganda")
      .then((res) => res.json())
      .then((res) => {
        setSummary(res.summary);
        setData(res.data);
      })
      .catch((err) => console.error("Gagal ambil data ganda:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mb-8">
      <h2 className="text-2xl font-semibold text-red-600 mb-3">
        🔴 UMKM yang Mendapat Bantuan Ganda
      </h2>

      {summary && (
        <p className="text-sm text-gray-600 mb-4">
          {summary.keterangan} ({summary.persentase_ganda})
        </p>
      )}

      {loading ? (
        <p className="text-gray-600">Loading data...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-red-600 text-white">
              <tr>
                <th className="px-3 py-2 text-left">Nama Pemilik</th>
                <th className="px-3 py-2 text-left">Jumlah Bantuan</th>
                <th className="px-3 py-2 text-left">Rincian Bantuan</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.nama_pemilik} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{item.nama_pemilik}</td>
                  <td className="px-3 py-2">{item.jumlah_bantuan}</td>
                  <td className="px-3 py-2">
                    <ul className="list-disc ml-4">
                      {item.rincian_bantuan.map((r: any) => (
                        <li key={r.id}>
                          {r.fasilitas_alat_bantu || "-"} ({r.jenis_bantuan || "-"})
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
