import express from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverless from 'serverless-http';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './src/common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './src/common/interceptors/logging.interceptor';
import { PrismaClient } from '@prisma/client';
import { IncomingMessage, ServerResponse } from 'http';

let cachedHandler: ReturnType<typeof serverless> | null = null;

async function bootstrap(): Promise<ReturnType<typeof serverless>> {
  if (cachedHandler) return cachedHandler;

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
  app.useGlobalInterceptors(new LoggingInterceptor(new PrismaClient()));

  // Swagger em /api-docs
  const config = new DocumentBuilder()
    .setTitle('Terra Manager API')
    .setDescription('API para gerenciamento agrícola')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.init();

  cachedHandler = serverless(expressApp);
  return cachedHandler;
}

// Handler padrão do Vercel — aguarda o bootstrap antes de processar cada requisição
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const handle = await bootstrap();
  return handle(req, res);
}