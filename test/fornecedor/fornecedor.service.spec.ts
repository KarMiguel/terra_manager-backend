import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { FornecedorService } from '../../src/modules/fornecedor/fornecedor.service';
import { CreateFornecedorDto } from '../../src/modules/fornecedor/dto/create-fornecedor.dto';

describe('FornecedorService', () => {
  let service: FornecedorService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(async () => {
    mockPrisma = {
      fornecedor: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    } as unknown as jest.Mocked<PrismaClient>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FornecedorService,
        { provide: PrismaClient, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FornecedorService>(FornecedorService);
  });

  describe('createFornecedor', () => {
   it('deve criar um fornecedor com sucesso', async () => {
  const createFornecedorDto: CreateFornecedorDto = {
    cnpj: '12345678901234',
    razaoSocial: 'Fornecedor Teste',
    email: 'fornecedor@teste.com',
    telefone: '123456789',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '12345-678',
  };
  const userId = 1;
  const createdBy = 'admin';

  (mockPrisma.fornecedor.findUnique as jest.Mock).mockResolvedValue(null); // CNPJ não existe
  (mockPrisma.fornecedor.create as jest.Mock).mockResolvedValue({
    id: 1,
    cnpj: '12345678901234',
    razaoSocial: 'Fornecedor Teste',
    idUsuario: userId,
    createdBy: 'admin',
  });

  const result = await service.createFornecedor(createFornecedorDto, userId, createdBy);

  expect(result).toEqual(expect.objectContaining({ razaoSocial: 'Fornecedor Teste', cnpj: '12345678901234' }));
  expect(mockPrisma.fornecedor.findUnique).toHaveBeenCalledWith({ where: { cnpj: '12345678901234' } });
  expect(mockPrisma.fornecedor.create).toHaveBeenCalled();
});

    it('deve lançar erro se o CNPJ já estiver registrado', async () => {
      const createFornecedorDto: CreateFornecedorDto = {
        razaoSocial: 'Fornecedor Teste',
        cnpj: '12345678901234',
        email: 'fornecedor@teste.com',
        telefone: '123456789',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '12345-678',
      };
      const userId = 1;
      const createdBy = 'admin';

      mockPrisma.fornecedor.findUnique = jest.fn().mockReturnValue(Promise.resolve({ id: 1, cnpj: '12345678901234' })); // CNPJ já existe
      await expect(service.createFornecedor(createFornecedorDto, userId, createdBy)).rejects.toThrowError(
        BadRequestException,
      );
    });

    it('deve lançar erro se o ID do usuário não for fornecido', async () => {
      const createFornecedorDto: CreateFornecedorDto = {
        razaoSocial: 'Fornecedor Teste',
        cnpj: '12345678901234',
        email: 'fornecedor@teste.com',
        telefone: '123456789',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '12345-678',
      };

      await expect(service.createFornecedor(createFornecedorDto, null, 'admin')).rejects.toThrowError(
        BadRequestException,
      );
    });
  });

  describe('findAndCountByUser', () => {
    it('deve retornar fornecedores e a contagem total', async () => {
      const userId = 1;
      const paginate = { page: 1, pageSize: 10 };
      const mockData = [
        { id: 1, nome: 'Fornecedor 1', cnpj: '12345678901234' },
        { id: 2, nome: 'Fornecedor 2', cnpj: '98765432109876' },
      ];

      mockPrisma.$transaction.mockResolvedValue([mockData, mockData.length]);

      const result = await service.findAndCountByUser(userId, paginate);

      expect(result.data.length).toBe(2);
      expect(result.count).toBe(2);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });
});