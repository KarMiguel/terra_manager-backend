import { Test, TestingModule } from "@nestjs/testing";
import { ProdutoEstoqueModel } from "src/modules/produtoEstoque/interface/produto-estoque.interface";
import { CategoriaEstoqueEnum, PrismaClient, StatusEstoqueEnum, UnidadeMedidaEnum } from "@prisma/client";  // Certifique-se de importar os enums corretamente
import { ProdutoEstoqueService } from "src/modules/produtoEstoque/produto-estoque.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";

// Mock do PrismaClient
const mockPrisma = {
  produtosEstoque: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
  },
  fazenda: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),  // Corrigido para $transaction
};

describe('ProdutoEstoqueService', () => {
  let service: ProdutoEstoqueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutoEstoqueService,
        { provide: PrismaClient, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProdutoEstoqueService>(ProdutoEstoqueService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });
  
  describe('aumentarQuantidade', () => {
    it('deve aumentar a quantidade de um produto', async () => {
      const produto = { id: 1, quantidade: 10 };
      mockPrisma.produtosEstoque.findUnique.mockResolvedValue(produto);
      mockPrisma.produtosEstoque.update.mockResolvedValue({
        ...produto,
        quantidade: produto.quantidade + 5,
      });

      const result = await service.aumentarQuantidade(1, 5);

      expect(result.quantidade).toBe(15);
      expect(mockPrisma.produtosEstoque.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { quantidade: 15 },
      });
    });


    it('deve lançar um erro se o produto não for encontrado', async () => {
      mockPrisma.produtosEstoque.findUnique.mockResolvedValue(null);
      await expect(service.aumentarQuantidade(1, 5)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('removerQuantidade', () => {
    it('deve remover a quantidade de um produto', async () => {
      const produto = { id: 1, quantidade: 10 };
      mockPrisma.produtosEstoque.findUnique.mockResolvedValue(produto);
      mockPrisma.produtosEstoque.update.mockResolvedValue({
        ...produto,
        quantidade: produto.quantidade - 5,
      });

      const result = await service.removerQuantidade(1, 5);

      expect(result.quantidade).toBe(5);
      expect(mockPrisma.produtosEstoque.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { quantidade: 5 },
      });
    });

    
    it('deve lançar um erro se o produto não for encontrado', async () => {
      mockPrisma.produtosEstoque.findUnique.mockResolvedValue(null);
      await expect(service.removerQuantidade(1, 5)).rejects.toThrowError(NotFoundException);
    });

    it('deve lançar um erro se a quantidade a ser removida for maior que o estoque disponível', async () => {
      const produto = { id: 1, quantidade: 3 };
      mockPrisma.produtosEstoque.findUnique.mockResolvedValue(produto);

      await expect(service.removerQuantidade(1, 5)).rejects.toThrowError(BadRequestException);
    });
  });

  describe('listarPorFazenda', () => {
    it('deve listar os produtos por fazenda com paginação', async () => {
      const farmId = 1;
      const userId = 1;
      const paginate = { page: 1, pageSize: 10 };

      const mockData = [
        { id: 1, nome: 'Produto 1', quantidade: 10, valorUnitario: 20, categoria: 'DEFENSIVOS' },
        { id: 2, nome: 'Produto 2', quantidade: 5, valorUnitario: 10, categoria: 'SEMENTES' },
      ];

      mockPrisma.$transaction.mockResolvedValue([
        mockData,  // Simula os dados dos produtos
        mockData.length,  // Simula o count
      ]);

      mockPrisma.fazenda.findUnique.mockResolvedValue({ id: farmId, idUsuario: userId });
      mockPrisma.produtosEstoque.findMany.mockResolvedValue(mockData);
      mockPrisma.produtosEstoque.count.mockResolvedValue(mockData.length);

      // Agora chamamos o método
      const result = await service.listarPorFazenda(farmId, userId, paginate);

      expect(result.data.length).toBe(2);
      expect(result.count).toBe(2);
    });

    it('deve lançar erro se a fazenda não for encontrada', async () => {
      mockPrisma.fazenda.findUnique.mockResolvedValue(null);
      await expect(service.listarPorFazenda(1, 1, { page: 1, pageSize: 10 })).rejects.toThrowError(NotFoundException);
    });

    it('deve lançar erro se o usuário não tiver permissão para acessar a fazenda', async () => {
      const mockFarm = { id: 1, idUsuario: 2 };  // ID do usuário não corresponde ao esperado
      mockPrisma.fazenda.findUnique.mockResolvedValue(mockFarm);

      await expect(service.listarPorFazenda(1, 1, { page: 1, pageSize: 10 })).rejects.toThrowError(BadRequestException);
    });
  });
});
