import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { PrismaClient } from '@prisma/client';
import * as express from 'express';

let cachedApp: express.Express;

async function createApp(): Promise<express.Express> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

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
  
  // Registrar o interceptor de logging globalmente
  const prisma = app.get(PrismaClient);
  app.useGlobalInterceptors(new LoggingInterceptor(prisma));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Terra Manager API')
    .setDescription(`
      API completa para gerenciamento agrícola e análise de solo.
      
      ## Funcionalidades Principais:
      
      - **Autenticação**: Sistema de login, registro e recuperação de senha
      - **Dashboard**: Dados climáticos, cotações de commodities, notícias e informações sobre solo e culturas
      - **Fazendas**: Gerenciamento de fazendas e propriedades rurais
      - **Plantios**: Controle de plantios por fazenda e tipo de planta
      - **Análise de Solo**: Análises de solo com cálculos de calagem e adubação
      - **Cultivares**: Gerenciamento de cultivares com exigências nutricionais
      - **Pragas**: Cadastro e gerenciamento de pragas
      - **Fornecedores**: Controle de fornecedores
      - **Produto Estoque**: Gerenciamento de estoque de produtos por fazenda
      - **Usuários**: Gerenciamento de usuários do sistema
      
      ## Autenticação:
      
      A maioria dos endpoints requer autenticação via JWT Bearer Token. 
      Use o endpoint \`/auth/login\` para obter o token e depois clique no botão "Authorize" 
      no topo desta página para adicionar o token nas requisições.
      
      ## Paginação:
      
      Endpoints que retornam listas suportam paginação através dos parâmetros:
      - \`page\`: Número da página (padrão: 1)
      - \`pageSize\`: Itens por página (padrão: 10)
      - \`options\`: Filtros em formato JSON (opcional)
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
    .addTag('Auth', 'Endpoints de autenticação e autorização')
    .addTag('Dashboard', 'Dados climáticos, cotações, notícias e informações gerais')
    .addTag('Fazenda', 'Gerenciamento de fazendas')
    .addTag('Plantio', 'Gerenciamento de plantios')
    .addTag('Análise de Solo', 'Análises de solo e cálculos de calagem/adubação')
    .addTag('Cultivar', 'Gerenciamento de cultivares')
    .addTag('Praga', 'Gerenciamento de pragas')
    .addTag('Fornecedor', 'Gerenciamento de fornecedores')
    .addTag('Produto Estoque', 'Gerenciamento de estoque de produtos')
    .addTag('User', 'Gerenciamento de usuários')
    .addTag('Log', 'Registro de operações do sistema')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

export default async function handler(req: express.Request, res: express.Response) {
  const app = await createApp();
  return app(req, res);
}
