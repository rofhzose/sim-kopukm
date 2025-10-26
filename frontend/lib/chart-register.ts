import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  registerables,
} from "chart.js";

/**
 * Fungsi aman untuk mendaftarkan Chart.js hanya sekali
 */
function registerChartJS() {
  // Pastikan hanya di browser
  if (typeof window === "undefined") return;

  // Jika belum pernah register
  const chartProto = ChartJS as unknown as { _registered?: boolean };

  if (!chartProto._registered) {
    ChartJS.register(
      CategoryScale,
      LinearScale,
      BarElement,
      LineElement,
      PointElement,
      Title,
      Tooltip,
      Legend,
      ...registerables
    );

    chartProto._registered = true;
  }
}

// Jalankan langsung saat import
registerChartJS();

export {};
