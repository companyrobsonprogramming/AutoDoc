# AutoDoc - Plataforma de Documentação Automática de Repositórios com IA

Sistema completo para gerar documentação automática de repositórios de código utilizando inteligência artificial (Gemini).

## 🏗️ Arquitetura

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Zustand** para gerenciamento de estado
- **React Router** para navegação
- **Axios** para comunicação com API
- **@google/generative-ai** para integração com Gemini

### Backend
- **.NET 8** com **C#**
- **Clean Architecture** (Domain, Application, Infrastructure, API)
- **Entity Framework Core** com **PostgreSQL**
- **Swagger** para documentação da API
- **Logging estruturado**

## 📋 Pré-requisitos

### Backend
- .NET 8 SDK instalado
- PostgreSQL instalado e rodando
- Visual Studio ou VS Code com extensão C#

### Frontend
- Node.js 18+ e npm/yarn

## 🚀 Como executar

### 1. Configurar Banco de Dados (PostgreSQL)

Crie um banco de dados PostgreSQL:

```sql
CREATE DATABASE autodoc;
CREATE USER autodoc WITH PASSWORD 'autodoc';
GRANT ALL PRIVILEGES ON DATABASE autodoc TO autodoc;
```

Ou ajuste a connection string em `backend/src/AutoDoc.Api/appsettings.json`.

### 2. Backend

```bash
cd auto-doc/backend

# Restaurar dependências
dotnet restore

# Aplicar migrations
dotnet ef database update -p src/AutoDoc.Infrastructure -s src/AutoDoc.Api

# Executar API
dotnet run --project src/AutoDoc.Api
```

A API estará disponível em:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger: `https://localhost:5001/swagger`

### 3. Frontend

```bash
cd auto-doc/frontend

# Instalar dependências
npm install

# Criar arquivo .env com sua chave do Gemini
echo "VITE_GEMINI_API_KEY=sua-chave-aqui" > .env
echo "VITE_API_BASE_URL=https://localhost:5001/api" >> .env

# Executar em modo desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

> Dica: a chave do Gemini agora é cadastrada via tela **Configurações** (rota `/settings`) ou via API de settings. Não é mais necessário definir `VITE_GEMINI_API_KEY` no `.env`.

## 🔑 Obter Chave da API do Gemini

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API key
3. Adicione no arquivo `.env` do frontend como `VITE_GEMINI_API_KEY`

## 📖 Fluxo de Uso

1. **Seleção de Arquivos**: Escolha arquivos/pastas do repositório local
2. **Seleção/Criação de Prompt**: Escolha ou crie um prompt para instruir a IA
3. **Criação de Sessão**: O sistema divide os arquivos em pacotes automaticamente
4. **Processamento**: Cada pacote é enviado ao Gemini e os resultados são salvos
5. **Consolidação**: Após todos os pacotes, a documentação final é gerada
6. **Exportação**: Exporte em Markdown, PDF ou DOCX

## 🗂️ Estrutura do Projeto

```
auto-doc/
├── backend/
│   └── src/
│       ├── AutoDoc.Api/          # Camada de apresentação (Controllers)
│       ├── AutoDoc.Application/   # Casos de uso e DTOs
│       ├── AutoDoc.Domain/        # Entidades de domínio
│       └── AutoDoc.Infrastructure/ # EF Core, Repositories
└── frontend/
    └── src/
        ├── components/            # Componentes React
        ├── pages/                 # Páginas principais
        ├── hooks/                 # Hooks customizados
        ├── services/              # Serviços (API, Gemini, etc)
        ├── store/                 # Zustand store
        └── types/                 # TypeScript types
```

## 🔧 Configurações Importantes

### Backend - Connection String

Edite `backend/src/AutoDoc.Api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=autodoc;Username=autodoc;Password=autodoc"
  }
}
```

### Frontend - Variáveis de Ambiente

Crie `frontend/.env` (apenas a URL da API é necessária):

```
VITE_API_BASE_URL=https://localhost:5001/api
```

A chave do Gemini é armazenada no backend (banco) e configurada pela tela `/settings` ou via endpoints de settings.

## 📝 Endpoints da API

### Prompts
- `GET /api/prompts` - Listar todos
- `GET /api/prompts/{id}` - Obter por ID
- `POST /api/prompts` - Criar novo
- `PUT /api/prompts/{id}` - Atualizar
- `DELETE /api/prompts/{id}` - Deletar

### Sessions
- `GET /api/sessions/{id}` - Obter por ID
- `POST /api/sessions` - Criar nova sessão

### Packages
- `GET /api/packages/session/{sessionId}` - Listar por sessão
- `GET /api/packages/{id}` - Obter por ID
- `POST /api/packages` - Criar novo pacote
- `PUT /api/packages/{id}/status` - Atualizar status
- `DELETE /api/packages/{id}` - Deletar

### AI Results
- `GET /api/airesults/session/{sessionId}` - Listar por sessão
- `GET /api/airesults/{id}` - Obter por ID
- `POST /api/airesults` - Criar resultado

### Documentations
- `POST /api/documentations/{sessionId}/consolidate` - Consolidar documentação
- `GET /api/documentations/{sessionId}` - Obter documentação final

### Settings
- `GET /api/settings/gemini-keys` - Listar chaves do Gemini
- `GET /api/settings/gemini-keys/active` - Obter chave ativa (retorna 404 se não houver)
- `POST /api/settings/gemini-keys` - Criar chave (opcionalmente marcando como ativa)
- `PUT /api/settings/gemini-keys/{id}` - Atualizar chave
- `DELETE /api/settings/gemini-keys/{id}` - Remover chave

- `GET /api/settings/ignore-rules` - Listar regras de ignore
- `POST /api/settings/ignore-rules` - Criar regra
- `PUT /api/settings/ignore-rules/{id}` - Atualizar regra
- `DELETE /api/settings/ignore-rules/{id}` - Remover regra

## 🐛 Troubleshooting

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Confirme a connection string em `appsettings.json`

### Erro de CORS no frontend
- Verifique se a URL da API em `.env` está correta
- Confirme que o backend está rodando

### Erro ao chamar Gemini
- Verifique se `VITE_GEMINI_API_KEY` está configurada
- Confirme que a chave é válida no Google AI Studio

## 📄 Licença

Este projeto foi desenvolvido como exemplo de arquitetura completa.
