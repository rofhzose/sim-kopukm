"use client";
import { useEffect, useState } from "react";

export default function UmkmDuplikatTable() {
  const [summary, setSummary] = useState<any>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/data/duplikat/umkm?limit=0")
      .then((res) => res.json())
      .then((res) => {
        setSummary(res.summary);
        setMessages(res.message);
      })
      .catch((err) => console.error("Gagal ambil data duplikat:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mb-8">
      <h2 className="text-2xl font-semibold text-blue-700 mb-3">
        🔵 Data Duplikat UMKM
      </h2>

      {loading ? (
        <p className="text-gray-600">Loading data...</p>
      ) : (
        <>
          {summary && (
            <p className="text-sm text-gray-600 mb-4">
              {summary.keterangan} ({summary.persentase_duplikat})
            </p>
          )}
          <ul className="list-disc ml-5 text-gray-700">
            {messages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
