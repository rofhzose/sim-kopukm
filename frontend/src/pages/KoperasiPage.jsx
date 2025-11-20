import React from "react";
import KoperasiSummary from "../components/KoperasiSummary";

export default function KoperasiPage() {
  return (
    <div className="p-8 min-h-screen bg-gray-50 pb-28">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">
        🏛️ Dashboard Bidang Koperasi
      </h1>

      <section className="mb-10">
        <KoperasiSummary />
      </section>
    </div>
  );
}
