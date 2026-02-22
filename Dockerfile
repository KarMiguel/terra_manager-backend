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

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=8080

# Porta da aplicação
EXPOSE 8080

# Comando final
CMD ["node", "dist/main.js"]