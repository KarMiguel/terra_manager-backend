# Passo a passo do sistema Terra Manager

Este documento descreve **em ordem** o que fazer no sistema: do início (criar usuário, selecionar plano, pagar) até o uso diário (fazenda, talhões, plantios, operações). Use como guia de onboarding ou checklist.

**Pré-requisito:** API rodando (`npm run start` ou `npm run start:dev`). Documentação interativa em `http://localhost:3000/api-docs`.

---

## Visão geral do fluxo

```
1. Cadastro e plano     → 2. Pagamento     → 3. Dados base     → 4. Operação
   (usuário, plano)        (cobrança, pago)   (fazenda, etc.)     (plantio, operações)
```

---

## Ordem dos módulos (sequência de dependência)

A ordem em que os módulos devem ser usados no sistema, do primeiro ao último:

| # | Módulo | Depende de | Observação |
|---|--------|------------|------------|
| 1 | **Usuário** | — | Cadastro e login. Raiz do sistema. |
| 2 | **Plano** | Usuário | Vincular plano ao usuário; cobrança e pagamento. |
| 3 | **Fazenda** | Usuário | Uma fazenda pertence ao usuário logado. |
| 4 | **Fornecedor** | Usuário | Opcional; usado em Cultivar e Produto estoque. |
| 5 | **Praga** | — | Opcional; pode ser usada na criação de Cultivar. |
| 6 | **Cultivar** | Usuário; opcional: Praga, Fornecedor | Necessária para criar Plantio. |
| 7 | **Análise de solo** | Usuário | Opcional; pode ser vinculada ao Plantio. |
| 8 | **Talhão** | Fazenda | Plano Premium. Opcional para Plantio e operações. |
| 9 | **Plantio** | **Fazenda**, **Cultivar**; opcional: Talhão, Análise de solo | Ordem: depois de Fazenda e Cultivar. |
| 10 | **Operação do plantio** | Plantio; opcional: Talhão | Plano Pro ou Premium. Etapas do ciclo (preparo, semeadura, colheita, etc.). |
| 11 | **Aplicação** | Operação do plantio; opcional: Produto estoque | Plano Pro ou Premium. Defensivo/fertilizante por operação. |
| 12 | **Produto estoque** | Fazenda, Fornecedor | Por fazenda; pode ser usado em Aplicação. |
| 13 | **Zona de manejo** | Fazenda; opcional: Talhão | Plano Premium. Mapa e relatórios. |
| 14 | **Mapa** | Fazenda (talhões e zonas) | Plano Premium. Visualização. |
| 15 | **Relatório** | Dados do usuário (fazendas, plantios, estoque, etc.) | Plano Premium. PDF. |
| 16 | **Dashboard** | — | Clima/notícias: público; cotação/dados-solo/dados-cultura: Pro ou Premium. |
| 17 | **Log** | — | Consulta de auditoria (autenticado). |

**Resumo da sequência principal:** **Usuário** → **Fazenda** → **Cultivar** (e opcionalmente Fornecedor/Praga) → **Plantio** → **Operação do plantio** → **Aplicação**.

---

## Fase 1: Início — usuário e plano

### Passo 1.1 — Criar usuário (registro)

- **Endpoint:** `POST /auth/register`
- **Body (exemplo):**
  ```json
  {
    "email": "usuario@exemplo.com",
    "password": "SenhaSegura123",
    "nome": "Nome do Usuário",
    "cpf": "12345678900",
    "telefone": "11999999999"
  }
  ```
- **Opcional:** `idPlano` — se enviado e válido, o usuário já é vinculado a esse plano; senão recebe o **plano BASICO** automaticamente (RN-013b).
- **Resultado:** Usuário criado e, em geral, já com plano BASICO vinculado (assinatura ativa).

### Passo 1.2 — Fazer login

- **Endpoint:** `POST /auth/login`
- **Body:**
  ```json
  {
    "email": "usuario@exemplo.com",
    "password": "SenhaSegura123"
  }
  ```
- **Resultado:** Resposta com `accessToken`, `role`, `email`, `name`, `tipoPlano`, `expires_at` e dados do plano. **Guarde o `accessToken`** e use em todas as requisições protegidas no header: `Authorization: Bearer <accessToken>`.

### Passo 1.3 — Listar planos disponíveis (opcional)

- **Endpoint:** `GET /plano` (público)
- **Resultado:** Lista de planos ativos (id, nome, tipoPlano, valorPlano, tempoPlanoDias, descrição). Use para exibir opções na tela de seleção de plano.

### Passo 1.4 — Selecionar / trocar plano (vincular plano ao usuário)

- **Endpoint:** `POST /plano/usuario/:idUsuario/plano/:idPlano` (público)
- **Parâmetros:** `idUsuario` = ID do usuário (ex.: 1), `idPlano` = ID do plano escolhido (ex.: 2 para PRO).
- **Resultado:** Plano vinculado ao usuário. Se já existir assinatura ativa, ela é cancelada e a nova é criada (troca de plano).

### Passo 1.5 — Ver status do plano (usuário logado)

- **Endpoint:** `GET /plano/me/status`
- **Header:** `Authorization: Bearer <accessToken>`
- **Resultado:** Status da assinatura atual: `tipoPlano`, `nomePlano`, `dataInicioPlano`, `dataFimPlano`, `planoValido`, `mensagem`, `pagamentoAprovado`.

---

## Fase 2: Pagamento (simulação)

### Passo 2.1 — Gerar cobrança

- **Endpoint:** `POST /plano/me/cobranca`
- **Header:** `Authorization: Bearer <accessToken>`
- **Body (exemplo):**
  ```json
  {
    "formaPagamento": "PIX",
    "valor": 299.90
  }
  ```
  `formaPagamento`: `PIX` | `BOLETO` | `CARTAO_CREDITO`. `valor` opcional (usa valor do plano se omitido).
- **Resultado:** `codigoCobranca`, `dataVencimento`, `message`. **Guarde o `codigoCobranca`** para registrar o pagamento.

### Passo 2.2 — Registrar pagamento (simulação)

- **Endpoint:** `POST /plano/me/pagamento?codigoCobranca=<codigoCobranca>`
- **Header:** `Authorization: Bearer <accessToken>`
- **Body (exemplo):**
  ```json
  {
    "formaPagamento": "PIX",
    "valor": 299.90
  }
  ```
  Use o mesmo `codigoCobranca` retornado no passo 2.1 para aprovar o pagamento na hora.
- **Resultado:** Pagamento registrado com status (ex.: APROVADO). O plano do usuário passa a ser considerado pago até o vencimento (tempoPlanoDias).

---

## Fase 3: Dados base — fazenda, cultivar, fornecedor

### Passo 3.1 — Criar fazenda

- **Endpoint:** `POST /fazenda`
- **Header:** `Authorization: Bearer <accessToken>`
- **Body (exemplo):**
  ```json
  {
    "nome": "Fazenda Exemplo",
    "latitude": -15.79,
    "longitude": -47.86,
    "areaTotal": 500,
    "municipio": "Brasília",
    "uf": "DF"
  }
  ```
- **Resultado:** Fazenda criada (id, nome, etc.). O usuário logado é associado automaticamente (idUsuario).

### Passo 3.2 — Criar cultivar (opcional, mas necessário para plantio)

- **Endpoint:** `POST /cultivar`
- **Header:** `Authorization: Bearer <accessToken>`
- **Body (exemplo):**
  ```json
  {
    "nomePopular": "Soja Intacta RR2",
    "nomeCientifico": "Glycine max",
    "tipoPlanta": "SOJA",
    "idFornecedor": 1
  }
  ```
- **Resultado:** Cultivar criada. Use `idCultivar` ao criar plantio.

### Passo 3.3 — Criar fornecedor (opcional; útil para cultivar e estoque)

- **Endpoint:** `POST /fornecedor`
- **Header:** `Authorization: Bearer <accessToken>`
- **Body (exemplo):**
  ```json
  {
    "razaoSocial": "Fornecedor LTDA",
    "cnpj": "12345678000199",
    "cidade": "São Paulo",
    "uf": "SP"
  }
  ```

---

## Fase 4: Estrutura da fazenda — talhões e zonas de manejo

### Passo 4.1 — Criar talhão

- **Endpoint:** `POST /talhao`
- **Header:** `Authorization: Bearer <accessToken>`
- **Body (exemplo):**
  ```json
  {
    "idFazenda": 1,
    "nome": "Talhão Norte",
    "areaHa": 50.5
  }
  ```
  Opcional: `geometria` (GeoJSON Polygon/MultiPolygon) para mapa.
- **Resultado:** Talhão criado. Pode ser usado em plantio e em operações por talhão.

### Passo 4.2 — Criar zona de manejo (opcional; para mapa e relatórios)

- **Endpoint:** `POST /zona-manejo`
- **Header:** `Authorization: Bearer <accessToken>`
- **Body (exemplo):**
  ```json
  {
    "idFazenda": 1,
    "idTalhao": 1,
    "nome": "Zona alta fertilidade",
    "tipo": "fertilidade",
    "geometria": { "type": "Polygon", "coordinates": [ [...] ] },
    "cor": "#4CAF50"
  }
  ```

### Passo 4.3 — Ver mapa da fazenda (talhões + zonas)

- **Endpoint:** `GET /mapa/fazenda/:idFazenda`
- **Header:** `Authorization: Bearer <accessToken>`
- **Resultado:** GeoJSON com `talhoes` e `zonasManejo` (FeatureCollection) para desenhar no mapa.

---

## Fase 5: Análise de solo e plantio

### Passo 5.1 — Criar análise de solo (opcional; recomendado para cálculos de calagem/adubação)

- **Endpoint:** `POST /analise-solo`
- **Header:** `Authorization: Bearer <accessToken>`
- **Body (exemplo):**
  ```json
  {
    "nomeSolo": "Talhão Norte - Amostra 1",
    "ph": 6.2,
    "areaTotal": 10.5,
    "n": 20,
    "p": 15,
    "k": 120
  }
  ```
- **Resultado:** Análise criada. Use `id` para vincular ao plantio (`idAnaliseSolo`).

### Passo 5.2 — Criar plantio

- **Endpoint:** `POST /plantio`
- **Header:** `Authorization: Bearer <accessToken>`
- **Body (exemplo mínimo):**
  ```json
  {
    "idCultivar": 1,
    "idFazenda": 1,
    "dataPlantio": "2025-10-01",
    "areaPlantada": 50,
    "densidadePlanejada": 250000,
    "densidadePlantioReal": 248000,
    "mmAguaAplicado": 30
  }
  ```
  Opcional: `idTalhao`, `idAnaliseSolo`, `dataPrevistaColheita`, custos, etc.
- **Resultado:** Plantio criado com status **PLANEJADO**. O status muda automaticamente ao registrar operações (ver passo 6).

### Passo 5.3 — Listar plantios por fazenda (e filtrar por status)

- **Endpoint:** `GET /plantio/fazenda/:idFazenda?options={"statusPlantio":"EM_MONITORAMENTO"}&page=1&pageSize=10`
- **Header:** `Authorization: Bearer <accessToken>`
- **Resultado:** Lista paginada de plantios. Filtro `statusPlantio`: PLANEJADO, EXECUTADO, EM_MONITORAMENTO, CONCLUIDO.

### Passo 5.4 — Alterar status do plantio manualmente (se necessário)

- **Endpoint:** `PATCH /plantio/:id/status`
- **Header:** `Authorization: Bearer <accessToken>`
- **Body:** `{ "statusPlantio": "EM_MONITORAMENTO" }`
- **Resultado:** Status do plantio atualizado.

---

## Fase 6: Operações do plantio (fases do ciclo)

Ao registrar operações, o **status do plantio** é atualizado automaticamente:

| Operação registrada | Efeito no status do plantio |
|--------------------|-----------------------------|
| PREPARO_SOLO ou SEMEADURA (quando PLANEJADO) | → EXECUTADO |
| SEMEADURA | → EM_MONITORAMENTO |
| COLHEITA | → CONCLUIDO |

### Passo 6.1 — Registrar operação/etapa do plantio

- **Endpoint:** `POST /operacao-plantio`
- **Header:** `Authorization: Bearer <accessToken>`
- **Body (exemplo):**
  ```json
  {
    "idPlantio": 1,
    "tipoEtapa": "SEMEADURA",
    "dataInicio": "2025-10-01",
    "areaHa": 50,
    "custoTotal": 15000
  }
  ```
  `tipoEtapa`: PREPARO_SOLO, SEMEADURA, APLICACAO_DEFENSIVO, APLICACAO_FERTILIZANTE, IRRIGACAO, COLHEITA, OUTROS. Opcional: `idTalhao`, `dataFim`, `observacao`.
- **Resultado:** Operação criada e, se aplicável, status do plantio atualizado (ex.: SEMEADURA → EM_MONITORAMENTO).

### Passo 6.2 — Listar operações de um plantio

- **Endpoint:** `GET /operacao-plantio/plantio/:idPlantio`
- **Header:** `Authorization: Bearer <accessToken>`
- **Resultado:** Lista de operações do plantio, ordenadas por dataInicio.

### Passo 6.3 — Registrar aplicação (defensivo/fertilizante) em uma operação (opcional)

- **Endpoint:** `POST /aplicacao`
- **Header:** `Authorization: Bearer <accessToken>`
- **Body (exemplo):**
  ```json
  {
    "idOperacaoPlantio": 1,
    "tipo": "FERTILIZANTE",
    "nomeProduto": "NPK 20-00-20",
    "dosePorHa": 300,
    "unidadeDose": "KG_HA",
    "dataAplicacao": "2025-10-15"
  }
  ```

---

## Fase 7: Relatórios e consultas

### Passo 7.1 — Custo por safra

- **Endpoint:** `GET /plantio/fazenda/:idFazenda/custo-safra?ano=2025`
- **Header:** `Authorization: Bearer <accessToken>`
- **Resultado:** custoTotalSafra, areaTotalHa, custoPorHaSafra, quantidadePlantios, resumoPorOperacao.

### Passo 7.2 — Relatório PDF (resumo, plantios, análises de solo, estoque)

- **Endpoints (todos com header Authorization):**
  - `GET /relatorio/resumo?ano=2025&mes=10` — Resumo geral (plano, fazendas, talhões, zonas de manejo, plantios, estoque, análises de solo).
  - `GET /relatorio/plantios?ano=2025` — Relatório de plantios.
  - `GET /relatorio/analises-solo?ano=2025` — Minhas análises de solo.
  - `GET /relatorio/estoque` — Relatório de estoque.
- **Resultado:** PDF (Buffer) para download ou exibição.

---

## Resumo em ordem sugerida

| Ordem | Ação | Endpoint principal |
|-------|------|--------------------|
| 1 | Criar usuário | `POST /auth/register` |
| 2 | Login | `POST /auth/login` |
| 3 | Listar planos | `GET /plano` |
| 4 | Vincular plano ao usuário | `POST /plano/usuario/:idUsuario/plano/:idPlano` |
| 5 | Gerar cobrança | `POST /plano/me/cobranca` |
| 6 | Registrar pagamento | `POST /plano/me/pagamento?codigoCobranca=...` |
| 7 | Criar fazenda | `POST /fazenda` |
| 8 | Criar fornecedor | `POST /fornecedor` |
| 9 | Criar cultivar | `POST /cultivar` |
| 10 | Criar talhão | `POST /talhao` |
| 11 | (Opcional) Zona de manejo | `POST /zona-manejo` |
| 12 | (Opcional) Análise de solo | `POST /analise-solo` |
| 13 | Criar plantio | `POST /plantio` |
| 14 | Registrar operações (preparo, semeadura, colheita, etc.) | `POST /operacao-plantio` |
| 15 | (Opcional) Aplicações (defensivo/fertilizante) | `POST /aplicacao` |
| 16 | Relatórios PDF | `GET /relatorio/resumo`, `/plantios`, `/analises-solo`, `/estoque` |

---

## Controle de acesso por plano

O token JWT inclui **tipoPlano** (BASICO, PRO, PREMIUM). Alguns módulos e endpoints exigem plano **Pro** ou **Premium**; se o usuário não tiver o plano exigido, a API retorna **403 Forbidden**.

| Plano   | O que tem além do Básico |
|---------|---------------------------|
| **Básico** | Auth, usuário, fazenda, cultivar, fornecedor, plantio (CRUD básico, listagem), análise de solo, estoque, praga. Dashboard: clima e notícias (públicos). |
| **Pro** | Tudo do Básico + **Operação do plantio**, **Aplicação**, **Dashboard**: cotação bolsa, dados solo, dados cultura. |
| **Premium** | Tudo do Pro + **Mapa**, **Talhão**, **Zona de manejo**, **Relatório** (PDF), **Custo por safra** (`GET /plantio/fazenda/:id/custo-safra`). |

Detalhes e RN: **REGRAS_NEGOCIO.md** §15.13.

---

## Observações

- **Token:** Após o login, use `Authorization: Bearer <accessToken>` em todos os endpoints protegidos (exceto registro, login, listar planos e vincular plano, que são públicos onde indicado).
- **Plano:** O usuário precisa de assinatura ativa e pagamento aprovado no período para o plano ser considerado válido (impacta login e uso). O **tipoPlano** no token define quais módulos/endpoints estão liberados (403 se plano insuficiente).
- **IDs:** Após cada criação, use o `id` retornado nos próximos passos (ex.: idFazenda ao criar talhão, idPlantio ao criar operação).
- **Swagger:** Em `http://localhost:3000/api-docs` é possível testar todos os endpoints e ver exemplos de body/query.

**Última atualização:** 2026-02-19
