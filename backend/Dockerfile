# ---------- Stage 1: install dependencies ----------
FROM node:22-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- Stage 2: build ----------
FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma Client must be generated to match schema.prisma before the app can boot
RUN npx prisma generate

# ---------- Stage 3: runtime ----------
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app ./

EXPOSE 4000

CMD ["node", "server.js"]