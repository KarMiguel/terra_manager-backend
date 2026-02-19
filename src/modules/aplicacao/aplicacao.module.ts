import { Module } from '@nestjs/common';
import { AplicacaoService } from './aplicacao.service';
import { AplicacaoController } from './aplicacao.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [AplicacaoController],
  providers: [AplicacaoService, PrismaClient],
  exports: [AplicacaoService],
})
export class AplicacaoModule {}
