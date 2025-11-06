import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ✅ Konfigurasi lengkap & aman
export default defineConfig({
  plugins: [
    react(),        // ⬅️ Wajib: biar Vite ngerti JSX
    tailwindcss(),  // ⬅️ Tailwind tetap aktif
  ],

  server: {
    port: 3000,     // 🚀 Jalankan di port 3000
    host: true,     // 🌍 Bisa diakses dari jaringan lain / VPS
    open: false,    // Jangan auto buka browser (opsional)
  },
})
