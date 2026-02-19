import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Terra Manager API')
    .setDescription(`
      API para gerenciamento agrícola: fazendas, plantios, talhões, operações do plantio, aplicações (defensivos/fertilizantes), análise de solo, custos por safra e relatórios em PDF.

      ## Funcionalidades principais

      - **Auth**: Login, registro e recuperação de senha (JWT).
      - **Fazendas**: Cadastro de propriedades rurais.
      - **Talhões**: Parcelas de terra por fazenda (área em ha). Base para custo, rotação e mapa. Endpoints: \`POST/GET /talhao\`, \`GET /talhao/fazenda/:id\`, \`GET /talhao/fazenda/:id/resumo\`.
      - **Plantios**: Plantios por fazenda e tipo de planta; opcionalmente vinculados a talhão (\`idTalhao\`). \`GET /plantio/fazenda/:id/custo-safra?ano=YYYY\` retorna custo total da safra, área e resumo por operação.
      - **Operações do plantio**: Etapas (preparo, semeadura, aplicação defensivo/fertilizante, irrigação, colheita). Custo por ha calculado automaticamente. \`POST /operacao-plantio\`, \`GET /operacao-plantio/plantio/:id\`.
      - **Aplicações**: Registro de defensivo ou fertilizante por operação; dose por ha e quantidade total (dose × área) calculada. \`POST /aplicacao\`, \`GET /aplicacao/operacao/:id\`.
      - **Análise de Solo**: Análises com cálculos de calagem e adubação.
      - **Cultivares**, **Pragas**, **Fornecedores**, **Produto Estoque**: Cadastros auxiliares.
      - **Planos**: Assinaturas (Básico, Pro, Premium), cobrança e pagamento.
      - **Relatórios**: PDFs (plantios, estoque, análises de solo, resumo geral).
      - **Dashboard**: Clima, cotações, notícias, dados de solo e cultura.

      ## Documentação complementar

      - **Regras de negócio**: \`REGRAS_NEGOCIO.md\` — RN por módulo, modelos e relacionamentos.
      - **Cálculos agronômicos**: \`REFERENCIAS_AGRONOMIA.md\` — Fórmulas e referências (talhão, dose por ha, custo por safra).
      - **Índice geral**: \`DOCUMENTACAO_SISTEMA.md\` — Visão geral da documentação do projeto.

      ## Autenticação

      A maioria dos endpoints exige JWT. Obtenha o token em \`POST /auth/login\` e use o botão **Authorize** nesta página para enviá-lo no header \`Authorization: Bearer <token>\`.

      ## Paginação e filtros

      - \`page\`: Página (padrão 1).
      - \`pageSize\`: Itens por página (padrão 10).
      - \`options\`: JSON com filtros (ex.: \`{"where": {"ativo": true}}\`).
    `)
    .setVersion('1.0')
    .setContact('Terra Manager', '', '')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Digite o token JWT obtido no endpoint /auth/login',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', 'Autenticação: login, registro, recuperação de senha')
    .addTag('Dashboard', 'Clima, cotações, notícias, solo e cultura')
    .addTag('Fazenda', 'Cadastro de fazendas')
    .addTag('Talhão', 'Parcelas de terra por fazenda (área por talhão, resumo)')
    .addTag('Plantio', 'Plantios por fazenda; custo por safra')
    .addTag('Operação do plantio', 'Etapas do plantio e custo por operação')
    .addTag('Aplicação', 'Defensivos e fertilizantes (dose por ha, quantidade total)')
    .addTag('Análise de Solo', 'Análises e cálculos de calagem/adubação')
    .addTag('Cultivar', 'Cultivares e exigências nutricionais')
    .addTag('Praga', 'Cadastro de pragas')
    .addTag('Fornecedor', 'Cadastro de fornecedores')
    .addTag('Produto Estoque', 'Estoque de produtos por fazenda')
    .addTag('User', 'Usuários do sistema')
    .addTag('Plano', 'Planos, assinaturas, cobrança e pagamento')
    .addTag('Relatório', 'Relatórios em PDF')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Manter o token inserido entre requisições
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
