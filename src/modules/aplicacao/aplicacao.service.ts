import { Injectable, NotFoundException } from '@nestjs/common';
import { CrudService } from '../../crud.service';
import { PrismaClient, Aplicacao } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { AplicacaoModel } from './interface/aplicacao.interface';
import { CreateAplicacaoDto } from './dto/create-aplicacao.dto';

@Injectable()
export class AplicacaoService extends CrudService<Aplicacao, AplicacaoModel> {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'aplicacao', AplicacaoModel);
  }

  /**
   * Quantidade total = dose por hectare × área (ha).
   * Referência: EMBRAPA/ANDEF – dose por unidade de área × área tratada (bulas, receituário agronômico).
   */
  private calcularQuantidadeTotal(dosePorHa: number, areaHa: number): number {
    const total = dosePorHa * areaHa;
    return Math.round(total * 10000) / 10000; // 4 decimais
  }

  async createAplicacao(dto: CreateAplicacaoDto, createdBy: string): Promise<AplicacaoModel> {
    const operacao = await this.prisma.operacaoPlantio.findUnique({
      where: { id: dto.idOperacaoPlantio },
      select: { id: true, areaHa: true },
    });
    if (!operacao) {
      throw new NotFoundException(`Operação do plantio com ID ${dto.idOperacaoPlantio} não encontrada.`);
    }
    const quantidadeTotal = this.calcularQuantidadeTotal(dto.dosePorHa, operacao.areaHa);
    const created = await this.prisma.aplicacao.create({
      data: {
        idOperacaoPlantio: dto.idOperacaoPlantio,
        idProdutosEstoque: dto.idProdutosEstoque ?? null,
        tipo: dto.tipo as any,
        nomeProduto: dto.nomeProduto ?? null,
        dosePorHa: dto.dosePorHa,
        unidadeDose: dto.unidadeDose as any,
        quantidadeTotal,
        custoAplicacao: dto.custoAplicacao ?? null,
        dataAplicacao: new Date(dto.dataAplicacao),
        observacao: dto.observacao ?? null,
        createdBy,
      },
    });
    return plainToInstance(AplicacaoModel, created, { excludeExtraneousValues: true });
  }

  async listarPorOperacao(idOperacaoPlantio: number): Promise<AplicacaoModel[]> {
    const list = await this.prisma.aplicacao.findMany({
      where: { idOperacaoPlantio, ativo: true },
      include: {
        produtoEstoque: { select: { id: true, nome: true, unidadeMedida: true } },
      },
      orderBy: { dataAplicacao: 'asc' },
    });
    return plainToInstance(AplicacaoModel, list, { excludeExtraneousValues: true });
  }
}
