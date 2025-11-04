# ---------- BASE BUILD IMAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Salin dependensi dulu (biar caching efisien)
COPY package*.json ./
RUN npm install

# Salin semua source code
COPY . .

# Build Next.js
RUN npm run build


# ---------- FINAL RUNTIME IMAGE ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Salin hanya file hasil build & node_modules dari tahap sebelumnya
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

EXPOSE 3000

# Jalankan Next.js
CMD ["npm", "start"]
