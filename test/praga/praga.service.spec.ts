import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { PragaService } from '../../src/modules/praga/praga.service';
import { CreatePragaDto } from '../../src/modules/praga/dto/create-praga.dto';
import { BadRequestException } from '@nestjs/common';

describe('PragaService', () => {
  let service: PragaService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(async () => {
    mockPrisma = {
      praga: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaClient>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PragaService,
        { provide: PrismaClient, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PragaService>(PragaService);
  });

  it('deve criar uma praga com sucesso', async () => {
    const createPragaDto: CreatePragaDto = { 
      nomeComum: 'Lagarta', 
      descricao: 'Praga de milho', 
      nomeCientifico: 'Spodoptera frugiperda' 
    };
    (mockPrisma.praga.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.praga.create as jest.Mock).mockResolvedValue({ id: 1, ...createPragaDto });

    const result = await service.createPraga(createPragaDto, 'testUser');

    expect(result).toEqual(expect.objectContaining({ nomeComum: 'Lagarta' }));
    expect(mockPrisma.praga.create).toHaveBeenCalled();
  });
});