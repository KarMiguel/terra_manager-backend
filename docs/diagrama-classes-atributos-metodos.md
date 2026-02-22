# Diagrama de Classes – Atributos e Métodos por Classe

Documento para montar o diagrama de classes: **atributos** e **métodos de domínio** de cada classe.  
*(Métodos de persistência genérica não listados.)*

---

## Convenção

- **Entidades (modelos):** atributos = campos do modelo (schema Prisma).
- **Serviços:** atributos = dependências injetadas (ex.: `- prisma`, `- userService`); métodos = apenas comportamento de negócio.
- `+` público, `-` privado, `#` protegido (opcional no diagrama).

---

# ENTIDADES (MODELOS DE DOMÍNIO)

## Usuario

| Atributos | Tipo |
|-----------|------|
| id | Int |
| email | String |
| password | String |
| nome | String |
| role | ROLE (ADMIN, USER) |
| cpf | String? |
| telefone | String? |
| idPlano | Int? |
| resetPasswordToken | String? |
| resetPasswordExpires | DateTime? |
| ativo | Boolean |
| createdBy | String? |
| dateCreated | DateTime |
| dateModified | DateTime |
| modifiedBy | String? |

*Métodos de domínio:* (entidade de dados; comportamento nos serviços User/Auth.)

---

## Plano

| Atributos | Tipo |
|-----------|------|
| id | Int |
| nome | String |
| tipoPlano | TipoPlanoEnum (BASICO, PRO, PREMIUM) |
| valorPlano | Float |
| tempoPlanoDias | Int? |
| descricao | String? |
| ativo | Boolean |
| createdBy | String? |
| dateCreated | DateTime |
| dateModified | DateTime |
| modifiedBy | String? |

*Métodos de domínio:* (catálogo; comportamento em PlanoService.)

---

## UsuarioPlano

| Atributos | Tipo |
|-----------|------|
| id | Int |
| idPlano | Int |
| idUsuario | Int |
| dataInicioPlano | DateTime |
| dataFimPlano | DateTime |
| dataCanceladoEm | DateTime? |
| motivoCancelamento | String? |
| renovacaoAutomatica | Boolean |
| ativo | Boolean |
| createdBy | String? |
| dateCreated | DateTime |
| dateModified | DateTime |
| modifiedBy | String? |

---

## Cobranca

| Atributos | Tipo |
|-----------|------|
| id | Int |
| idUsuarioPlano | Int |
| formaPagamento | FormaPagamentoEnum (PIX, BOLETO, CARTAO_CREDITO) |
| valor | Float |
| dataVencimento | DateTime |
| codigoCobranca | String |
| status | StatusCobrancaEnum (PENDENTE, PAGO, CANCELADO, VENCIDO) |
| idPagamentoPlano | Int? |
| createdBy | String? |
| dateCreated | DateTime |
| dateModified | DateTime |
| modifiedBy | String? |

---

## PagamentoPlano

| Atributos | Tipo |
|-----------|------|
| id | Int |
| idUsuarioPlano | Int |
| dataPagamento | DateTime |
| dataVencimento | DateTime? |
| valor | Float? |
| statusPagamento | StatusPagamentoEnum (CANCELADO, APROVADO, REPROVADO, PROCESSANDO) |
| formaPagamento | FormaPagamentoEnum? |
| idTransacaoExterno | String? |
| ativo | Boolean |
| createdBy | String? |
| dateCreated | DateTime |
| dateModified | DateTime |
| modifiedBy | String? |

---

## Fazenda

| Atributos | Tipo |
|-----------|------|
| id | Int |
| nome | String |
| latitude | Float |
| longitude | Float |
| areaTotal | Float? |
| cnpj | String? |
| soloPredominante | String? |
| cultivoPredominante | String? |
| municipio | String? |
| uf | String? |
| idUsuario | Int |
| ativo | Boolean |
| createdBy | String? |
| dateCreated | DateTime |
| dateModified | DateTime |
| modifiedBy | String? |

---

## Talhao

| Atributos | Tipo |
|-----------|------|
| id | Int |
| idFazenda | Int |
| nome | String |
| areaHa | Float |
| geometria | Json? (GeoJSON) |
| observacao | String? |
| ativo | Boolean |
| createdBy | String? |
| dateCreated | DateTime |
| dateModified | DateTime |
| modifiedBy | String? |

---

## ZonaManejo

| Atributos | Tipo |
|-----------|------|
| id | Int |
| idFazenda | Int |
| idTalhao | Int? |
| nome | String |
| descricao | String? |
| tipo | String? |
| geometria | Json (GeoJSON) |
| cor | String? |
| ativo | Boolean |
| createdBy | String? |
| dateCreated | DateTime |
| dateModified | DateTime |
| modifiedBy | String? |

---

## Cultivar

| Atributos | Tipo |
|-----------|------|
| id | Int |
| nomeCientifico | String? |
| nomePopular | String |
| tipoPlanta | TipoPlantaEnum (SOJA, MILHO, FEIJAO, …) |
| tipoSolo | TipoSoloEnum |
| phSolo | Float? |
| dataPlantioInicio | DateTime? |
| dataPlantioFim | DateTime? |
| periodoDias | Int? |
| mmAgua | Float? |
| aduboNitrogenio | Float? |
| aduboFosforo | Float? |
| aduboPotassio | Float? |
| aduboCalcio | Float? |
| aduboMagnesio | Float? |
| tempoCicloDias | Int? |
| densidadePlantio | Float? |
| densidadeColheita | Float? |
| observacao | String? |
| idUsuario | Int |
| idPraga | Int? |
| idFornecedor | Int? |
| createdBy | String? |
| dateCreated | DateTime |
| dateModified | DateTime? |
| modifiedBy | String? |

---

## Praga

| Atributos | Tipo |
|-----------|------|
| id | Int |
| nomeCientifico | String |
| nomeComum | String |
| descricao | String? |
| dateCreated | DateTime |
| dateModified | DateTime |
| createdBy | String? |
| modifiedBy | String? |

---

## Fornecedor

| Atributos | Tipo |
|-----------|------|
| id | Int |
| cnpj | String |
| razaoSocial | String |
| nomeFantasia | String? |
| responsavel | String? |
| email | String? |
| telefone | String? |
| linkSite | String? |
| logradouro | String? |
| numero | String? |
| complemento | String? |
| bairro | String? |
| cidade | String? |
| estado | String? |
| cep | String? |
| observacao | String? |
| idUsuario | Int |
| ativo | Boolean |
| createdBy | String? |
| dateCreated | DateTime |
| dateModified | DateTime |
| modifiedBy | String? |

---

## AnaliseSolo

| Atributos | Tipo |
|-----------|------|
| id | Int |
| idUsuario | Int |
| nomeSolo | String? |
| ph | Float? |
| areaTotal | Float? |
| hAi | Float? |
| sb | Float? |
| ctc | Float? |
| v | Float? |
| m | Float? |
| mo | Float? |
| prnt | Float? |
| valorCultural | Float? |
| n | Float? |
| p | Float? |
| k | Float? |
| ativo | Boolean |
| createdBy | String? |
| dateCreated | DateTime |
| dateModified | DateTime |
| modifiedBy | String? |

---

## Plantio

| Atributos | Tipo |
|-----------|------|
| id | Int |
| idCultivar | Int |
| idFazenda | Int |
| idTalhao | Int? |
| idAnaliseSolo | Int? |
| dataPlantio | DateTime |
| dataEmergencia | DateTime? |
| dataPrevistaColheita | DateTime? |
| dataMaturacao | DateTime? |
| areaPlantada | Float |
| densidadePlanejada | Float |
| densidadePlantioReal | Float |
| phSoloInicial | Float? |
| umidadeSoloInicial | Float? |
| loteSemente | String? |
| taxaGerminacao | Float? |
| tratamentoSemente | String? |
| profundidadeSemeadura | Float? |
| espacamentoEntreLinhas | Float? |
| orientacaoTransplantio | String? |
| mmAguaAplicado | Float |
| irrigacaoVolume | Float? |
| irrigacaoDuracao | Int? |
| aduboNitrogenioDose | Float? |
| aduboNitrogenioUnidade | UnidadeDoseEnum? |
| aduboFosforoDose | Float? |
| aduboFosforoUnidade | UnidadeDoseEnum? |
| aduboPotassioDose | Float? |
| aduboPotassioUnidade | UnidadeDoseEnum? |
| defensivoUtilizado | String? |
| doseDefensivo | Float? |
| unidadeDefensivo | UnidadeDoseEnum? |
| rendimentoEstimado | Float? |
| custoSemente | Float? |
| custoFertilizante | Float? |
| custoDefensivo | Float? |
| custoCombustivel | Float? |
| custoOutros | Float? |
| custoTotal | Float? |
| statusPlantio | StatusPlantioEnum (PLANEJADO, EXECUTADO, EM_MONITORAMENTO, CONCLUIDO) |
| observacao | String? |
| ativo | Boolean |
| createdBy | String? |
| dateCreated | DateTime |
| dateModified | DateTime |
| modifiedBy | String? |

---

## OperacaoPlantio

| Atributos | Tipo |
|-----------|------|
| id | Int |
| idPlantio | Int |
| idTalhao | Int? |
| tipoEtapa | TipoEtapaOperacaoEnum (PREPARO_SOLO, SEMEADURA, APLICACAO_*, COLHEITA, …) |
| dataInicio | DateTime |
| dataFim | DateTime? |
| areaHa | Float |
| custoTotal | Float? |
| custoPorHa | Float? |
| observacao | String? |
| ativo | Boolean |
| createdBy | String? |
| dateCreated | DateTime |
| dateModified | DateTime |
| modifiedBy | String? |

---

## Aplicacao

| Atributos | Tipo |
|-----------|------|
| id | Int |
| idOperacaoPlantio | Int |
| idProdutosEstoque | Int? |
| tipo | TipoAplicacaoEnum (DEFENSIVO, FERTILIZANTE) |
| nomeProduto | String? |
| dosePorHa | Float |
| unidadeDose | UnidadeDoseEnum (KG_HA, G_HA, ML_HA, L_HA, TON_HA) |
| quantidadeTotal | Float? |
| custoAplicacao | Float? |
| dataAplicacao | DateTime |
| observacao | String? |
| ativo | Boolean |
| createdBy | String? |
| dateCreated | DateTime |
| dateModified | DateTime |
| modifiedBy | String? |

---

## ProdutosEstoque

| Atributos | Tipo |
|-----------|------|
| id | Int |
| nome | String? |
| descricao | String? |
| marca | String? |
| quantidade | Int |
| valorUnitario | Float |
| unidadeMedida | UnidadeMedidaEnum |
| dataValidade | DateTime? |
| categoria | CategoriaEstoqueEnum |
| status | StatusEstoqueEnum |
| idFazenda | Int |
| idFornecedor | Int |
| ativo | Boolean |
| createdBy | String? |
| dateCreated | DateTime |
| dateModified | DateTime |
| modifiedBy | String? |

---

# SERVIÇOS (CLASSES DE APLICAÇÃO – ATRIBUTOS = DEPENDÊNCIAS, MÉTODOS = DOMÍNIO)

## AuthService

| Atributos (dependências) | Tipo |
|--------------------------|------|
| - userService | UserService |
| - jwtService | JwtService |
| - emailService | EmailService |
| - planoService | PlanoService |

| Métodos |
|---------|
| + validateUser(email: string, password: string): Promise<Usuario \| null> |
| + login(data: { email, password }): Promise<LoginResponse> |
| + register(data: CreateUserDto): Promise<UserModel> |
| + forgotPassword(email: string): Promise<{ message: string }> |
| + resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> |
| + verifyResetPasswordToken(token: string): Promise<{ valid: boolean, message?: string }> |

---

## UserService

| Atributos (dependências) | Tipo |
|--------------------------|------|
| - prisma | PrismaClient |

| Métodos |
|---------|
| + findByEmail(email: string): Promise<Usuario \| null> |
| + create(data: UsuarioCreateInput): Promise<Usuario> |
| + updateUser(userId: number, data: UsuarioUpdateInput): Promise<Usuario> |

---

## PlanoService

| Atributos (dependências) | Tipo |
|--------------------------|------|
| - prisma | PrismaClient |

| Métodos |
|---------|
| + getPlanoInicial(): Promise<Plano> |
| + getStatusPlanoUsuario(idUsuario: number): Promise<StatusPlanoUsuario \| null> |
| + criarUsuarioPlano(idUsuario: number, idPlano: number, createdBy?: string): Promise<void> |
| + cancelarAssinatura(idUsuario: number, motivoCancelamento?: string): Promise<CancelarPlanoResponseDto> |
| + vincularPlanoUsuario(idUsuario: number, idPlano: number, createdBy?: string): Promise<{ message: string }> |
| + gerarCobranca(idUsuario: number, body: GerarCobrancaRequestDto, createdBy?: string): Promise<GerarCobrancaResponseDto> |
| + registrarPagamento(idUsuario: number, body: RegistrarPagamentoRequestDto, createdBy?: string, codigoCobranca?: string): Promise<RegistrarPagamentoResponseDto> |

---

## FazendaService

| Atributos (dependências) | Tipo |
|--------------------------|------|
| - prisma | PrismaClient |

| Métodos |
|---------|
| + createFazenda(dto: CreateFazendaDto, userId: number, createdBy: string): Promise<FazendaModel> |
| + findAndCountByUser(userId: number, paginate?: Paginate, options?): Promise<{ data, count }> |

---

## PlantioService

| Atributos (dependências) | Tipo |
|--------------------------|------|
| - prisma | PrismaClient |

| Métodos |
|---------|
| + createPlantio(dto: CreatePlantioDto, createdBy: string): Promise<PlantioModel> |
| + updateStatusPlantio(idPlantio: number, statusPlantio: StatusPlantioEnum, idUsuario: number, modifiedBy: string): Promise<PlantioModel> |
| + listarPorFazenda(idFazenda: number, idUsuario: number, paginate?, options?): Promise<{ data: PlantioModel[], count }> |
| + listarPorFazendaTipoPlanta(idFazenda: number, tipoPlanta: TipoPlantaEnum): Promise<{ data: PlantioModel[], count }> |
| + custoPorSafra(idFazenda: number, ano: number, idUsuario: number): Promise<CustoPorSafraResponse> |

---

## AplicacaoService

| Atributos (dependências) | Tipo |
|--------------------------|------|
| - prisma | PrismaClient |

| Métodos |
|---------|
| + createAplicacao(dto: CreateAplicacaoDto, createdBy: string): Promise<AplicacaoModel> |
| + listarPorOperacao(idOperacaoPlantio: number): Promise<AplicacaoModel[]> |
| - calcularQuantidadeTotal(dosePorHa: number, areaHa: number): number |

---

## AnaliseSoloService

| Atributos (dependências) | Tipo |
|--------------------------|------|
| - prisma | PrismaClient |
| - cultivarService | CultivarService |

| Métodos |
|---------|
| + createAnaliseSolo(dto: CreateAnaliseSoloDto, userId: number, createdBy: string): Promise<AnaliseSoloModel> |
| + calculaCalagem(idPlantio: number): Promise<CalagemResponseModel> |
| + calculoAdubacao(idPlantio: number): Promise<AdubacaoResponseModel> |
| + comparativoNutrientes(idPlantio: number): Promise<ComparativoNutrientes> |

---

## CalculosUtil (classe utilitária de domínio)

| Atributos | Tipo |
|-----------|------|
| + EFICIENCIA | { N, P, K } (const) |
| + FATOR_CONVERSAO | number (const) |

| Métodos |
|---------|
| + calcDoseKgHa(soloMgDm3: number \| null, exigKgHa: number, eficiencia: number): number |
| + calcCalagem(analiseSolo: AnaliseSoloModel): CalagemModel |

---

## OperacaoPlantioService

| Atributos (dependências) | Tipo |
|--------------------------|------|
| - prisma | PrismaClient |

| Métodos |
|---------|
| + createOperacao(dto: CreateOperacaoPlantioDto, createdBy: string): Promise<OperacaoPlantioModel> |
| + listarPorPlantio(idPlantio: number): Promise<OperacaoPlantioModel[]> |
| - calcularCustoPorHa(custoTotal: number, areaHa: number): number |

*Regra (função fora da classe no código):* novoStatusPorEtapa(tipoEtapa, statusAtual): StatusPlantioEnum \| null

---

## ProdutoEstoqueService

| Atributos (dependências) | Tipo |
|--------------------------|------|
| - prisma | PrismaClient |

| Métodos |
|---------|
| + createProdutoEstoque(data: CreateProdutoEstoqueDto, createdBy: string): Promise<ProdutoEstoqueModel> |
| + aumentarQuantidade(id: number, quantidade: number): Promise<ProdutosEstoque> |
| + removerQuantidade(id: number, quantidade: number): Promise<ProdutosEstoque> |
| + listarPorFazenda(idFazenda: number, idUsuario: number, paginate?, options?): Promise<{ data, count }> |

---

## TalhaoService

| Atributos (dependências) | Tipo |
|--------------------------|------|
| - prisma | PrismaClient |

| Métodos |
|---------|
| + createTalhao(dto: CreateTalhaoDto, createdBy: string, idUsuario: number): Promise<TalhaoModel> |
| + mapaPorFazenda(idFazenda: number, idUsuario: number): Promise<TalhaoMapaResponse> |
| + listarPorFazenda(idFazenda: number, idUsuario: number, paginate?): Promise<{ data: TalhaoModel[], count }> |
| + resumoPorFazenda(idFazenda: number, idUsuario: number): Promise<ResumoPorFazenda> |

---

## ZonaManejoService

| Atributos (dependências) | Tipo |
|--------------------------|------|
| - prisma | PrismaClient |

| Métodos |
|---------|
| + createZonaManejo(dto: CreateZonaManejoDto, createdBy: string, idUsuario: number): Promise<ZonaManejoModel> |
| + listarPorFazenda(idFazenda: number, idUsuario: number, paginate?): Promise<{ data: ZonaManejoModel[], count }> |
| + mapaPorFazenda(idFazenda: number, idUsuario: number): Promise<FeatureCollection> |
| + updateWithUser(id: number, data, modifiedBy: string, idUsuario: number): Promise<ZonaManejoModel> |
| + findOneByIdAndUser(id: number, idUsuario: number): Promise<ZonaManejoModel \| null> |
| + deleteAndCheckUser(id: number, idUsuario: number): Promise<ZonaManejoModel> |

---

## CultivarService

| Atributos (dependências) | Tipo |
|--------------------------|------|
| - prisma | PrismaClient |

| Métodos |
|---------|
| + CreateCultivar(dto: CreateCultivarDto, userId: number, createdBy: string): Promise<CultivarModel> |
| + findAndCountByUser(userId: number, paginate?, options?): Promise<{ data, count }> |
| + checkUserCultivars(userId: number): Promise<Record<string, boolean>> |

---

## PragaService

| Atributos (dependências) | Tipo |
|--------------------------|------|
| - prisma | PrismaClient |

| Métodos |
|---------|
| + createPraga(dto: CreatePragaDto, createdBy: string): Promise<PragaModel> |

---

## RelatorioService

| Atributos (dependências) | Tipo |
|--------------------------|------|
| - prisma | PrismaClient |
| - planoService | PlanoService |

| Métodos |
|---------|
| + gerarRelatorioPlantios(idUsuario: number, ano?: number, idFazenda?: number): Promise<Buffer> |
| + gerarRelatorioEstoque(idUsuario: number, idFazenda?: number, categoria?: string): Promise<Buffer> |
| + gerarRelatorioAnalisesSolo(idUsuario: number, ano?: number): Promise<Buffer> |
| + gerarRelatorioResumo(idUsuario: number, ano?: number, mes?: number): Promise<Buffer> |

---

## DashboardService

| Atributos (dependências) | Tipo |
|--------------------------|------|
| - configService | ConfigService |
| - cultivos | (dados estáticos de culturas) |

| Métodos |
|---------|
| + getCultivoByName(nome: string): Promise<CultivoData> |
| + getWeatherByCity(city: string, state?: string, country?: string): Promise<WeatherResponse> |
| + getCommodityPrice(symbol?: string): Promise<CommodityPriceResponse> |
| + getNewsByQuery(query: string, pageSize?: number): Promise<NewsResponse> |
| + getSoilSummaryData(lon: number, lat: number, properties?: string[]): Promise<SoilSummaryResponse> |

---

## MapaService

| Atributos (dependências) | Tipo |
|--------------------------|------|
| - talhaoService | TalhaoService |
| - zonaManejoService | ZonaManejoService |

| Métodos |
|---------|
| + getMapaFazenda(idFazenda: number, idUsuario: number): Promise<MapaFazendaResponse> |

---

## Resumo para o diagrama

- **Entidades:** use a seção "ENTIDADES (MODELOS DE DOMÍNIO)" — uma caixa por modelo com atributos listados; métodos de domínio estão nos serviços.
- **Serviços:** use a seção "SERVIÇOS" — uma caixa por serviço com dependências como atributos e apenas os métodos de domínio listados.
- **Relações:** Usuario 1 — * Fazenda; Fazenda 1 — * Talhao, Plantio, ProdutosEstoque, ZonaManejo; Plantio * — 1 Cultivar, 1 Fazenda, 0..1 AnaliseSolo; Plantio 1 — * OperacaoPlantio; OperacaoPlantio 1 — * Aplicacao; etc. Serviços dependem de Prisma e de outros serviços conforme a tabela de atributos.
