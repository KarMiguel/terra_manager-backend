import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { FornecedorController } from './fornecedor.controller';
import { FornecedorService } from './fornecedor.service';

@Module({
  controllers: [FornecedorController],
  providers: [FornecedorService, PrismaClient],
  exports: [FornecedorService],
})
export class FornecedorModule {}

