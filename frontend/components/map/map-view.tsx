"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { style, onEachFeature } from "./map-utils";
import { GeoJsonFeature } from "./types";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import("react-leaflet").then((m) => m.GeoJSON),
  { ssr: false }
);

interface Props {
  filter: "umkm" | "koperasi";
  setHoveredData: (data: any) => void;
}

export default function MapView({ filter, setHoveredData }: Props) {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch("/data/32.15_kecamatan.geojson")
      .then((res) => res.json())
      .then((data) => {
        data.features.forEach((f: GeoJsonFeature) => {
          f.properties.umkm = Math.floor(Math.random() * 300) + 50;
          f.properties.koperasi = Math.floor(Math.random() * 100) + 10;
        });
        setGeoData(data);
      });
  }, []);

  // 🔹 Batas geografis Karawang
  const karawangBounds: L.LatLngBoundsExpression = [
    [-6.55, 107.05],
    [-5.95, 107.55],
  ];

  return (
    <MapContainer
      center={[-6.239603757751061, 107.38273894864598]}
      zoom={8}
      className="w-full h-[600px]"
      style={{
        zIndex: 0,
        backgroundColor: "#f8fafc", // 💡 latar polos abu-abu muda
      }}
      maxBounds={karawangBounds}
      maxBoundsViscosity={1.0}
      minZoom={10}
      maxZoom={12}
      scrollWheelZoom={false}
      zoomControl={true}
      attributionControl={false}
    >
      {geoData && (
        <GeoJSON
          data={geoData}
          style={(f: GeoJsonFeature) => style(f, filter)}
          onEachFeature={(f, layer) => onEachFeature(f, layer, setHoveredData)}
        />
      )}
    </MapContainer>
  );
}
