import { BadRequestException, Injectable } from '@nestjs/common';
import { AnaliseSolo, PrismaClient } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { calculatePagination } from 'src/common/utils/calculatePagination';
import { Paginate } from 'src/common/utils/types';
import { CrudService } from 'src/crud.service';

import { CreateAnaliseSoloDto } from './dto/create-analise-solo.dto';
import { AdubacaoModel, AnaliseSoloModel, CalagemModel } from './interface/analise-solo.interface';
import { CultivarService } from '../cultivar/cultivar.service';
import { FATOR_CONVERSAO, EFICIENCIA } from './interface/enum/analise-solo.util';

@Injectable()
export class AnaliseSoloService extends CrudService<AnaliseSolo, AnaliseSoloModel> {
  constructor(protected readonly prisma: PrismaClient,
    private readonly cultivarService: CultivarService,
  ) {
    super(prisma, 'analiseSolo', AnaliseSoloModel);
  }

  async createAnaliseSolo(
    createAnaliseSoloDto: CreateAnaliseSoloDto,
    userId: number,
    createdBy: string,
  ): Promise<AnaliseSoloModel> {
    if (!userId) {
      throw new BadRequestException('O ID do usuário é obrigatório para criar uma análise de solo.');
    }

    const createdAnaliseSolo = await this.prisma.analiseSolo.create({
      data: {
        ...createAnaliseSoloDto,
        idUsuario: userId,
        createdBy,
      },
    });

    return plainToInstance(AnaliseSoloModel, createdAnaliseSolo, {
      excludeExtraneousValues: true, 
    });
  }

  async findAndCountByUser(
    userId: number,
    paginate?: Paginate,
    options: Record<string, any> = {},
  ): Promise<{ data: any[]; count: number }> {
    const pagination = calculatePagination(paginate || { page: 1, pageSize: 10 });
  
    const where = {
      ...options.where,
      idUsuario: userId, 
    };
  
    const [data, count] = await this.prisma.$transaction([
      this.prisma.analiseSolo.findMany({
        ...pagination,
        where,
        orderBy: options.order || { dateCreated: 'desc' }, 
      }),
      this.prisma.analiseSolo.count({ where }),
    ]);
  
    return { data, count };
  }

  async findByPlantioId(plantioId: number): Promise<AnaliseSoloModel | null> {
    if (!plantioId) {
      throw new BadRequestException('O ID do plantio é obrigatório.');
    }

    const plantio = await this.prisma.plantio.findUnique({
      where: { id: plantioId },
      include: {
        analiseSolo: true,
      },
    });

    if (!plantio) {
      throw new BadRequestException('Plantio não encontrado.');
    }

    if (!plantio.analiseSolo) {
      return null;
    }

    return plainToInstance(AnaliseSoloModel, plantio.analiseSolo, {
      excludeExtraneousValues: true,
    });
  }

  async calculaCalagem(idPlantio: number): Promise<CalagemModel> {

    const analiseSolo = await this.findByPlantioId(idPlantio);

    if (!analiseSolo) {
      throw new BadRequestException('Plantio não possui análise de solo.');
    }

    const { ctc, v, valorCultural, prnt, areaTotal } = analiseSolo;

    const rc = ctc * (valorCultural - v) / prnt;

    const rct = rc * areaTotal;

    return { rc, rct };
  }

  async calculoAdubacao(idPlantio: number): Promise<AdubacaoModel> {
    const analiseSolo = await this.findByPlantioId(idPlantio);

    if (!analiseSolo) {
      throw new BadRequestException('Plantio não possui análise de solo.');
    }

    const plantio = await this.prisma.plantio.findUnique({
      where: { id: idPlantio },
      include: { cultivar: true },
    });

    if (!plantio || !plantio.cultivar) {
      throw new BadRequestException('Plantio ou cultivar não encontrados.');
    }

    const {
      aduboNitrogenio: exigN = 0,
      aduboFosforo: exigP = 0,
      aduboPotassio: exigK = 0,
    } = plantio.cultivar;

    // Função para calcular adubação com conversão de mg/dm³ para kg/ha
    const calcDoseKgHa = (soloMgDm3: number | null | undefined, exigKgHa: number, eficiencia: number): number => {
      const soloMgDm3Value = soloMgDm3 ?? 0;
      
      // Conversão: 1 mg/dm³ ≈ 2 kg/ha (camada 0-20cm, densidade 1,0 g/cm³)
      const soloKgHa = soloMgDm3Value * FATOR_CONVERSAO;
      
      // Fórmula: Adubação = (Exigência - Disponível no solo) ÷ Eficiência
      const necessidade = Math.max(exigKgHa - soloKgHa, 0);
      const dose = necessidade / eficiencia;
      
      return Number(dose.toFixed(2));
    };

    const doseN = calcDoseKgHa(analiseSolo.n, exigN, EFICIENCIA.N);
    const doseP = calcDoseKgHa(analiseSolo.p, exigP, EFICIENCIA.P);
    const doseK = calcDoseKgHa(analiseSolo.k, exigK, EFICIENCIA.K);

    // Área do plantio para cálculo total
    const areaHa = plantio.areaPlantada;

    // Cálculo da dose total por área (kg totais)
    const nTotalKg = Number((doseN * areaHa).toFixed(2));
    const pTotalKg = Number((doseP * areaHa).toFixed(2));
    const kTotalKg = Number((doseK * areaHa).toFixed(2));

    return { 
      n: doseN,           // kg/ha
      p: doseP,           // kg/ha
      k: doseK,           // kg/ha
      nTotalKg,           // kg totais para toda a área
      pTotalKg,           // kg totais para toda a área
      kTotalKg,           // kg totais para toda a área
      areaHa              // área em hectares
    };
  }
} 