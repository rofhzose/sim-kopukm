import { Bar } from "react-chartjs-2";
import { FeatureProperties } from "./types";
import "@/lib/chart-register";

interface Props {
  hoveredData: FeatureProperties;
}

export default function MapInfoCard({ hoveredData }: Props) {
  return (
    <div className="absolute right-4 top-4 bg-white shadow-2xl rounded-xl p-4 w-64 z-1000 border">
      <h2 className="text-base font-semibold mb-1">{hoveredData.kecamatan}</h2>
      <p className="text-xs text-gray-600 mb-1">
        UMKM: <span className="font-semibold">{hoveredData.umkm}</span>
      </p>
      <p className="text-xs text-gray-600 mb-2">
        Koperasi: <span className="font-semibold">{hoveredData.koperasi}</span>
      </p>

      <Bar
        data={{
          labels: ["UMKM", "Koperasi"],
          datasets: [
            {
              label: "Jumlah",
              data: [hoveredData.umkm, hoveredData.koperasi],
              backgroundColor: ["#10b981", "#3b82f6"],
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { font: { size: 10 } } },
            x: { ticks: { font: { size: 10 } } },
          },
        }}
      />
    </div>
  );
}
