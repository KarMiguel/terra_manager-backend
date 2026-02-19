import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RelatorioController } from './relatorio.controller';
import { RelatorioService } from './relatorio.service';

@Module({
  controllers: [RelatorioController],
  providers: [RelatorioService, PrismaClient],
  exports: [RelatorioService],
})
export class RelatorioModule {}
