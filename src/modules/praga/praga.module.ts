import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PragaService } from './praga.service';
import { PragaController } from './praga.controller';

@Module({
  controllers: [PragaController],
  providers: [PragaService, PrismaClient],
  exports: [PragaService],
})
export class PragaModule {}

