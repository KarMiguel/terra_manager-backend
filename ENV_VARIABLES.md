# Variáveis de Ambiente - Terra Manager API

Este documento descreve todas as variáveis de ambiente utilizadas pela aplicação.

## 📋 Arquivos de Configuração

- **`.env`** - Arquivo local (não versionado, crie a partir do exemplo)
- **`.env.example`** - Template para desenvolvimento local
- **`.docker-compose.env.example`** - Template para Docker Compose

## 🔧 Variáveis Obrigatórias

### Banco de Dados

```env
# URL de conexão com PostgreSQL
DATABASE_URL=postgresql://usuario:senha@host:porta/database?schema=public
```

**Exemplos:**
- **Desenvolvimento local**: `postgresql://postgres:postgres@localhost:5432/terra_manager?schema=public`
- **Docker**: `postgresql://postgres:postgres@db:5432/terra_manager?schema=public`

### Autenticação JWT

```env
# Chave secreta para assinatura de tokens (OBRIGATÓRIO alterar em produção)
JWT_SECURITY=your-secret-key-here-change-in-production

# Tempo de expiração em segundos (padrão: 36000 = 10 horas)
JWT_EXPIRATION=36000
```

## 🔧 Variáveis Opcionais

### Aplicação

```env
# Porta da aplicação (padrão: 3000)
PORT=3000

# Ambiente (development, production, test)
NODE_ENV=development
```

### Frontend

```env
# URL do frontend (para links de reset de senha)
FRONTEND_URL=http://localhost:3001
```

### Email (Opcional)

```env
# Configurações de email (descomente se necessário)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Docker Compose (Apenas para Docker)

```env
# Configurações do container PostgreSQL
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=terra_manager
DB_PORT=5432
```

## 📝 Como Configurar

### Desenvolvimento Local

1. Copie o template:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` com suas configurações locais

3. Certifique-se de que o PostgreSQL está rodando localmente

### Docker

1. Copie o template do Docker:
   ```bash
   cp .docker-compose.env.example .env
   ```

2. Edite o arquivo `.env` com suas configurações

3. Execute:
   ```bash
   docker-compose up -d
   ```

## ⚠️ Segurança

- **NUNCA** commite o arquivo `.env` no Git
- Use chaves fortes e aleatórias para `JWT_SECURITY` em produção
- Não compartilhe credenciais de banco de dados
- Use variáveis de ambiente do sistema ou secrets em produção

## 🔍 Onde são Usadas

| Variável | Onde é Usada |
|----------|--------------|
| `DATABASE_URL` | Prisma Client (conexão com banco) |
| `JWT_SECURITY` | AuthModule, JwtStrategy (autenticação) |
| `JWT_EXPIRATION` | AuthModule (expiração de tokens) |
| `PORT` | main.ts (porta do servidor) |
| `NODE_ENV` | Configuração geral da aplicação |
| `FRONTEND_URL` | AuthService (links de reset de senha) |
| `EMAIL_*` | EmailService (envio de emails) |

## 📚 Referências

- [NestJS Config](https://docs.nestjs.com/techniques/configuration)
- [Prisma Environment Variables](https://www.prisma.io/docs/concepts/components/prisma-schema/accessing-environment-variables)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
