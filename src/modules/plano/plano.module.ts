import { Module } from '@nestjs/common';
import { PlanoService } from './plano.service';
import { PlanoController } from './plano.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [PlanoController],
  providers: [PlanoService, PrismaClient],
  exports: [PlanoService],
})
export class PlanoModule {}
