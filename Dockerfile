# ── Stage 1: build the React frontend ────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: production image ─────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server/ ./server/
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_FILE=/app/data/data.json

RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "server/index.js"]
