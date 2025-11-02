# ==========================================
# 🧱 1. Gunakan Node versi stabil
# ==========================================
FROM node:20

# ==========================================
# 📂 2. Set working directory ke dalam container
# ==========================================
WORKDIR /app

# ==========================================
# 📦 3. Copy file package.json dan package-lock.json dari backend
# ==========================================
COPY backend/package*.json ./

# ==========================================
# 📦 4. Install dependencies
# ==========================================
RUN npm install --production

# ==========================================
# 📁 5. Copy seluruh kode backend ke dalam container
# ==========================================
COPY backend .

# ==========================================
# 🔥 6. Expose port (ubah sesuai app lo)
# ==========================================
EXPOSE 4849

# ==========================================
# 🚀 7. Jalankan aplikasi
# ==========================================
CMD ["npm", "run", "dev"]
