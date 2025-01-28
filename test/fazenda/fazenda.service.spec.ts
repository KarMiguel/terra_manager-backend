import { Test, TestingModule } from "@nestjs/testing";
import { FazendaService } from "src/modules/fazenda/fazenda.service";
import { PrismaClient } from "@prisma/client";
import { BadRequestException } from '@nestjs/common';
import { CreateFazendaDto } from "src/modules/fazenda/dto/create-fazenda.dto";


describe('FazendaService', () => {
    let service: FazendaService;
    let prismaMock: any; 
  
    beforeEach(async () => {
      prismaMock = {
        fazenda: {
          create: jest.fn(),
          findUnique: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
        },
      };
  
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          FazendaService,
          {
            provide: PrismaClient,
            useValue: prismaMock,
          },
        ],
      }).compile();
  
      service = module.get<FazendaService>(FazendaService);
    });
  
    it('deve estar definido', () => {
      expect(service).toBeDefined();
    });
  
    describe('criarFazenda', () => {
      it('deve lançar um erro se o ID do usuário estiver ausente', async () => {
        const dto: CreateFazendaDto = {
          nome: 'Fazenda Teste',
          latitude: -15.799,
          longitude: -47.86,
          municipio: 'Teste',
          uf: 'SP',
        };
  
        await expect(service.createFazenda(dto, null, 'teste@example.com')).rejects.toThrowError(
          'O ID do usuário é obrigatório para criar uma fazenda.',
        );
      });
  
      it('deve lançar um erro se o CNPJ já estiver registrado', async () => {
        const dto: CreateFazendaDto = {
          nome: 'Fazenda Teste',
          latitude: -15.799,
          longitude: -47.86,
          municipio: 'Teste',
          uf: 'SP',
          cnpj: '12345678000195',
        };
  
        prismaMock.fazenda.findUnique.mockResolvedValueOnce({ id: 1, cnpj: '12345678000195' });
  
        await expect(service.createFazenda(dto, 1, 'teste@example.com')).rejects.toThrowError(
          new BadRequestException('O CNPJ 12345678000195 já está registrado.'),
        );
      });
  
      it('deve criar uma fazenda com sucesso', async () => {
        const dto: CreateFazendaDto = {
          nome: 'Fazenda Teste',
          latitude: -15.799,
          longitude: -47.86,
          municipio: 'Teste',
          uf: 'SP',
          cnpj: '12345678000195',
        };
  
        prismaMock.fazenda.findUnique.mockResolvedValueOnce(null);  // Simula CNPJ não encontrado
        prismaMock.fazenda.create.mockResolvedValueOnce({
          id: 1,
          nome: 'Fazenda Teste',
          latitude: -15.799,
          longitude: -47.86,
          municipio: 'Teste',
          uf: 'SP',
          cnpj: '12345678000195',
        });
  
        const resultado = await service.createFazenda(dto, 1, 'teste@example.com');
        expect(resultado).toEqual({ id: 1, ...dto });
      });
    });
  });