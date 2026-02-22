#!/bin/sh
set -e
# Garante PORT para Cloud Run; log para confirmar que o container iniciou
export PORT="${PORT:-8080}"
echo "[Terra Manager] Container iniciado. Escutando na porta $PORT"
exec node dist/main.js
