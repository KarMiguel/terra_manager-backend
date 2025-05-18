import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PlantioService } from '../../src/modules/plantio/plantio.service';
import { CreatePlantioDto } from '../../src/modules/plantio/dto/create-plantio.dto';
import { StatusPlantioEnum } from '../../src/modules/plantio/enum/plantio.enum';

describe('PlantioService', () => {
  let service: PlantioService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlantioService,
        {
          provide: PrismaClient,
          useValue: {
            plantio: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            fazenda: {
              findUnique: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PlantioService>(PlantioService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  describe('createPlantio', () => {
    it('deve criar um plantio com dados válidos', async () => {
      const dto: CreatePlantioDto = {
        idCultivar: 1,
        idFazenda: 1,
        dataPlantio: '2025-05-06T10:00:00.000Z',
        areaPlantada: 10,
        densidadePlanejada: 300000,
        densidadePlantioReal: 300000,
        mmAguaAplicado: 50,
        statusPlantio: StatusPlantioEnum.PLANEJADO,
        ativo: true,
      };

      prisma.plantio.create = jest.fn().mockResolvedValue({
        id: 1,
        ...dto,
        dataPlantio: new Date(dto.dataPlantio),
      });

      const result = await service.createPlantio(dto, 'usuario1');

      expect(prisma.plantio.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          idCultivar: dto.idCultivar,
          idFazenda: dto.idFazenda,
          areaPlantada: dto.areaPlantada,
          statusPlantio: dto.statusPlantio,
          createdBy: 'usuario1',
        }),
      });
      expect(result).toHaveProperty('id', 1);
      expect(result.statusPlantio).toBe(StatusPlantioEnum.PLANEJADO);
    });
  });

  describe('listarPorFazenda', () => {
    it('deve lançar NotFoundException se fazenda não existir', async () => {
      prisma.fazenda.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.listarPorFazenda(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException se fazenda não pertencer ao usuário', async () => {
      prisma.fazenda.findUnique = jest.fn().mockResolvedValue({
        idUsuario: 2, 
      });

      await expect(service.listarPorFazenda(999, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve retornar lista de plantios se usuário tiver permissão', async () => {
      const mockPlantios = [
        { id: 1, idFazenda: 999, statusPlantio: StatusPlantioEnum.PLANEJADO },
        { id: 2, idFazenda: 999, statusPlantio: StatusPlantioEnum.EM_ANDAMENTO },
      ];

      prisma.fazenda.findUnique = jest.fn().mockResolvedValue({
        idUsuario: 1,
      });

      
      prisma.$transaction = jest.fn().mockResolvedValue([mockPlantios, mockPlantios.length]);

      const result = await service.listarPorFazenda(999, 1);

      expect(prisma.fazenda.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        select: { idUsuario: true },
      });

      expect(prisma.$transaction).toHaveBeenCalled();

      expect(result.data).toEqual(expect.arrayContaining(mockPlantios));
      expect(result.count).toBe(mockPlantios.length);
    });
  });
});
