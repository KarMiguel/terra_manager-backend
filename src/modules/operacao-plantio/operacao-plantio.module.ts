import { Module } from '@nestjs/common';
import { OperacaoPlantioService } from './operacao-plantio.service';
import { OperacaoPlantioController } from './operacao-plantio.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [OperacaoPlantioController],
  providers: [OperacaoPlantioService, PrismaClient],
  exports: [OperacaoPlantioService],
})
export class OperacaoPlantioModule {}
