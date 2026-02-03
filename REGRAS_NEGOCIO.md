# Regras de Negócio - Terra Manager API

Este documento descreve todas as regras de negócio implementadas no sistema Terra Manager, organizadas por módulo e feature.

---

## 📋 Índice

1. [Autenticação e Autorização](#1-autenticação-e-autorização)
2. [Usuários](#2-usuários)
3. [Fazendas](#3-fazendas)
4. [Fornecedores](#4-fornecedores)
5. [Cultivares](#5-cultivares)
6. [Pragas](#6-pragas)
7. [Plantios](#7-plantios)
8. [Análise de Solo](#8-análise-de-solo)
9. [Produto Estoque](#9-produto-estoque)
10. [Dashboard](#10-dashboard)
11. [Sistema de Logs](#11-sistema-de-logs)
12. [Regras Gerais CRUD](#12-regras-gerais-crud)

---

## 1. Autenticação e Autorização

### 1.1. Login
- **RN-001**: O email e senha são obrigatórios para autenticação.
- **RN-002**: A senha deve ser comparada usando bcrypt com hash armazenado.
- **RN-003**: Se as credenciais forem inválidas, retorna `UnauthorizedException`.
- **RN-004**: O token JWT contém: `email`, `sub` (ID do usuário), e `role`.
- **RN-005**: O token JWT expira conforme configurado em `JWT_EXPIRATION` (padrão: 720000ms).
- **RN-006**: A resposta do login inclui: `accessToken`, `role`, `email`, `telefone`, `cpf`, `name`, `expires_at`.

### 1.2. Registro de Usuário
- **RN-007**: O email deve ser único no sistema.
- **RN-008**: O CPF deve ser único no sistema (quando informado).
- **RN-009**: A senha deve ser hasheada com bcrypt (10 rounds) antes de ser armazenada.
- **RN-010**: O role padrão é `USER` se não especificado.
- **RN-011**: Usuários são criados com `ativo = true` por padrão.
- **RN-012**: Se email ou CPF já existirem, retorna `ConflictException` (409).
- **RN-013**: O sistema registra automaticamente a criação do usuário no log.

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
- **RN-023**: Existem três roles: `ADMIN`, `USER`, `MODERATOR`.
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

---

## 8. Análise de Solo

### 8.1. Criação
- **RN-092**: O ID do usuário é obrigatório para criar uma análise de solo.
- **RN-093**: O usuário deve existir no sistema.
- **RN-094**: Campos opcionais: pH, área total, H+Al, SB, CTC, V, M, MO, PRNT, valor cultural, N, P, K.
- **RN-095**: Análises são criadas com `ativo = true` por padrão.

### 8.2. Consulta
- **RN-096**: Usuários só podem listar análises próprias (`idUsuario`).
- **RN-097**: Ordenação padrão é por `dateCreated` descendente.
- **RN-098**: Busca por plantio retorna a análise vinculada ao plantio.

### 8.3. Cálculo de Calagem
- **RN-099**: O plantio deve possuir uma análise de solo vinculada.
- **RN-100**: Fórmula: `RC = (CTC × (Valor Cultural - V)) / PRNT`
- **RN-101**: Fórmula: `RCT = RC × Área Total`
- **RN-102**: Retorna recomendação em t/ha (toneladas por hectare).
- **RN-103**: Se o plantio não tiver análise, retorna `BadRequestException`.

### 8.4. Cálculo de Adubação
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

### 8.5. Comparativo de Nutrientes
- **RN-111**: Compara valores da análise de solo com exigências da cultivar.
- **RN-112**: Retorna pH, N, P, K, Ca, Mg do solo vs cultivar.
- **RN-113**: Valores formatados com unidades apropriadas (kg/ha, pH).

---

## 9. Produto Estoque

### 9.1. Criação
- **RN-114**: ID da fazenda é obrigatório.
- **RN-115**: ID do fornecedor é obrigatório.
- **RN-116**: Nome é opcional.
- **RN-117**: Categoria é obrigatória (enum: DEFENSIVOS, FERTILIZANTES, SEMENTES, etc.).
- **RN-118**: Status é obrigatório (enum: DISPONIVEL, EM_USO, ESGOTADO, DANIFICADO, EXPIRADO).
- **RN-119**: Unidade de medida é obrigatória (enum: QUILO, GRAMA, LITRO, etc.).
- **RN-120**: Quantidade padrão é 0.
- **RN-121**: Valor unitário padrão é 0.0.
- **RN-122**: Produtos são criados com `ativo = true` por padrão.

### 9.2. Aumentar Quantidade
- **RN-123**: A quantidade a ser adicionada deve ser maior que 0.
- **RN-124**: O produto deve existir.
- **RN-125**: A quantidade é somada ao estoque atual.

### 9.3. Remover Quantidade
- **RN-126**: A quantidade a ser removida deve ser maior que 0.
- **RN-127**: O produto deve existir.
- **RN-128**: A quantidade a ser removida não pode ser maior que o estoque disponível.
- **RN-129**: Se tentar remover mais do que tem, retorna `BadRequestException`.
- **RN-130**: A quantidade é subtraída do estoque atual.

### 9.4. Consulta por Fazenda
- **RN-131**: O ID do usuário é obrigatório para listar estoque de uma fazenda.
- **RN-132**: A fazenda deve existir e pertencer ao usuário logado.
- **RN-133**: Se a fazenda não pertencer ao usuário, retorna `BadRequestException`.
- **RN-134**: Listagem inclui relacionamentos: `fazenda`, `fornecedor`.
- **RN-135**: Filtro por nome usa busca case-insensitive.

---

## 10. Dashboard

### 10.1. Dados Climáticos
- **RN-136**: Cidade é obrigatória.
- **RN-137**: Estado e país são opcionais (padrão: BR).
- **RN-138**: Busca dados atuais e previsão dos próximos dias via OpenWeatherMap API.
- **RN-139**: Retorna condição atual, temperatura, umidade, vento e previsão.

### 10.2. Cotação de Commodities
- **RN-140**: Símbolo padrão é 'SOJA'.
- **RN-141**: Busca cotações via BRAPI.
- **RN-142**: Retorna preço atual, passado, futuro e prospecção.

### 10.3. Notícias
- **RN-143**: Query é obrigatória.
- **RN-144**: PageSize padrão é 5.
- **RN-145**: Busca até 5 páginas se necessário para atingir pageSize.
- **RN-146**: Filtra artigos removidos ou inválidos.
- **RN-147**: Retorna título, descrição, URL, imagem, fonte e data.

### 10.4. Dados de Solo
- **RN-148**: Longitude e latitude são obrigatórias.
- **RN-149**: Propriedades padrão: clay, sand, silt, bdod, cec, nitrogen, phh2o, cfvo, ocd, ocs, soc.
- **RN-150**: Busca dados via ISRIC SoilGrids API.
- **RN-151**: Retorna propriedades por profundidade.

### 10.5. Dados de Cultura
- **RN-152**: Nome da cultura é obrigatório.
- **RN-153**: Busca em dados estáticos de culturas.
- **RN-154**: Se cultura não encontrada, retorna `HttpException 404`.

---

## 11. Sistema de Logs

### 11.1. Registro Automático
- **RN-155**: Todas as operações CREATE, UPDATE, DELETE, DEACTIVATE, ACTIVATE são logadas automaticamente.
- **RN-156**: Operações READ são logadas apenas se houver contexto de usuário.
- **RN-157**: Logs são registrados de forma assíncrona para não bloquear a resposta.
- **RN-158**: Rotas ignoradas: `/api-docs`, `/health`, `/favicon.ico`, `/log`.

### 11.2. Dados Capturados
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

### 11.3. Consulta de Logs
- **RN-169**: Logs podem ser consultados por tabela.
- **RN-170**: Logs podem ser consultados por usuário.
- **RN-171**: Logs podem ser consultados por tipo de operação.
- **RN-172**: Listagem geral suporta paginação e filtros.
- **RN-173**: Logs são ordenados por data de criação descendente.

### 11.4. Sanitização
- **RN-174**: Campos sensíveis (password, token, secret, key) são ocultados como '[HIDDEN]'.

---

## 12. Regras Gerais CRUD

### 12.1. Criação
- **RN-175**: Campos de auditoria `createdBy` e `dateCreated` são preenchidos automaticamente.
- **RN-176**: Campos `ativo` padrão é `true`.

### 12.2. Atualização
- **RN-177**: Campos de auditoria `modifiedBy` e `dateModified` são atualizados automaticamente.
- **RN-178**: Apenas campos válidos do modelo são atualizados (filtro automático).
- **RN-179**: Registro deve existir antes de atualizar.
- **RN-180**: Violações de unique constraint retornam `ConflictException` (409).

### 12.3. Exclusão
- **RN-181**: Registro deve existir antes de excluir.
- **RN-182**: Dados são capturados antes da exclusão para log.

### 12.4. Desativação/Ativação
- **RN-183**: Registro deve existir antes de desativar/ativar.
- **RN-184**: Desativação define `ativo = false`.
- **RN-185**: Ativação define `ativo = true`.
- **RN-186**: Campos de auditoria são atualizados.

### 12.5. Consulta
- **RN-187**: Listagem suporta paginação via `page` e `pageSize` (padrão: page=1, pageSize=10).
- **RN-188**: Listagem suporta filtros via `options.where`.
- **RN-189**: Listagem suporta ordenação via `options.order` ou `options.orderBy`.
- **RN-190**: Consulta por ID retorna null se não encontrado.
- **RN-191**: Respostas são transformadas usando `plainToInstance` com `excludeExtraneousValues`.

### 12.6. Validação
- **RN-192**: ValidationPipe global valida DTOs com `whitelist: true` e `forbidNonWhitelisted: true`.
- **RN-193**: Transformação automática de tipos é habilitada.

### 12.7. Tratamento de Erros
- **RN-194**: Erros de unique constraint (P2002) são convertidos para `ConflictException` (409).
- **RN-195**: Erros são formatados com status code, timestamp, path, method e mensagem.
- **RN-196**: Mensagens de erro são padronizadas por status HTTP.

### 12.8. Segurança
- **RN-197**: CORS permite qualquer origem (`*`) - ajustar em produção.
- **RN-198**: Senhas nunca são retornadas nas respostas (sanitização).
- **RN-199**: Tokens JWT são obrigatórios para rotas protegidas.

---

## 📝 Notas Finais

- Todas as operações de criação, atualização, exclusão, desativação e ativação são automaticamente logadas.
- Campos de auditoria (`createdBy`, `dateCreated`, `modifiedBy`, `dateModified`) são gerenciados automaticamente.
- Validações de unique constraint são tratadas globalmente via `HttpExceptionFilter`.
- Paginação padrão: página 1, 10 itens por página.
- Todos os registros são criados com `ativo = true` por padrão.
- Relacionamentos entre entidades são validados antes de operações (ex: fazenda deve existir antes de criar plantio).

---

**Última atualização**: 2025-01-XX
**Versão do documento**: 1.0
