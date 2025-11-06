import React from "react";
import UMKMSummary from "../components/UMKMSummary";
import BantuanSummary from "../components/BantuanSummary";
import UMKMDuplikatSummary from "../components/UMKMDuplikat";

export default function DashboardPage() {
  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">
        📊 Dashboard Data UMKM & Bantuan
      </h1>

      {/* UMKM Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Statistik Data UMKM
        </h2>
        <UMKMSummary />
      </section>

      {/* Bantuan Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Statistik Data Bantuan
        </h2>
        <BantuanSummary />
      </section>

            <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Statistik Terindikasi Duplikat
        </h2>
        <UMKMDuplikatSummary />
      </section>



      
    </div>
  );
}
