import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { CrudController } from '../../crud.controller';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PlanoGuard } from '../../common/guards/plano.guard';
import { RequerPlanoExato } from '../../common/guards/plano.decorator';
import { TipoPlanoEnum } from '../../common/guards/plano.constants';
import { ZonaManejoService } from './zona-manejo.service';
import { ZonaManejo } from '@prisma/client';
import { ZonaManejoModel } from './interface/zona-manejo.interface';
import { CreateZonaManejoDto } from './dto/create-zona-manejo.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Zona de manejo')
@Controller('zona-manejo')
@UseGuards(JwtAuthGuard, PlanoGuard)
@RequerPlanoExato(TipoPlanoEnum.PREMIUM)
@ApiBearerAuth('access-token')
export class ZonaManejoController extends CrudController<ZonaManejo, ZonaManejoModel> {
  constructor(private readonly zonaManejoService: ZonaManejoService) {
    super(zonaManejoService);
  }

  @Post()
  @ApiOperation({
    summary: 'Cria zona de manejo',
    description: '**Requer plano: Premium.** Cadastra uma zona de manejo (área com critério de manejo: fertilidade, irrigação, produtividade, etc.) com geometria GeoJSON (Polygon/MultiPolygon). Opcionalmente vincula a um talhão (idTalhao).',
  })
  @ApiResponse({ status: 201, description: 'Zona de manejo criada. Retorna objeto com id, idFazenda, nome, tipo, geometria, cor, etc.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou fazenda/talhão não pertencem ao usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado. Faça login.' })
  @ApiResponse({ status: 403, description: 'Este recurso exige plano Premium. Seu plano atual não possui permissão.' })
  @ApiResponse({ status: 404, description: 'Fazenda não encontrada' })
  async create(@Body() dto: CreateZonaManejoDto, @Req() req): Promise<ZonaManejoModel> {
    const idUsuario = req.user?.id;
    if (!idUsuario) throw new Error('Usuário não autenticado.');
    return this.zonaManejoService.createZonaManejo(dto, req.user?.email, idUsuario);
  }

  @Get('fazenda/:idFazenda')
  @ApiOperation({
    summary: 'Lista zonas de manejo por fazenda',
    description: '**Requer plano: Premium.** Retorna zonas ativas da fazenda (ordenadas por nome). Suporta paginação (page, pageSize).',
  })
  @ApiParam({ name: 'idFazenda', description: 'ID da fazenda', type: Number, example: 1 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 50 })
  @ApiResponse({ status: 200, description: 'Objeto com data (array de zonas) e count' })
  @ApiResponse({ status: 400, description: 'Fazenda não pertence ao usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado. Faça login.' })
  @ApiResponse({ status: 403, description: 'Este recurso exige plano Premium. Seu plano atual não possui permissão.' })
  @ApiResponse({ status: 404, description: 'Fazenda não encontrada' })
  async listarPorFazenda(
    @Param('idFazenda', ParseIntPipe) idFazenda: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Req() req?: any,
  ): Promise<{ data: ZonaManejoModel[]; count: number }> {
    const idUsuario = req.user?.id;
    if (!idUsuario) throw new Error('Usuário não autenticado.');
    const paginate = page && pageSize ? { page, pageSize } : undefined;
    const result = await this.zonaManejoService.listarPorFazenda(idFazenda, idUsuario, paginate);
    return { data: plainToInstance(ZonaManejoModel, result.data, { excludeExtraneousValues: true }), count: result.count };
  }

  @Get('fazenda/:idFazenda/mapa')
  @ApiOperation({
    summary: 'GeoJSON mapa das zonas de manejo',
    description: '**Requer plano: Premium.** Retorna GeoJSON FeatureCollection com as zonas de manejo da fazenda (geometria + properties: id, nome, tipo, cor, idTalhao).',
  })
  @ApiParam({ name: 'idFazenda', description: 'ID da fazenda', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'FeatureCollection com features (geometry + properties)',
    schema: {
      type: 'object',
      properties: {
        type: { enum: ['FeatureCollection'] },
        features: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { enum: ['Feature'] },
              geometry: { type: 'object' },
              properties: { type: 'object', properties: { id: { type: 'number' }, nome: { type: 'string' }, tipo: { type: 'string' }, cor: { type: 'string' }, idTalhao: { type: 'number' } } },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Fazenda não pertence ao usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado. Faça login.' })
  @ApiResponse({ status: 403, description: 'Este recurso exige plano Premium. Seu plano atual não possui permissão.' })
  @ApiResponse({ status: 404, description: 'Fazenda não encontrada' })
  async mapaPorFazenda(
    @Param('idFazenda', ParseIntPipe) idFazenda: number,
    @Req() req?: any,
  ): Promise<{ type: 'FeatureCollection'; features: Array<{ type: 'Feature'; geometry: Record<string, unknown>; properties: Record<string, unknown> }> }> {
    const idUsuario = req.user?.id;
    if (!idUsuario) throw new Error('Usuário não autenticado.');
    return this.zonaManejoService.mapaPorFazenda(idFazenda, idUsuario);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca zona de manejo por ID' })
  @ApiParam({ name: 'id', description: 'ID da zona de manejo', type: Number })
  @ApiResponse({ status: 200, description: 'Zona de manejo encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Zona não encontrada ou sem permissão' })
  async findOne(@Param('id') id: string, @Req() req?: any): Promise<ZonaManejoModel | null> {
    const idUsuario = req?.user?.id;
    if (!idUsuario) throw new Error('Usuário não autenticado.');
    return this.zonaManejoService.findOneByIdAndUser(parseInt(id, 10), idUsuario);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza zona de manejo' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Zona atualizada' })
  @ApiResponse({ status: 400, description: 'Sem permissão para esta fazenda' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Zona não encontrada' })
  async update(@Param('id') id: string, @Body() body: any, @Req() req): Promise<ZonaManejoModel> {
    const idUsuario = req.user?.id;
    if (!idUsuario) throw new Error('Usuário não autenticado.');
    return this.zonaManejoService.updateWithUser(parseInt(id, 10), body, req.user?.email, idUsuario);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove zona de manejo' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Zona removida' })
  @ApiResponse({ status: 400, description: 'Sem permissão' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Zona não encontrada' })
  async delete(@Param('id') id: string, @Req() req?: any): Promise<ZonaManejoModel> {
    const idUsuario = req?.user?.id;
    if (!idUsuario) throw new Error('Usuário não autenticado.');
    return this.zonaManejoService.deleteAndCheckUser(parseInt(id, 10), idUsuario);
  }
}
