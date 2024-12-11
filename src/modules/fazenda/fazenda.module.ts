import { Module } from '@nestjs/common';
import { FazendaService } from './fazenda.service';
import { FazendaController } from './fazenda.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [FazendaController],
  providers: [FazendaService, PrismaClient],
  exports: [FazendaService],
})
export class FazendaModule {}

