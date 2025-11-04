# ==========================================
# 🧱 Gunakan Node versi stabil (ringan + cepat)
# ==========================================
FROM node:20-alpine AS base

# ==========================================
# 📂 Set working directory di container
# ==========================================
WORKDIR /app

# ==========================================
# ⚙️ Salin file package.json & package-lock.json
# ==========================================
COPY package*.json ./

# ==========================================
# 📦 Install dependencies (tanpa devDependencies)
# Gunakan retry agar stabil di koneksi VPS
# ==========================================
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-factor 2 \
    && npm config set fetch-retry-maxtimeout 60000 \
    && npm install --omit=dev

# ==========================================
# 📁 Copy semua source code backend
# ==========================================
COPY . .

# ==========================================
# ⚙️ Jalankan sebagai user node (tanpa chown berat)
# ==========================================
USER node

# ==========================================
# 🌍 Expose port backend API
# ==========================================
EXPOSE 4849

# ==========================================
# 🚀 Jalankan aplikasi Node.js
# ==========================================
CMD ["node", "server.js"]
