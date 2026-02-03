#!/bin/sh
set -e

echo "🚀 Iniciando Terra Manager API..."

# Função simples para verificar conexão com banco
check_db() {
  node -e "
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      prisma.\$connect()
        .then(() => {
          prisma.\$disconnect();
          process.exit(0);
        })
        .catch(() => {
          process.exit(1);
        });
    } catch (e) {
      process.exit(1);
    }
  " > /dev/null 2>&1
}

# Aguardar o banco de dados estar pronto (máximo 60 tentativas = 2 minutos)
echo "⏳ Aguardando banco de dados..."
MAX_ATTEMPTS=60
ATTEMPT=0
until check_db || [ $ATTEMPT -eq $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))
  echo "   Tentativa $ATTEMPT/$MAX_ATTEMPTS..."
  sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo "❌ Erro: Não foi possível conectar ao banco de dados após $MAX_ATTEMPTS tentativas"
  exit 1
fi

echo "✅ Banco de dados conectado!"

# Executar migrações
echo "📦 Executando migrações do Prisma..."
npx prisma migrate deploy || echo "⚠️  Aviso: Erro ao executar migrações (pode ser normal se já estiverem aplicadas)"

echo "🎉 Iniciando aplicação..."
exec node dist/main
