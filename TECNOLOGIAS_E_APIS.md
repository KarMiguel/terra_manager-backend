# Tecnologias e APIs Externas — Terra Manager

Documentação das tecnologias utilizadas no projeto e das APIs externas consumidas.

---

## 1. Tecnologias utilizadas

### Runtime e linguagem
| Tecnologia | Versão | Uso no projeto |
|------------|--------|-----------------|
| **Node.js** | 20.x | Runtime JavaScript/TypeScript. |
| **TypeScript** | ^5.1.3 | Linguagem principal, tipagem e compilação. |

### Framework e servidor
| Tecnologia | Versão | Uso no projeto |
|------------|--------|-----------------|
| **NestJS** | ^10.4.x | Framework backend: módulos, injeção de dependência, guards, interceptors. |
| **Express** | (via @nestjs/platform-express) | Servidor HTTP sob o NestJS. |
| **serverless-http** | ^4.0.0 | Adaptador para rodar a API em ambiente serverless (ex.: Vercel). |

### Banco de dados e ORM
| Tecnologia | Versão | Uso no projeto |
|------------|--------|-----------------|
| **PostgreSQL** | — | Banco de dados relacional (ex.: Neon, local). |
| **Prisma** | ^5.22.0 | ORM: schema, migrations, cliente type-safe e geração de tipos. |

### Autenticação e segurança
| Tecnologia | Versão | Uso no projeto |
|------------|--------|-----------------|
| **Passport** | (via @nestjs/passport) | Estratégias de autenticação. |
| **passport-jwt** | ^4.0.1 | Estratégia JWT para validação de tokens. |
| **@nestjs/jwt** | ^10.2.0 | Geração e assinatura de JWT. |
| **bcrypt** | ^5.1.1 | Hash de senhas. |

### Validação e transformação
| Tecnologia | Versão | Uso no projeto |
|------------|--------|-----------------|
| **class-validator** | ^0.14.0 | Validação de DTOs (decorators). |
| **class-transformer** | ^0.5.1 | Serialização/transformação de objetos (ex.: DTO ↔ entidade). |

### Documentação da API
| Tecnologia | Versão | Uso no projeto |
|------------|--------|-----------------|
| **Swagger (OpenAPI)** | @nestjs/swagger ^8.0.5 | Documentação e UI em `/api-docs`. |
| **swagger-ui-express** | ^5.0.1 | Servir a interface Swagger UI. |

### Configuração e ambiente
| Tecnologia | Versão | Uso no projeto |
|------------|--------|-----------------|
| **@nestjs/config** | ^3.3.0 | Carregamento de variáveis de ambiente (.env). |

### HTTP e utilitários
| Tecnologia | Versão | Uso no projeto |
|------------|--------|-----------------|
| **axios** | ^1.7.7 | Cliente HTTP para chamadas às APIs externas. |
| **lodash** | ^4.17.21 | Utilitários (objetos, arrays, strings). |
| **rxjs** | ^7.8.1 | Programação reativa (usado internamente pelo NestJS). |
| **reflect-metadata** | ^0.2.0 | Metadados para decorators (NestJS/TypeScript). |

### E-mail
| Tecnologia | Versão | Uso no projeto |
|------------|--------|-----------------|
| **nodemailer** | ^6.9.16 | Envio de e-mails (ex.: recuperação de senha). |

### Relatórios (uso local)
| Tecnologia | Versão | Uso no projeto |
|------------|--------|-----------------|
| **puppeteer** | ^24.37.4 (devDependencies) | Geração de PDFs (relatórios). Usado apenas em ambiente local; não no deploy serverless. |

### Deploy e ferramentas de desenvolvimento
| Tecnologia | Uso no projeto |
|------------|-----------------|
| **Vercel** | Hospedagem serverless da API (api/index.ts). |
| **Jest** | Testes unitários e e2e. |
| **ESLint + Prettier** | Lint e formatação. |
| **Prisma CLI** | Migrations, seeds, `prisma generate`. |

### Docker (ambiente local / self-hosted)
| Tecnologia | Uso no projeto |
|------------|-----------------|
| **Docker** | Containerização da API (Node 20 Alpine). |
| **Docker Compose** | Orquestração: API + PostgreSQL em rede local. |
| **Dockerfile** | Build multi-stage: stage de build (npm run build) e stage de produção (apenas dist + deps de produção). Inclui healthcheck e usuário não-root. |
| **docker-compose.yml** | Serviços `app` (API) e `db` (PostgreSQL 16 Alpine), variáveis de ambiente, volumes para dados do banco, healthchecks. |
| **.docker-compose.env.example** | Template de variáveis para rodar com Docker Compose. |

**Arquivos:** `Dockerfile`, `docker-compose.yml`, `scripts/docker-entrypoint.sh`, `.docker-compose.env.example`.  
**Documentação detalhada:** `DOCKER.md` (comandos, troubleshooting, migrações no container).

### Mapa e geolocalização (GeoJSON)

O projeto **não usa biblioteca de mapa** (Leaflet, Mapbox, Google Maps, etc.) no backend. A API apenas **armazena e devolve geometria no padrão GeoJSON**.

| O que | Como é no projeto |
|-------|-------------------|
| **Padrão** | **GeoJSON** (RFC 7946): geometrias `Polygon` ou `MultiPolygon`, coordenadas no formato `[longitude, latitude]`. |
| **Fazenda** | Campos `latitude` e `longitude` (Float) no banco — ponto de referência da fazenda. |
| **Talhão** | Campo `geometria` (Json) no Prisma — GeoJSON Polygon/MultiPolygon para desenhar o contorno no mapa. |
| **Zona de manejo** | Campo `geometria` (Json) obrigatório + opcional `cor` (hex) para exibição no mapa. |
| **Endpoints de mapa** | `GET /mapa/fazenda/:idFazenda` — retorna duas camadas GeoJSON: `talhoes` (FeatureCollection) e `zonasManejo` (FeatureCollection). Também: `GET /talhao/fazenda/:id/mapa` e `GET /zona-manejo/fazenda/:id/mapa`. |

**Exemplo de geometria GeoJSON (talhão/zona):**
```json
{
  "type": "Polygon",
  "coordinates": [[[-48.5, -15.8], [-48.4, -15.8], [-48.4, -15.7], [-48.5, -15.7], [-48.5, -15.8]]]
}
```
(Em GeoJSON a ordem é sempre **longitude, latitude**.)

**Geolocalização em outros módulos:**  
- Dashboard **dados-solo**: parâmetros `lat` e `lon` (ou `log`) na URL — enviados para a API ISRIC SoilGrids para buscar propriedades do solo naquele ponto.

**Para exibir mapas no frontend:**  
O backend só entrega GeoJSON. Para desenhar o mapa no navegador use, por exemplo, **Leaflet** (`leaflet` + GeoJSON nativo), **Mapbox GL JS** ou **Google Maps JavaScript API**, consumindo os endpoints acima (requer plano Premium).

---

## 2. APIs externas (URLs base)

Todas as URLs base são configuráveis via variáveis de ambiente. Nunca commitar chaves ou tokens no repositório.

### 2.1 Clima (OpenWeatherMap)
- **Uso:** Clima atual e previsão por cidade (dashboard).
- **URL base (clima atual):**  
  `https://api.openweathermap.org/data/2.5/weather`
- **URL base (previsão):**  
  `https://api.openweathermap.org/data/2.5/forecast`
- **Variáveis de ambiente:** `API_CLIMA_URL`, `API_CLIMA_KEY`
- **Documentação:** https://openweathermap.org/api

---

### 2.2 Cotação de commodities (Brapi)
- **Uso:** Cotação de commodities agrícolas (ex.: soja, milho) na bolsa.
- **URL base:**  
  `https://brapi.dev/api/quote`
- **Exemplo de endpoint usado:**  
  `GET {API_COTACAO_URL}/{symbol}?token={API_COTACAO_TOKEN}`  
  (ex.: `/SOJA`, `/MILHO`)
- **Variáveis de ambiente:** `API_COTACAO_URL`, `API_COTACAO_TOKEN`
- **Documentação:** https://brapi.dev/

---

### 2.3 Notícias (NewsAPI)
- **Uso:** Busca de notícias por termos (dashboard).
- **URL base:**  
  `https://newsapi.org/v2/everything`
- **Exemplo de uso:**  
  `GET {API_NEWS_URL}?q={query}&apiKey={key}&language=pt&page=1&pageSize=5`
- **Variáveis de ambiente:** `API_NEWS_URL`, `API_NEWS_KEY`
- **Documentação:** https://newsapi.org/docs

---

### 2.4 Dados de solo (ISRIC SoilGrids)
- **Uso:** Propriedades físicas e químicas do solo por coordenadas (lat/lon).
- **URL base:**  
  `https://rest.isric.org/soilgrids/v2.0/properties/query`
- **Exemplo de uso:**  
  `GET {API_SOIL_URL}?lon={lon}&lat={lat}&property=clay&property=sand&...`
- **Variáveis de ambiente:** `API_SOIL_URL`
- **Documentação:** https://www.isric.org/explore/soilgrids

---

## 3. Resumo das variáveis de ambiente (APIs e serviços)

| Variável | Descrição | Exemplo de valor (não commitar) |
|----------|-----------|----------------------------------|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `JWT_SECURITY` | Segredo para assinatura do JWT | string longa e aleatória |
| `JWT_EXPIRATION` | Expiração do token (ms) | `720000` |
| `API_CLIMA_URL` | Base URL clima atual | `https://api.openweathermap.org/data/2.5/weather` |
| `API_CLIMA_KEY` | Chave OpenWeatherMap | obtida em openweathermap.org |
| `API_COTACAO_URL` | Base URL cotação | `https://brapi.dev/api/quote` |
| `API_COTACAO_TOKEN` | Token Brapi | obtido em brapi.dev |
| `API_NEWS_URL` | Base URL notícias | `https://newsapi.org/v2/everything` |
| `API_NEWS_KEY` | Chave NewsAPI | obtida em newsapi.org |
| `API_SOIL_URL` | Base URL solo | `https://rest.isric.org/soilgrids/v2.0/properties/query` |
| `EMAIL_USER` | E-mail para envio (ex.: Gmail) | seu-email@gmail.com |
| `EMAIL_PASS` | Senha de app do e-mail | senha de app do provedor |

---

## 4. Dados locais (sem API externa)

- **Culturas (dados-cultura):** dados estáticos em `src/modules/dashboard/data/cultivos.data.ts` (soja, milho, feijão, algodão, café, arroz, trigo, cana-de-açúcar). Não consome API externa.
