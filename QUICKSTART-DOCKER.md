# 🚀 Quick Start - Docker

## Passo a Passo Rápido

### 1. Configure a chave do Gemini

Crie um arquivo `.env` na raiz do projeto:

```bash
VITE_GEMINI_API_KEY=sua-chave-do-gemini-aqui
```

**Obtenha sua chave em:** https://makersuite.google.com/app/apikey

### 2. Execute o Docker Compose

```bash
docker-compose up --build
```

### 3. Acesse a aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger

## Comandos Úteis

```bash
# Parar tudo
docker-compose down

# Ver logs
docker-compose logs -f

# Reconstruir e iniciar
docker-compose up --build -d

# Limpar tudo (incluindo banco de dados)
docker-compose down -v
```

## Troubleshooting

**Erro de conexão com banco?**
- Aguarde alguns segundos após iniciar (o PostgreSQL precisa inicializar)
- Verifique logs: `docker-compose logs postgres`

**Frontend não conecta na API?**
- Verifique se o backend está rodando: `docker-compose ps`
- Verifique logs: `docker-compose logs backend`

**Migrations não aplicadas?**
- Execute manualmente: `docker-compose exec backend dotnet ef database update --project /src/src/AutoDoc.Infrastructure --startup-project /src/src/AutoDoc.Api`

Para mais detalhes, consulte [DOCKER.md](./DOCKER.md)
