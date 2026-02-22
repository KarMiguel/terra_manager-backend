# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Produção
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl chromium nss freetype harfbuzz ca-certificates ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production && npm cache clean --force
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/main.js"]
