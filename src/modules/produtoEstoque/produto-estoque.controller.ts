import { ProdutoEstoqueModel } from './interface/produto-estoque.interface';
import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { CrudController } from 'src/crud.controller';
import { Fazenda } from '@prisma/client';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProdutoEstoqueService } from './produto-estoque.service';
import { CreateProdutoEstoqueDto } from './dto/create-produto-estoque.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Produto Estoque') 
@Controller('produto-estoque')
export class ProdutoEstoqueController extends CrudController<Fazenda, ProdutoEstoqueModel> {
  constructor(private readonly produtoEstoqueService: ProdutoEstoqueService) {
    super(produtoEstoqueService);
  }

  @Post()
  @ApiOperation ({ summary: 'Cria um novo produto no estoque' })
  async create(@Body() createProdutoEstoqueDto: CreateProdutoEstoqueDto, @Req() req) {
    const createdBy = req.user?.email; 
    return this.produtoEstoqueService.createProdutoEstoque(createProdutoEstoqueDto, createdBy);
  }
  
  @Patch(':id/aumentar-quantidade')
  @ApiOperation({ summary: 'Aumenta a quantidade de um produto no estoque' })
  @ApiQuery({
    name: 'quantidade',
    required: false,
    description: 'Quantidade a ser adicionada ao estoque. O valor padrão é 1.',
    type: Number,
  })
  async aumentarQuantidade(
    @Param('id', ParseIntPipe) id: number,
    @Query('quantidade') quantidade?: number, 
  ) {
    const quantidadeFinal = quantidade ? parseInt(quantidade.toString(), 10) : 1; 
    return this.produtoEstoqueService.aumentarQuantidade(id, quantidadeFinal);
  }

  @Patch(':id/remover-quantidade')
  @ApiOperation({ summary: 'Remove uma quantidade de um produto no estoque' })
  @ApiQuery({
    name: 'quantidade',
    required: false,
    description: 'Quantidade a ser removida do estoque. O valor padrão é 1.',
    type: Number,
  })
  async removerQuantidade(
    @Param('id', ParseIntPipe) id: number,
    @Query('quantidade') quantidade?: number, 
  ) {
    const quantidadeFinal = quantidade ? parseInt(quantidade.toString(), 10) : 1; 
    return this.produtoEstoqueService.removerQuantidade(id, quantidadeFinal);
  }


  @Get('fazenda/:idFazenda')
  @ApiOperation({ summary: 'Lista o estoque de produtos por ID da fazenda' })
  async listarPorFazenda(
    @Param('idFazenda', ParseIntPipe) idFazenda: number,
    @Req() req,
  ) {
    const idUsuario = req.user?.id;
    if (!idUsuario) {
      throw new BadRequestException('Usuário não autenticado.');
    }

    const { produtos, count } = await this.produtoEstoqueService.listarPorFazenda(
      idFazenda,
      idUsuario,
    );

    return {
      produtos: plainToInstance(ProdutoEstoqueModel, produtos, {
        excludeExtraneousValues: true,
      }),
      count,
    };
  }

}