# Docker - Terra Manager API

Este documento contém instruções para construir e executar a aplicação Terra Manager usando Docker.

## 📋 Pré-requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Arquivo `.env` configurado (veja `.docker-compose.env.example`)

## 🚀 Início Rápido

### 1. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp .docker-compose.env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/terra_manager?schema=public
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=terra_manager
DB_PORT=5432
PORT=3000
JWT_SECURITY=your-secret-key-here
JWT_EXPIRATION=36000
FRONTEND_URL=http://localhost:3001
```

### 2. Executar com Docker Compose

```bash
# Construir e iniciar os containers
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Parar os containers
docker-compose down

# Parar e remover volumes (⚠️ apaga dados do banco)
docker-compose down -v
```

## 🏗️ Construir Imagem Docker Manualmente

### Build da Imagem

```bash
# Build da imagem de produção
docker build -t terra_manager:latest .

# Build com tag específica
docker build -t terra_manager:v1.0.0 .
```

### Executar Container

```bash
# Executar container (requer banco de dados externo)
docker run -d \
  --name terra_manager_api \
  -p 3000:3000 \
  --env-file .env \
  terra_manager:latest
```

## 📦 Estrutura dos Arquivos Docker

### Dockerfile (Produção)

- **Multi-stage build**: Otimiza o tamanho da imagem final
- **Stage 1 (builder)**: Instala dependências, gera Prisma Client e compila o código
- **Stage 2 (production)**: Apenas dependências de produção e código compilado
- **Usuário não-root**: Executa como usuário `nestjs` para segurança
- **Healthcheck**: Verifica se a aplicação está respondendo

### docker-compose.yml

- **app**: Container da aplicação NestJS
- **db**: Container PostgreSQL 16
- **Volumes**: Persistência de dados do banco
- **Networks**: Rede isolada para comunicação entre containers
- **Healthchecks**: Monitoramento de saúde dos serviços


## 🔧 Comandos Úteis

### Gerenciamento de Containers

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs apenas da aplicação
docker-compose logs -f app

# Ver logs apenas do banco
docker-compose logs -f db

# Reiniciar um serviço
docker-compose restart app

# Parar todos os serviços
docker-compose stop

# Iniciar serviços parados
docker-compose start
```

### Banco de Dados

```bash
# Executar migrações manualmente
docker-compose exec app npx prisma migrate deploy

# Acessar banco de dados via psql
docker-compose exec db psql -U postgres -d terra_manager

# Fazer backup do banco
docker-compose exec db pg_dump -U postgres terra_manager > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U postgres terra_manager < backup.sql

# Executar seed (se houver)
docker-compose exec app npm run seed:praga
```

### Prisma

```bash
# Gerar Prisma Client
docker-compose exec app npx prisma generate

# Visualizar banco (Prisma Studio)
docker-compose exec app npx prisma studio

# Criar nova migration
docker-compose exec app npx prisma migrate dev --name nome_da_migration
```

### Debugging

```bash
# Entrar no container da aplicação
docker-compose exec app sh

# Ver variáveis de ambiente
docker-compose exec app env

# Verificar conectividade com banco
docker-compose exec app npx prisma db execute --command "SELECT 1"
```

## 🔐 Segurança

### Boas Práticas Implementadas

1. **Usuário não-root**: A aplicação roda como usuário `nestjs` (UID 1001)
2. **Multi-stage build**: Reduz tamanho da imagem e superfície de ataque
3. **Apenas dependências de produção**: Imagem final não contém devDependencies
4. **Healthchecks**: Monitoramento automático da saúde da aplicação
5. **Variáveis de ambiente**: Credenciais não hardcoded

### Recomendações Adicionais

1. **Altere as senhas padrão** no arquivo `.env`
2. **Use secrets** do Docker Compose em produção:
   ```yaml
   secrets:
     db_password:
       file: ./secrets/db_password.txt
   ```
3. **Configure firewall** para limitar acesso às portas
4. **Use HTTPS** em produção (configure reverse proxy como Nginx)
5. **Backup regular** do banco de dados

## 📊 Monitoramento

### Healthcheck

O container verifica automaticamente a saúde da aplicação:

```bash
# Verificar status do healthcheck
docker inspect terra_manager_api | grep -A 10 Health
```

### Logs

```bash
# Logs com timestamps
docker-compose logs -f --timestamps app

# Últimas 100 linhas
docker-compose logs --tail=100 app

# Filtrar por termo
docker-compose logs app | grep ERROR
```

## 🚀 Deploy em Produção

### Opções de Deploy

1. **Docker Compose** (recomendado para VPS/servidor próprio)
2. **Kubernetes** (para orquestração avançada)
3. **Cloud Platforms**:
   - AWS ECS/Fargate
   - Google Cloud Run
   - Azure Container Instances
   - DigitalOcean App Platform

### Exemplo: Deploy com Docker Compose em VPS

```bash
# 1. Clonar repositório
git clone <repository-url>
cd terra_manager

# 2. Configurar .env
cp .docker-compose.env.example .env
nano .env  # Editar com valores de produção

# 3. Construir e iniciar
docker-compose up -d --build

# 4. Verificar status
docker-compose ps
docker-compose logs -f app
```

### Variáveis de Ambiente de Produção

Certifique-se de configurar:

- `NODE_ENV=production`
- `DATABASE_URL` com credenciais seguras
- `JWT_SECURITY` com chave forte e aleatória
- `FRONTEND_URL` com URL do frontend em produção
- Configurações de email (se aplicável)

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs de erro
docker-compose logs app

# Verificar se porta está em uso
netstat -tulpn | grep 3000

# Verificar recursos do sistema
docker stats
```

### Erro de conexão com banco

```bash
# Verificar se banco está rodando
docker-compose ps db

# Testar conexão
docker-compose exec app npx prisma db execute --command "SELECT 1"

# Verificar variável DATABASE_URL
docker-compose exec app env | grep DATABASE_URL
```

### Migrações não executam

```bash
# Executar manualmente
docker-compose exec app npx prisma migrate deploy

# Verificar status das migrações
docker-compose exec app npx prisma migrate status
```

### Problemas de permissão

```bash
# Verificar ownership dos arquivos
docker-compose exec app ls -la

# Corrigir permissões (se necessário, como root)
docker-compose exec -u root app chown -R nestjs:nodejs /app
```

## 📝 Notas

- As migrações do Prisma são executadas automaticamente no startup via `docker-entrypoint.sh`
- O Prisma Client é gerado automaticamente durante o build
- O healthcheck usa o endpoint `GET /` da aplicação
- Volumes do PostgreSQL são persistidos em `postgres_data`

## 🔗 Links Úteis

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
