import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CrudService } from 'src/crud.service';
import { PrismaClient, Plantio } from '@prisma/client';

import { plainToInstance } from 'class-transformer';
import { calculatePagination } from 'src/common/utils/calculatePagination';
import { CrudServiceOptions, Paginate } from 'src/common/utils/types';
import { PlantioModel } from './interface/plantio.interface';
import { CreatePlantioDto } from './dto/create-plantio.dto';
import { TipoPlantaEnum } from '../cultivar/enum/cultivar.enum';

@Injectable()
export class PlantioService extends CrudService<Plantio, PlantioModel> {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'plantio', PlantioModel);
  }

  async createPlantio(
    dto: CreatePlantioDto,
    createdBy: string,
  ): Promise<PlantioModel> {
    const {
      dataPlantio,
      dataEmergencia,
      dataPrevistaColheita,
      dataMaturacao,
      densidadePlanejada,
      ...rest
    } = dto;
  
    const dataToCreate: any = {
      ...rest,
      dataPlantio: new Date(dataPlantio),
      ...(dataEmergencia && { dataEmergencia: new Date(dataEmergencia) }),
      ...(dataPrevistaColheita && { dataPrevistaColheita: new Date(dataPrevistaColheita) }),
      ...(dataMaturacao && { dataMaturacao: new Date(dataMaturacao) }),
      createdBy,
      areaPlantada: dto.areaPlantada,
      densidadePlanejada: densidadePlanejada,
      densidadePlantioReal: dto.densidadePlantioReal ?? densidadePlanejada,
      mmAguaAplicado: dto.mmAguaAplicado
    
    };
  
    const created = await this.prisma.plantio.create({
      data: dataToCreate,
    });

    return plainToInstance(PlantioModel, created, {
      excludeExtraneousValues: true,
    });
  }
  
  async listarPorFazenda(
    idFazenda: number,
    idUsuario: number,
    paginate?: Paginate,
    options: CrudServiceOptions = {},
  ): Promise<{ data: PlantioModel[]; count: number }> {

    const fazenda = await this.prisma.fazenda.findUnique({
      where: { id: idFazenda },
      select: { idUsuario: true },
    });
  
    if (!fazenda) {
      throw new NotFoundException(`Fazenda com ID ${idFazenda} não encontrada.`);
    }
    if (fazenda.idUsuario !== idUsuario) {
      throw new BadRequestException(
        `O usuário logado não tem permissão para acessar os plantios desta fazenda.`
      );
    }
  
    const pagination = calculatePagination(paginate);
  
    const where: any = {
      ...options.where,
      idFazenda,
    };
  
    if (options.where?.cultivarNome) {
      where.cultivar = {
        nomePopular: {
          contains: options.where.cultivarNome,
          mode: 'insensitive',
        }
      };
    }
  
    const [plantios, count] = await this.prisma.$transaction([
      this.prisma.plantio.findMany({
        ...pagination,
        where,
        include: {
          cultivar: {
            select: { id: true, nomePopular: true, nomeCientifico: true },
          },
          fazenda: {
            select: { id: true, nome: true, municipio: true, uf: true },
          },
          analiseSolo: {
            select: { id: true, hAi: true, sb: true, ctc: true, v: true, m: true, mo: true },
          },
        },
        orderBy: { dataPlantio: 'desc' },
        ...this.filterOptions(options),
      }),
      this.prisma.plantio.count({ where }),
    ]);
  
    const data = plainToInstance(PlantioModel, plantios, {
      excludeExtraneousValues: true,
    });
  
    return { data, count };
  }

  async listarPorFazendaTipoPlanta(
    idFazenda: number,
    tipoPlanta: TipoPlantaEnum
  ): Promise<{ data: PlantioModel[]; count: number }> {
    const plantios = await this.prisma.plantio.findMany({
      where: {
        idFazenda,
        cultivar: {
          tipoPlanta
        }
      },
      include: {
        cultivar: {
          select: { id: true, nomePopular: true, nomeCientifico: true, tipoPlanta: true },
        },
        fazenda: {
          select: { id: true, nome: true, municipio: true, uf: true },
        },
        analiseSolo: {
          select: {
            id: true, hAi: true, sb: true, ctc: true, v: true, m: true, mo: true,
            n: true, p: true, k: true, valorCultural: true, prnt: true, areaTotal: true,
        
          },
        },
      },
      orderBy: { dataPlantio: 'desc' },
    });

    const data = plainToInstance(PlantioModel, plantios, {
      excludeExtraneousValues: true,
    });

    return { data, count: data.length };
  }

  /**
   * Custo por safra: soma dos custos dos plantios da fazenda no ano (gestão financeira real).
   * Safra definida pelo ano da data de plantio (conforme CONAB/EMBRAPA).
   * Custo por ha = custo total / área total.
   */
  async custoPorSafra(
    idFazenda: number,
    ano: number,
    idUsuario: number,
  ): Promise<{
    ano: number;
    idFazenda: number;
    custoTotalSafra: number;
    areaTotalHa: number;
    custoPorHaSafra: number;
    quantidadePlantios: number;
    resumoPorOperacao: { tipoEtapa: string; custoTotal: number; quantidade: number }[];
  }> {
    const fazenda = await this.prisma.fazenda.findUnique({
      where: { id: idFazenda },
      select: { idUsuario: true },
    });
    if (!fazenda) {
      throw new NotFoundException(`Fazenda com ID ${idFazenda} não encontrada.`);
    }
    if (fazenda.idUsuario !== idUsuario) {
      throw new BadRequestException('O usuário não tem permissão para acessar esta fazenda.');
    }
    const inicioAno = new Date(ano, 0, 1);
    const fimAno = new Date(ano, 11, 31, 23, 59, 59);
    const plantios = await this.prisma.plantio.findMany({
      where: {
        idFazenda,
        ativo: true,
        dataPlantio: { gte: inicioAno, lte: fimAno },
      },
      select: {
        id: true,
        areaPlantada: true,
        custoTotal: true,
        operacoes: {
          where: { ativo: true },
          select: { tipoEtapa: true, custoTotal: true },
        },
      },
    });
    let custoTotalSafra = 0;
    let areaTotalHa = 0;
    const custoPorOperacao: Record<string, { custoTotal: number; quantidade: number }> = {};
    for (const p of plantios) {
      areaTotalHa += p.areaPlantada;
      const custoPlantio = p.custoTotal ?? 0;
      custoTotalSafra += custoPlantio;
      for (const op of p.operacoes) {
        const key = op.tipoEtapa;
        if (!custoPorOperacao[key]) custoPorOperacao[key] = { custoTotal: 0, quantidade: 0 };
        custoPorOperacao[key].custoTotal += op.custoTotal ?? 0;
        custoPorOperacao[key].quantidade += 1;
      }
    }
    const custoPorHaSafra =
      areaTotalHa > 0 ? Math.round((custoTotalSafra / areaTotalHa) * 100) / 100 : 0;
    const resumoPorOperacao = Object.entries(custoPorOperacao).map(([tipoEtapa, v]) => ({
      tipoEtapa,
      custoTotal: Math.round(v.custoTotal * 100) / 100,
      quantidade: v.quantidade,
    }));
    return {
      ano,
      idFazenda,
      custoTotalSafra: Math.round(custoTotalSafra * 100) / 100,
      areaTotalHa: Math.round(areaTotalHa * 100) / 100,
      custoPorHaSafra,
      quantidadePlantios: plantios.length,
      resumoPorOperacao,
    };
  }
}
