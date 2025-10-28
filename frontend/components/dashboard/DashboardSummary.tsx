"use client";
import { useEffect, useState } from "react";

export default function DashboardSummary() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/data/umkm/dashboard")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setSummary(res.summary);
      })
      .catch((err) => console.error("Gagal ambil data dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-600 py-10">
        Loading statistik dashboard...
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center text-red-600 py-10">
        ⚠️ Gagal memuat data dashboard.
      </div>
    );
  }

  const cards = [
    {
      title: "Total UMKM",
      value: summary.total_umkm.toLocaleString(),
      color: "bg-blue-500",
    },
    {
      title: "Total Data Duplikat",
      value: summary.total_duplikat.toLocaleString(),
      color: "bg-yellow-500",
    },
    {
      title: "UMKM Mendapat Bantuan",
      value: summary.total_mendapat_bantuan.toLocaleString(),
      color: "bg-green-500",
    },
    {
      title: "UMKM Belum Mendapat Bantuan",
      value: summary.total_tidak_mendapat_bantuan.toLocaleString(),
      color: "bg-gray-500",
    },
    {
      title: "Penerima Bantuan Ganda",
      value: summary.total_penerima_ganda.toLocaleString(),
      color: "bg-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`${card.color} text-white rounded-xl shadow-md p-5 text-center transform transition hover:scale-[1.02]`}
        >
          <h3 className="text-sm uppercase tracking-wide opacity-80">
            {card.title}
          </h3>
          <p className="text-2xl font-bold mt-2">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
