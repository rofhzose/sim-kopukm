import { GeoJsonFeature } from "./types";

export function getColor(value: number) {
  return value > 250
    ? "#005824"
    : value > 150
    ? "#238b45"
    : value > 100
    ? "#41ae76"
    : value > 50
    ? "#66c2a4"
    : "#ccece6";
}

export function style(feature: GeoJsonFeature, filter: "umkm" | "koperasi") {
  const val = filter === "umkm" ? feature.properties.umkm : feature.properties.koperasi;
  return {
    fillColor: getColor(val),
    weight: 1,
    opacity: 1,
    color: "#fff",
    dashArray: "3",
    fillOpacity: 0.7,
  };
}

export function onEachFeature(feature: GeoJsonFeature, layer: any, setHoveredData: any) {
  layer.on({
    mouseover: () => setHoveredData(feature.properties),
    mouseout: () => setHoveredData(null),
  });
  {
  layer.bindTooltip(feature.properties.kecamatan, {
    permanent: false, // ganti jadi true kalau ingin selalu tampil
    direction: "center",
    className: "map-tooltip"
  });
}
}


