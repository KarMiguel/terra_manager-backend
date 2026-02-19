# Regras de Negócio - Terra Manager API

Este documento descreve todas as **regras de negócio** implementadas no sistema Terra Manager, organizadas por módulo e feature. É a referência para comportamento esperado da API, validações, permissões e modelos de dados.

## Documentação do sistema

| Onde | O que |
|------|--------|
| **Swagger (API)** | Documentação interativa dos endpoints: ao subir a API, acesse `http://localhost:3000/api-docs`. Inclui descrições, parâmetros, exemplos e respostas. |
| **REGRAS_NEGOCIO.md** | Este arquivo: regras (RN-xxx), modelos de entidade, relacionamentos e foreign keys. |
| **REFERENCIAS_AGRONOMIA.md** | Fórmulas e referências bibliográficas dos cálculos (talhão, dose por ha, custo por safra). |
| **DOCUMENTACAO_SISTEMA.md** | Índice geral da documentação do projeto. |
| **IDEIAS_EVOLUCAO.md** | Backlog de evolução e status do que já foi implementado. |

---

## 📋 Índice

1. [Autenticação e Autorização](#1-autenticação-e-autorização)
2. [Usuários](#2-usuários)
3. [Fazendas](#3-fazendas)
4. [Fornecedores](#4-fornecedores)
5. [Cultivares](#5-cultivares)
6. [Pragas](#6-pragas)
7. [Plantios](#7-plantios) (incl. 7.4 Talhões, 7.5 Operações, 7.6 Aplicações, 7.7 Custo por safra)
8. [Mapa (GeoJSON) e Zonas de manejo](#8-mapa-geojson-e-zonas-de-manejo)
9. [Análise de Solo](#9-análise-de-solo)
10. [Produto Estoque](#10-produto-estoque)
11. [Dashboard](#11-dashboard)
12. [Sistema de Logs](#12-sistema-de-logs)
13. [Regras Gerais CRUD](#13-regras-gerais-crud)
14. [Modelo Entidade Relacionamento](#14-modelo-entidade-relacionamento)
15. [Planos e Assinaturas](#15-planos-e-assinaturas)
16. [Relatórios (PDF)](#16-relatórios-pdf)

---

## 1. Autenticação e Autorização

### 1.1. Login
- **RN-001**: O email e senha são obrigatórios para autenticação.
- **RN-002**: A senha deve ser comparada usando bcrypt com hash armazenado.
- **RN-003**: Se as credenciais forem inválidas, retorna `UnauthorizedException`.
- **RN-004**: O token JWT contém: `email`, `sub` (ID do usuário), e `role`.
- **RN-005**: O token JWT expira conforme configurado em `JWT_EXPIRATION` (padrão: 720000ms).
- **RN-006**: A resposta do login inclui: `accessToken`, `role`, `email`, `telefone`, `cpf`, `name`, `expires_at`, e objeto `plano` (status do plano: válido, tipo, datas, pagamento aprovado).

### 1.2. Registro de Usuário
- **RN-007**: O email deve ser único no sistema.
- **RN-008**: O CPF deve ser único no sistema (quando informado).
- **RN-009**: A senha deve ser hasheada com bcrypt (10 rounds) antes de ser armazenada.
- **RN-010**: O role padrão é `USER` se não especificado.
- **RN-011**: Usuários são criados com `ativo = true` por padrão.
- **RN-012**: Se email ou CPF já existirem, retorna `ConflictException` (409).
- **RN-013**: O sistema registra automaticamente a criação do usuário no log.
- **RN-013b**: No registro, o usuário recebe automaticamente o **plano inicial** (plano BASICO). Opcionalmente o body pode enviar `idPlano`; se enviado e válido, esse plano é usado; senão usa o plano BASICO. É criado um vínculo em `UsuarioPlano` com vigência conforme `tempoPlanoDias` do plano.

### 1.3. Recuperação de Senha
- **RN-014**: O email é obrigatório para solicitar recuperação de senha.
- **RN-015**: Se o email não existir, retorna `BadRequestException`.
- **RN-016**: Um token aleatório de 32 bytes (hex) é gerado para reset de senha.
- **RN-017**: O token expira em 30 minutos após a geração.
- **RN-018**: O link de reset é enviado por email usando `FRONTEND_URL`.
- **RN-019**: O token deve ser verificado antes de permitir reset de senha.
- **RN-020**: Tokens expirados ou inválidos retornam `UnauthorizedException`.
- **RN-021**: As senhas nova e confirmação devem ser idênticas.
- **RN-022**: Após reset bem-sucedido, o token e data de expiração são removidos.

### 1.4. Autorização por Roles
- **RN-023**: Existem três roles: `ADMIN`, `USER`.
- **RN-024**: Rotas protegidas requerem autenticação via JWT Bearer Token.
- **RN-025**: Rotas públicas usam o decorator `@Public()`.
- **RN-026**: O `RolesGuard` verifica se o usuário possui a role necessária.
- **RN-027**: Usuários sem role ou sem autenticação recebem `UnauthorizedException`.

---

## 2. Usuários

### 2.1. Criação
- **RN-028**: Email é obrigatório e único.
- **RN-029**: CPF é opcional, mas quando informado deve ser único.
- **RN-030**: Nome é obrigatório.
- **RN-031**: Senha é obrigatória e deve ser hasheada.
- **RN-032**: Role padrão é `USER`.

### 2.2. Consulta
- **RN-033**: Busca por email retorna o usuário completo (incluindo senha hasheada).
- **RN-034**: Busca por token de reset retorna usuário apenas se token não expirou.

### 2.3. Atualização
- **RN-035**: Atualização de senha deve incluir hash bcrypt.
- **RN-036**: Campos de auditoria (`modifiedBy`, `dateModified`) são atualizados automaticamente.

---

## 3. Fazendas

### 3.1. Criação
- **RN-037**: O ID do usuário é obrigatório para criar uma fazenda.
- **RN-038**: CNPJ é opcional, mas quando informado deve ser único.
- **RN-039**: Nome, latitude e longitude são obrigatórios.
- **RN-040**: Se CNPJ já existir, retorna `ConflictException` (409).
- **RN-041**: A fazenda é vinculada ao usuário através de `idUsuario`.
- **RN-042**: Fazendas são criadas com `ativo = true` por padrão.

### 3.2. Consulta
- **RN-043**: Usuários só podem listar fazendas próprias (`idUsuario`).
- **RN-044**: Listagem suporta paginação com `page` e `pageSize`.
- **RN-045**: Listagem suporta filtros via `options.where`.
- **RN-046**: Listagem suporta ordenação via `options.order`.

### 3.3. Atualização e Exclusão
- **RN-047**: Apenas o dono da fazenda pode atualizar/excluir.
- **RN-048**: CNPJ único é validado em atualizações.

---

## 4. Fornecedores

### 4.1. Criação
- **RN-049**: O ID do usuário é obrigatório para criar um fornecedor.
- **RN-050**: CNPJ é obrigatório e deve ser único.
- **RN-051**: Razão social é obrigatória.
- **RN-052**: Se CNPJ já existir, retorna `ConflictException` (409).
- **RN-053**: O fornecedor é vinculado ao usuário através de `idUsuario`.
- **RN-054**: Fornecedores são criados com `ativo = true` por padrão.

### 4.2. Consulta
- **RN-055**: Usuários só podem listar fornecedores próprios (`idUsuario`).
- **RN-056**: Listagem suporta paginação e filtros.

---

## 4.7. Modelo Entidade Relacionamento

### 4.7.1. Padrão de Auditoria

Todas as tabelas do sistema seguem um padrão comum de campos de auditoria para rastreabilidade e controle:

#### Campos Padrão de Auditoria

- **`id`** (Int, Primary Key, Auto Increment)
  - Identificador único de cada registro
  - Tipo: Integer com auto incremento
  - Obrigatório em todas as tabelas

- **`createdBy`** (String?, VarChar(255))
  - Email ou identificador do usuário que criou o registro
  - Opcional, mas preenchido automaticamente pelo sistema
  - Armazena quem realizou a criação

- **`dateCreated`** (DateTime, Timestamp)
  - Data e hora de criação do registro
  - Preenchido automaticamente com `@default(now())`
  - Não pode ser modificado manualmente

- **`dateModified`** (DateTime, Timestamp)
  - Data e hora da última modificação
  - Atualizado automaticamente com `@updatedAt` a cada alteração
  - Mantém histórico de quando houve mudanças

- **`modifiedBy`** (String?, VarChar(255))
  - Email ou identificador do usuário que modificou o registro
  - Opcional, mas preenchido automaticamente em atualizações
  - Rastreia quem fez a última alteração

- **`ativo`** (Boolean, Default: true)
  - Indica se o registro está ativo no sistema
  - Padrão: `true` (ativo)
  - Usado para soft delete (desativação ao invés de exclusão física)
  - Permite reativação de registros

#### Regras de Auditoria

- **RN-AUD-001**: Todos os registros são criados com `ativo = true` por padrão.
- **RN-AUD-002**: `dateCreated` é definido automaticamente na criação e nunca alterado.
- **RN-AUD-003**: `dateModified` é atualizado automaticamente a cada operação de UPDATE.
- **RN-AUD-004**: `createdBy` e `modifiedBy` armazenam o email do usuário autenticado.
- **RN-AUD-005**: Campos de auditoria não podem ser modificados diretamente pelo cliente.

---

### 4.7.2. Enumeradores (Enums)

O sistema utiliza enums para garantir consistência e validação de dados:

#### ROLE
- **ADMIN**: Administrador do sistema (acesso total)
- **USER**: Usuário comum (acesso padrão)

#### CategoriaEstoqueEnum
- **DEFENSIVOS**: Produtos defensivos agrícolas
- **FERTILIZANTES**: Fertilizantes e adubos
- **SEMENTES**: Sementes para plantio
- **CONDICIONADORES**: Condicionadores de solo
- **FERRAMENTAS**: Ferramentas agrícolas
- **EQUIPAMENTOS**: Equipamentos e maquinários
- **EMBALAGENS**: Embalagens e recipientes

#### StatusEstoqueEnum
- **DISPONIVEL**: Produto disponível para uso
- **EM_USO**: Produto em uso atual
- **ESGOTADO**: Estoque esgotado
- **DANIFICADO**: Produto danificado
- **EXPIRADO**: Produto com validade vencida

#### UnidadeMedidaEnum
- **QUILO**: Quilogramas (kg)
- **GRAMA**: Gramas (g)
- **LITRO**: Litros (L)
- **METRO**: Metros (m)
- **CENTIMETRO**: Centímetros (cm)
- **METRO_QUADRADO**: Metros quadrados (m²)
- **METRO_CUBICO**: Metros cúbicos (m³)
- **TONELADA**: Toneladas (t)

#### TipoPlantaEnum
- **SOJA**: Soja
- **MILHO**: Milho
- **FEIJAO**: Feijão
- **ARROZ**: Arroz
- **CAFE**: Café
- **ALGODAO**: Algodão
- **BANANA**: Banana
- **LARANJA**: Laranja

#### TipoSoloEnum
- **ARENOSO**: Solo arenoso
- **ARGILOSO**: Solo argiloso
- **SILTOSO**: Solo siltoso
- **MISTO**: Solo misto
- **HUMIFERO**: Solo humífero
- **CALCARIO**: Solo calcário
- **GLEISSOLO**: Gleissolo
- **LATOSSOLO**: Latossolo
- **CAMBISSOLO**: Cambissolo
- **ORGANOSSOLO**: Organossolo
- **NEOSSOLO**: Neossolo
- **PLANOSSOLO**: Planossolo
- **VERTISSOLO**: Vertissolo

#### StatusPlantioEnum
- **PLANEJADO**: Plantio planejado (ainda não executado)
- **EXECUTADO**: Plantio executado
- **EM_MONITORAMENTO**: Em fase de monitoramento
- **CONCLUIDO**: Plantio concluído (colheita realizada)

#### UnidadeDoseEnum
- **KG_HA**: Quilogramas por hectare
- **G_HA**: Gramas por hectare
- **ML_HA**: Mililitros por hectare
- **L_HA**: Litros por hectare
- **TON_HA**: Toneladas por hectare

#### TipoOperacaoEnum
- **CREATE**: Criação de registro
- **UPDATE**: Atualização de registro
- **DELETE**: Exclusão de registro
- **DEACTIVATE**: Desativação de registro
- **ACTIVATE**: Ativação de registro
- **READ**: Leitura de registro

---

### 4.7.3. Tabelas do Sistema

#### 4.7.3.1. Usuario (usuario)

**Descrição**: Armazena informações dos usuários do sistema.

**Campos de Auditoria Padrão**: ✅ Todos (id, createdBy, dateCreated, dateModified, modifiedBy, ativo)

**Campos Específicos**:
- `email` (String, Unique, Obrigatório): Email único do usuário
- `password` (String, Obrigatório): Senha hasheada com bcrypt
- `cpf` (String?, Unique, Opcional): CPF único quando informado
- `nome` (String, Obrigatório): Nome completo do usuário
- `telefone` (String?, Opcional): Telefone de contato
- `role` (ROLE, Default: USER): Papel do usuário no sistema
- `idPlano` (Int?, Opcional): Referência a plano de assinatura
- `resetPasswordToken` (String?, Opcional): Token para recuperação de senha
- `resetPasswordExpires` (DateTime?, Opcional): Data de expiração do token

**Foreign Keys**:
- Nenhuma (tabela raiz)

**Relacionamentos**:
- `fazendas`: Um usuário pode ter múltiplas fazendas (1:N)
- `fornecedores`: Um usuário pode ter múltiplos fornecedores (1:N)
- `cultivares`: Um usuário pode ter múltiplas cultivares (1:N)
- `analisesSolo`: Um usuário pode ter múltiplas análises de solo (1:N)
- `logs`: Um usuário pode ter múltiplos logs (1:N)

**Regras Específicas**:
- Email deve ser único no sistema
- CPF deve ser único quando informado
- Senha nunca é retornada nas consultas (sanitização)
- Token de reset expira em 30 minutos

---

#### 4.7.3.2. Fazenda (fazenda)

**Descrição**: Representa propriedades rurais dos usuários.

**Campos de Auditoria Padrão**: ✅ Todos

**Campos Específicos**:
- `nome` (String, Obrigatório): Nome da fazenda
- `latitude` (Float, Obrigatório): Coordenada geográfica latitude
- `longitude` (Float, Obrigatório): Coordenada geográfica longitude
- `areaTotal` (Float?, Opcional): Área total em hectares
- `cnpj` (String?, Unique, Opcional): CNPJ único quando informado
- `soloPredominante` (String?, Opcional): Tipo de solo predominante
- `cultivoPredominante` (String?, Opcional): Cultivo predominante
- `municipio` (String?, Opcional): Município da fazenda
- `uf` (String?, Opcional): Unidade federativa (2 caracteres)

**Foreign Keys**:
- `idUsuario` → `Usuario.id` (Obrigatório): Proprietário da fazenda

**Relacionamentos**:
- `usuario`: Uma fazenda pertence a um usuário (N:1)
- `produtosEstoque`: Uma fazenda pode ter múltiplos produtos em estoque (1:N)
- `plantios`: Uma fazenda pode ter múltiplos plantios (1:N)
- `talhoes`: Uma fazenda pode ter múltiplos talhões (1:N)
- `zonasManejo`: Uma fazenda pode ter múltiplas zonas de manejo (1:N)

**Regras Específicas**:
- CNPJ deve ser único quando informado
- Latitude e longitude são obrigatórias para geolocalização
- Usuário só pode acessar fazendas próprias

---

#### 4.7.3.3. Fornecedor (fornecedor)

**Descrição**: Armazena informações de fornecedores de produtos e serviços.

**Campos de Auditoria Padrão**: ✅ Todos

**Campos Específicos**:
- `cnpj` (String, Unique, Obrigatório): CNPJ único do fornecedor
- `razaoSocial` (String, Obrigatório): Razão social
- `nomeFantasia` (String?, Opcional): Nome fantasia
- `responsavel` (String?, Opcional): Nome do responsável
- `email` (String?, Opcional): Email de contato
- `telefone` (String?, Opcional): Telefone de contato
- `linkSite` (String?, Opcional): URL do site
- `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `cep` (String?, Opcional): Endereço completo
- `observacao` (String?, Opcional): Observações gerais

**Foreign Keys**:
- `idUsuario` → `Usuario.id` (Obrigatório): Usuário que cadastrou o fornecedor

**Relacionamentos**:
- `usuario`: Um fornecedor é cadastrado por um usuário (N:1)
- `produtosEstoque`: Um fornecedor pode fornecer múltiplos produtos (1:N)
- `cultivares`: Um fornecedor pode fornecer múltiplas cultivares (1:N)

**Regras Específicas**:
- CNPJ é obrigatório e único
- Razão social é obrigatória

---

#### 4.7.3.4. Praga (praga)

**Descrição**: Catálogo de pragas que podem afetar as culturas.

**Campos de Auditoria Padrão**: ⚠️ Parcial (id, dateCreated, dateModified, createdBy, modifiedBy)
- **Não possui campo `ativo`**: Pragas são permanentes no catálogo

**Campos Específicos**:
- `nomeCientifico` (String, Obrigatório): Nome científico da praga
- `nomeComum` (String, Obrigatório): Nome comum/popular
- `descricao` (String?, Opcional): Descrição detalhada

**Foreign Keys**:
- Nenhuma (tabela independente)

**Relacionamentos**:
- `cultivares`: Uma praga pode afetar múltiplas cultivares (1:N)

**Regras Específicas**:
- Nome científico e comum são obrigatórios
- Pode ser criada independentemente ou durante criação de cultivar

---

#### 4.7.3.5. Cultivar (cultivar)

**Descrição**: Armazena informações sobre variedades de plantas cultivadas.

**Campos de Auditoria Padrão**: ✅ Todos

**Campos Específicos**:
- `nomeCientifico` (String?, Opcional): Nome científico
- `nomePopular` (String, Obrigatório): Nome popular/comum
- `tipoPlanta` (TipoPlantaEnum, Obrigatório): Tipo de planta (enum)
- `tipoSolo` (TipoSoloEnum, Obrigatório): Tipo de solo ideal (enum)
- `phSolo` (Float?, Opcional): pH ideal do solo
- `dataPlantioInicio` (DateTime?, Opcional): Data inicial recomendada para plantio
- `dataPlantioFim` (DateTime?, Opcional): Data final recomendada para plantio
- `periodoDias` (Int?, Opcional): Período de plantio em dias
- `mmAgua` (Float?, Opcional): Necessidade de água em mm
- `aduboNitrogenio`, `aduboFosforo`, `aduboPotassio`, `aduboCalcio`, `aduboMagnesio` (Float?, Opcional): Exigências nutricionais em kg/ha
- `tempoCicloDias` (Int?, Opcional): Tempo de ciclo em dias
- `densidadePlantio` (Float?, Opcional): Densidade recomendada de plantio
- `densidadeColheita` (Float?, Opcional): Densidade esperada na colheita
- `observacao` (String?, Opcional): Observações gerais

**Foreign Keys**:
- `idUsuario` → `Usuario.id` (Obrigatório): Usuário proprietário
- `idPraga` → `Praga.id` (Opcional): Praga associada
- `idFornecedor` → `Fornecedor.id` (Opcional): Fornecedor da cultivar

**Relacionamentos**:
- `usuario`: Uma cultivar pertence a um usuário (N:1)
- `praga`: Uma cultivar pode ter uma praga associada (N:1, Opcional)
- `fornecedor`: Uma cultivar pode ter um fornecedor (N:1, Opcional)
- `plantios`: Uma cultivar pode ser usada em múltiplos plantios (1:N)

**Regras Específicas**:
- Nome popular é obrigatório
- Tipo de planta e tipo de solo são obrigatórios (enums)
- Pode criar praga automaticamente durante criação

---

#### 4.7.3.6. AnaliseSolo (analise_solo)

**Descrição**: Armazena resultados de análises de solo.

**Campos de Auditoria Padrão**: ✅ Todos

**Campos Específicos**:
- `ph` (Float?, Opcional): pH do solo
- `areaTotal` (Float?, Opcional): Área total analisada em hectares
- `hAi` (Float?, Opcional): H+Al (acidez potencial)
- `sb` (Float?, Opcional): Soma de bases (SB)
- `ctc` (Float?, Opcional): Capacidade de troca catiônica (CTC)
- `v` (Float?, Opcional): Saturação por bases (V%)
- `m` (Float?, Opcional): Saturação por alumínio (M%)
- `mo` (Float?, Opcional): Matéria orgânica (MO)
- `prnt` (Float?, Opcional): Poder relativo de neutralização total (PRNT)
- `valorCultural` (Float?, Opcional): Valor cultural para calagem
- `n` (Float?, Opcional): Nitrogênio disponível (mg/dm³)
- `p` (Float?, Opcional): Fósforo disponível (mg/dm³)
- `k` (Float?, Opcional): Potássio disponível (mg/dm³)

**Foreign Keys**:
- `idUsuario` → `Usuario.id` (Obrigatório): Usuário proprietário da análise

**Relacionamentos**:
- `usuario`: Uma análise pertence a um usuário (N:1)
- `plantios`: Uma análise pode ser vinculada a múltiplos plantios (1:N)

**Regras Específicas**:
- Todos os campos técnicos são opcionais
- Usado para cálculos de calagem e adubação
- Vinculada a plantios para recomendações

---

#### 4.7.2.1. Entidade Plantio (plantio)

**Descrição**: A entidade Plantio representa a execução da atividade agrícola em uma fazenda. Armazena todas as informações relacionadas ao ciclo completo do plantio, desde o planejamento até a colheita, incluindo dados técnicos, financeiros e de monitoramento.

**Campos de Auditoria Padrão**: ✅ Todos (id, createdBy, dateCreated, dateModified, modifiedBy, ativo)

---

#### 4.7.3.7. Plantio (plantio)

**Descrição**: Registra informações sobre plantios realizados nas fazendas.

**Campos de Auditoria Padrão**: ✅ Todos

**Atributos da Entidade Plantio**:

**Identificação**:
- `id` (Int, Primary Key): Identificador único do plantio

**Datas do Ciclo**:
- `dataPlantio` (DateTime, Obrigatório): Data do plantio
- `dataEmergencia` (DateTime?, Opcional): Data de emergência das plantas
- `dataMaturacao` (DateTime?, Opcional): Data de maturação
- `dataPrevistaColheita` (DateTime?, Opcional): Data prevista para colheita

**Área e Densidades**:
- `areaPlantada` (Float, Obrigatório): Área plantada em hectares
- `densidadePlanejada` (Float, Obrigatório): Densidade planejada (plantas/ha)
- `densidadePlantioReal` (Float, Obrigatório): Densidade real efetiva (plantas/ha)

**Dados de Irrigação**:
- `mmAguaAplicado` (Float, Obrigatório): Lâmina de água aplicada (mm)
- `irrigacaoVolume` (Float?, Opcional): Volume irrigado (mm)
- `irrigacaoDuracao` (Int?, Opcional): Duração da irrigação (minutos)

**Adubação e Defensivos**:
- `aduboNitrogenioDose` (Float?, Opcional): Dose de nitrogênio
- `aduboNitrogenioUnidade` (UnidadeDoseEnum?, Opcional): Unidade da dose de nitrogênio
- `aduboFosforoDose` (Float?, Opcional): Dose de fósforo
- `aduboFosforoUnidade` (UnidadeDoseEnum?, Opcional): Unidade da dose de fósforo
- `aduboPotassioDose` (Float?, Opcional): Dose de potássio
- `aduboPotassioUnidade` (UnidadeDoseEnum?, Opcional): Unidade da dose de potássio
- `defensivoUtilizado` (String?, Opcional): Nome do defensivo utilizado
- `doseDefensivo` (Float?, Opcional): Dose do defensivo aplicado
- `unidadeDefensivo` (UnidadeDoseEnum?, Opcional): Unidade da dose do defensivo

**Rendimento e Custos Agrícolas**:
- `rendimentoEstimado` (Float?, Opcional): Rendimento estimado (kg/ha)
- `custoSemente` (Float?, Opcional): Custo de sementes (R$/ha)
- `custoFertilizante` (Float?, Opcional): Custo de fertilizantes (R$/ha)
- `custoDefensivo` (Float?, Opcional): Custo de defensivos (R$/ha)
- `custoCombustivel` (Float?, Opcional): Custo de combustível (R$)
- `custoOutros` (Float?, Opcional): Outros custos (R$)
- `custoTotal` (Float?, Opcional): Custo total do plantio (R$)

**Status e Observações**:
- `statusPlantio` (StatusPlantioEnum, Default: PLANEJADO): Status atual do plantio
- `observacao` (String?, Opcional): Observações gerais sobre o plantio

**Dados Adicionais de Semeadura**:
- `phSoloInicial` (Float?, Opcional): pH do solo antes do plantio
- `umidadeSoloInicial` (Float?, Opcional): Umidade do solo ao plantar (%)
- `loteSemente` (String?, Opcional): Código do lote de semente
- `taxaGerminacao` (Float?, Opcional): Taxa de germinação (%)
- `tratamentoSemente` (String?, Opcional): Tratamento aplicado na semente (fungicida, inoculante, etc.)
- `profundidadeSemeadura` (Float?, Opcional): Profundidade de semeadura (cm)
- `espacamentoEntreLinhas` (Float?, Opcional): Espaçamento entre linhas (cm)
- `orientacaoTransplantio` (String?, Opcional): Orientação do transplantio (N-S, L-O, etc.)

**Foreign Keys**:
- `idCultivar` (Int, Obrigatório): Referência à cultivar plantada
- `idFazenda` (Int, Obrigatório): Referência à fazenda onde ocorre o plantio
- `idTalhao` (Int?, Opcional): Referência ao talhão (parcela da fazenda); quando informado, o plantio fica vinculado à parcela
- `idAnaliseSolo` (Int?, Opcional): Referência à análise de solo vinculada

**Campos de Auditoria**:
- `ativo` (Boolean, Default: true): Indica se o plantio está ativo
- `createdBy` (String?, Opcional): Email do usuário que criou
- `dateCreated` (DateTime, Auto): Data de criação
- `dateModified` (DateTime, Auto): Data da última modificação
- `modifiedBy` (String?, Opcional): Email do usuário que modificou

**Enums Utilizados**:
- **StatusPlantioEnum**: Define o status do plantio
  - `PLANEJADO`: Plantio planejado (ainda não executado)
  - `EXECUTADO`: Plantio executado
  - `EM_MONITORAMENTO`: Em fase de monitoramento
  - `CONCLUIDO`: Plantio concluído (colheita realizada)
  
- **UnidadeDoseEnum**: Define as unidades de medida para doses de adubação e defensivos
  - `KG_HA`: Quilogramas por hectare
  - `G_HA`: Gramas por hectare
  - `ML_HA`: Mililitros por hectare
  - `L_HA`: Litros por hectare
  - `TON_HA`: Toneladas por hectare

**Campos Específicos** (versão detalhada):
- `dataPlantio` (DateTime, Obrigatório): Data do plantio
- `dataEmergencia` (DateTime?, Opcional): Data de emergência das plantas
- `dataPrevistaColheita` (DateTime?, Opcional): Data prevista para colheita
- `dataMaturacao` (DateTime?, Opcional): Data de maturação
- `areaPlantada` (Float, Obrigatório): Área plantada em hectares
- `densidadePlanejada` (Float, Obrigatório): Densidade planejada (plantas/ha)
- `densidadePlantioReal` (Float, Obrigatório): Densidade real efetiva (plantas/ha)
- `phSoloInicial` (Float?, Opcional): pH do solo antes do plantio
- `umidadeSoloInicial` (Float?, Opcional): Umidade do solo ao plantar (%)
- `loteSemente` (String?, Opcional): Código do lote de semente
- `taxaGerminacao` (Float?, Opcional): Taxa de germinação (%)
- `tratamentoSemente` (String?, Opcional): Tratamento aplicado na semente
- `profundidadeSemeadura` (Float?, Opcional): Profundidade em cm
- `espacamentoEntreLinhas` (Float?, Opcional): Espaçamento em cm
- `orientacaoTransplantio` (String?, Opcional): Orientação (N-S, L-O, etc.)
- `mmAguaAplicado` (Float, Obrigatório): Lâmina de água aplicada (mm)
- `irrigacaoVolume`, `irrigacaoDuracao` (Float?, Int?, Opcional): Dados de irrigação
- `aduboNitrogenioDose`, `aduboFosforoDose`, `aduboPotassioDose` (Float?, Opcional): Doses de adubação
- `aduboNitrogenioUnidade`, `aduboFosforoUnidade`, `aduboPotassioUnidade` (UnidadeDoseEnum?, Opcional): Unidades das doses
- `defensivoUtilizado` (String?, Opcional): Defensivo utilizado
- `doseDefensivo`, `unidadeDefensivo` (Float?, UnidadeDoseEnum?, Opcional): Dose e unidade do defensivo
- `rendimentoEstimado` (Float?, Opcional): Rendimento estimado (kg/ha)
- `custoSemente`, `custoFertilizante`, `custoDefensivo`, `custoCombustivel`, `custoOutros`, `custoTotal` (Float?, Opcional): Custos em R$
- `statusPlantio` (StatusPlantioEnum, Default: PLANEJADO): Status do plantio (enum)
- `observacao` (String?, Opcional): Observações gerais

**Foreign Keys**:
- `idCultivar` → `Cultivar.id` (Obrigatório, onDelete: Restrict): Cultivar plantada
- `idFazenda` → `Fazenda.id` (Obrigatório, onDelete: Restrict): Fazenda do plantio
- `idTalhao` → `Talhao.id` (Opcional, onDelete: SetNull): Talhão (parcela) da fazenda
- `idAnaliseSolo` → `AnaliseSolo.id` (Opcional, onDelete: Cascade): Análise de solo vinculada

**Relacionamentos**:
- `cultivar`: Um plantio usa uma cultivar (N:1)
- `fazenda`: Um plantio pertence a uma fazenda (N:1)
- `talhao`: Um plantio pode estar vinculado a um talhão (N:1, Opcional)
- `analiseSolo`: Um plantio pode ter uma análise de solo (N:1, Opcional)
- `operacoes`: Um plantio pode ter várias operações/etapas (1:N)

**Regras Específicas**:
- Cultivar e fazenda são obrigatórias
- Análise de solo é opcional mas necessária para cálculos de calagem e adubação
- Status padrão é PLANEJADO
- Restrict em cultivar/fazenda: não permite deletar se houver plantios vinculados
- Cascade em análise: deleta análise se plantio for deletado
- Densidade real padrão é igual à densidade planejada se não informada
- MM de água aplicado é obrigatório para controle de irrigação
- Custos podem ser informados por categoria ou apenas o total

---

#### 4.7.3.8. ProdutosEstoque (produtos_estoque)

**Descrição**: Gerencia estoque de produtos das fazendas.

**Campos de Auditoria Padrão**: ✅ Todos

**Campos Específicos**:
- `nome` (String?, Opcional): Nome do produto
- `descricao` (String?, Opcional): Descrição do produto
- `marca` (String?, Opcional): Marca do produto
- `quantidade` (Int, Default: 0): Quantidade em estoque
- `valorUnitario` (Float, Default: 0.0): Valor unitário do produto
- `unidadeMedida` (UnidadeMedidaEnum, Obrigatório): Unidade de medida (enum)
- `dataValidade` (DateTime?, Opcional): Data de validade
- `categoria` (CategoriaEstoqueEnum, Obrigatório): Categoria do produto (enum)
- `status` (StatusEstoqueEnum, Obrigatório): Status atual do estoque (enum)

**Foreign Keys**:
- `idFazenda` → `Fazenda.id` (Obrigatório): Fazenda que possui o estoque
- `idFornecedor` → `Fornecedor.id` (Obrigatório): Fornecedor do produto

**Relacionamentos**:
- `fazenda`: Um produto pertence a uma fazenda (N:1)
- `fornecedor`: Um produto é fornecido por um fornecedor (N:1)

**Regras Específicas**:
- Quantidade padrão é 0
- Valor unitário padrão é 0.0
- Categoria e status são obrigatórios (enums)
- Unidade de medida é obrigatória (enum)
- Suporta aumento e remoção de quantidade com validações

---

#### 4.7.3.9. Log (log) ⭐ TABELA ESPECIAL

**Descrição**: Sistema de auditoria e rastreabilidade de todas as operações do sistema.

**Campos de Auditoria Padrão**: ⚠️ Parcial
- **Possui**: `id`, `dateCreated`
- **Não possui**: `createdBy`, `dateModified`, `modifiedBy`, `ativo`
- **Motivo**: Logs são imutáveis e não podem ser modificados ou desativados

**Campos Específicos**:
- `tipoOperacao` (TipoOperacaoEnum, Obrigatório): Tipo da operação registrada (CREATE, UPDATE, DELETE, etc.)
- `tabela` (String, VarChar(100), Obrigatório): Nome da tabela afetada
- `idRegistro` (Int?, Opcional): ID do registro afetado na tabela
- `dadosAnteriores` (Json?, Opcional): Dados do registro antes da operação (JSON)
- `dadosNovos` (Json?, Opcional): Dados do registro após a operação (JSON)
- `descricao` (String?, Text, Opcional): Descrição textual da operação
- `idUsuario` (Int?, Opcional): ID do usuário que realizou a operação
- `emailUsuario` (String?, VarChar(255), Opcional): Email do usuário (redundante para consultas rápidas)
- `ipAddress` (String?, VarChar(45), Opcional): Endereço IP da requisição
- `userAgent` (String?, VarChar(500), Opcional): User agent do cliente (navegador/app)

**Foreign Keys**:
- `idUsuario` → `Usuario.id` (Opcional, onDelete: SetNull): Usuário que realizou a operação

**Relacionamentos**:
- `usuario`: Um log pode estar associado a um usuário (N:1, Opcional)

**Índices** (Performance):
- `@@index([tabela])`: Índice para busca por tabela
- `@@index([idRegistro])`: Índice para busca por registro específico
- `@@index([tipoOperacao])`: Índice para busca por tipo de operação
- `@@index([idUsuario])`: Índice para busca por usuário
- `@@index([dateCreated])`: Índice para ordenação temporal

**Regras Específicas**:
- **Imutabilidade**: Logs nunca são modificados ou deletados
- **Registro Automático**: Todas as operações CREATE, UPDATE, DELETE, DEACTIVATE, ACTIVATE são logadas automaticamente
- **Assíncrono**: Logs são salvos de forma assíncrona para não bloquear a resposta
- **Sanitização**: Campos sensíveis (password, token, secret) são ocultados como '[HIDDEN]'
- **Dados JSON**: `dadosAnteriores` e `dadosNovos` armazenam snapshots completos em JSON
- **Rastreabilidade**: Captura IP, user agent e email para auditoria completa
- **SetNull**: Se usuário for deletado, `idUsuario` é setado como null (mantém histórico)
- **Consulta**: Logs podem ser consultados por tabela, usuário, tipo de operação ou data

**Casos de Uso**:
- Auditoria de alterações em dados críticos
- Rastreamento de ações dos usuários
- Recuperação de dados após exclusões acidentais
- Análise de uso do sistema
- Compliance e segurança

---

#### 4.7.3.10. Talhao (talhao)

**Descrição**: Parcela de terra da fazenda. Base para custo, rotação e mapa (área por talhão). Pode possuir geometria GeoJSON para exibição no mapa.

**Campos de Auditoria Padrão**: ✅ Todos

**Campos Específicos**:
- `idFazenda` (Int, Obrigatório): Fazenda à qual o talhão pertence
- `nome` (String, Obrigatório): Nome do talhão
- `areaHa` (Float, Obrigatório): Área em hectares
- `geometria` (Json?, Opcional): GeoJSON Geometry (Polygon ou MultiPolygon) para mapa; coordenadas [longitude, latitude] (WGS84)
- `observacao` (String?, Opcional): Observações

**Foreign Keys**:
- `idFazenda` → `Fazenda.id` (Obrigatório, onDelete: Cascade): Fazenda do talhão

**Relacionamentos**:
- `fazenda`: Um talhão pertence a uma fazenda (N:1)
- `plantios`: Um talhão pode ter vários plantios (1:N)
- `operacoes`: Operações do plantio podem ser vinculadas ao talhão (1:N)
- `zonasManejo`: Zonas de manejo podem ser vinculadas ao talhão (1:N, opcional na zona)

**Regras Específicas**:
- Área deve ser > 0. Apenas usuário dono da fazenda pode criar/listar talhões.
- Endpoints: POST/GET /talhao, GET /talhao/fazenda/:idFazenda, GET /talhao/fazenda/:idFazenda/resumo, GET /talhao/fazenda/:idFazenda/mapa (GeoJSON FeatureCollection dos talhões com geometria).
- Geometria opcional na criação e atualização; formato GeoJSON Polygon ou MultiPolygon.

---

#### 4.7.3.11. OperacaoPlantio (operacao_plantio)

**Descrição**: Etapa/operação do plantio (preparo, semeadura, aplicação, irrigação, colheita). Rastreabilidade e custo por operação.

**Campos de Auditoria Padrão**: ✅ Todos

**Campos Específicos**:
- `idPlantio` (Int, Obrigatório): Plantio ao qual a operação pertence
- `idTalhao` (Int?, Opcional): Talhão quando a operação é por parcela
- `tipoEtapa` (TipoEtapaOperacaoEnum, Obrigatório): PREPARO_SOLO, SEMEADURA, APLICACAO_DEFENSIVO, APLICACAO_FERTILIZANTE, IRRIGACAO, COLHEITA, OUTROS
- `dataInicio` (Date, Obrigatório), `dataFim` (Date?, Opcional): Período da operação
- `areaHa` (Float, Obrigatório): Área em que a operação foi feita (ha)
- `custoTotal` (Float?, Opcional): Custo total (R$)
- `custoPorHa` (Float?, Opcional): Calculado: custoTotal / areaHa (R$/ha)

**Foreign Keys**:
- `idPlantio` → `Plantio.id` (Obrigatório, onDelete: Cascade)
- `idTalhao` → `Talhao.id` (Opcional, onDelete: SetNull)

**Relacionamentos**:
- `plantio`: Uma operação pertence a um plantio (N:1)
- `talhao`: Operação pode estar vinculada a um talhão (N:1, Opcional)
- `aplicacoes`: Uma operação pode ter várias aplicações (1:N)

**Regras Específicas**:
- areaHa não pode ser maior que a área plantada do plantio. custoPorHa calculado automaticamente quando custoTotal é informado.

---

#### 4.7.3.12. Aplicacao (aplicacao)

**Descrição**: Registro de aplicação de defensivo ou fertilizante em uma operação do plantio. Dose por ha → quantidade total (fórmula agronômica).

**Campos de Auditoria Padrão**: ✅ Todos

**Campos Específicos**:
- `idOperacaoPlantio` (Int, Obrigatório): Operação em que foi feita a aplicação
- `idProdutosEstoque` (Int?, Opcional): Produto do estoque (quando vinculado)
- `tipo` (TipoAplicacaoEnum, Obrigatório): DEFENSIVO ou FERTILIZANTE
- `nomeProduto` (String?, Opcional): Nome quando não vincula estoque
- `dosePorHa` (Float, Obrigatório): Dose por hectare
- `unidadeDose` (UnidadeDoseEnum, Obrigatório): KG_HA, G_HA, ML_HA, L_HA, TON_HA
- `quantidadeTotal` (Float?, Opcional): Calculado: dosePorHa × areaHa da operação
- `custoAplicacao` (Float?, Opcional): Custo (R$)
- `dataAplicacao` (Date, Obrigatório): Data da aplicação

**Foreign Keys**:
- `idOperacaoPlantio` → `OperacaoPlantio.id` (Obrigatório, onDelete: Cascade)
- `idProdutosEstoque` → `ProdutosEstoque.id` (Opcional, onDelete: SetNull)

**Relacionamentos**:
- `operacaoPlantio`: Uma aplicação pertence a uma operação (N:1)
- `produtoEstoque`: Pode estar vinculada a um produto do estoque (N:1, Opcional)

**Regras Específicas**:
- quantidadeTotal calculada automaticamente. Conforme bula e receituário agronômico (ver REFERENCIAS_AGRONOMIA.md).

---

#### 4.7.3.13. ZonaManejo (zona_manejo)

**Descrição**: Zona de manejo: área com critério de manejo (fertilidade, irrigação, produtividade, solo, etc.) com geometria GeoJSON para exibição no mapa.

**Campos de Auditoria Padrão**: ✅ Todos

**Campos Específicos**:
- `idFazenda` (Int, Obrigatório): Fazenda à qual a zona pertence
- `idTalhao` (Int?, Opcional): Talhão quando a zona é de uma parcela específica; quando null, a zona é da fazenda inteira
- `nome` (String, Obrigatório): Nome da zona
- `descricao` (String?, Opcional): Descrição
- `tipo` (String?, Opcional): Critério/tipo (ex.: fertilidade, irrigacao, produtividade, solo)
- `geometria` (Json, Obrigatório): GeoJSON Geometry (Polygon ou MultiPolygon)
- `cor` (String?, Opcional): Cor em hex (ex.: #4CAF50) para exibição no mapa

**Foreign Keys**:
- `idFazenda` → `Fazenda.id` (Obrigatório, onDelete: Cascade)
- `idTalhao` → `Talhao.id` (Opcional, onDelete: SetNull)

**Relacionamentos**:
- `fazenda`: Uma zona pertence a uma fazenda (N:1)
- `talhao`: Uma zona pode estar vinculada a um talhão (N:1, Opcional)

**Regras Específicas**:
- Apenas dono da fazenda pode criar/listar/atualizar/excluir zonas. Se idTalhao informado, o talhão deve pertencer à mesma fazenda. Endpoints: POST/GET/PUT/DELETE /zona-manejo, GET /zona-manejo/fazenda/:id, GET /zona-manejo/fazenda/:id/mapa (GeoJSON FeatureCollection).

---

### 4.7.4. Relacionamentos entre Tabelas

#### Hierarquia de Dependências

```
Usuario (raiz)
├── Fazenda
│   ├── Plantio
│   │   ├── Cultivar (referência)
│   │   ├── Talhao (referência opcional)
│   │   ├── AnaliseSolo (referência opcional)
│   │   └── OperacaoPlantio (1:N)
│   │       └── Aplicacao (1:N)
│   ├── Talhao (1:N) [com geometria GeoJSON opcional]
│   ├── ZonaManejo (1:N) [geometria GeoJSON, opcional idTalhao]
│   └── ProdutosEstoque
│       └── Fornecedor (referência)
├── Fornecedor
│   ├── ProdutosEstoque (referência)
│   └── Cultivar (referência)
├── Cultivar
│   ├── Praga (referência opcional)
│   └── Plantio (referência)
├── AnaliseSolo
│   └── Plantio (referência)
└── Log (referência opcional a todas as tabelas)
```

#### Regras de Integridade Referencial

- **Restrict**: Impede exclusão de registro se houver dependências
  - Exemplo: Não pode deletar `Cultivar` se houver `Plantio` usando ela
  
- **Cascade**: Exclui registros dependentes quando o pai é excluído
  - Exemplo: Deletar `Plantio` deleta `AnaliseSolo` vinculada
  
- **SetNull**: Define FK como null quando o registro referenciado é excluído
  - Exemplo: Deletar `Usuario` mantém `Log` mas remove referência

#### Cardinalidades

- **1:N (Um para Muitos)**:
  - Usuario → Fazenda, Fornecedor, Cultivar, AnaliseSolo
  - Fazenda → Plantio, ProdutosEstoque
  - Fornecedor → ProdutosEstoque, Cultivar
  - Cultivar → Plantio
  - AnaliseSolo → Plantio
  - Praga → Cultivar

- **N:1 (Muitos para Um)**:
  - Plantio → Cultivar, Fazenda, AnaliseSolo
  - ProdutosEstoque → Fazenda, Fornecedor
  - Log → Usuario (opcional)

---

### 4.7.5. Resumo de Foreign Keys

| Tabela | Campo FK | Referência | Obrigatório | onDelete |
|--------|----------|------------|-------------|----------|
| Fazenda | idUsuario | Usuario.id | ✅ Sim | Default |
| Fornecedor | idUsuario | Usuario.id | ✅ Sim | Default |
| Cultivar | idUsuario | Usuario.id | ✅ Sim | Default |
| Cultivar | idPraga | Praga.id | ❌ Não | Default |
| Cultivar | idFornecedor | Fornecedor.id | ❌ Não | Default |
| AnaliseSolo | idUsuario | Usuario.id | ✅ Sim | Default |
| Plantio | idCultivar | Cultivar.id | ✅ Sim | Restrict |
| Plantio | idFazenda | Fazenda.id | ✅ Sim | Restrict |
| Plantio | idTalhao | Talhao.id | ❌ Não | SetNull |
| Plantio | idAnaliseSolo | AnaliseSolo.id | ❌ Não | Cascade |
| Talhao | idFazenda | Fazenda.id | ✅ Sim | Cascade |
| OperacaoPlantio | idPlantio | Plantio.id | ✅ Sim | Cascade |
| OperacaoPlantio | idTalhao | Talhao.id | ❌ Não | SetNull |
| Aplicacao | idOperacaoPlantio | OperacaoPlantio.id | ✅ Sim | Cascade |
| Aplicacao | idProdutosEstoque | ProdutosEstoque.id | ❌ Não | SetNull |
| ProdutosEstoque | idFazenda | Fazenda.id | ✅ Sim | Default |
| ProdutosEstoque | idFornecedor | Fornecedor.id | ✅ Sim | Default |
| ZonaManejo | idFazenda | Fazenda.id | ✅ Sim | Cascade |
| ZonaManejo | idTalhao | Talhao.id | ❌ Não | SetNull |
| Log | idUsuario | Usuario.id | ❌ Não | SetNull |

---

**Última atualização**: 2026-02-19
**Versão do documento**: 1.3

---

## 5. Cultivares

### 5.1. Criação
- **RN-057**: O ID do usuário é obrigatório para criar uma cultivar.
- **RN-058**: Nome popular é obrigatório.
- **RN-059**: Tipo de planta é obrigatório (enum: SOJA, MILHO, FEIJAO, ARROZ, CAFE, ALGODAO, BANANA, LARANJA).
- **RN-060**: Tipo de solo é obrigatório (enum: ARENOSO, ARGILOSO, SILTOSO, etc.).
- **RN-061**: Se uma praga for informada no DTO, ela é criada automaticamente antes da cultivar.
- **RN-062**: A cultivar pode ser vinculada a um fornecedor existente (`idFornecedor`).
- **RN-063**: Datas de plantio (`dataPlantioInicio`, `dataPlantioFim`) são convertidas para Date.
- **RN-064**: A cultivar é vinculada ao usuário através de `idUsuario`.

### 5.2. Consulta
- **RN-065**: Usuários só podem listar cultivares próprias (`idUsuario`).
- **RN-066**: Busca por nome científico ou popular usa `contains` case-insensitive.
- **RN-067**: Listagem inclui relacionamentos: `praga` e `fornecedor`.
- **RN-068**: Método `checkUserCultivars` verifica quais tipos de plantas o usuário possui cultivares.

### 5.3. Validações
- **RN-069**: Retorna um objeto com boolean para cada tipo de planta indicando se o usuário possui cultivar.

---

## 6. Pragas

### 6.1. Criação
- **RN-070**: Nome científico é obrigatório.
- **RN-071**: Nome comum é obrigatório.
- **RN-072**: Descrição é opcional.
- **RN-073**: Pragas podem ser criadas independentemente ou durante criação de cultivar.

---

## 7. Plantios

### 7.1. Criação
- **RN-074**: ID da cultivar (`idCultivar`) é obrigatório.
- **RN-075**: ID da fazenda (`idFazenda`) é obrigatório.
- **RN-075b**: ID do talhão (`idTalhao`) é opcional; quando informado, o plantio fica vinculado à parcela (talhão) da fazenda.
- **RN-076**: Data de plantio é obrigatória e convertida para Date.
- **RN-077**: Área plantada é obrigatória (em hectares).
- **RN-078**: Densidade planejada é obrigatória (plantas/ha).
- **RN-079**: Densidade real padrão é igual à densidade planejada se não informada.
- **RN-080**: MM de água aplicado é obrigatório.
- **RN-081**: Datas opcionais (emergência, colheita, maturação) são convertidas para Date quando informadas.
- **RN-082**: Status padrão é `PLANEJADO`.
- **RN-083**: Plantios são criados com `ativo = true` por padrão.

### 7.2. Consulta por Fazenda
- **RN-084**: O ID do usuário é obrigatório para listar plantios de uma fazenda.
- **RN-085**: A fazenda deve existir e pertencer ao usuário logado.
- **RN-086**: Se a fazenda não pertencer ao usuário, retorna `BadRequestException`.
- **RN-087**: Listagem inclui relacionamentos: `cultivar`, `fazenda`, `analiseSolo`.
- **RN-088**: Ordenação padrão é por `dataPlantio` descendente.
- **RN-089**: Filtro por nome de cultivar usa busca case-insensitive.

### 7.3. Consulta por Tipo de Planta
- **RN-090**: Lista plantios de uma fazenda filtrados por tipo de planta.
- **RN-091**: Inclui dados completos de análise de solo quando disponível.

### 7.4. Talhões
- **RN-TAL-001**: Talhão é uma parcela de terra da fazenda; base para custo, rotação e mapa. Campos obrigatórios: `idFazenda`, `nome`, `areaHa` (área em hectares).
- **RN-TAL-002**: Só é possível criar talhão em fazenda que pertença ao usuário logado (`idUsuario` da fazenda = usuário autenticado). Caso contrário retorna `BadRequestException`.
- **RN-TAL-003**: Área do talhão (`areaHa`) deve ser maior que zero (validação `Min(0.01)`).
- **RN-TAL-004**: `GET /talhao/fazenda/:idFazenda`: lista talhões da fazenda (apenas ativos). Exige que a fazenda pertença ao usuário. Suporta paginação (`page`, `pageSize`).
- **RN-TAL-005**: `GET /talhao/fazenda/:idFazenda/resumo`: retorna área total (ha), quantidade de talhões e lista de talhões com id, nome e área. Usado como base para custo, rotação e mapa.
- **RN-TAL-006**: Talhões são criados com `ativo = true` por padrão. Ordenação na listagem: por `nome` ascendente.
- **RN-TAL-007**: O talhão pode possuir **geometria** (GeoJSON) opcional para exibição no mapa. Formato: objeto GeoJSON do tipo **Polygon** ou **MultiPolygon** (coordenadas em [longitude, latitude]). Na criação (POST) e na atualização (PUT) o campo `geometria` é opcional; quando informado, deve ser um objeto válido (type + coordinates).
- **RN-TAL-008**: `GET /talhao/fazenda/:idFazenda/mapa`: retorna **GeoJSON FeatureCollection** apenas dos talhões que possuem geometria. Cada feature contém `type: "Feature"`, `geometry` (objeto GeoJSON) e `properties` (id, nome, areaHa). Talhões sem geometria são omitidos. Exige que a fazenda pertença ao usuário.

### 7.5. Operações do plantio (etapas)
- **RN-OPE-001**: Operação do plantio representa uma etapa do ciclo (preparo, semeadura, aplicação de defensivo/fertilizante, irrigação, colheita, outros). Campos obrigatórios: `idPlantio`, `tipoEtapa`, `dataInicio`, `areaHa`.
- **RN-OPE-002**: Tipos de etapa (`TipoEtapaOperacaoEnum`): PREPARO_SOLO, SEMEADURA, APLICACAO_DEFENSIVO, APLICACAO_FERTILIZANTE, IRRIGACAO, COLHEITA, OUTROS.
- **RN-OPE-003**: A área da operação (`areaHa`) não pode ser maior que a área plantada do plantio. Caso contrário retorna `BadRequestException`.
- **RN-OPE-004**: Custo por hectare é calculado automaticamente: `custoPorHa = custoTotal / areaHa` quando `custoTotal` é informado. Arredondamento em 2 decimais.
- **RN-OPE-005**: `idTalhao` é opcional; quando informado, a operação fica vinculada ao talhão (rastreabilidade por parcela).
- **RN-OPE-006**: `GET /operacao-plantio/plantio/:idPlantio`: lista operações do plantio (ativas), ordenadas por `dataInicio` ascendente. Inclui dados do talhão quando houver.

### 7.6. Aplicações (defensivo/fertilizante)
- **RN-APL-001**: Aplicação registra o uso de defensivo ou fertilizante em uma operação do plantio. Campos obrigatórios: `idOperacaoPlantio`, `tipo` (DEFENSIVO ou FERTILIZANTE), `dosePorHa`, `unidadeDose`, `dataAplicacao`.
- **RN-APL-002**: A quantidade total é calculada automaticamente: `quantidadeTotal = dosePorHa × areaHa` da operação vinculada (fórmula agronômica: dose por unidade de área × área tratada).
- **RN-APL-003**: Unidades de dose (`UnidadeDoseEnum`): KG_HA, G_HA, ML_HA, L_HA, TON_HA. Devem estar de acordo com bula/receituário agronômico.
- **RN-APL-004**: Pode-se vincular a um produto do estoque (`idProdutosEstoque`) ou informar apenas `nomeProduto` quando não houver vínculo com estoque.
- **RN-APL-005**: `GET /aplicacao/operacao/:idOperacaoPlantio`: lista aplicações da operação (ativas), ordenadas por `dataAplicacao` ascendente. Inclui dados do produto de estoque quando houver.

### 7.7. Custo por operação e por safra
- **RN-CUS-001**: Custo por operação: cada registro de `OperacaoPlantio` pode ter `custoTotal` (R$) e `custoPorHa` (R$/ha) calculado automaticamente (ver RN-OPE-004).
- **RN-CUS-002**: Safra é definida pelo **ano civil da data de plantio** (ex.: safra 2025 = plantios com `dataPlantio` no ano 2025). Alinhado a práticas CONAB/EMBRAPA.
- **RN-CUS-003**: `GET /plantio/fazenda/:idFazenda/custo-safra?ano=YYYY`: retorna custo total da safra, área total (ha), custo por ha da safra, quantidade de plantios e resumo por tipo de operação (tipoEtapa, custoTotal, quantidade de operações). Exige que a fazenda pertença ao usuário.
- **RN-CUS-004**: O parâmetro `ano` é obrigatório na query e deve ser um ano válido (ex.: 2000–2100). Caso contrário retorna `BadRequestException`.
- **RN-CUS-005**: O custo total da safra considera a soma de `plantio.custoTotal` dos plantios da fazenda no ano; o resumo por operação considera a soma dos `custoTotal` das operações desses plantios. Custo por ha da safra = custoTotalSafra / areaTotalHa (quando areaTotalHa > 0).

---

## 8. Mapa (GeoJSON) e Zonas de manejo

Este módulo reúne as regras de **geometria (shape/GeoJSON)** para talhões, **zonas de manejo** e o **endpoint de mapa agregado** da fazenda.

### 8.1. Geometria nos talhões (mapa de talhões)
- **RN-MAP-001**: O talhão pode ter campo opcional **geometria** (Json): objeto GeoJSON do tipo **Polygon** ou **MultiPolygon**. Coordenadas no formato [longitude, latitude] (WGS84). Usado para desenhar o contorno do talhão no mapa.
- **RN-MAP-002**: Na criação (POST /talhao) e na atualização (PUT /talhao/:id), `geometria` é opcional. Se informado, deve ser um objeto com `type` e `coordinates` válidos.
- **RN-MAP-003**: `GET /talhao/fazenda/:idFazenda/mapa`: retorna GeoJSON FeatureCollection somente dos talhões que possuem geometria; talhões sem geometria são omitidos. Cada feature tem `geometry` e `properties` (id, nome, areaHa). A fazenda deve pertencer ao usuário.

### 8.2. Zonas de manejo
- **RN-ZM-001**: **Zona de manejo** é uma área com critério de manejo específico (ex.: fertilidade, irrigação, produtividade, solo). Possui geometria GeoJSON (Polygon ou MultiPolygon) obrigatória, nome, e opcionalmente descrição, tipo, cor (hex) e vínculo a um talhão.
- **RN-ZM-002**: Campos obrigatórios na criação: `idFazenda`, `nome`, `geometria`. Opcionais: `idTalhao`, `descricao`, `tipo` (ex.: fertilidade, irrigacao, produtividade, solo), `cor` (hex, ex.: #4CAF50), `ativo`.
- **RN-ZM-003**: Se `idTalhao` for informado, o talhão deve existir e pertencer à mesma fazenda (`idFazenda`). Caso contrário retorna `BadRequestException`.
- **RN-ZM-004**: Apenas o usuário dono da fazenda pode criar, listar, atualizar e excluir zonas de manejo dessa fazenda.
- **RN-ZM-005**: `POST /zona-manejo`: cria zona de manejo. Exige autenticação; valida pertencimento da fazenda ao usuário.
- **RN-ZM-006**: `GET /zona-manejo/fazenda/:idFazenda`: lista zonas ativas da fazenda (ordenadas por nome). Suporta paginação (`page`, `pageSize`). Fazenda deve pertencer ao usuário.
- **RN-ZM-007**: `GET /zona-manejo/fazenda/:idFazenda/mapa`: retorna **GeoJSON FeatureCollection** das zonas de manejo da fazenda. Cada feature contém `geometry` e `properties` (id, nome, tipo, cor, idTalhao). Fazenda deve pertencer ao usuário.
- **RN-ZM-008**: `GET /zona-manejo/:id`: retorna uma zona por ID. Só retorna se a fazenda da zona pertencer ao usuário; caso contrário 404 ou 400.
- **RN-ZM-009**: `PUT /zona-manejo/:id`: atualiza zona. Só permite se a fazenda da zona pertencer ao usuário.
- **RN-ZM-010**: `DELETE /zona-manejo/:id`: remove a zona. Só permite se a fazenda da zona pertencer ao usuário.
- **RN-ZM-011**: Cor, quando informada, deve ser string hex de 6 caracteres (ex.: #4CAF50), para exibição no mapa.

### 8.3. Mapa agregado da fazenda
- **RN-MAP-004**: `GET /mapa/fazenda/:idFazenda`: retorna **mapa completo** da fazenda em uma única resposta, com duas camadas GeoJSON: **talhoes** (FeatureCollection dos talhões com geometria) e **zonasManejo** (FeatureCollection das zonas de manejo). Permite ao front desenhar um único mapa com ambas as camadas. A fazenda deve pertencer ao usuário.
- **RN-MAP-005**: A resposta tem o formato: `{ talhoes: { type: "FeatureCollection", features: [...] }, zonasManejo: { type: "FeatureCollection", features: [...] } }`.

---

## 9. Análise de Solo

### 9.1. Criação
- **RN-092**: O ID do usuário é obrigatório para criar uma análise de solo.
- **RN-093**: O usuário deve existir no sistema.
- **RN-094**: Campos opcionais: pH, área total, H+Al, SB, CTC, V, M, MO, PRNT, valor cultural, N, P, K.
- **RN-095**: Análises são criadas com `ativo = true` por padrão.

### 9.2. Consulta
- **RN-096**: Usuários só podem listar análises próprias (`idUsuario`).
- **RN-097**: Ordenação padrão é por `dateCreated` descendente.
- **RN-098**: Busca por plantio retorna a análise vinculada ao plantio.

### 9.3. Cálculo de Calagem
- **RN-099**: O plantio deve possuir uma análise de solo vinculada.
- **RN-100**: Fórmula: `RC = (CTC × (Valor Cultural - V)) / PRNT`
- **RN-101**: Fórmula: `RCT = RC × Área Total`
- **RN-102**: Retorna recomendação em t/ha (toneladas por hectare).
- **RN-103**: Se o plantio não tiver análise, retorna `BadRequestException`.

### 9.4. Cálculo de Adubação
- **RN-104**: O plantio deve possuir análise de solo vinculada.
- **RN-105**: A cultivar deve possuir valores de `aduboNitrogenio`, `aduboFosforo`, `aduboPotassio`.
- **RN-106**: A análise deve possuir valores de N, P, K.
- **RN-107**: Fórmula de dose (kg/ha):
  - Converte mg/dm³ para kg/ha: `soloKgHa = soloMgDm3 × 2`
  - Necessidade: `necessidade = exigKgHa - soloKgHa`
  - Se necessidade ≤ 0: aplica 10% da exigência (manutenção)
  - Dose final: `doseKgHa = doseAplicar / eficiencia`
- **RN-108**: Eficiências de utilização:
  - Nitrogênio (N): 50% (0.5)
  - Fósforo (P): 30% (0.3)
  - Potássio (K): 60% (0.6)
- **RN-109**: Retorna doses em kg/ha e total em kg para a área plantada.
- **RN-110**: Se dados insuficientes, retorna `BadRequestException`.

### 9.5. Comparativo de Nutrientes
- **RN-111**: Compara valores da análise de solo com exigências da cultivar.
- **RN-112**: Retorna pH, N, P, K, Ca, Mg do solo vs cultivar.
- **RN-113**: Valores formatados com unidades apropriadas (kg/ha, pH).

---

## 10. Produto Estoque

### 10.1. Criação
- **RN-114**: ID da fazenda é obrigatório.
- **RN-115**: ID do fornecedor é obrigatório.
- **RN-116**: Nome é opcional.
- **RN-117**: Categoria é obrigatória (enum: DEFENSIVOS, FERTILIZANTES, SEMENTES, etc.).
- **RN-118**: Status é obrigatório (enum: DISPONIVEL, EM_USO, ESGOTADO, DANIFICADO, EXPIRADO).
- **RN-119**: Unidade de medida é obrigatória (enum: QUILO, GRAMA, LITRO, etc.).
- **RN-120**: Quantidade padrão é 0.
- **RN-121**: Valor unitário padrão é 0.0.
- **RN-122**: Produtos são criados com `ativo = true` por padrão.

### 10.2. Aumentar Quantidade
- **RN-123**: A quantidade a ser adicionada deve ser maior que 0.
- **RN-124**: O produto deve existir.
- **RN-125**: A quantidade é somada ao estoque atual.

### 10.3. Remover Quantidade
- **RN-126**: A quantidade a ser removida deve ser maior que 0.
- **RN-127**: O produto deve existir.
- **RN-128**: A quantidade a ser removida não pode ser maior que o estoque disponível.
- **RN-129**: Se tentar remover mais do que tem, retorna `BadRequestException`.
- **RN-130**: A quantidade é subtraída do estoque atual.

### 10.4. Consulta por Fazenda
- **RN-131**: O ID do usuário é obrigatório para listar estoque de uma fazenda.
- **RN-132**: A fazenda deve existir e pertencer ao usuário logado.
- **RN-133**: Se a fazenda não pertencer ao usuário, retorna `BadRequestException`.
- **RN-134**: Listagem inclui relacionamentos: `fazenda`, `fornecedor`.
- **RN-135**: Filtro por nome usa busca case-insensitive.

---

## 11. Dashboard

### 11.1. Dados Climáticos
- **RN-136**: Cidade é obrigatória.
- **RN-137**: Estado e país são opcionais (padrão: BR).
- **RN-138**: Busca dados atuais e previsão dos próximos dias via OpenWeatherMap API.
- **RN-139**: Retorna condição atual, temperatura, umidade, vento e previsão.

### 11.2. Cotação de Commodities
- **RN-140**: Símbolo padrão é 'SOJA'.
- **RN-141**: Busca cotações via BRAPI.
- **RN-142**: Retorna preço atual, passado, futuro e prospecção.

### 11.3. Notícias
- **RN-143**: Query é obrigatória.
- **RN-144**: PageSize padrão é 5.
- **RN-145**: Busca até 5 páginas se necessário para atingir pageSize.
- **RN-146**: Filtra artigos removidos ou inválidos.
- **RN-147**: Retorna título, descrição, URL, imagem, fonte e data.

### 11.4. Dados de Solo
- **RN-148**: Longitude e latitude são obrigatórias.
- **RN-149**: Propriedades padrão: clay, sand, silt, bdod, cec, nitrogen, phh2o, cfvo, ocd, ocs, soc.
- **RN-150**: Busca dados via ISRIC SoilGrids API.
- **RN-151**: Retorna propriedades por profundidade.

### 11.5. Dados de Cultura
- **RN-152**: Nome da cultura é obrigatório.
- **RN-153**: Busca em dados estáticos de culturas.
- **RN-154**: Se cultura não encontrada, retorna `HttpException 404`.

---

## 12. Sistema de Logs

### 12.1. Registro Automático
- **RN-155**: Todas as operações CREATE, UPDATE, DELETE, DEACTIVATE, ACTIVATE são logadas automaticamente.
- **RN-156**: Operações READ são logadas apenas se houver contexto de usuário.
- **RN-157**: Logs são registrados de forma assíncrona para não bloquear a resposta.
- **RN-158**: Rotas ignoradas: `/api-docs`, `/health`, `/favicon.ico`, `/log`.

### 12.2. Dados Capturados
- **RN-159**: Tipo de operação (CREATE, UPDATE, DELETE, etc.).
- **RN-160**: Nome da tabela afetada.
- **RN-161**: ID do registro (quando aplicável).
- **RN-162**: Dados anteriores (para UPDATE, DELETE, DEACTIVATE, ACTIVATE).
- **RN-163**: Dados novos (após a operação).
- **RN-164**: ID do usuário (quando autenticado).
- **RN-165**: Email do usuário.
- **RN-166**: IP address da requisição.
- **RN-167**: User agent do cliente.
- **RN-168**: Descrição gerada automaticamente.

### 12.3. Consulta de Logs
- **RN-169**: Logs podem ser consultados por tabela.
- **RN-170**: Logs podem ser consultados por usuário.
- **RN-171**: Logs podem ser consultados por tipo de operação.
- **RN-172**: Listagem geral suporta paginação e filtros.
- **RN-173**: Logs são ordenados por data de criação descendente.

### 12.4. Sanitização
- **RN-174**: Campos sensíveis (password, token, secret, key) são ocultados como '[HIDDEN]'.

---

## 13. Regras Gerais CRUD

### 13.1. Criação
- **RN-175**: Campos de auditoria `createdBy` e `dateCreated` são preenchidos automaticamente.
- **RN-176**: Campos `ativo` padrão é `true`.

### 13.2. Atualização
- **RN-177**: Campos de auditoria `modifiedBy` e `dateModified` são atualizados automaticamente.
- **RN-178**: Apenas campos válidos do modelo são atualizados (filtro automático).
- **RN-179**: Registro deve existir antes de atualizar.
- **RN-180**: Violações de unique constraint retornam `ConflictException` (409).

### 13.3. Exclusão
- **RN-181**: Registro deve existir antes de excluir.
- **RN-182**: Dados são capturados antes da exclusão para log.

### 13.4. Desativação/Ativação
- **RN-183**: Registro deve existir antes de desativar/ativar.
- **RN-184**: Desativação define `ativo = false`.
- **RN-185**: Ativação define `ativo = true`.
- **RN-186**: Campos de auditoria são atualizados.

### 13.5. Consulta
- **RN-187**: Listagem suporta paginação via `page` e `pageSize` (padrão: page=1, pageSize=10).
- **RN-188**: Listagem suporta filtros via `options.where`.
- **RN-189**: Listagem suporta ordenação via `options.order` ou `options.orderBy`.
- **RN-190**: Consulta por ID retorna null se não encontrado.
- **RN-191**: Respostas são transformadas usando `plainToInstance` com `excludeExtraneousValues`.

### 13.6. Validação
- **RN-192**: ValidationPipe global valida DTOs com `whitelist: true` e `forbidNonWhitelisted: true`.
- **RN-193**: Transformação automática de tipos é habilitada.

### 13.7. Tratamento de Erros
- **RN-194**: Erros de unique constraint (P2002) são convertidos para `ConflictException` (409).
- **RN-195**: Erros são formatados com status code, timestamp, path, method e mensagem.
- **RN-196**: Mensagens de erro são padronizadas por status HTTP.

### 13.8. Segurança
- **RN-197**: CORS permite qualquer origem (`*`) - ajustar em produção.
- **RN-198**: Senhas nunca são retornadas nas respostas (sanitização).
- **RN-199**: Tokens JWT são obrigatórios para rotas protegidas.

---

## 15. Planos e Assinaturas

### 15.1. Visão geral e interação plano × usuário
- **Plano (Plano)**: cadastro do tipo de oferta (nome, tipo, valor do plano para o período em dias — `valorPlano`, `tempoPlanoDias`). Tipos: BASICO, PRO, PREMIUM.
- **UsuarioPlano (assinatura)**: vínculo do usuário com um plano. Cada usuário tem **no máximo uma assinatura ativa** (vigente, não cancelada). Contém `dataInicioPlano`, `dataFimPlano` (vigência em dias definida pelo `plano.tempoPlanoDias`).
- **Usuario.idPlano**: referência ao plano atual do usuário (atualizado ao vincular plano).
- **PagamentoPlano**: pagamentos registrados na assinatura; o último APROVADO define a cobertura do período (data do pagamento + `plano.tempoPlanoDias` dias).
- **Cobranca**: cobranças geradas na assinatura (PIX, BOLETO, CARTAO_CREDITO); possuem `codigoCobranca`, `dataVencimento`, `valor`, status PENDENTE/PAGO/etc.

### 15.2. Tipos de Plano (TipoPlanoEnum)
- **BASICO**, **PRO**, **PREMIUM**: Planos com vigência em dias (`tempoPlanoDias`) e valor (`valorPlano`) para esse período.
- **Plano inicial**: o plano **BASICO** é usado como plano inicial no cadastro (quando `idPlano` não é enviado ou é inválido).

### 15.3. Registro e plano default
- **RN-PLN-001**: Ao criar conta, o usuário **já é vinculado** a um plano. Se o body enviar `idPlano` (opcional) e o plano existir e estiver ativo, esse plano é usado; senão usa o plano **BASICO**.
- **RN-PLN-002**: O campo `Usuario.idPlano` é preenchido com o ID do plano vinculado.
- **RN-PLN-003**: É criado um registro em `UsuarioPlano` com `dataInicioPlano = now()` e `dataFimPlano = now() + tempoPlanoDias` do plano (vigência sempre em dias).

### 15.4. Vincular plano a usuário
- **RN-PLN-004**: `POST /plano/usuario/:idUsuario/plano/:idPlano` (público): vincula um plano a um usuário. Parâmetros de path: `idUsuario` e `idPlano`. Não usa body.
- **RN-PLN-005**: Se o usuário **já tiver assinatura ativa**, ela é **cancelada** (dataCanceladoEm, motivoCancelamento "Troca de plano", ativo = false) e em seguida é criada a nova assinatura com o novo plano. O campo `Usuario.idPlano` é atualizado.
- **RN-PLN-006**: Usuário e plano devem existir e estar ativos; caso contrário retorna 400.

### 15.5. Login e verificação de plano
- **RN-PLN-007**: No login, o sistema verifica o plano atual do usuário (último `UsuarioPlano` ativo, não cancelado, vigente).
- **RN-PLN-008**: **Sem plano não loga**: se não houver plano ativo (`getStatusPlanoUsuario` retorna null), o login é bloqueado com `401` e mensagem "Nenhum plano ativo. Contrate um plano para acessar o sistema.".
- **RN-PLN-009**: **Login permitido mesmo com plano inválido**: se o usuário tiver assinatura mas `planoValido` for false (vencido ou pagamento em atraso), o login **é permitido** e o token é retornado, para que o usuário possa gerar cobrança e registrar pagamento. A resposta inclui `plano.planoValido` e `plano.mensagem` para o front exibir "Regularize o pagamento" e liberar apenas fluxo de pagamento.
- **RN-PLN-010**: **Prazo do contrato**: o plano é considerado no prazo se `dataFimPlano >= now()`.
- **RN-PLN-011**: **Cobertura por pagamento**: é necessário último pagamento com `statusPagamento = APROVADO` e vigência por **tempoPlanoDias** (dias) do plano — a cobertura vale a partir da data do pagamento: data do pagamento + `plano.tempoPlanoDias` dias. Se passou a data e não há pagamento aprovado cobrindo o período atual, o plano fica inválido (mas o login continua permitido para regularizar).
- **RN-PLN-012**: A resposta do login inclui o objeto `plano`: `planoValido`, `tipoPlano`, `nomePlano`, `dataFimPlano`, `dataInicioPlano`, `pagamentoAprovado`, e opcionalmente `mensagem`.

### 15.6. Endpoints de planos (catálogo e status)
- **RN-PLN-013**: `GET /plano` (público): lista todos os planos ativos, ordenados por valor.
- **RN-PLN-014**: `GET /plano/:id` (público): retorna um plano ativo por ID.
- **RN-PLN-015**: `GET /plano/me/status` (autenticado): retorna o status da assinatura atual (vigência, pagamento, planoValido, mensagem). Requer token.

### 15.7. Cancelar assinatura
- **RN-PLN-016**: `POST /plano/me/assinatura/cancelar` (autenticado): cancela a assinatura ativa do usuário. Registra `dataCanceladoEm`, `motivoCancelamento` (opcional), desativa renovação e assinatura (`ativo = false`). Requer token.

### 15.8. Gerar cobrança
- **RN-PLN-017**: `POST /plano/me/cobranca` (autenticado): gera uma cobrança na assinatura vigente. Body: **formaPagamento** (obrigatório: PIX | BOLETO | CARTAO_CREDITO) e **valor** (opcional; se omitido, usa o valor do plano, que é sempre para o período em dias — `plano.valorPlano`). **Data de vencimento** é calculada no backend: 3 dias a partir de hoje (fim do dia 23:59:59). Simulação, sem gateway real.
- **RN-PLN-018**: Retorna `codigoCobranca` (ex.: PIX-YYYYMMDDHHmmss-XXX), que deve ser usado em **POST /plano/me/pagamento** (query) para simular o pagamento.
- **RN-PLN-019**: **Não gera cobrança se já pagou no período**: se o usuário já tem pagamento APROVADO cobrindo o período atual (data atual ≤ data de vencimento do plano), retorna 400: "Você já pagou. Só poderá gerar nova cobrança quando passar a data de vencimento do seu plano (DD/MM/AAAA)."

### 15.9. Registrar pagamento (simulação)
- **RN-PLN-020**: `POST /plano/me/pagamento?codigoCobranca=...` (autenticado): registra um pagamento simulado na assinatura vigente. **codigoCobranca** vai na **query** (não no body). Body: **formaPagamento** e **valor** (opcionais). Data de vencimento do pagamento vem da cobrança quando há codigoCobranca.
- **RN-PLN-021**: Quando o `codigoCobranca` (query) é **igual** ao da cobrança PENDENTE encontrada, o status do pagamento é **APROVADO na hora** e a cobrança é marcada como PAGO. Caso contrário o pagamento fica PROCESSANDO.
- **RN-PLN-022**: **Valor pago**: deve ser igual ao valor da cobrança (quando há codigoCobranca) ou ao valor do plano. Tolerância R$ 0,01. Se diferente, retorna 400 com mensagem indicando o valor correto.
- **RN-PLN-023**: **Cobrança vencida**: se a cobrança encontrada tiver `dataVencimento` já passada (hoje > dataVencimento), retorna 400: "Cobrança vencida. Gere uma nova em POST /plano/me/cobranca e pague até a data de vencimento."
- **RN-PLN-024**: **Só aceita a última cobrança**: se o codigoCobranca informado não for o da **última** cobrança PENDENTE da assinatura (código antigo), retorna 400: "Código de cobrança antigo. Gere uma nova cobrança em POST /plano/me/cobranca e use o último código retornado."
- **RN-PLN-025**: **Não registra pagamento se já pagou no período**: se o usuário já tem pagamento APROVADO cobrindo o período atual, retorna 400: "Você já pagou. Só poderá pagar novamente quando passar a data de vencimento do seu plano (DD/MM/AAAA)."

### 15.10. Vigência e enums
- **Vigência em dias**: a cobertura após um pagamento aprovado é sempre **tempoPlanoDias** do plano (ex.: 365 dias). Não há enum de periodicidade; o valor do plano (`valorPlano`) é para esse período em dias.
- **StatusPagamentoEnum**: CANCELADO, APROVADO, REPROVADO, PROCESSANDO.
- **StatusCobrancaEnum**: PENDENTE, PAGO, CANCELADO, VENCIDO.
- **FormaPagamentoEnum**: PIX, BOLETO, CARTAO_CREDITO.

### 15.11. Seed de planos
- **RN-PLN-026**: O seed `npm run seed:plano` cria/atualiza os planos (Básico, Pro, Premium) com `valorPlano` (R$) e `tempoPlanoDias` (ex.: 180, 365, 730). Deve ser executado antes do primeiro registro ou quando os planos forem alterados.

### 15.12. Modelos e campos (resumo)
- **UsuarioPlano**: não possui campo `valorPago`; valor do pagamento fica em **PagamentoPlano**.
- **PagamentoPlano**: não possui campo `identificadorPagamento`; registra valor, status, forma de pagamento, data de vencimento (quando vinculado a cobrança).
- **Cobranca**: codigoCobranca (único), valor, dataVencimento, formaPagamento, status; vinculada a UsuarioPlano e opcionalmente a PagamentoPlano quando paga.

---

## 16. Relatórios (PDF)

O módulo de relatórios gera PDFs para apoio à decisão. Os templates HTML ficam na pasta da feature (`relatorio/templates`); o service busca dados no Prisma, monta o objeto de dados e chama o template correspondente; a geração do PDF é feita com Puppeteer.

### 16.1. Regras gerais
- **RN-REL-001**: Todos os endpoints de relatório exigem autenticação (JWT). Sem token retorna 401.
- **RN-REL-002**: Os relatórios consideram apenas dados do usuário autenticado (`req.user.id`).
- **RN-REL-003**: A resposta é sempre PDF (`Content-Type: application/pdf`) com nome de arquivo sugerido em `Content-Disposition`.
- **RN-REL-004**: Registros inativos (`ativo = false`) não entram nos relatórios, salvo quando a regra do relatório disser o contrário.

### 16.2. Relatório: Meus plantios por safra/cultura
- **RN-REL-005**: `GET /relatorio/plantios`. Parâmetros de query opcionais: **ano** (número), **idFazenda** (número).
- **RN-REL-006**: Dados: plantios das fazendas do usuário (ativas). Se `idFazenda` informado, apenas essa fazenda; se **ano** informado, apenas `dataPlantio` dentro do ano.
- **RN-REL-006b**: O relatório inclui por plantio: **talhão** (nome ou "—" se não vinculado), **custo total** (R$), **quantidade de operações**. No resumo: custo total dos plantios listados e custo médio por ha.
- **RN-REL-007**: Inclui resumo para decisão: área total, quantidade de plantios, custo total, custo/ha médio, % concluídos; resumo por cultura e por fazenda.
- **RN-REL-008**: Pontos de atenção: muitos plantios ainda "Planejados" (> 50%); plantios "Em monitoramento" (quantidade informada).

### 16.3. Relatório: Meu estoque por fazenda
- **RN-REL-010**: `GET /relatorio/estoque`. Parâmetros de query opcionais: **idFazenda** (número), **categoria** (string).
- **RN-REL-011**: Dados: itens de estoque das fazendas do usuário (ativos). Filtro por fazenda e/ou categoria quando informados.
- **RN-REL-011b**: A tabela inclui coluna **Fornecedor** (nome fantasia ou razão social) para cada item.
- **RN-REL-012**: Inclui resumo: valor total do estoque, valor em risco (itens que vencem em até 90 dias), valor e quantidade de itens vencidos; valor por categoria.
- **RN-REL-013**: Pontos de atenção: itens vencidos (valor e quantidade); itens que vencem em 90 dias (valor em risco); itens com status ESGOTADO.

### 16.4. Relatório: Minhas análises de solo
- **RN-REL-015**: `GET /relatorio/analises-solo`. Parâmetro de query opcional: **ano** (número).
- **RN-REL-016**: Dados: análises de solo do usuário (ativas). Se **ano** informado, apenas `dateCreated` dentro do ano.
- **RN-REL-017**: Inclui resumo: quantidade de análises, área coberta (soma de areaTotal), última análise (dias atrás), médias dos indicadores (pH, N, P, K, CTC, V%, MO) quando houver dados.
- **RN-REL-018**: Pontos de atenção: pH médio fora da faixa ideal (5,5–6,5); última análise há mais de 365 dias.

### 16.5. Relatório: Resumo geral do sistema para o cliente
- **RN-REL-020**: `GET /relatorio/resumo`. Parâmetros de query opcionais: **ano** (número), **mes** (número 1–12). Gera PDF com **resumo de tudo relevante do sistema** para o cliente.
- **RN-REL-021**: Período: se **mes** informado, intervalo do mês no ano (ano padrão = ano atual); senão, ano inteiro. Dados de plantios e pagamentos ao sistema são filtrados por esse período.
- **RN-REL-022**: Conteúdo do relatório: **plano atual** (tipo, nome, vigência, status válido/atenção, mensagem); **resumo do sistema** (fazendas, área total, **talhões**, **zonas de manejo**, plantios no período, fornecedores, cultivares em uso, **custo total da safra do ano de referência**, total pago ao sistema no período); **resumo de estoque** (total de itens, valor total estimado, itens próximos a vencer em 90 dias, itens vencidos); **resumo de análises de solo** (total de análises, última análise, área coberta); **destaques** e **pontos de atenção**; tabelas de fazendas, plantios por cultura e fornecedores.
- **RN-REL-022b**: O custo da safra no resumo considera o **ano de referência** do relatório (ano ou ano do mês informado): soma de `plantio.custoTotal` e dos `custoTotal` das operações dos plantios desse ano em todas as fazendas do usuário.
- **RN-REL-023**: Dados considerados: fazendas do usuário (ativas), contagem de **talhões** e **zonas de manejo** das fazendas do usuário, plantios no período (com cultivar), plantios da safra (ano de referência) para cálculo do custo safra, assinaturas ativas e pagamentos APROVADOS no período, fornecedores (ativos), itens de estoque das fazendas do usuário (ativos), análises de solo do usuário (ativas), status do plano via `getStatusPlanoUsuario`.
- **RN-REL-024**: Pontos de atenção: nenhuma fazenda cadastrada; nenhum fornecedor cadastrado; plano inválido ou mensagem; itens de estoque vencidos ou próximos a vencer; nenhuma análise de solo cadastrada.

---

## 📝 Notas Finais

- Todas as operações de criação, atualização, exclusão, desativação e ativação são automaticamente logadas.
- Campos de auditoria (`createdBy`, `dateCreated`, `modifiedBy`, `dateModified`) são gerenciados automaticamente.
- Validações de unique constraint são tratadas globalmente via `HttpExceptionFilter`.
- Paginação padrão: página 1, 10 itens por página.
- Todos os registros são criados com `ativo = true` por padrão.
- Relacionamentos entre entidades são validados antes de operações (ex: fazenda deve existir antes de criar plantio).

---

**Última atualização**: 2026-02-19
**Versão do documento**: 1.3
