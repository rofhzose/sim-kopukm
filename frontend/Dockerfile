# ---------- BASE BUILD IMAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Salin file dependensi dulu (biar caching efisien)
COPY package*.json ./

# Install dependency
RUN npm install

# Salin semua source code
COPY . .

# Tentukan environment (default: production)
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Build Next.js (static + SSR)
RUN npm run build


# ---------- FINAL RUNTIME IMAGE ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Salin hasil build dari tahap sebelumnya
COPY --from=builder /app ./

# Expose port default Next.js
EXPOSE 3000

# Jalankan Next.js
CMD ["npm", "start"]
