"use client";

import { useState } from "react";
import { FeatureProperties } from "./types";
import MapView from "./map-view";
import MapFilter from "./map-filter";
import MapInfoCard from "./map-info-card";

export default function MapKarawang() {
  const [filter, setFilter] = useState<"umkm" | "koperasi">("umkm");
  const [hoveredData, setHoveredData] = useState<FeatureProperties | null>(null);

  return (
    <section className="relative mx-auto max-w-7xl mt-16 mb-20 px-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Peta Persebaran UMKM & Koperasi di Kabupaten Karawang
      </h2>

      <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-xl border border-gray-200">
        <MapView filter={filter} setHoveredData={setHoveredData} />

        <MapFilter filter={filter} setFilter={setFilter} />

        {hoveredData && <MapInfoCard hoveredData={hoveredData} />}
      </div>
    </section>
  );
}
