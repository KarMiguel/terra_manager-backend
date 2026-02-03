import { BadRequestException, Injectable } from '@nestjs/common';
import { AnaliseSolo, PrismaClient } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { calculatePagination } from 'src/common/utils/calculatePagination';
import { Paginate } from 'src/common/utils/types';
import { CrudService } from 'src/crud.service';

import { CreateAnaliseSoloDto } from './dto/create-analise-solo.dto';
import { AdubacaoResponseModel, AnaliseSoloModel, CalagemModel, CalagemResponseModel, NutrienteComparacaoResponseModel } from './interface/analise-solo.interface';
import { CultivarService } from '../cultivar/cultivar.service';
import { CalculosUtil } from './util/calculos.util';
import { LogContext, LogHelper, TipoOperacaoEnum } from 'src/common/utils/log-helper';

@Injectable()
export class AnaliseSoloService extends CrudService<AnaliseSolo, AnaliseSoloModel> {
  protected logHelper: LogHelper;

  constructor(protected readonly prisma: PrismaClient,
    private readonly cultivarService: CultivarService,
  ) {
super(prisma, 'analiseSolo', AnaliseSoloModel);
    this.logHelper = new LogHelper(prisma);
  }

  async createAnaliseSolo(
    createAnaliseSoloDto: CreateAnaliseSoloDto,
    userId: number,
    createdBy: string,
    logContext?: LogContext,
  ): Promise<AnaliseSoloModel> {
    if (!userId) {
      throw new BadRequestException('O ID do usuário é obrigatório para criar uma análise de solo.');
    }

    // Verifica se o usuário existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new BadRequestException('Usuário não encontrado.');
    }

    const createdAnaliseSolo = await this.prisma.analiseSolo.create({
      data: {
        ...createAnaliseSoloDto,
        idUsuario: userId,
        createdBy,
      },
    });

    // Registra log da operação CREATE
    if (logContext) {
      this.logHelper.createLog(
        TipoOperacaoEnum.CREATE,
        'analiseSolo',
        logContext,
        {
          idRegistro: createdAnaliseSolo.id,
          dadosNovos: createdAnaliseSolo,
          descricao: `Criação de análise de solo ID ${createdAnaliseSolo.id}`,
        },
      ).catch(err => console.error('Erro ao registrar log:', err));
    }

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

  async findByPlantioId(idPlantio: number): Promise<AnaliseSoloModel | null> {
    if (!idPlantio) {
      throw new BadRequestException('O ID do plantio é obrigatório.');
    }

    const plantio = await this.prisma.plantio.findUnique({
      where: { id: idPlantio },
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

  async calculaCalagem(idPlantio: number): Promise<CalagemResponseModel> {

    const analiseSolo = await this.findByPlantioId(idPlantio);

    if (!analiseSolo) {
      throw new BadRequestException('Plantio não possui análise de solo.');
    }

    const calc = CalculosUtil.calcCalagem(analiseSolo);

    return {
      rencomedacaoCalagem: Number(calc.rc).toFixed(2) + ' t/ha',
      recomendacaoCalagemTotal: Number(calc.rct).toFixed(2) + ' t/ha',
    };
  }

  async calculoAdubacao(idPlantio: number): Promise<AdubacaoResponseModel> {
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
    
    const { aduboNitrogenio: exigN, aduboFosforo: exigP, aduboPotassio: exigK } = plantio.cultivar;

    // Verificação se há dados suficientes para o cálculo
    if (exigN == null || exigP == null || exigK == null) {
      throw new BadRequestException('A cultivar deve possuir valores de aduboNitrogenio, aduboFosforo e aduboPotassio cadastrados para o cálculo de adubação.');
    }

    // Verificação se há dados da análise de solo
    if (!analiseSolo.n && !analiseSolo.p && !analiseSolo.k) {
      throw new BadRequestException('Análise de solo não possui dados de NPK');
    }

    // Função para calcular adubação usando a fórmula clássica sem valores padrão
    const doseN = CalculosUtil.calcDoseKgHa(analiseSolo.n, exigN, CalculosUtil.EFICIENCIA.N);
    const doseP = CalculosUtil.calcDoseKgHa(analiseSolo.p, exigP, CalculosUtil.EFICIENCIA.P);
    const doseK = CalculosUtil.calcDoseKgHa(analiseSolo.k, exigK, CalculosUtil.EFICIENCIA.K);

    return {
      n: Number(doseN).toFixed(2) + ' kg/ha',
      p: Number(doseP).toFixed(2) + ' kg/ha',
      k: Number(doseK).toFixed(2) + ' kg/ha',
      nTotalAreaKg: Number(doseN * plantio.areaPlantada).toFixed(2) + ' kg',
      pTotalAreaKg: Number(doseP * plantio.areaPlantada).toFixed(2) + ' kg',
      kTotalAreaKg: Number(doseK * plantio.areaPlantada).toFixed(2) + ' kg',
      areaHa: Number(plantio.areaPlantada).toFixed(2) + ' ha',
    };
  }

  async comparativoNutrientes(idPlantio: number): Promise<any> {
    const analiseSolo = await this.findByPlantioId(idPlantio);

    const plantio = await this.prisma.plantio.findUnique({
      where: { id: idPlantio },
      include: { cultivar: true },
    });

    if (!plantio || !plantio.cultivar) {
      throw new BadRequestException('Plantio ou cultivar não encontrados.');
    }

    const cultivar = plantio.cultivar;

    const data = {
      data: {
        // Dados da análise de solo - valores encontrados no solo
        analiseSolo: {
          ph: analiseSolo.ph ? Number(analiseSolo.ph).toFixed(1) : '-',              // pH do solo (escala 0-14, adimensional)
          n: analiseSolo?.n ? Number(analiseSolo.n).toFixed(2) + ' kg/ha' : '-',                  // Nitrogênio disponível no solo (mg/dm³)
          p: analiseSolo?.p ? Number(analiseSolo.p).toFixed(2) + ' kg/ha' : '-',                  // Fósforo disponível no solo (mg/dm³) 
          k: analiseSolo?.k ? Number(analiseSolo.k).toFixed(2) + ' kg/ha' : '-',                  // Potássio disponível no solo (mg/dm³)
          ca: analiseSolo?.sb ? Number(analiseSolo.sb).toFixed(2) + ' kg/ha' : '-',            // Cálcio + Magnésio (soma de bases - cmolc/dm³)
          mg: analiseSolo?.m ? Number(analiseSolo.m).toFixed(1) + ' kg/ha' : '-',                      // Saturação por alumínio (% - índice de toxidez)
         },
        // Exigências nutricionais da cultivar - doses recomendadas
        cultivar: {
          ph: cultivar.phSolo ? Number(cultivar.phSolo).toFixed(1) : '-',                          // pH ideal para a cultivar (escala 0-14)
          n: cultivar.aduboNitrogenio ? Number(cultivar.aduboNitrogenio).toFixed(2) + ' kg/ha' : '-',    // Nitrogênio necessário (kg/ha)
          p: cultivar.aduboFosforo ? Number(cultivar.aduboFosforo).toFixed(2) + ' kg/ha' : '-',          // Fósforo necessário (kg/ha)
          k: cultivar.aduboPotassio ? Number(cultivar.aduboPotassio).toFixed(2) + ' kg/ha' : '-',        // Potássio necessário (kg/ha)
          ca: cultivar.aduboCalcio ? Number(cultivar.aduboCalcio).toFixed(2) + ' kg/ha' : '-',           // Cálcio necessário (kg/ha)
          mg: cultivar.aduboMagnesio ? Number(cultivar.aduboMagnesio).toFixed(2) + ' kg/ha' : '-',       // Magnésio necessário (kg/ha)
        },
      },
    };

    return data;
  }
} 