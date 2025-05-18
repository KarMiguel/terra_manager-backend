import { Test, TestingModule } from "@nestjs/testing";
import { CultivarService } from "../../src/modules/cultivar/cultivar.service";
import { PrismaClient } from "@prisma/client";
import { BadRequestException } from '@nestjs/common';
import { CreateCultivarDto } from "../../src/modules/cultivar/dto/create-cultivar.dto";
import { TipoPlantaEnum } from "src/modules/cultivar/enum/cultivar.enum";
import { TipoSoloEnum } from "src/modules/cultivar/enum/cultivar.enum";


jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    praga: {
      create: jest.fn(),
    },
    cultivar: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  })),
}));

describe('CultivarService', () => {
  let service: CultivarService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CultivarService, PrismaClient],
    }).compile();

    service = module.get<CultivarService>(CultivarService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('deve lançar exceção se userId não for fornecido', async () => {
    const dto = {} as CreateCultivarDto;
    await expect(service.CreateCultivar(dto, null as any, 'admin'))
      .rejects
      .toThrow(BadRequestException);
  });

  it('deve criar cultivar com praga associada', async () => {
    const dto: CreateCultivarDto = {
      nomeCientifico: 'Glycine max',
      nomePopular: 'Soja',
      tipoPlanta: TipoPlantaEnum.SOJA,
      tipoSolo: TipoSoloEnum.ARGILOSO,
      phSolo: 6.5,
      dataPlantioInicio: '2024-01-01',
      dataPlantioFim: '2024-03-31',
      periodoDias: 120,
      mmAgua: 800,
      aduboNitrogenio: 50,
      aduboFosforo: 30,
      aduboPotassio: 40,
      tempoCicloDias: 150,
      densidadePlantio: 300000,
      densidadeColheita: 280000,
      praga: {
        nomeCientifico: 'Aedes aegypti',
        nomeComum: 'Aedes',
        descricao: 'Mosquito transmissor de doenças'
      }
    };

    const pragaCriada = { id: 1, ...dto.praga };
    const cultivarCriada = { ...dto, id: 123, praga: pragaCriada };

    jest.spyOn(prisma.praga, 'create').mockResolvedValue(pragaCriada as any);
    jest.spyOn(prisma.cultivar, 'create').mockResolvedValue(cultivarCriada as any);

    const result = await service.CreateCultivar(dto, 1, 'admin');
    expect(result).toBeDefined();
    expect(result).toHaveProperty('id');
    expect(prisma.praga.create).toHaveBeenCalled();
    expect(prisma.cultivar.create).toHaveBeenCalled();
  });

  it('deve criar cultivar sem praga associada', async () => {
    const dto: CreateCultivarDto = {
      nomeCientifico: 'Zea mays',
      nomePopular: 'Milho',
      tipoPlanta: TipoPlantaEnum.MILHO,
      tipoSolo: TipoSoloEnum.SILTOSO, 
      phSolo: 5.8,
      dataPlantioInicio: '2024-02-01',
      dataPlantioFim: '2024-04-30',
      periodoDias: 100,
      mmAgua: 700,
      aduboNitrogenio: 40,
      aduboFosforo: 20,
      aduboPotassio: 25,
      tempoCicloDias: 120,
      densidadePlantio: 250000,
      densidadeColheita: 240000
    };

    const cultivarCriada = { ...dto, id: 456 };

    jest.spyOn(prisma.cultivar, 'create').mockResolvedValue(cultivarCriada as any);

    const result = await service.CreateCultivar(dto, 2, 'admin');
    expect(result).toBeDefined();
    expect(prisma.praga.create).not.toHaveBeenCalled();
    expect(prisma.cultivar.create).toHaveBeenCalled();
  });
});
