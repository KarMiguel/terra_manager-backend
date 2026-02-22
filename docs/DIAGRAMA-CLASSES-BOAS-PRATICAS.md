# Diagrama de Classes – Boas Práticas

Checklist aplicado ao diagrama de classes do Terra Manager (`diagrama-classes.mmd`). **Foco 100% no modelo** — não na API. O diagrama mostra três camadas: **entidades**, **serviços de domínio** e **camada de aplicação**.

## Princípio: modelo, não API

| Camada | Responsabilidade | O que NÃO faz |
|--------|------------------|----------------|
| **Entidades** | Estado + comportamento **sobre si** (consultas de estado, transições). Ex.: `estaVigente()`, `cancelar(motivo)`, `marcarComoPaga()`, `atualizarStatus()`. | **CRUD/registrar** — entidades não criam nem persistem a si mesmas; isso é serviço. |
| **Serviços de domínio** | Operações que **criam/orquestram** entidades e regras de negócio. Ex.: `criarFazenda()`, `assinarPlano()`, `registrarPlantio()`, `custoPorSafra()`, `listarFazendasDoUsuario()`. | Parâmetros de API (dto, userId, paginate); assinaturas em **linguagem de domínio** (usuario, fazenda, dados de negócio). |
| **Camada de aplicação** | Use cases que orquestram serviços (quem + o quê). Ex.: `criarFazenda(usuario, dados)`, `registrarPagamento(usuario, cobranca, dados)`. | Lógica de negócio pesada; isso fica nos serviços de domínio. |

## Correções aplicadas (PROBLEMA 1–6)

| Problema | Correção |
|----------|----------|
| **1. Entidades fazendo CRUD** | **Entidades não fazem CRUD.** Removidos das entidades: `registrar(...)`, `criar(...)`. Mantidos apenas: estado + métodos que consultam/alteram o **próprio** estado (`estaVigente()`, `cancelar(motivo)`, `marcarComoPaga()`, `atualizarStatus()`, `alterarDados()`, `aumentarQuantidade()`, `removerQuantidade()`). |
| **2. Onde estão os serviços?** | **Serviços de domínio** explícitos no diagrama: AuthService, UserService, PlanoService, FazendaService, TalhaoService, ZonaManejoService, CultivarService, PragaService, AnaliseSoloService, PlantioService, OperacaoPlantioService, AplicacaoService, ProdutoEstoqueService. Assinaturas em domínio (entidades, valores de negócio). |
| **3. Onde está a camada de aplicação?** | **Camada de aplicação** representada como `CamadaAplicacao`: use cases que orquestram serviços (ex.: `criarFazenda(usuario, dados)`, `registrarPlantio(usuario, dados)`). Depende dos serviços de domínio, não das entidades diretamente. |
| **4. Mistura de camadas** | Diagrama separa: entidades (modelo), serviços de domínio (criação/orquestração), aplicação (use cases). Sem parâmetros de API (dto, userId, createdBy, paginate) nas assinaturas de domínio. |
| **5. DTO/Model no retorno** | Retornos em tipos de domínio (Fazenda, Plantio, Cobranca, Usuario, etc.). Sem *ResponseDto, *Model. |
| **6. Modelagem como API** | Assinaturas em **linguagem de domínio**: parâmetros são entidades/valores de negócio (usuario, fazenda, plantio, valor, status, dados), não dto, userId, body. |

---

## 1. Estrutura das classes

| Item | Descrição | Status |
|------|-----------|--------|
| ☐ | **Nome da classe em PascalCase** (ex.: `Fazenda`, `UsuarioPlano`, `StatusPlantioEnum`) | ☑ |
| ☐ | **Atributos com tipo** (ex.: `-id: Int`, `-nome: String`, `-areaHa: Float`) | ☑ |
| ☐ | **Métodos com parâmetros e retorno de domínio** (entidades: ex. `+estaVigente() Boolean`, `+cancelar(motivo) void`; serviços: ex. `+criarFazenda(usuario, nome, areaTotal, ...) Fazenda`) | ☑ |
| ☐ | **Visibilidade** (+ público, - privado) em atributos e métodos | ☑ |

---

## 2. Atributos

| Item | Descrição | Status |
|------|-----------|--------|
| ☐ | **Apenas os relevantes ao domínio** (id, nome, área, status, datas de negócio, etc.) | ☑ |
| ☐ | **Não incluir campos técnicos** (createdAt, updatedAt, createdBy, modifiedBy, dateCreated, dateModified) | ☑ |
| ☐ | **Não transformar em modelo de banco** — foco no domínio, não em colunas de tabela | ☑ |

---

## 3. Métodos

| Item | Descrição | Status |
|------|-----------|--------|
| ☐ | **Apenas regras de negócio** — entidades: comportamento sobre o próprio estado; serviços: criar/orquestrar entidades (criar fazenda, assinar plano, custo por safra, etc.) | ☑ |
| ☐ | **Parâmetros de domínio** — entidades (Usuario, Fazenda, Plantio), enums, valores (nome, valor, status); **não** dto, userId, createdBy, idUsuario, body, paginate | ☑ |
| ☐ | **Não incluir getters/setters** (getId, getNome, setEmail, etc.) | ☑ |
| ☐ | **Entidades:** não incluir métodos de criação/persistência (registrar, create*, find*, listar*). Esses métodos ficam nos **serviços de domínio**. | ☑ |

---

## 4. Relacionamentos

| Item | Descrição | Status |
|------|-----------|--------|
| ☐ | **Associação correta** — setas indicando direção e papel (ex.: Usuario → Fazenda : idUsuario) | ☑ |
| ☐ | **Multiplicidade** (1, 0..1, 1..*, *, etc.) nos relacionamentos entre entidades | ☑ |
| ☐ | **Herança bem definida** (se houver) — neste diagrama não há herança entre classes de domínio | ☑ |

---

## Multiplicidades usadas no diagrama

| Relação | Multiplicidade | Significado |
|---------|----------------|-------------|
| Usuario → Fazenda | 1 → 1..* | Um usuário possui uma ou mais fazendas |
| Usuario → UsuarioPlano | 1 → * | Um usuário possui vários vínculos com planos |
| Plano → Usuario | 0..1 → 1 | Um usuário pode ter zero ou um plano (atual) |
| Fazenda → Talhao | 1 → * | Uma fazenda possui vários talhões |
| Plantio → OperacaoPlantio | 1 → * | Um plantio possui várias operações |
| OperacaoPlantio → Aplicacao | 1 → * | Uma operação possui várias aplicações |
| AnaliseSolo → Plantio | 0..1 → * | Um plantio pode ter zero ou uma análise de solo |
| Praga → Cultivar | 0..1 → * | Uma cultivar pode ter zero ou uma praga associada |

---

## Arquivos relacionados

- **diagrama-classes.mmd** — Código Mermaid: entidades (estado + comportamento sobre si, sem CRUD), serviços de domínio (criar/orquestrar), camada de aplicação (use cases), relacionamentos.
- **DIAGRAMA-CLASSES-README.md** — Como visualizar e convenções gerais.
- **diagrama-classes-domínio.md** — Critério “o que entra” (domínio vs persistência).
