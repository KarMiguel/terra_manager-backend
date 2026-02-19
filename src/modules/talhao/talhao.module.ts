import { Module } from '@nestjs/common';
import { TalhaoService } from './talhao.service';
import { TalhaoController } from './talhao.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [TalhaoController],
  providers: [TalhaoService, PrismaClient],
  exports: [TalhaoService],
})
export class TalhaoModule {}
