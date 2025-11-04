# ---------- BASE BUILD IMAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Salin dependensi dulu
COPY package*.json ./

# Install semua dependensi (termasuk dev)
RUN npm install --legacy-peer-deps

# Salin semua source code
COPY . .

# Build Next.js
RUN npm run build


# ---------- FINAL RUNTIME IMAGE ----------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Salin hasil build dari builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
