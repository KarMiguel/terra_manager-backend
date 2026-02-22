#!/bin/sh
PORT=${PORT:-8080}
echo "Rodando na porta $PORT"
exec node dist/main.js