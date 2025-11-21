import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ✅ Konfigurasi lengkap & aman untuk VPS + domain publik
export default defineConfig({
  plugins: [
    react(),        // ⬅️ Supaya JSX bisa jalan
    tailwindcss(),  // ⬅️ Aktifkan Tailwind
  ],

  server: {
    host: '0.0.0.0',       // 🌍 Terima koneksi dari mana pun
    port: 3001,            // 🚀 Jalankan di port 3001 (sesuai setup kamu)
    open: false,           // ❌ Jangan auto buka browser
    allowedHosts: [        // ✅ Izinkan akses dari domain publik kamu
      'localhost',
      '72.61.208.1',
      'www.himavera.my.id',
      'himavera.my.id',
      'api.himavera.my.id'
    ],
  },
})
