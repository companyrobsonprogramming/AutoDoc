# Guia de Execução com Docker

Este guia explica como executar o AutoDoc usando Docker e Docker Compose.

## 📋 Pré-requisitos

- Docker Desktop instalado (ou Docker Engine + Docker Compose)
- Git (para clonar o repositório, se necessário)

## 🚀 Execução Rápida

### 1. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure sua chave do Gemini:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua chave do Gemini:

```
VITE_GEMINI_API_KEY=sua-chave-do-gemini-aqui
```

**Importante:** Obtenha sua chave em [Google AI Studio](https://makersuite.google.com/app/apikey)

### 2. Executar com Docker Compose

Na raiz do projeto, execute:

```bash
docker-compose up --build
```

Ou para executar em background:

```bash
docker-compose up -d --build
```

### 3. Acessar a Aplicação

Após os containers iniciarem (pode levar alguns minutos na primeira execução):

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger
- **PostgreSQL**: localhost:5432

## 🔧 Comandos Úteis

### Ver logs
```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend

# Apenas banco de dados
docker-compose logs -f postgres
```

### Parar os serviços
```bash
docker-compose down
```

### Parar e remover volumes (limpar banco de dados)
```bash
docker-compose down -v
```

### Reconstruir apenas um serviço
```bash
docker-compose build backend
docker-compose up -d backend
```

### Executar migrations manualmente
```bash
docker-compose exec backend dotnet ef database update --project /src/src/AutoDoc.Infrastructure --startup-project /src/src/AutoDoc.Api
```

### Acessar shell do container
```bash
# Backend
docker-compose exec backend sh

# PostgreSQL
docker-compose exec postgres psql -U autodoc -d autodoc
```

## 🏗️ Estrutura dos Serviços

### PostgreSQL
- **Porta**: 5432
- **Database**: autodoc
- **Usuário**: autodoc
- **Senha**: autodoc
- **Volume**: `postgres_data` (persistente)

### Backend (.NET)
- **Porta**: 5000 (mapeada para 8080 interno)
- **Healthcheck**: Verifica disponibilidade em `/swagger`
- **Migrations**: Executadas automaticamente no startup

### Frontend (React + Vite)
- **Porta**: 5173 (mapeada para 80 interno do nginx)
- **Build**: Executado durante construção da imagem
- **Servidor**: Nginx para servir arquivos estáticos

## 🐛 Troubleshooting

### Erro ao conectar no banco de dados
- Verifique se o container do PostgreSQL está rodando: `docker-compose ps`
- Verifique os logs: `docker-compose logs postgres`
- Aguarde alguns segundos após iniciar (o PostgreSQL precisa de tempo para inicializar)

### Frontend não consegue conectar na API
- Verifique se o backend está rodando: `docker-compose ps`
- Verifique se a URL da API está correta no `.env`
- Verifique os logs do backend: `docker-compose logs backend`

### Erro ao aplicar migrations
- As migrations são executadas automaticamente no startup do backend
- Se falhar, você pode executar manualmente (veja comandos úteis acima)
- Verifique se o banco de dados está acessível: `docker-compose exec postgres pg_isready -U autodoc`

### Porta já em uso
Se alguma porta já estiver em uso, você pode alterar no `docker-compose.yml`:

```yaml
ports:
  - "5001:8080"  # Altere 5000 para outra porta
```

### Reconstruir tudo do zero
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 📝 Notas Importantes

1. **Primeira execução**: Pode levar alguns minutos para baixar as imagens e construir os containers
2. **Migrations**: São executadas automaticamente no primeiro startup do backend
3. **Variáveis de ambiente**: O arquivo `.env` na raiz é usado pelo docker-compose
4. **Persistência**: Os dados do PostgreSQL são salvos em um volume Docker (`postgres_data`)

## 🔐 Segurança

⚠️ **Atenção**: As configurações padrão são para desenvolvimento. Para produção:

1. Altere as senhas do PostgreSQL
2. Configure HTTPS no nginx
3. Use variáveis de ambiente seguras
4. Configure CORS adequadamente
5. Use secrets do Docker para informações sensíveis
