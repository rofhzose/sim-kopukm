"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

export default function KoperasiDashboardSummary() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/data/koperasi/dashboard");
        const result = await res.json();
        if (result.success) setData(result.summary);
      } catch (error) {
        console.error("Gagal mengambil data koperasi dashboard:", error);
      }
    };
    fetchData();
  }, []);

  if (!data) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading koperasi dashboard...
      </div>
    );
  }

  // 🎨 Warna chart
  const COLORS = ["#2563EB", "#059669", "#D97706", "#EF4444", "#7C3AED", "#0EA5E9", "#F59E0B"];

  // 🔹 Helper buat ubah objek ke array untuk chart
  const objectToArray = (obj: any) =>
    Object.entries(obj || {}).map(([name, value]) => ({ name, value }));

  const jenisData = objectToArray(data.total_jenis_koperasi);
  const sektorData = objectToArray(data.total_sektor_usaha);
  const kecamatanData = objectToArray(data.total_kecamatan);
  const polaData = objectToArray(data.total_pola_pengelolaan);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-blue-700 text-center mb-4">
        📊 Dashboard Koperasi Karawang
      </h1>

      {/* ✅ Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-gray-500 text-sm">Total Koperasi</p>
            <p className="text-2xl font-bold">{data.total_koperasi.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-gray-500 text-sm">Aktif</p>
            <p className="text-2xl font-bold text-green-600">{data.total_aktif.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-gray-500 text-sm">Tidak Aktif</p>
            <p className="text-2xl font-bold text-red-500">{data.total_tidak_aktif.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-gray-500 text-sm">Persentase Aktif</p>
            <p className="text-2xl font-bold text-blue-500">{data.persentase_aktif}%</p>
          </CardContent>
        </Card>
      </div>

      {/* 🥧 Jenis Koperasi */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Jenis Koperasi</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={jenisData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {jenisData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 📈 Sektor Usaha */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Top 10 Sektor Usaha</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sektorData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 🏙️ Kecamatan Terbanyak */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Top 10 Kecamatan</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kecamatanData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 📘 Pola Pengelolaan & Perizinan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Pola Pengelolaan</h2>
            <ul className="space-y-2">
              {polaData.map((item: any, i: number) => (
                <li key={i} className="flex justify-between text-sm border-b pb-1">
                  <span>{item.name}</span>
                  <span className="font-semibold">{item.value.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Perizinan</h2>
            <ul className="text-sm space-y-1">
              <li>
                Berbadan Hukum:{" "}
                <span className="font-semibold text-green-600">
                  {data.perizinan.total_nomor_badan_hukum_valid.toLocaleString()}
                </span>
              </li>
              <li>
                Tidak Ada Nomor Badan Hukum:{" "}
                <span className="font-semibold text-red-500">
                  {data.perizinan.total_nomor_badan_hukum_tidak_ada.toLocaleString()}
                </span>
              </li>
              <li>
                Persentase Berbadan Hukum:{" "}
                <span className="font-semibold text-blue-600">{data.perizinan.persentase_berbadan_hukum}%</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
