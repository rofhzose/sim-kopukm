import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path"; // ⬅️ TAMBAHKAN INI

// ✅ Konfigurasi lengkap & aman untuk VPS + domain publik
export default defineConfig({
  plugins: [
    react(),        
    tailwindcss(),  
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // ⬅️ ALIAS PENTING
    },
  },

  server: {
    host: "0.0.0.0",
    port: 3001,
    open: false,
    allowedHosts: [
      "72.61.208.1",
      "192.168.1.6",
    ],
  },
});
