import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import * as serverless from 'serverless-http';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.enableCors();
  await app.init();
}
bootstrap();

export const handler = serverless(server);