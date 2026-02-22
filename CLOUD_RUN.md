# Deploy no Google Cloud Run — Terra Manager API

Este guia explica como fazer deploy da API Terra Manager no **Google Cloud Run** usando o Dockerfile do projeto.

---

## Pré-requisitos

1. **Conta no Google Cloud** — [console.cloud.google.com](https://console.cloud.google.com)
2. **Google Cloud CLI (gcloud)** instalado — [Instalar gcloud](https://cloud.google.com/sdk/docs/install)
3. **Docker** instalado (para build local) ou use **Cloud Build** (build na nuvem)
4. **Projeto** criado no GCP (ex.: `terra-manager-prod`)

---

## Passo 1: Login e projeto

```bash
# Login na conta Google
gcloud auth login

# Definir projeto padrão
gcloud config set project SEU_PROJECT_ID
```

Substitua `SEU_PROJECT_ID` pelo ID do seu projeto (ex.: `terra-manager-prod`).

---

## Passo 2: APIs necessárias

Habilite a **Artifact Registry** (para imagens Docker) e o **Cloud Run**:

```bash
gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com
```

---

## Passo 3: Repositório de imagens (Artifact Registry)

Crie um repositório Docker na região desejada (ex.: `southamerica-east1` — São Paulo):

```bash
gcloud artifacts repositories create terra-manager-api \
  --repository-format=docker \
  --location=southamerica-east1 \
  --description="Imagens da API Terra Manager"
```

Anote o nome do repositório: `terra-manager-api`.

---

## Passo 4: Build da imagem

### Opção A: Build na nuvem (Cloud Build) — recomendado

Na raiz do projeto (onde está o `Dockerfile`):

```bash
# Substitua REGION e PROJECT_ID
export PROJECT_ID=$(gcloud config get-value project)
export REGION=southamerica-east1
export REPO=terra-manager-api
export IMAGE=api

# Build e push em um comando
gcloud builds submit --tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${IMAGE}:latest
```

### Opção B: Build local e push

```bash
# Configurar Docker para o Artifact Registry
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

# Build local
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${IMAGE}:latest .

# Push
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${IMAGE}:latest
```

---

## Passo 5: Deploy no Cloud Run

```bash
gcloud run deploy terra-manager-api \
  --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${IMAGE}:latest \
  --region ${REGION} \
  --platform managed \
  --allow-unauthenticated
```

O Cloud Run injeta a variável **PORT=8080**. O `main.ts` usa `process.env.PORT ?? 3000`; como no Cloud Run existe `PORT`, a aplicação sobe na **8080** automaticamente. Não é necessário usar `--port`.

---

## Passo 6: Variáveis de ambiente e secrets

No primeiro deploy você não passa variáveis; depois configure no console ou via CLI.

### Via Console

1. Acesse **Cloud Run** → seu serviço **terra-manager-api**
2. **Edit & Deploy New Revision** → aba **Variables & Secrets**
3. Adicione as variáveis (ex.: `DATABASE_URL`, `JWT_SECURITY`, `JWT_EXPIRATION`, `API_CLIMA_KEY`, etc.). Ver lista em `docs/TECNOLOGIAS_E_APIS.md`.

### Via CLI (exemplo)

```bash
gcloud run services update terra-manager-api \
  --region ${REGION} \
  --set-env-vars "DATABASE_URL=postgresql://...,JWT_SECURITY=seu_segredo,JWT_EXPIRATION=720000"
```

Para muitas variáveis, use um arquivo:

```bash
# Criar arquivo env.yaml (não commitar)
# env.yaml:
# DATABASE_URL: "postgresql://..."
# JWT_SECURITY: "..."
# ...

gcloud run services update terra-manager-api \
  --region ${REGION} \
  --env-vars-file env.yaml
```

Para dados sensíveis, prefira **Secret Manager** e referencie no Cloud Run (Variables & Secrets → Reference a secret).

---

## Passo 7: Banco de dados

O Cloud Run **não** provisiona banco. Você precisa de um PostgreSQL acessível pela internet (ex.: Cloud SQL, Neon, Supabase).

- **Cloud SQL:** Crie uma instância, configure usuário/senha e use a connection string em `DATABASE_URL`. Para conectar do Cloud Run ao Cloud SQL, use o conector ou IP público/private IP conforme a rede.
- **Neon/Supabase:** Use a URL de conexão fornecida por eles em `DATABASE_URL`.

O `docker-entrypoint.sh` executa `prisma migrate deploy` na subida do container. Garanta que o banco está acessível pela internet (Cloud SQL, Neon, Supabase, etc.) e que `DATABASE_URL` está configurado nas variáveis do serviço no Cloud Run.

---

## Resumo dos comandos (copiar e colar)

Ajuste `PROJECT_ID`, `REGION`, `REPO` e depois:

```bash
export PROJECT_ID=seu-projeto-id
export REGION=southamerica-east1
export REPO=terra-manager-api
export IMAGE=api

gcloud config set project $PROJECT_ID
gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com
gcloud artifacts repositories create $REPO --repository-format=docker --location=$REGION --description="Terra Manager API"

# Build e push
gcloud builds submit --tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${IMAGE}:latest

# Deploy (sem variáveis; configure depois no console)
gcloud run deploy terra-manager-api \
  --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${IMAGE}:latest \
  --region ${REGION} \
  --platform managed \
  --allow-unauthenticated
```

Depois: configurar **Variables & Secrets** no Cloud Run com `DATABASE_URL`, `JWT_SECURITY`, `JWT_EXPIRATION` e demais variáveis (ver `docs/TECNOLOGIAS_E_APIS.md`).

---

## URLs após o deploy

- **API:** `https://terra-manager-api-XXXXX-uc.a.run.app` (a URL exata aparece no console)
- **Swagger:** `https://<sua-url>/api-docs`
- **Health (raiz):** `https://<sua-url>/`

---

## Solução de problemas: "Container failed to start and listen on PORT=8080"

1. **Porta do container no Cloud Run (obrigatório)**  
   No console: serviço **terra-manager** → **Editar e implantar nova revisão** → aba **Container** → em **Porta do contêiner** defina **8080**. Se estiver em branco ou outro valor, o Cloud Run não enxerga a aplicação.

2. **Configurações recomendadas no Cloud Run**  
   Na mesma tela **Editar e implantar nova revisão**:
   - **Porta do contêiner:** 8080
   - **Tempo limite da solicitação:** 300 (segundos) — dá tempo da aplicação subir
   - **Memória:** 512 MiB ou 1 GiB — evita OOM durante o bootstrap do NestJS
   - **Variáveis de ambiente:** defina pelo menos `DATABASE_URL`, `JWT_SECURITY`, `JWT_EXPIRATION`

3. **Deploy via gcloud com porta e timeout**  
   ```bash
   gcloud run deploy terra-manager \
     --image ... \
     --port 8080 \
     --timeout 300 \
     --memory 512Mi \
     --region ... \
     --platform managed \
     --allow-unauthenticated
   ```

4. **Logs no Cloud Logging**  
   Use o link "Abrir o Cloud Logging" da revisão. Procure por (na ordem):
   - `[Terra Manager] Container iniciado. Escutando na porta 8080` — script de entrada rodou
   - `[Terra Manager] Processo iniciado. PORT= 8080` — Node iniciou
   - `[Terra Manager] Iniciando aplicação (porta 8080)` — bootstrap começou
   - `[Terra Manager] Escutando na porta 8080 0.0.0.0` — prestes a abrir a porta
   - `[Terra Manager] Servidor iniciado` — subiu com sucesso  
   Se aparecer `Falha ao iniciar a aplicação:` — o texto seguinte é o erro (ex.: `DATABASE_URL` ausente, Prisma falhou).

5. **Redeploy após alterações**  
   Depois de mudar o código (main.ts, Dockerfile, scripts), faça **novo build e deploy** da imagem; a revisão que falha pode ser uma versão antiga.

6. **Variáveis de ambiente**  
   Sem `DATABASE_URL` (e outras obrigatórias), o NestJS pode falhar ao carregar módulos. Configure **Variables & Secrets** no serviço.

---

## Arquivos do projeto

| Arquivo        | Uso                                      |
|----------------|------------------------------------------|
| `Dockerfile`   | Build da imagem para Cloud Run           |
| `.gcloudignore`| Arquivos ignorados no `gcloud builds submit` |
| `scripts/start-cloudrun.sh`    | Entrada no Cloud Run (PORT + log) |
| `scripts/docker-entrypoint.sh`| Migrações + start (Docker Compose) |

Documentação de variáveis de ambiente e APIs externas: `docs/TECNOLOGIAS_E_APIS.md`.
