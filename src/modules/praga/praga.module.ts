import { Module } from '@nestjs/common';
import { PragaService } from './praga.service';
import { PragaController } from './praga.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [PragaController],
  providers: [PragaService, PrismaClient],
  exports: [PragaService],

})
export class PragaModule {}

