import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PlanoModule } from '../plano/plano.module';
import { RelatorioController } from './relatorio.controller';
import { RelatorioService } from './relatorio.service';

@Module({
  imports: [PlanoModule],
  controllers: [RelatorioController],
  providers: [RelatorioService, PrismaClient],
  exports: [RelatorioService],
})
export class RelatorioModule {}
