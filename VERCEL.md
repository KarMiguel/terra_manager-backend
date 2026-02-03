# Deploy na Vercel - Terra Manager API

Este guia explica como fazer deploy da API Terra Manager na Vercel.

## 📋 Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Banco de dados PostgreSQL (recomendado: Neon, Supabase, ou Railway)

## 🚀 Passo a Passo

### 1. Preparar o Repositório

Certifique-se de que seu código está no Git:

```bash
git add .
git commit -m "Preparar para deploy na Vercel"
git push
```

### 2. Conectar Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Importe seu repositório Git
4. A Vercel detectará automaticamente o projeto NestJS

### 3. Configurar Variáveis de Ambiente

Na Vercel, vá em **Settings > Environment Variables** e adicione:

#### Obrigatórias:
- `DATABASE_URL` - URL de conexão do PostgreSQL
- `JWT_SECURITY` - Chave secreta para JWT (use uma chave forte)
- `JWT_EXPIRATION` - Tempo de expiração (padrão: 720000)

#### Opcionais (mas recomendadas):
- `PORT` - Porta (Vercel define automaticamente)
- `NODE_ENV` - production
- `FRONTEND_URL` - URL do seu frontend
- `API_CLIMA_URL` - URL da API de clima
- `API_CLIMA_KEY` - Chave da API de clima
- `API_COTACAO_URL` - URL da API de cotação
- `API_COTACAO_TOKEN` - Token da API de cotação
- `API_NEWS_URL` - URL da API de notícias
- `API_NEWS_KEY` - Chave da API de notícias
- `API_SOIL_URL` - URL da API de solo
- `EMAIL_USER` - Email para envio de notificações
- `EMAIL_PASS` - Senha do email

### 4. Configurar Build Settings

Na Vercel, configure:

- **Framework Preset**: Other
- **Build Command**: `npm run build:vercel`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Executar Migrações do Prisma

Após o primeiro deploy, você precisa executar as migrações:

**Opção 1: Via Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel env pull .env.local
npx prisma migrate deploy
```

**Opção 2: Via Script de Deploy**
Crie um script que execute as migrações automaticamente após o build.

### 6. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar
3. Acesse a URL fornecida pela Vercel

## 🔧 Configurações Importantes

### Prisma no Serverless

O Prisma Client é gerado automaticamente durante o build através do script `postinstall` no `package.json`.

### Timeout

A Vercel tem timeout padrão de 10s para funções serverless. O `vercel.json` está configurado para 30s.

### CORS

O CORS está configurado para aceitar requisições de qualquer origem (`*`). Em produção, considere restringir para seu domínio.

## 📝 Estrutura de Arquivos

```
.
├── api/
│   └── index.ts          # Handler serverless para Vercel
├── src/                  # Código fonte da aplicação
├── prisma/               # Schema e migrações do Prisma
├── vercel.json           # Configuração da Vercel
├── .vercelignore         # Arquivos ignorados no deploy
└── package.json          # Dependências e scripts
```

## 🔍 Troubleshooting

### Erro: "Cannot find module '@prisma/client'"

**Solução**: Certifique-se de que o script `postinstall` está no `package.json`:
```json
"postinstall": "prisma generate"
```

### Erro: "Database connection failed"

**Solução**: 
1. Verifique se `DATABASE_URL` está configurada corretamente
2. Verifique se o banco permite conexões externas
3. Use connection pooling (ex: Neon, Supabase)

### Erro: "Function timeout"

**Solução**: 
- Aumente o `maxDuration` no `vercel.json`
- Otimize queries do Prisma
- Use índices no banco de dados

### Migrações não executam

**Solução**: Execute manualmente após o deploy:
```bash
npx prisma migrate deploy
```

Ou adicione um script de deploy que execute as migrações.

## 🌐 URLs Após Deploy

Após o deploy, você terá:
- **API**: `https://seu-projeto.vercel.app`
- **Swagger**: `https://seu-projeto.vercel.app/api-docs`
- **Health Check**: `https://seu-projeto.vercel.app/`

## 📚 Recursos

- [Documentação Vercel](https://vercel.com/docs)
- [NestJS na Vercel](https://docs.nestjs.com/faq/serverless)
- [Prisma na Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
