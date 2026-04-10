import React, { useEffect, useState } from "react";
import formatIdr from "@/utils/formatIdr";

export default function PrintKibBTablePage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Ambil data dari localStorage
    const storedData = localStorage.getItem("printData");
    if (storedData) {
      setData(JSON.parse(storedData));
      
      // Auto print setelah data di-load
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, []);

  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold uppercase">KARTU INVENTARIS BARANG (KIB) B</h1>
        <h2 className="text-lg font-bold uppercase">PERALATAN DAN MESIN</h2>
        <p className="text-sm mt-2">Dicetak pada: {new Date().toLocaleDateString("id-ID")}</p>
      </div>

      <table className="w-full border-collapse border border-black text-xs">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-black p-2 w-10">No</th>
            <th className="border border-black p-2">Kode Barang</th>
            <th className="border border-black p-2">Nama Barang</th>
            <th className="border border-black p-2">Merk / Type</th>
            <th className="border border-black p-2 w-16 text-center">Tahun</th>
            <th className="border border-black p-2 text-right">Harga (Rp)</th>
            <th className="border border-black p-2 text-center">Kondisi</th>
            <th className="border border-black p-2">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="8" className="border border-black p-4 text-center italic">Tidak ada data.</td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index}>
                <td className="border border-black p-2 text-center">{index + 1}</td>
                <td className="border border-black p-2">{item.kode_barang}</td>
                <td className="border border-black p-2">{item.nama_barang}</td>
                <td className="border border-black p-2">{item.merk_type || "-"}</td>
                <td className="border border-black p-2 text-center">{item.tahun_perolehan}</td>
                <td className="border border-black p-2 text-right">{formatIdr(item.harga)}</td>
                <td className="border border-black p-2 text-center">{item.kondisi}</td>
                <td className="border border-black p-2">{item.keterangan || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
