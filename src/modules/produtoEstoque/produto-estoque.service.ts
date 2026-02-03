import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CrudService } from 'src/crud.service';
import { PrismaClient, Fazenda } from '@prisma/client';
import { ProdutoEstoqueModel } from './interface/produto-estoque.interface';
import { CreateProdutoEstoqueDto } from './dto/create-produto-estoque.dto';
import { plainToInstance } from 'class-transformer';
import { calculatePagination } from 'src/common/utils/calculatePagination';
import { CrudServiceOptions, Paginate } from 'src/common/utils/types';
import { LogHelper, LogContext, TipoOperacaoEnum } from 'src/common/utils/log-helper';

@Injectable()
export class ProdutoEstoqueService extends CrudService<Fazenda, ProdutoEstoqueModel> {
  protected logHelper: LogHelper;

  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'produtosEstoque', ProdutoEstoqueModel);
    this.logHelper = new LogHelper(prisma);
  }

  
  async createProdutoEstoque(
    data: CreateProdutoEstoqueDto,
    createdBy: string,
    logContext?: LogContext,
  ): Promise<ProdutoEstoqueModel> {
    const createdProduto = await this.prisma.produtosEstoque.create({
      data: {
        ...data,
        createdBy,
      },
    });

    // Registra log da operação CREATE
    if (logContext) {
      this.logHelper.createLog(
        TipoOperacaoEnum.CREATE,
        'produtosEstoque',
        logContext,
        {
          idRegistro: createdProduto.id,
          dadosNovos: createdProduto,
          descricao: `Criação de produto no estoque ID ${createdProduto.id}`,
        },
      ).catch(err => console.error('Erro ao registrar log:', err));
    }

    return plainToInstance(ProdutoEstoqueModel, createdProduto, {
      excludeExtraneousValues: true, 
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


  async listarPorFazenda(
    idFazenda: number,
    idUsuario: number,
    paginate?: Paginate,
    options: CrudServiceOptions = {},
  ): Promise<{ data: ProdutoEstoqueModel[]; count: number }> {
    const fazenda = await this.prisma.fazenda.findUnique({
      where: { id: idFazenda },
    });
  
    if (!fazenda) {
      throw new NotFoundException(`Fazenda com ID ${idFazenda} não encontrada.`);
    }
  
    if (fazenda.idUsuario !== idUsuario) {
      throw new BadRequestException(
        `O usuário logado não tem permissão para acessar o estoque desta fazenda.`
      );
    }
  
    const pagination = calculatePagination(paginate);
  
    const where = {
      ...options.where,
      idFazenda,
      ...(options.where?.nome
        ? {
            nome: {
              contains: options.where.nome, 
              mode: 'insensitive', 
          },
        }
        : {}),
    };
  
    const [produtos, count] = await this.prisma.$transaction([
      this.prisma.produtosEstoque.findMany({
        ...pagination,
        ...this.filterOptions(options),
        where,
        include: {
          fazenda: {
            select: {
              id: true,
              cnpj: true,
              nome: true,
              municipio: true,
              uf: true
            }
          },
          fornecedor: {
            select: {
              id: true,
              razaoSocial: true,
              cnpj: true,
              nomeFantasia: true,
              email: true,
              telefone: true
            }
          }
        },
      }),
      this.prisma.produtosEstoque.count({ where }),
    ]);
  
    const transformedData = plainToInstance(ProdutoEstoqueModel, produtos, {
      excludeExtraneousValues: true,
    });
  
    return { data: transformedData, count };
  }
  
}

