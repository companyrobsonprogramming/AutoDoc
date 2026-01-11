# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Argumentos de build (variáveis de ambiente do Vite)
ARG VITE_API_BASE_URL=http://localhost:5000/api
ARG VITE_GEMINI_API_KEY

# Definir como variáveis de ambiente para o build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Copiar arquivos de dependências
COPY package.json yarn.lock ./

# Instalar dependências
RUN yarn install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build da aplicação
RUN yarn build

# Production stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remover arquivos padrão do nginx
RUN rm -rf ./*

# Copiar arquivos buildados
COPY --from=build /app/dist .

# Copiar configuração customizada do nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
