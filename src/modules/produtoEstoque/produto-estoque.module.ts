import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ProdutoEstoqueController } from './produto-estoque.controller';
import { ProdutoEstoqueService } from './produto-estoque.service';

@Module({
  controllers: [ProdutoEstoqueController],
  providers: [ProdutoEstoqueService, PrismaClient],
  exports: [ProdutoEstoqueService],
})
export class ProdutoEstoqueModule {}
