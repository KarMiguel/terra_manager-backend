# Documentação do sistema Terra Manager

Índice da documentação do projeto: onde encontrar regras de negócio, API (Swagger), cálculos agronômicos e evolução.

---

## 1. API (Swagger)

- **URL (local):** `http://localhost:3000/api-docs`
- **Especificação OpenAPI (JSON):** `http://localhost:3000/api-docs-json` (para Postman/Insomnia)
- **Conteúdo:** Descrição de todos os endpoints, parâmetros, body, respostas (200, 201, 400, 401, 404) e exemplos. Autenticação JWT (Bearer Token).
- **Configuração:** `src/main.ts` (DocumentBuilder, tags, descrição). Cada controller usa `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiParam`, `@ApiQuery`; DTOs usam `@ApiProperty` / `@ApiPropertyOptional`.

Subir a API: `npm run start` ou `npm run start:dev`.

---

## 2. Regras de negócio

- **Arquivo:** [REGRAS_NEGOCIO.md](./REGRAS_NEGOCIO.md)
- **Conteúdo:**
  - Regras por módulo (Auth, Usuários, Fazendas, Plantios, Talhões, Operações do plantio, Aplicações, Custo por safra, Análise de solo, Planos, Relatórios, etc.).
  - Numeração RN-xxx e RN-TAL, RN-OPE, RN-APL, RN-CUS para as novas features.
  - Modelo de entidade e relacionamento (§4.7): tabelas, campos, foreign keys, enums.
  - Resumo de FKs e hierarquia de dependências.
- **Uso:** Consulta para validações, permissões, comportamento esperado da API e modelo de dados.

---

## 3. Cálculos agronômicos e referências

- **Arquivo:** [REFERENCIAS_AGRONOMIA.md](./REFERENCIAS_AGRONOMIA.md)
- **Conteúdo:**
  - Fórmulas utilizadas (área por talhão, custo por ha, quantidade total = dose por ha × área, custo por safra).
  - Referências bibliográficas (EMBRAPA, CONAB, CFSEMG, ANDEF, bulas, receituário agronômico).
  - Tabela resumo: funcionalidade × fórmula × onde no código.
- **Uso:** Justificativa dos cálculos e base para auditoria ou evolução agronômica.

---

## 4. Ideias de evolução (backlog)

- **Arquivo:** [IDEIAS_EVOLUCAO.md](./IDEIAS_EVOLUCAO.md)
- **Conteúdo:** Ideias por área (gestão, plantio, agronomia, sistema), priorização (alta/média/baixa) e **status** (feito vs pendente) das funcionalidades já implementadas (talhões, operações, aplicações, custo por safra).
- **Uso:** Planejamento de próximas entregas e visão do que já existe.

---

## 5. README e outros

- **README.md:** Configuração do projeto, como rodar, testes e seção **Documentação Swagger** (acesso à API docs, estrutura dos controllers, exemplos de uso).
- **.docker-compose.env.example / docker-compose.yml:** Variáveis e serviços para ambiente Docker.
- **prisma/schema.prisma:** Modelo de dados (entidades, enums, relações). Migrations em `prisma/migrations/`.

---

## Resumo rápido

| Preciso de… | Onde ver |
|-------------|----------|
| Endpoints, parâmetros, exemplos de request/response | Swagger: `/api-docs` |
| Regras (o que pode/não pode, validações, RN) | REGRAS_NEGOCIO.md |
| Fórmulas e referências (dose por ha, custo safra) | REFERENCIAS_AGRONOMIA.md |
| O que já foi feito e o que está no backlog | IDEIAS_EVOLUCAO.md |
| Como rodar o projeto e testes | README.md |

**Última atualização:** 2026-02-19
