import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CrudController } from 'src/crud.controller';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TalhaoService } from './talhao.service';
import { Talhao } from '@prisma/client';
import { TalhaoModel } from './interface/talhao.interface';
import { CreateTalhaoDto } from './dto/create-talhao.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Talhão')
@Controller('talhao')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class TalhaoController extends CrudController<Talhao, TalhaoModel> {
  constructor(private readonly talhaoService: TalhaoService) {
    super(talhaoService);
  }

  @Post()
  @ApiOperation({
    summary: 'Cria um novo talhão',
    description: 'Cadastra uma parcela de terra (talhão) em uma fazenda. Área em hectares (areaHa). A fazenda deve pertencer ao usuário logado. Base para custo, rotação e mapa (ver REGRAS_NEGOCIO.md §7.4).',
  })
  @ApiResponse({ status: 201, description: 'Talhão criado com sucesso. Retorna o objeto talhão com id, idFazenda, nome, areaHa, observacao, ativo.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou fazenda não pertence ao usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado — token JWT ausente ou inválido' })
  @ApiResponse({ status: 404, description: 'Fazenda não encontrada' })
  async create(@Body() dto: CreateTalhaoDto, @Req() req): Promise<TalhaoModel> {
    const idUsuario = req.user?.id;
    if (!idUsuario) throw new Error('Usuário não autenticado.');
    return this.talhaoService.createTalhao(dto, req.user?.email, idUsuario);
  }

  @Get('fazenda/:idFazenda')
  @ApiOperation({
    summary: 'Lista talhões por fazenda',
    description: 'Retorna talhões ativos da fazenda (ordenados por nome). A fazenda deve pertencer ao usuário. Suporta paginação (page, pageSize).',
  })
  @ApiParam({ name: 'idFazenda', description: 'ID da fazenda', type: Number, example: 1 })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página', type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Itens por página', type: Number, example: 50 })
  @ApiResponse({ status: 200, description: 'Objeto com data (array de talhões) e count (total)' })
  @ApiResponse({ status: 400, description: 'Fazenda não pertence ao usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Fazenda não encontrada' })
  async listarPorFazenda(
    @Param('idFazenda', ParseIntPipe) idFazenda: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Req() req?: any,
  ): Promise<{ data: TalhaoModel[]; count: number }> {
    const idUsuario = req.user?.id;
    if (!idUsuario) throw new Error('Usuário não autenticado.');
    const paginate = page && pageSize ? { page, pageSize } : undefined;
    const result = await this.talhaoService.listarPorFazenda(idFazenda, idUsuario, paginate);
    return { data: plainToInstance(TalhaoModel, result.data, { excludeExtraneousValues: true }), count: result.count };
  }

  @Get('fazenda/:idFazenda/resumo')
  @ApiOperation({
    summary: 'Resumo de área por talhão',
    description: 'Retorna área total (ha), quantidade de talhões e lista com id, nome e areaHa de cada talhão. Base para custo, rotação e mapa (RN-TAL-005).',
  })
  @ApiParam({ name: 'idFazenda', description: 'ID da fazenda', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Resumo com areaTotalHa, totalTalhoes e array talhoes (id, nome, areaHa)',
    schema: {
      type: 'object',
      properties: {
        areaTotalHa: { type: 'number', example: 125.5, description: 'Soma das áreas dos talhões (ha)' },
        totalTalhoes: { type: 'number', example: 5 },
        talhoes: {
          type: 'array',
          items: { type: 'object', properties: { id: { type: 'number' }, nome: { type: 'string' }, areaHa: { type: 'number' } } },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Fazenda não pertence ao usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Fazenda não encontrada' })
  async resumoPorFazenda(
    @Param('idFazenda', ParseIntPipe) idFazenda: number,
    @Req() req?: any,
  ): Promise<{ areaTotalHa: number; totalTalhoes: number; talhoes: { id: number; nome: string; areaHa: number }[] }> {
    const idUsuario = req.user?.id;
    if (!idUsuario) throw new Error('Usuário não autenticado.');
    return this.talhaoService.resumoPorFazenda(idFazenda, idUsuario);
  }
}
