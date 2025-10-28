"use client";
import { useEffect, useState } from "react";

export default function UmkmTableBersih() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/umkm/bersih?page=${pageNumber}&limit=100`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
        setTotal(result.total);
      } else {
        console.error("❌ Gagal ambil data:", result);
      }
    } catch (err) {
      console.error("⚠️ Error ambil data bersih:", err);
    } finally {
      setLoading(false);
    }
  };

  // Ambil semua nama kolom dari item pertama (dinamis)
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-green-700">
        🧹 Data UMKM Bersih (Tidak Ada Duplikasi)
      </h2>

      {loading ? (
        <div className="text-center text-gray-600 py-8">Loading data...</div>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-3">
            Total data: <span className="font-semibold">{total}</span>
          </p>

          {/* 🔹 Tabel scrollable untuk data banyak kolom */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-max text-xs md:text-sm table-auto">
              <thead className="bg-green-600 text-white">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left capitalize whitespace-nowrap border-r border-gray-300"
                    >
                      {col.replaceAll("_", " ")}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.map((item, rowIndex) => (
                  <tr
                    key={item.id || rowIndex}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="px-3 py-2 whitespace-nowrap border-r border-gray-100 text-gray-700"
                      >
                        {item[col] === null || item[col] === "" ? "-" : item[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🔸 Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="font-semibold">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
