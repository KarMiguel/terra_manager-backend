# Diagrama de Classes – Apenas Domínio (Boas Práticas)

**Regra aplicada:**
- **Entra no diagrama:** funções que respondem *"O que essa entidade faz no sistema?"* (comportamento de negócio).
- **Não entra:** funções que respondem *"Como eu salvo isso no banco?"* (persistência/CRUD genérico).

**Modelagem como domínio, não como API:** no diagrama, as assinaturas usam **tipos e valores de domínio** (entidades, enums, primitivos de negócio). Não aparecem parâmetros de aplicação como `dto`, `userId`, `createdBy`, `modifiedBy`, `idUsuario`, `body`, `paginate`, `options`. Ex.: `registrar(nome, areaTotal, municipio, uf, ...)` em vez de `createFazenda(dto, userId, createdBy)`; `atualizarStatus(novoStatus)` em vez de `updateStatusPlantio(idPlantio, statusPlantio, idUsuario, modifiedBy)`.

Métodos herdados de `CrudService` (update, findAndCountAll, findOneById, delete, deactivate, activate, findAndCountByUserId) são **persistência** e **não** devem aparecer como operações de domínio no diagrama.

---

## 1. Auth (Autenticação)

| Classe        | Métodos que entram no diagrama | O que a entidade faz no sistema |
|---------------|--------------------------------|---------------------------------|
| **AuthService** | `validateUser(email, password)` | Validar credenciais do usuário. |
| | `login(data)` | Autenticar e retornar token + dados do plano. |
| | `register(data)` | Registrar novo usuário e vincular ao plano inicial. |
| | `forgotPassword(email)` | Solicitar recuperação de senha (token + e-mail). |
| | `resetPassword(token, newPassword, confirmPassword)` | Redefinir senha com token válido. |
| | `verifyResetPasswordToken(token)` | Verificar se token de reset é válido. |

---

## 2. User (Usuário)

| Classe        | Métodos que entram no diagrama | O que a entidade faz no sistema |
|---------------|--------------------------------|---------------------------------|
| **UserService** | `findByEmail(email)` | Localizar usuário por e-mail (suporte ao login). |
| | `create(data)` | Cadastrar usuário (comportamento de negócio de “criar usuário”). |
| | `updateUser(userId, data)` | Atualizar dados do usuário (ex.: reset de senha). |

*Não entram:* update genérico, findOneById, findAndCountAll, delete (persistência).

---

## 3. Plano (Assinatura e Pagamento)

| Classe        | Métodos que entram no diagrama | O que a entidade faz no sistema |
|---------------|--------------------------------|---------------------------------|
| **PlanoService** | `getPlanoInicial()` | Retornar plano padrão (ex.: BASICO) para novo usuário. |
| | `getStatusPlanoUsuario(idUsuario)` | Determinar se o plano do usuário está válido (vigência + pagamento aprovado). |
| | `criarUsuarioPlano(idUsuario, idPlano, createdBy?)` | Vincular usuário ao plano (regra: uma assinatura ativa por usuário). |
| | `cancelarAssinatura(idUsuario, motivoCancelamento?)` | Cancelar assinatura ativa do usuário. |
| | `vincularPlanoUsuario(idUsuario, idPlano, createdBy?)` | Trocar plano do usuário (cancela anterior e cria nova assinatura). |
| | `gerarCobranca(idUsuario, body, createdBy?)` | Gerar cobrança (PIX/Boleto/Cartão) com código conforme forma de pagamento. |
| | `registrarPagamento(idUsuario, body, createdBy?, codigoCobranca?)` | Registrar pagamento (validar valor, cobrança e aprovar quando codigoCobranca informado). |

*Não entram:* findAllAtivos, findById, findByTipo, create (catálogo/admin) — ou incluir apenas se forem considerados “o que o sistema oferece” (ex.: listar planos disponíveis).

---

## 4. Fazenda

| Classe        | Métodos que entram no diagrama | O que a entidade faz no sistema |
|---------------|--------------------------------|---------------------------------|
| **FazendaService** | `createFazenda(dto, userId, createdBy)` | Criar fazenda para o usuário (validação CNPJ único). |
| | `findAndCountByUser(userId, paginate?, options?)` | Listar fazendas do usuário (comportamento: “minhas fazendas”). |

---

## 5. Plantio

| Classe        | Métodos que entram no diagrama | O que a entidade faz no sistema |
|---------------|--------------------------------|---------------------------------|
| **PlantioService** | `createPlantio(dto, createdBy)` | Registrar plantio (datas, área, densidade, cultivar, fazenda). |
| | `updateStatusPlantio(idPlantio, statusPlantio, idUsuario, modifiedBy)` | Atualizar status do plantio (com regra: só dono da fazenda). |
| | `listarPorFazenda(idFazenda, idUsuario, paginate?, options?)` | Listar plantios da fazenda (com filtros e permissão). |
| | `listarPorFazendaTipoPlanta(idFazenda, tipoPlanta)` | Listar plantios da fazenda por tipo de cultura. |
| | `custoPorSafra(idFazenda, ano, idUsuario)` | Calcular custo por safra (custo total, área, custo/ha, resumo por operação). |

---

## 6. Aplicação (Aplicação de insumos)

| Classe        | Métodos que entram no diagrama | O que a entidade faz no sistema |
|---------------|--------------------------------|---------------------------------|
| **AplicacaoService** | `createAplicacao(dto, createdBy)` | Registrar aplicação (calcula quantidade total = dose/ha × área; regra EMBRAPA/ANDEF). |
| | `listarPorOperacao(idOperacaoPlantio)` | Listar aplicações de uma operação de plantio. |

*Comportamento interno (pode aparecer como regra no diagrama):* `calcularQuantidadeTotal(dosePorHa, areaHa)` — quantidade total para a aplicação.

---

## 7. Análise de Solo

| Classe        | Métodos que entram no diagrama | O que a entidade faz no sistema |
|---------------|--------------------------------|---------------------------------|
| **AnaliseSoloService** | `createAnaliseSolo(dto, userId, createdBy)` | Cadastrar análise de solo do usuário. |
| | `calculaCalagem(idPlantio)` | Calcular recomendação de calagem (RC e RCT) a partir da análise. |
| | `calculoAdubacao(idPlantio)` | Calcular recomendação de adubação N/P/K (exigência da cultivar × análise). |
| | `comparativoNutrientes(idPlantio)` | Comparar nutrientes da análise com exigências da cultivar. |
| **CalculosUtil** (domínio) | `calcDoseKgHa(soloMgDm3, exigKgHa, eficiencia)` | Calcular dose de fertilizante (kg/ha). |
| | `calcCalagem(analiseSolo)` | Calcular calagem (RC, RCT). |

*Não entram:* findAndCountByUser, findByPlantioId (apenas “como busco no banco”).

---

## 8. Operação de Plantio

| Classe        | Métodos que entram no diagrama | O que a entidade faz no sistema |
|---------------|--------------------------------|---------------------------------|
| **OperacaoPlantioService** | `createOperacao(dto, createdBy)` | Registrar operação (valida área ≤ área plantada; calcula custo/ha; atualiza status do plantio conforme etapa). |
| | `listarPorPlantio(idPlantio)` | Listar operações de um plantio. |

*Regras de domínio (podem aparecer como funções/estado no diagrama):*  
- `calcularCustoPorHa(custoTotal, areaHa)` — custo por hectare.  
- `novoStatusPorEtapa(tipoEtapa, statusAtual)` — transição de status (ex.: COLHEITA → CONCLUIDO, SEMEADURA → EM_MONITORAMENTO).

---

## 9. Produto Estoque

| Classe        | Métodos que entram no diagrama | O que a entidade faz no sistema |
|---------------|--------------------------------|---------------------------------|
| **ProdutoEstoqueService** | `createProdutoEstoque(data, createdBy)` | Cadastrar produto no estoque. |
| | `aumentarQuantidade(id, quantidade)` | Entrada no estoque (regra: quantidade > 0). |
| | `removerQuantidade(id, quantidade)` | Saída no estoque (regra: não exceder quantidade disponível). |
| | `listarPorFazenda(idFazenda, idUsuario, paginate?, options?)` | Listar estoque da fazenda (com permissão do usuário). |

---

## 10. Talhão

| Classe        | Métodos que entram no diagrama | O que a entidade faz no sistema |
|---------------|--------------------------------|---------------------------------|
| **TalhaoService** | `createTalhao(dto, createdBy, idUsuario)` | Criar talhão na fazenda (regra: fazenda pertence ao usuário). |
| | `mapaPorFazenda(idFazenda, idUsuario)` | Retornar talhões da fazenda em GeoJSON (para mapa). |
| | `listarPorFazenda(idFazenda, idUsuario, paginate?)` | Listar talhões da fazenda. |
| | `resumoPorFazenda(idFazenda, idUsuario)` | Resumo por fazenda (área total, área por talhão). |

---

## 11. Zona de Manejo

| Classe        | Métodos que entram no diagrama | O que a entidade faz no sistema |
|---------------|--------------------------------|---------------------------------|
| **ZonaManejoService** | `createZonaManejo(dto, createdBy, idUsuario)` | Criar zona de manejo (valida fazenda e talhão). |
| | `listarPorFazenda(idFazenda, idUsuario, paginate?)` | Listar zonas da fazenda. |
| | `mapaPorFazenda(idFazenda, idUsuario)` | Retornar zonas em GeoJSON para mapa. |
| | `updateWithUser(id, data, modifiedBy, idUsuario)` | Atualizar zona (com verificação de permissão). |
| | `findOneByIdAndUser(id, idUsuario)` | Buscar zona por id (com verificação de permissão). |
| | `deleteAndCheckUser(id, idUsuario)` | Excluir zona (com verificação de permissão). |

---

## 12. Cultivar

| Classe        | Métodos que entram no diagrama | O que a entidade faz no sistema |
|---------------|--------------------------------|---------------------------------|
| **CultivarService** | `CreateCultivar(dto, userId, createdBy)` | Cadastrar cultivar (pode criar praga em cascata). |
| | `findAndCountByUser(userId, paginate?, options?)` | Listar cultivares do usuário (com filtros). |
| | `checkUserCultivars(userId)` | Verificar quais tipos de cultura (ex.: SOJA, MILHO) o usuário possui. |

---

## 13. Praga

| Classe        | Métodos que entram no diagrama | O que a entidade faz no sistema |
|---------------|--------------------------------|---------------------------------|
| **PragaService** | `createPraga(dto, createdBy)` | Cadastrar praga (comportamento de catálogo de pragas). |

---

## 14. Fornecedor

Se o módulo tiver apenas CRUD genérico (create via service específico, update, findOneById, findAndCountAll, delete), esses métodos **não entram** (persistência).  
Se existir algo como “listar fornecedores do usuário” ou “validar CNPJ do fornecedor” como regra de negócio, esses comportamentos **entram**.

---

## 15. Relatório

| Classe        | Métodos que entram no diagrama | O que a entidade faz no sistema |
|---------------|--------------------------------|---------------------------------|
| **RelatorioService** | `gerarRelatorioPlantios(idUsuario, ano?, idFazenda?)` | Gerar PDF de relatório de plantios (área, custo, status, cultura, alertas). |
| | `gerarRelatorioEstoque(idUsuario, idFazenda?, categoria?)` | Gerar PDF de relatório de estoque (valor, vencimento, categorias). |
| | `gerarRelatorioAnalisesSolo(idUsuario, ano?)` | Gerar PDF de relatório de análises de solo. |
| | `gerarRelatorioResumo(idUsuario, ano?, mes?)` | Gerar PDF de resumo geral (fazendas, plantios, estoque, plano, etc.). |

*Não entra:* `generatePdf(html)` — “como gero o PDF” (infraestrutura).

---

## 16. Dashboard

| Classe        | Métodos que entram no diagrama | O que a entidade faz no sistema |
|---------------|--------------------------------|---------------------------------|
| **DashboardService** | `getCultivoByName(nome)` | Obter dados da cultura pelo nome. |
| | `getWeatherByCity(city, state?, country?)` | Obter previsão do tempo por cidade. |
| | `getCommodityPrice(symbol?)` | Obter cotação de commodity (ex.: SOJA). |
| | `getNewsByQuery(query, pageSize?)` | Buscar notícias por termo. |
| | `getSoilSummaryData(lon, lat, properties?)` | Obter resumo de dados de solo por coordenadas. |

---

## 17. Mapa

| Classe        | Métodos que entram no diagrama | O que a entidade faz no sistema |
|---------------|--------------------------------|---------------------------------|
| **MapaService** | `getMapaFazenda(idFazenda, idUsuario)` | Retornar mapa da fazenda (talhões + zonas de manejo em GeoJSON). |

---

## 18. Log

Módulo tipicamente só de persistência (registrar logs). **Não incluir** no diagrama de classes de domínio, a menos que exista regra de negócio explícita (ex.: “arquivar log após N dias”).

---

## Resumo: o que NÃO entra no diagrama de classes de domínio

- Métodos do **CrudService**: `update`, `findAndCountAll`, `findOneById`, `delete`, `deactivate`, `activate`, `findAndCountByUserId`, `mapToResponse`, `filterOptions`.
- Qualquer método que seja apenas “buscar no banco”, “atualizar campo no banco”, “deletar no banco” sem regra de negócio.
- Geração técnica de PDF (`generatePdf`), chamadas HTTP brutas, configuração de ORM.

Use este documento como checklist ao desenhar o diagrama: cada **classe** listada acima com seus **métodos** corresponde ao que a entidade/serviço **faz no sistema**, não ao como isso é persistido.
