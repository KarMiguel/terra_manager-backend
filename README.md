<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Documentação do sistema

O projeto possui documentação estruturada em vários arquivos. O **índice geral** está em **[DOCUMENTACAO_SISTEMA.md](./DOCUMENTACAO_SISTEMA.md)**.

| Documento | Conteúdo |
|-----------|----------|
| **[DOCUMENTACAO_SISTEMA.md](./DOCUMENTACAO_SISTEMA.md)** | Índice de toda a documentação |
| **[PASSO_A_PASSO_SISTEMA.md](./PASSO_A_PASSO_SISTEMA.md)** | Passo a passo: cadastro → plano → pagamento → fazenda → plantio |
| **[REGRAS_NEGOCIO.md](./REGRAS_NEGOCIO.md)** | Regras de negócio (RN), modelos de entidade, FKs |
| **[REFERENCIAS_AGRONOMIA.md](./REFERENCIAS_AGRONOMIA.md)** | Fórmulas e referências dos cálculos agronômicos |
| **[IDEIAS_EVOLUCAO.md](./IDEIAS_EVOLUCAO.md)** | Backlog e status das funcionalidades |
| **Swagger (/api-docs)** | Documentação interativa da API (endpoints, parâmetros, exemplos) |

---

## Documentação Swagger

### Acessar a Documentação

A documentação interativa da API está disponível em:
- **URL**: `http://localhost:3000/api-docs`
- **Formato JSON**: `http://localhost:3000/api-docs-json` (para importar no Postman)

### Configuração do Swagger

O Swagger está configurado no arquivo `src/main.ts` com as seguintes características:

```typescript
// Configuração do Swagger
const config = new DocumentBuilder()
  .setTitle('API Documentation')           // Título da documentação
  .setDescription('API documentation for the application')  // Descrição
  .setVersion('1.0')                        // Versão da API
  .addBearerAuth(                          // Configuração de autenticação JWT
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
    'access-token',                        // Nome do esquema de autenticação
  )
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api-docs', app, document, {
  swaggerOptions: {
    persistAuthorization: true,            // Mantém o token entre requisições
  },
});
```

**Características da Configuração:**
- **Título**: API Documentation
- **Versão**: 1.0
- **Autenticação**: Bearer Token (JWT) com esquema nomeado 'access-token'
- **Persistência de Token**: O token inserido é mantido entre requisições
- **Rota**: `/api-docs` - Interface Swagger UI
- **Rota JSON**: `/api-docs-json` - Especificação OpenAPI em JSON

### Estrutura dos Controllers

O projeto utiliza uma arquitetura baseada em controllers que herdam de `CrudController`:

#### Controller Base: `CrudController`

Localizado em `src/crud.controller.ts`, fornece operações CRUD padrão:

```typescript
export abstract class CrudController<T, R> {
  @Put(':id')           // Atualizar registro
  @Get()                // Listar todos com paginação e filtros
  @Get(':id')           // Buscar por ID
  @Delete(':id')        // Deletar registro
}
```

**Endpoints herdados automaticamente:**
- `PUT /{recurso}/:id` - Atualizar registro
- `GET /{recurso}` - Listar com paginação (query: `options`, `paginate`)
- `GET /{recurso}/:id` - Buscar por ID
- `DELETE /{recurso}/:id` - Deletar registro

#### Controllers Específicos

Cada módulo possui seu próprio controller que estende `CrudController` e adiciona endpoints customizados:

**1. AuthController** (`src/modules/auth/auth.controller.ts`)
- **Não herda** de CrudController
- **Endpoints públicos** (sem autenticação - decorator `@Public()`)
- `POST /auth/login` - Autenticação de usuário
- `POST /auth/register` - Registro de novo usuário
- `POST /auth/forgot-password` - Solicitação de recuperação de senha
- `POST /auth/verify-reset-password-token` - Verificação de token
- `POST /auth/reset-password` - Redefinição de senha

**2. DashboardController** (`src/modules/dashboard/dashboard.controller.ts`)
- **Não herda** de CrudController
- **Endpoints públicos**
- `GET /dashboard/clima?city={}&state={}&country={}` - Dados climáticos
- `GET /dashboard/cotacao-bolsa?symbol={}` - Cotações de commodities
- `GET /dashboard/noticias?query={}&size={}` - Notícias relacionadas
- `GET /dashboard/dados-solo?log={}&lat={}&properties={}` - Propriedades do solo
- `GET /dashboard/dados-cultura?nome={}` - Informações sobre culturas

**3. AnaliseSoloController** (`src/modules/analiseSolo/analise-solo.controller.ts`)
- Herda CRUD + endpoints específicos de cálculos:
  - `POST /analise-solo` - Criar análise de solo
  - `GET /analise-solo/lista?options={}&page={}&pageSize={}` - Listar análises do usuário
  - `GET /analise-solo/plantio/:idPlantio` - Buscar análise por plantio
  - `GET /analise-solo/calagem/:idPlantio` - Calcular calagem (t/ha)
  - `GET /analise-solo/adubacao/:idPlantio` - Calcular adubação NPK
  - `GET /analise-solo/comparativo-nutrientes/:idPlantio` - Comparativo cultivar vs solo

**4. PlantioController** (`src/modules/plantio/plantio.controller.ts`)
- Herda CRUD + endpoints específicos:
  - `POST /plantio` - Criar plantio (opcional: idTalhao)
  - `GET /plantio/fazenda/:idFazenda?options={}&page={}&pageSize={}` - Listar por fazenda
  - `GET /plantio/fazenda/:idFazenda/tipo-planta/:tipoPlanta` - Filtrar por tipo de planta
  - `GET /plantio/fazenda/:idFazenda/custo-safra?ano=YYYY` - Custo por safra (área, custo total, R$/ha, resumo por operação)

**4b. TalhaoController** (`src/modules/talhao/talhao.controller.ts`)
- `POST /talhao` - Criar talhão (idFazenda, nome, areaHa)
- `GET /talhao/fazenda/:idFazenda` - Listar talhões da fazenda
- `GET /talhao/fazenda/:idFazenda/resumo` - Resumo (área total e por talhão)
- Herda: PUT /talhao/:id, GET /talhao, GET /talhao/:id, DELETE /talhao/:id

**4c. OperacaoPlantioController** (`src/modules/operacao-plantio/operacao-plantio.controller.ts`)
- `POST /operacao-plantio` - Registrar operação/etapa (tipoEtapa, dataInicio, areaHa, custoTotal; custoPorHa calculado)
- `GET /operacao-plantio/plantio/:idPlantio` - Listar operações do plantio
- Herda: PUT, GET, GET/:id, DELETE

**4d. AplicacaoController** (`src/modules/aplicacao/aplicacao.controller.ts`)
- `POST /aplicacao` - Registrar aplicação defensivo/fertilizante (dosePorHa; quantidadeTotal = dosePorHa × área)
- `GET /aplicacao/operacao/:idOperacaoPlantio` - Listar aplicações da operação
- Herda: PUT, GET, GET/:id, DELETE

**5. CultivarController** (`src/modules/cultivar/cultivar.controller.ts`)
- Herda CRUD + endpoints específicos:
  - `POST /cultivar` - Criar cultivar
  - `GET /cultivar/lista?options={}&page={}&pageSize={}` - Listar cultivares do usuário
  - `GET /cultivar/check-cultivars` - Verificar quais tipos de planta o usuário possui

**6. FazendaController** (`src/modules/fazenda/fazenda.controller.ts`)
- Herda CRUD + endpoints específicos:
  - `POST /fazenda` - Criar fazenda
  - `GET /fazenda/lista?options={}&page={}&pageSize={}` - Listar fazendas do usuário

**7. PragaController** (`src/modules/praga/praga.controller.ts`)
- Herda CRUD padrão
- `POST /praga` - Criar praga (customizado para incluir `createdBy`)

**8. FornecedorController** (`src/modules/fornecedor/fornecedor.controller.ts`)
- Herda CRUD padrão

**9. ProdutoEstoqueController** (`src/modules/produtoEstoque/produto-estoque.controller.ts`)
- Herda CRUD padrão

**10. UserController** (`src/modules/user/user.controller.ts`)
- Herda CRUD padrão
- `GET /user/by-email?email={}` - Buscar usuário por email

### Recursos de Documentação Utilizados

#### Decorators de Controller

- **`@ApiTags('Nome')`**: Agrupa endpoints por categoria (ex: 'Auth', 'Plantio', 'Análise de Solo')
- **`@ApiBearerAuth('access-token')`**: Indica que o endpoint requer autenticação JWT
- **`@ApiOperation({ summary: 'Descrição' })`**: Adiciona descrição resumida do endpoint

#### Decorators de Parâmetros

- **`@ApiQuery()`**: Documenta parâmetros de query string
  ```typescript
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    description: 'Número da página', 
    type: Number, 
    example: 1 
  })
  ```

- **`@ApiParam()`**: Documenta parâmetros de rota
  ```typescript
  @ApiParam({
    name: 'id',
    description: 'ID do registro',
    type: Number,
    required: true
  })
  ```

- **`@ApiBody()`**: Documenta o corpo da requisição
  ```typescript
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'usuario@example.com' }
      }
    }
  })
  ```

#### Decorators de DTO

- **`@ApiProperty()`**: Documenta propriedades de DTOs
  ```typescript
  @ApiProperty({ 
    description: 'Email do usuário', 
    example: 'usuario@example.com' 
  })
  email: string;
  ```

### Endpoints Documentados

#### 1. **Auth** (Público)
- `POST /auth/login` - Autenticação de usuário
- `POST /auth/register` - Registro de novo usuário
- `POST /auth/forgot-password` - Solicitação de recuperação de senha
- `POST /auth/verify-reset-password-token` - Verificação de token de reset
- `POST /auth/reset-password` - Redefinição de senha

#### 2. **Dashboard** (Público)
- `GET /dashboard/clima` - Dados climáticos por cidade
- `GET /dashboard/cotacao-bolsa` - Cotações de commodities
- `GET /dashboard/noticias` - Notícias relacionadas
- `GET /dashboard/dados-solo` - Dados de propriedades do solo
- `GET /dashboard/dados-cultura` - Informações sobre culturas

#### 3. **Análise de Solo** (Protegido - JWT)
- `POST /analise-solo` - Criar análise de solo
- `GET /analise-solo/lista` - Listar análises com paginação
- `GET /analise-solo/plantio/:idPlantio` - Buscar análise por plantio
- `GET /analise-solo/calagem/:idPlantio` - Calcular calagem
- `GET /analise-solo/adubacao/:idPlantio` - Calcular adubação
- `GET /analise-solo/comparativo-nutrientes/:idPlantio` - Comparativo de nutrientes

#### 4. **Plantio** (Protegido - JWT)
- `POST /plantio` - Criar plantio (opcional: idTalhao)
- `GET /plantio` - Listar todos os plantios
- `GET /plantio/:id` - Buscar plantio por ID
- `GET /plantio/fazenda/:idFazenda` - Listar plantios por fazenda
- `GET /plantio/fazenda/:idFazenda/tipo-planta/:tipoPlanta` - Filtrar por tipo de planta
- `GET /plantio/fazenda/:idFazenda/custo-safra?ano=YYYY` - Custo por safra
- `PUT /plantio/:id` - Atualizar plantio
- `DELETE /plantio/:id` - Deletar plantio

#### 4b. **Talhão** (Protegido - JWT)
- `POST /talhao` - Criar talhão
- `GET /talhao/fazenda/:idFazenda` - Listar talhões da fazenda
- `GET /talhao/fazenda/:idFazenda/resumo` - Resumo área por talhão
- CRUD: GET /talhao, GET /talhao/:id, PUT /talhao/:id, DELETE /talhao/:id

#### 4c. **Operação do plantio** (Protegido - JWT)
- `POST /operacao-plantio` - Registrar operação/etapa
- `GET /operacao-plantio/plantio/:idPlantio` - Listar operações do plantio
- CRUD: GET, GET/:id, PUT/:id, DELETE/:id

#### 4d. **Aplicação** (Protegido - JWT)
- `POST /aplicacao` - Registrar aplicação defensivo/fertilizante
- `GET /aplicacao/operacao/:idOperacaoPlantio` - Listar aplicações da operação
- CRUD: GET, GET/:id, PUT/:id, DELETE/:id

#### 5. **Cultivar** (Protegido - JWT)
- `POST /cultivar` - Criar cultivar
- `GET /cultivar` - Listar cultivares
- `GET /cultivar/:id` - Buscar cultivar por ID
- `PUT /cultivar/:id` - Atualizar cultivar
- `DELETE /cultivar/:id` - Deletar cultivar

#### 6. **Fazenda** (Protegido - JWT)
- `POST /fazenda` - Criar fazenda
- `GET /fazenda` - Listar fazendas
- `GET /fazenda/:id` - Buscar fazenda por ID
- `PUT /fazenda/:id` - Atualizar fazenda
- `DELETE /fazenda/:id` - Deletar fazenda

#### 7. **Praga** (Protegido - JWT)
- `POST /praga` - Criar praga
- `GET /praga` - Listar pragas
- `GET /praga/:id` - Buscar praga por ID
- `PUT /praga/:id` - Atualizar praga
- `DELETE /praga/:id` - Deletar praga

#### 8. **Fornecedor** (Protegido - JWT)
- `POST /fornecedor` - Criar fornecedor
- `GET /fornecedor` - Listar fornecedores
- `GET /fornecedor/:id` - Buscar fornecedor por ID
- `PUT /fornecedor/:id` - Atualizar fornecedor
- `DELETE /fornecedor/:id` - Deletar fornecedor

#### 9. **Produto Estoque** (Protegido - JWT)
- `POST /produto-estoque` - Criar produto em estoque
- `GET /produto-estoque` - Listar produtos
- `GET /produto-estoque/:id` - Buscar produto por ID
- `PUT /produto-estoque/:id` - Atualizar produto
- `DELETE /produto-estoque/:id` - Deletar produto

#### 10. **User** (Protegido - JWT)
- `GET /user` - Listar usuários
- `GET /user/:id` - Buscar usuário por ID
- `PUT /user/:id` - Atualizar usuário
- `DELETE /user/:id` - Deletar usuário

### Como Usar o Swagger UI

#### 1. Autenticação

1. **Obter Token JWT**:
   - Acesse o endpoint `POST /auth/login`
   - Preencha os campos:
     ```json
     {
       "email": "seu-email@example.com",
       "password": "sua-senha"
     }
     ```
   - Execute a requisição
   - Copie o `accessToken` da resposta

2. **Autorizar no Swagger**:
   - Clique no botão **"Authorize"** (cadeado) no topo da página
   - Cole o token JWT no campo
   - Clique em **"Authorize"** e depois **"Close"**
   - O token será mantido para todas as requisições protegidas

#### 2. Testar Endpoints

1. **Expandir Endpoint**: Clique no endpoint desejado para expandir
2. **Preencher Dados**: 
   - Parâmetros de rota: preencha diretamente na URL
   - Query parameters: use a interface do Swagger
   - Body: use o editor JSON ou formulário
3. **Executar**: Clique em **"Try it out"** e depois **"Execute"**
4. **Ver Resposta**: A resposta aparecerá abaixo com código HTTP, headers e body

#### 3. Exemplos de Uso

**Criar Análise de Solo:**
```json
POST /analise-solo
{
  "ph": 6.2,
  "areaTotal": 10.5,
  "hAi": 2.5,
  "sb": 4.2,
  "ctc": 6.7,
  "v": 62.7,
  "m": 15.3,
  "mo": 3.2,
  "n": 100,
  "p": 100,
  "k": 100
}
```

**Listar Plantios com Paginação:**
```
GET /plantio?options={"where":{"statusPlantio":"PLANEJADO"}}&page=1&pageSize=10
```

**Calcular Calagem:**
```
GET /analise-solo/calagem/1
```

### Importar no Postman

1. Acesse `http://localhost:3000/api-docs-json`
2. Copie o JSON gerado
3. No Postman:
   - File → Import
   - Cole o JSON ou importe a URL
   - A collection será criada automaticamente
4. Configure variáveis de ambiente:
   - `base_url`: `http://localhost:3000`
   - `token`: Token JWT obtido no login
5. Configure autenticação:
   - Selecione a collection
   - Vá em Authorization → Type: Bearer Token
   - Use `{{token}}` como valor

### Estrutura de Respostas

#### Resposta de Sucesso
```json
{
  "id": 1,
  "campo1": "valor1",
  "campo2": "valor2",
  "dateCreated": "2024-01-01T00:00:00.000Z"
}
```

#### Resposta com Paginação
```json
{
  "data": [...],
  "count": 100
}
```

#### Resposta de Erro
```json
{
  "statusCode": 400,
  "message": "Mensagem de erro",
  "error": "Bad Request"
}
```

### Validação de Dados

Todos os endpoints utilizam `class-validator` para validação:
- Campos obrigatórios são marcados com `@IsNotEmpty()`
- Tipos são validados automaticamente
- Mensagens de erro personalizadas são retornadas

### Recursos Avançados

- **Filtros JSON**: Use o parâmetro `options` para filtrar resultados
  ```json
  {"where": {"campo": "valor"}, "order": {"dateCreated": "desc"}}
  ```

- **Paginação**: Use `page` e `pageSize` para paginar resultados
  ```
  ?page=1&pageSize=10
  ```

- **Enums**: Alguns endpoints aceitam valores de enum (ex: `TipoPlantaEnum`)
  
## Testes

### Tecnologias Utilizadas

- **Jest**: Framework de testes JavaScript/TypeScript
- **@nestjs/testing**: Módulo de testes do NestJS para criação de módulos de teste
- **Supertest**: Biblioteca para testes de API HTTP
- **ts-jest**: Transformador TypeScript para Jest

### Estrutura de Testes

O projeto utiliza dois tipos de testes:

1. **Testes Unitários** (`*.spec.ts`): Localizados em `src/` e `test/`
   - Testam serviços, controladores e componentes isoladamente
   - Usam mocks para dependências externas (Prisma, serviços, etc.)
   - Exemplo: `test/auth/auth.service.spec.ts`, `test/plantio/plantio.service.spec.ts`

2. **Testes E2E** (`*.e2e-spec.ts`): Localizados em `test/`
   - Testam a aplicação completa end-to-end
   - Usam Supertest para fazer requisições HTTP reais
   - Exemplo: `test/app.e2e-spec.ts`

### Configuração

- **Jest Unitário**: `jest.config.ts` - Configura testes unitários
- **Jest E2E**: `test/jest-e2e.json` - Configura testes end-to-end

### Executar Testes

```bash
# Testes unitários
$ npm run test

# Testes unitários em modo watch (observa mudanças)
$ npm run test:watch

# Testes E2E
$ npm run test:e2e

# Cobertura de testes
$ npm run test:cov

# Debug de testes
$ npm run test:debug
```

### Como Funcionam os Testes Unitários

Os testes unitários seguem o padrão do NestJS:

1. **Criação do módulo de teste**: Usa `Test.createTestingModule()` para criar um ambiente isolado
2. **Mock de dependências**: Substitui serviços e dependências por mocks usando `useValue`
3. **Testes isolados**: Cada teste verifica comportamentos específicos sem depender de serviços externos

**Exemplo de estrutura:**
```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServiceName,
        {
          provide: PrismaClient,
          useValue: {
            // mocks do Prisma
          },
        },
      ],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
  });

  it('deve executar ação esperada', async () => {
    // teste aqui
  });
});
```

### Testes de API

#### Swagger UI

A documentação interativa da API está disponível em:
- **URL**: `http://localhost:3000/api-docs`
- Permite testar endpoints diretamente no navegador
- Suporta autenticação JWT Bearer Token
- Configurado em `src/main.ts` com `@nestjs/swagger`

**Como usar:**
1. Inicie a aplicação: `npm run start:dev`
2. Acesse `http://localhost:3000/api-docs`
3. Faça login via endpoint `/auth/login` para obter o token
4. Clique em "Authorize" e cole o token JWT
5. Teste os endpoints diretamente na interface

#### Postman

Para testar via Postman:

1. **Importar Collection**: Use a URL do Swagger para gerar collection:
   - Acesse `http://localhost:3000/api-docs-json` (formato JSON)
   - Importe no Postman

2. **Autenticação**:
   - Faça POST em `/auth/login` com `email` e `password`
   - Copie o `accessToken` da resposta
   - Configure no Postman: Authorization → Bearer Token → Cole o token

3. **Variáveis de Ambiente**:
   - Crie variável `base_url`: `http://localhost:3000`
   - Crie variável `token`: Token JWT obtido no login

4. **Testar Endpoints**:
   - Todos os endpoints protegidos requerem o header: `Authorization: Bearer {token}`
   - Endpoints públicos: `/auth/login`, `/auth/register`

### Plano de Testes

**Cobertura atual:**
- ✅ Serviços de autenticação (`auth.service.spec.ts`)
- ✅ Controladores de autenticação (`auth.controller.spec.ts`)
- ✅ Serviços de plantio (`plantio.service.spec.ts`)
- ✅ Serviços de cultivar (`cultivar.service.spec.ts`)
- ✅ Serviços de fazenda (`fazenda.service.spec.ts`)
- ✅ Serviços de praga (`praga.service.spec.ts`)
- ✅ Serviços de fornecedor (`fornecedor.service.spec.ts`)
- ✅ Serviços de produto estoque (`produtoEstoque.spec.ts`)
- ✅ Dashboard controller (`dashboard.controller.spec.ts`)
- ✅ Teste E2E básico (`app.e2e-spec.ts`)

**Comandos**
- npm run test - executa testes unitários
- npm run test:e2e - executa testes E2E
- npm run test:cov - gera cobertura de teste 

**Próximos passos:**
- Expandir cobertura de testes unitários para todos os módulos
- Adicionar mais testes E2E para fluxos completos
- Testes de integração com banco de dados

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
