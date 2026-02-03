import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [
    LogService,
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
  ],
  controllers: [LogController],
  exports: [LogService],
})
export class LogModule {}
