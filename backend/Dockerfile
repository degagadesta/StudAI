# ---------- Stage 1: install dependencies ----------
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- Stage 2: build ----------
FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma Client must be generated to match schema.prisma before the app can boot
RUN npx prisma generate

# Bake the local embedding model into this layer (see step 2)
RUN node scripts/preload-embeddings.mjs

# ---------- Stage 3: runtime ----------
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app ./

EXPOSE 4000

CMD ["node", "server.js"]

RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*