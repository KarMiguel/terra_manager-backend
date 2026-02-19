import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CrudService } from 'src/crud.service';
import { PrismaClient, OperacaoPlantio } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { OperacaoPlantioModel } from './interface/operacao-plantio.interface';
import { CreateOperacaoPlantioDto } from './dto/create-operacao-plantio.dto';
import { TipoEtapaOperacaoEnum } from './enum/tipo-etapa.enum';

@Injectable()
export class OperacaoPlantioService extends CrudService<OperacaoPlantio, OperacaoPlantioModel> {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'operacaoPlantio', OperacaoPlantioModel);
  }

  /**
   * Custo por hectare = custo total / área (ha).
   * Referência: gestão financeira por área (CONAB, EMBRAPA sistemas de produção).
   */
  private calcularCustoPorHa(custoTotal: number, areaHa: number): number {
    if (areaHa <= 0) return 0;
    return Math.round((custoTotal / areaHa) * 100) / 100;
  }

  async createOperacao(dto: CreateOperacaoPlantioDto, createdBy: string): Promise<OperacaoPlantioModel> {
    const plantio = await this.prisma.plantio.findUnique({
      where: { id: dto.idPlantio },
      select: { id: true, areaPlantada: true },
    });
    if (!plantio) {
      throw new NotFoundException(`Plantio com ID ${dto.idPlantio} não encontrado.`);
    }
    if (dto.areaHa > plantio.areaPlantada) {
      throw new BadRequestException(
        `Área da operação (${dto.areaHa} ha) não pode ser maior que a área plantada (${plantio.areaPlantada} ha).`,
      );
    }
    const custoTotal = dto.custoTotal ?? null;
    const custoPorHa =
      custoTotal != null && dto.areaHa > 0 ? this.calcularCustoPorHa(custoTotal, dto.areaHa) : null;
    const created = await this.prisma.operacaoPlantio.create({
      data: {
        idPlantio: dto.idPlantio,
        idTalhao: dto.idTalhao ?? null,
        tipoEtapa: dto.tipoEtapa as any,
        dataInicio: new Date(dto.dataInicio),
        dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
        areaHa: dto.areaHa,
        custoTotal,
        custoPorHa,
        observacao: dto.observacao ?? null,
        createdBy,
      },
    });
    return plainToInstance(OperacaoPlantioModel, created, { excludeExtraneousValues: true });
  }

  async listarPorPlantio(idPlantio: number): Promise<OperacaoPlantioModel[]> {
    const list = await this.prisma.operacaoPlantio.findMany({
      where: { idPlantio, ativo: true },
      include: {
        talhao: { select: { id: true, nome: true, areaHa: true } },
      },
      orderBy: { dataInicio: 'asc' },
    });
    return plainToInstance(OperacaoPlantioModel, list, { excludeExtraneousValues: true });
  }
}
