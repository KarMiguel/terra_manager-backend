import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './logging.interceptor';
import { PrismaClient } from '@prisma/client';

@Global()
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    LoggingInterceptor,
    PrismaClient,
  ],
  exports: [LoggingInterceptor],
})
export class LoggingInterceptorModule {}
