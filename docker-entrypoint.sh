#!/bin/sh
set -e

echo "==> Central de Trabalho IA - Inicializando container..."

echo "==> Aguardando banco de dados PostgreSQL..."
sleep 2

echo "==> Sincronizando schema do banco de dados (Prisma)..."
npx prisma db push --skip-generate || true

echo "==> Verificando e aplicando seed inicial..."
node prisma/seed.js || true

echo "==> Central de Trabalho IA pronta na porta 3000 (mapeada para http://localhost:3030)"
exec node server.js
