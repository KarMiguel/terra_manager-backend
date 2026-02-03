import { ProdutoEstoqueModel } from './interface/produto-estoque.interface';
import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { CrudController } from 'src/crud.controller';
import { Fazenda } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ProdutoEstoqueService } from './produto-estoque.service';
import { CreateProdutoEstoqueDto } from './dto/create-produto-estoque.dto';
import { plainToInstance } from 'class-transformer';
import { Paginate } from 'src/common/utils/types';

@ApiTags('Produto Estoque') 
@Controller('produto-estoque')
@ApiBearerAuth('access-token')
export class ProdutoEstoqueController extends CrudController<Fazenda, ProdutoEstoqueModel> {
  constructor(private readonly produtoEstoqueService: ProdutoEstoqueService) {
    super(produtoEstoqueService);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Cria um novo produto no estoque',
    description: 'Cria um novo registro de produto no estoque de uma fazenda. Produtos podem ser insumos, sementes, fertilizantes, etc.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Produto criado no estoque com sucesso' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos ou usuário não autenticado' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Não autorizado - Token JWT inválido ou ausente' 
  })
  async create(@Body() createProdutoEstoqueDto: CreateProdutoEstoqueDto, @Req() req) {
    const createdBy = req.user?.email; 
    return this.produtoEstoqueService.createProdutoEstoque(createProdutoEstoqueDto, createdBy);
  }
  
  @Patch(':id/aumentar-quantidade')
  @ApiOperation({ 
    summary: 'Aumenta a quantidade de um produto no estoque',
    description: 'Adiciona uma quantidade ao estoque de um produto específico. Útil para registrar entradas de produtos.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do produto no estoque',
    type: Number,
    example: 1
  })
  @ApiQuery({
    name: 'quantidade',
    required: false,
    description: 'Quantidade a ser adicionada ao estoque. O valor padrão é 1.',
    type: Number,
    example: 10
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Quantidade aumentada com sucesso' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Produto não encontrado' 
  })
  async aumentarQuantidade(
    @Param('id', ParseIntPipe) id: number,
    @Query('quantidade') quantidade?: number, 
  ) {
    const quantidadeFinal = quantidade ? parseInt(quantidade.toString(), 10) : 1; 
    return this.produtoEstoqueService.aumentarQuantidade(id, quantidadeFinal);
  }

  @Patch(':id/remover-quantidade')
  @ApiOperation({ 
    summary: 'Remove uma quantidade de um produto no estoque',
    description: 'Remove uma quantidade do estoque de um produto específico. Útil para registrar saídas ou consumo de produtos.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do produto no estoque',
    type: Number,
    example: 1
  })
  @ApiQuery({
    name: 'quantidade',
    required: false,
    description: 'Quantidade a ser removida do estoque. O valor padrão é 1.',
    type: Number,
    example: 5
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Quantidade removida com sucesso' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Quantidade a remover maior que a disponível no estoque' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Produto não encontrado' 
  })
  async removerQuantidade(
    @Param('id', ParseIntPipe) id: number,
    @Query('quantidade') quantidade?: number, 
  ) {
    const quantidadeFinal = quantidade ? parseInt(quantidade.toString(), 10) : 1; 
    return this.produtoEstoqueService.removerQuantidade(id, quantidadeFinal);
  }

  @Get('fazenda/:idFazenda')
  @ApiOperation({
    summary: 'Lista o estoque de produtos por ID da fazenda',
    description: 'Retorna uma lista paginada de todos os produtos no estoque de uma fazenda específica do usuário autenticado, com opção de filtros.'
  })
  @ApiParam({ 
    name: 'idFazenda', 
    description: 'ID da fazenda',
    type: Number,
    example: 1
  })
  @ApiQuery({
    name: 'options',
    required: false,
    description: 'Opções de filtro em formato JSON (opcional). Exemplo: {"nome": "Produto Exemplo"}',
    type: String,
    example: '{"nome": "Produto Exemplo"}'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (opcional, padrão: 1)',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Tamanho da página (opcional, padrão: 10)',
    type: Number,
    example: 10,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de produtos no estoque retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        count: { type: 'number', description: 'Total de produtos encontrados' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Usuário não autenticado ou parâmetros inválidos' 
  })
  async listarPorFazenda(
    @Param('idFazenda', ParseIntPipe) idFazenda: number,
    @Query('options') options?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Req() req?: any,
  ): Promise<{ data: ProdutoEstoqueModel[]; count: number }> {
    const idUsuario = req.user?.id;
    if (!idUsuario) {
      throw new BadRequestException('Usuário não autenticado.');
    }

    let parsedOptions: Record<string, any> = {};
    let parsedPage = 1;
    let parsedPageSize = 10;

    try {
      if (options) {
        parsedOptions = JSON.parse(options);
      }
    } catch (error) {
      throw new BadRequestException(
        'O parâmetro "options" deve ser um JSON válido.'
      );
    }

    try {
      parsedPage = page && page > 0 ? page : 1;
      parsedPageSize = pageSize && pageSize > 0 ? pageSize : 10;

      if (typeof parsedPage !== 'number' || typeof parsedPageSize !== 'number') {
        throw new Error();
      }
    } catch (error) {
      throw new BadRequestException(
        'Os parâmetros de paginação "page" e "pageSize" devem ser números positivos.'
      );
    }

    const paginate = {
      page: parsedPage,
      pageSize: parsedPageSize,
    };

    return await this.produtoEstoqueService.listarPorFazenda(
      idFazenda,
      idUsuario,
      paginate,
      parsedOptions,
    );
  }

  
}