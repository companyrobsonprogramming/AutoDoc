# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copiar arquivos de projeto
COPY ["src/AutoDoc.Api/AutoDoc.Api.csproj", "src/AutoDoc.Api/"]
COPY ["src/AutoDoc.Application/AutoDoc.Application.csproj", "src/AutoDoc.Application/"]
COPY ["src/AutoDoc.Domain/AutoDoc.Domain.csproj", "src/AutoDoc.Domain/"]
COPY ["src/AutoDoc.Infrastructure/AutoDoc.Infrastructure.csproj", "src/AutoDoc.Infrastructure/"]

# Restaurar dependências
RUN dotnet restore "src/AutoDoc.Api/AutoDoc.Api.csproj"

# Copiar todo o código fonte
COPY . .

# Build da aplicação
WORKDIR "/src/src/AutoDoc.Api"
RUN dotnet build "AutoDoc.Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "AutoDoc.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage - usando SDK para poder executar migrations
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Instalar PostgreSQL client e curl para healthcheck
RUN apt-get update && apt-get install -y postgresql-client curl && rm -rf /var/lib/apt/lists/*

# Instalar dotnet-ef globalmente para migrations
RUN dotnet tool install --global dotnet-ef --version 9.0.0
ENV PATH="$PATH:/root/.dotnet/tools"

# Copiar código fonte para migrations (necessário para dotnet ef)
COPY --from=build /src /src

# Copiar arquivos publicados
COPY --from=publish /app/publish .

# Criar script de entrypoint diretamente (evita problemas de CRLF/LF)
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo 'echo "=== Iniciando AutoDoc Backend ==="' >> /app/entrypoint.sh && \
    echo 'echo "Diretório atual: $(pwd)"' >> /app/entrypoint.sh && \
    echo 'echo "Arquivos em /app:"' >> /app/entrypoint.sh && \
    echo 'ls -la /app || echo "Erro ao listar /app"' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo 'echo "Aguardando banco de dados estar pronto..."' >> /app/entrypoint.sh && \
    echo 'MAX_RETRIES=60' >> /app/entrypoint.sh && \
    echo 'RETRY_COUNT=0' >> /app/entrypoint.sh && \
    echo 'until pg_isready -h postgres -p 5432 -U autodoc 2>/dev/null; do' >> /app/entrypoint.sh && \
    echo '  RETRY_COUNT=$((RETRY_COUNT + 1))' >> /app/entrypoint.sh && \
    echo '  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then' >> /app/entrypoint.sh && \
    echo '    echo "ERRO: Timeout aguardando PostgreSQL. Abortando."' >> /app/entrypoint.sh && \
    echo '    exit 1' >> /app/entrypoint.sh && \
    echo '  fi' >> /app/entrypoint.sh && \
    echo '  echo "Aguardando PostgreSQL... (tentativa $RETRY_COUNT/$MAX_RETRIES)"' >> /app/entrypoint.sh && \
    echo '  sleep 2' >> /app/entrypoint.sh && \
    echo 'done' >> /app/entrypoint.sh && \
    echo 'echo "Banco de dados está pronto!"' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo 'echo "Verificando dotnet ef..."' >> /app/entrypoint.sh && \
    echo 'if command -v dotnet-ef > /dev/null 2>&1; then' >> /app/entrypoint.sh && \
    echo '    echo "dotnet-ef encontrado!"' >> /app/entrypoint.sh && \
    echo '    echo "Tentando aplicar migrations..."' >> /app/entrypoint.sh && \
    echo '    if [ -d "/src/src/AutoDoc.Infrastructure" ]; then' >> /app/entrypoint.sh && \
    echo '        cd /src/src/AutoDoc.Api' >> /app/entrypoint.sh && \
    echo '        dotnet ef database update --project ../AutoDoc.Infrastructure --startup-project . --connection "Host=postgres;Port=5432;Database=autodoc;Username=autodoc;Password=autodoc" || echo "AVISO: Falha ao aplicar migrations. Continuando mesmo assim..."' >> /app/entrypoint.sh && \
    echo '        cd /app' >> /app/entrypoint.sh && \
    echo '    fi' >> /app/entrypoint.sh && \
    echo 'fi' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo 'echo "Verificando se AutoDoc.Api.dll existe..."' >> /app/entrypoint.sh && \
    echo 'if [ ! -f "/app/AutoDoc.Api.dll" ]; then' >> /app/entrypoint.sh && \
    echo '    echo "ERRO: AutoDoc.Api.dll não encontrado em /app"' >> /app/entrypoint.sh && \
    echo '    ls -la /app' >> /app/entrypoint.sh && \
    echo '    exit 1' >> /app/entrypoint.sh && \
    echo 'fi' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo 'echo "Iniciando aplicação..."' >> /app/entrypoint.sh && \
    echo 'cd /app' >> /app/entrypoint.sh && \
    echo 'exec dotnet AutoDoc.Api.dll' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Variáveis de ambiente padrão (podem ser sobrescritas no docker-compose)
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["sh", "/app/entrypoint.sh"]
