import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CrudService } from 'src/crud.service';
import { PrismaClient, Fazenda } from '@prisma/client';
import { ProdutoEstoqueModel } from './interface/produto-estoque.interface';
import { CreateProdutoEstoqueDto } from './dto/create-produto-estoque.dto';

@Injectable()
export class ProdutoEstoqueService extends CrudService<Fazenda, ProdutoEstoqueModel> {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'produtosEstoque', ProdutoEstoqueModel);
  }

  
  async createProdutoEstoque(data: CreateProdutoEstoqueDto, createdBy: string) {
    return this.prisma.produtosEstoque.create({
      data: {
        ...data,
        createdBy,
      },
    });
  }
  

  async aumentarQuantidade(id: number, quantidade: number) {
    if (quantidade <= 0) {
      throw new BadRequestException('A quantidade deve ser maior que 0.');
    }

    const produto = await this.prisma.produtosEstoque.findUnique({ where: { id } });

    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }

    return this.prisma.produtosEstoque.update({
      where: { id },
      data: { quantidade: produto.quantidade + quantidade },
    });
  }

  async removerQuantidade(id: number, quantidade: number) {
    if (quantidade <= 0) {
      throw new BadRequestException('A quantidade deve ser maior que 0.');
    }

    const produto = await this.prisma.produtosEstoque.findUnique({ where: { id } });

    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }

    if (produto.quantidade < quantidade) {
      throw new BadRequestException('A quantidade a ser removida é maior que o estoque disponível.');
    }

    return this.prisma.produtosEstoque.update({
      where: { id },
      data: { quantidade: produto.quantidade - quantidade },
    });
  }
  
  async listarPorFazenda(idFazenda: number, idUsuario: number) {
    const fazenda = await this.prisma.fazenda.findUnique({
      where: { id: idFazenda },
    });
  
    if (!fazenda) {
      throw new NotFoundException(`Fazenda com ID ${idFazenda} não encontrada.`);
    }
  
    if (fazenda.idUsuario !== idUsuario) {
      throw new BadRequestException(
        `O usuário logado não tem permissão para acessar estoque desta fazenda.`
      );
    }
  
    const produtos = await this.prisma.produtosEstoque.findMany({
      where: { idFazenda },
    });
    
    return produtos;
  }
  
  
}

