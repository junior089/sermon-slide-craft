# syntax=docker/dockerfile:1

# ---------- Stage 1: build ----------
# TanStack Start exige Node >= 22.12. Usamos a imagem Debian slim (glibc) para
# binários nativos confiáveis (lightningcss, etc.).
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Dependências primeiro, para aproveitar o cache de camadas.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copia o restante do código e gera o build do servidor Node (preset nitro node-server)
COPY . .
ENV BUILD_TARGET=node
ENV NODE_ENV=production
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# O preset node-server gera um bundle autônomo em .output (deps já embutidas).
COPY --from=builder /app/.output ./.output

# Roda como usuário não-root (já existe na imagem oficial do Node)
USER node

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
