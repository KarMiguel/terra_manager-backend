# Use Node 20 com Alpine
FROM node:20-alpine

# Diretório da aplicação
WORKDIR /app

# Dependências do sistema
RUN apk add --no-cache openssl

# Copia arquivos de dependência primeiro para otimizar cache
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia a pasta do Prisma e gera client
COPY prisma ./prisma/
RUN npx prisma generate

# Copia todo o resto do projeto
COPY . .

# Build do NestJS
RUN npm run build

# Variáveis de ambiente (Cloud Run injeta PORT=8080)
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Script de entrada: garante PORT e log; exec para PID 1
RUN chmod +x scripts/start-cloudrun.sh
CMD ["./scripts/start-cloudrun.sh"]