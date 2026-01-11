#!/bin/sh
set -e

echo "=== Iniciando AutoDoc Backend ==="
echo "Diretório atual: $(pwd)"
echo "Arquivos em /app:"
ls -la /app || echo "Erro ao listar /app"

echo ""
echo "Aguardando banco de dados estar pronto..."

# Aguardar o PostgreSQL estar disponível (máximo 60 tentativas = 2 minutos)
MAX_RETRIES=60
RETRY_COUNT=0
until pg_isready -h postgres -p 5432 -U autodoc 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "ERRO: Timeout aguardando PostgreSQL. Abortando."
    exit 1
  fi
  echo "Aguardando PostgreSQL... (tentativa $RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

echo "Banco de dados está pronto!"

# Tentar aplicar migrations
echo ""
echo "Verificando dotnet ef..."
if command -v dotnet-ef > /dev/null 2>&1; then
    echo "dotnet-ef encontrado!"
    echo ""
    echo "Tentando aplicar migrations..."
    if [ -d "/src/src/AutoDoc.Infrastructure" ]; then
        cd /src/src/AutoDoc.Api
        dotnet ef database update --project ../AutoDoc.Infrastructure --startup-project . --connection "Host=postgres;Port=5432;Database=autodoc;Username=autodoc;Password=autodoc" || {
            echo "AVISO: Falha ao aplicar migrations. Continuando mesmo assim..."
        }
        cd /app
    else
        echo "AVISO: Diretório /src/src/AutoDoc.Infrastructure não encontrado. Pulando migrations."
    fi
else
    echo "AVISO: dotnet-ef não encontrado. Pulando migrations."
    echo "PATH atual: $PATH"
fi

echo ""
echo "Verificando se AutoDoc.Api.dll existe..."
if [ ! -f "/app/AutoDoc.Api.dll" ]; then
    echo "ERRO: AutoDoc.Api.dll não encontrado em /app"
    echo "Conteúdo de /app:"
    ls -la /app
    exit 1
fi

echo ""
echo "Iniciando aplicação..."
cd /app
exec dotnet AutoDoc.Api.dll
