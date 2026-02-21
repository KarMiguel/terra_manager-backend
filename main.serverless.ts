import express from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModuleServerless } from './src/app.module.serverless';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverless from 'serverless-http';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './src/common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';

let cachedHandler: ReturnType<typeof serverless> | null = null;

async function bootstrap(): Promise<ReturnType<typeof serverless>> {
  if (cachedHandler) return cachedHandler;

  const expressApp = express();
  const app = await NestFactory.create(AppModuleServerless, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn'],
  });

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
  // LoggingInterceptor já registrado via LoggingInterceptorModule (APP_INTERCEPTOR)

  // Swagger em /api-docs — assets via CDN para evitar múltiplas chamadas serverless
  const config = new DocumentBuilder()
    .setTitle('Terra Manager API')
    .setDescription('API para gerenciamento agrícola')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js',
    ],
  });

  await app.init();

  cachedHandler = serverless(expressApp);
  return cachedHandler;
}

// Handler padrão do Vercel — aguarda bootstrap antes de processar cada requisição
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const handle = await bootstrap();
  return handle(req, res);
}