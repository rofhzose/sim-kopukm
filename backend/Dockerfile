# ==========================================
# 🧱 Gunakan Node versi stabil & ringan
# ==========================================
FROM node:20-alpine

WORKDIR /app

# ==========================================
# 📦 Copy file konfigurasi npm
# ==========================================
COPY package*.json ./

# ==========================================
# ⚙️ Install dependensi lengkap (non-cache)
# ==========================================
RUN npm install --force && npm rebuild && npm cache clean --force

# ==========================================
# 📁 Copy semua file backend
# ==========================================
COPY . .

# ==========================================
# 🌍 Expose port API backend
# ==========================================
EXPOSE 4849

# ==========================================
# 🚀 Jalankan backend langsung
# ==========================================
CMD ["node", "server.js"]
