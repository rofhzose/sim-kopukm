# ---------- BASE BUILD IMAGE ----------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Salin hanya file package untuk cache layer
COPY package*.json ./

# 🌐 Gunakan npm mirror dan retry biar gak timeout di VPS
RUN npm config set registry https://registry.npmmirror.com \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm install --legacy-peer-deps

# Salin seluruh source code ke image
COPY . .

# Build Next.js (production build)
RUN npm run build


# ---------- FINAL RUNTIME IMAGE ----------
FROM node:20-alpine AS runner

# Working directory
WORKDIR /app

# Set environment production
ENV NODE_ENV=production
ENV PORT=3000

# Salin hasil build dan dependensi minimal dari builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose port Next.js
EXPOSE 3000

# Jalankan Next.js (bukan dev server)
CMD ["npm", "start"]
