import { PlantioModel } from './interface/plantio.interface';
import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CrudController } from 'src/crud.controller';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreatePlantioDto } from './dto/create-plantio.dto';
import { UpdateStatusPlantioDto } from './dto/update-status-plantio.dto';
import { plainToInstance } from 'class-transformer';
import { Paginate } from 'src/common/utils/types';
import { PlantioService } from './plantio.service';
import { TipoPlantaEnum } from '../cultivar/enum/cultivar.enum';
import { Plantio } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Plantio')
@Controller('plantio')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class PlantioController extends CrudController<Plantio, PlantioModel> {
  constructor(private readonly plantioService: PlantioService) {
    super(plantioService);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Cria um novo registro de plantio',
    description: 'Cria um novo plantio associado a uma fazenda e cultivar. O plantio representa uma área cultivada em uma fazenda específica.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Plantio criado com sucesso' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos ou fazenda/cultivar não encontrados' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Não autorizado - Token JWT inválido ou ausente' 
  })
  async create(
    @Body() createPlantioDto: CreatePlantioDto,
    @Req() req,
  ): Promise<PlantioModel> {
    return this.plantioService.createPlantio(createPlantioDto, req.user?.email);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Atualiza o status do plantio',
    description:
      'Altera apenas o status do plantio (PLANEJADO, EXECUTADO, EM_MONITORAMENTO, CONCLUIDO). O status também é atualizado automaticamente ao registrar operações: PREPARO_SOLO/SEMEADURA → EXECUTADO/EM_MONITORAMENTO; COLHEITA → CONCLUIDO.',
  })
  @ApiParam({ name: 'id', description: 'ID do plantio', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Sem permissão para este plantio' })
  @ApiResponse({ status: 404, description: 'Plantio não encontrado' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusPlantioDto,
    @Req() req: any,
  ): Promise<PlantioModel> {
    const idUsuario = req.user?.id;
    if (!idUsuario) throw new BadRequestException('Usuário não autenticado.');
    return this.plantioService.updateStatusPlantio(id, dto.statusPlantio as any, idUsuario, req.user?.email ?? '');
  }

  @Get('fazenda/:idFazenda')
  @ApiOperation({ 
    summary: 'Lista plantios por ID da fazenda',
    description: 'Retorna uma lista paginada de todos os plantios de uma fazenda específica do usuário autenticado, com opção de filtros.'
  })
  @ApiParam({ 
    name: 'idFazenda', 
    description: 'ID da fazenda',
    type: Number,
    example: 1
  })
  @ApiQuery({ name: 'options', required: false, description: 'Filtros em formato JSON (opcional). Ex: {"statusPlantio": "EM_MONITORAMENTO", "cultivarNome": "SOJA"}', type: String, example: '{"statusPlantio": "EM_MONITORAMENTO"}' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página (padrão: 1)', type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Tamanho da página (padrão: 10)', type: Number, example: 10 })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de plantios retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        count: { type: 'number', description: 'Total de plantios encontrados' }
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
  ): Promise<{ data: PlantioModel[]; count: number }> {
    const idUsuario = req.user?.id;
    if (!idUsuario) {
      throw new BadRequestException('Usuário não autenticado.');
    }

    let parsedOptions: Record<string, any> = {};
    let parsedPage = 1;
    let parsedPageSize = 10;

    if (options) {
      try {
        parsedOptions = JSON.parse(options);
      } catch {
        throw new BadRequestException('O parâmetro "options" deve ser um JSON válido.');
      }
    }

    if (page && page > 0) parsedPage = page;
    if (pageSize && pageSize > 0) parsedPageSize = pageSize;

    const paginate: Paginate = { page: parsedPage, pageSize: parsedPageSize };

    const { data, count } = await this.plantioService.listarPorFazenda(
      idFazenda,
      idUsuario,
      paginate,
      parsedOptions,
    );

    return { data: plainToInstance(PlantioModel, data, { excludeExtraneousValues: true }), count };
  }

  @Get('fazenda/:idFazenda/tipo-planta/:tipoPlanta')
  @ApiOperation({ 
    summary: 'Lista plantios por fazenda e tipo de planta',
    description: 'Retorna todos os plantios de uma fazenda específica filtrados por tipo de planta (SOJA, MILHO, ALGODAO, etc.)'
  })
  @ApiParam({
    name: 'idFazenda',
    description: 'ID da fazenda',
    type: Number,
    required: true,
    example: 1
  })
  @ApiParam({
    name: 'tipoPlanta',
    description: 'Tipo de planta do cultivar',
    enum: TipoPlantaEnum,
    required: true,
    type: 'string',
    example: TipoPlantaEnum.SOJA
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de plantios filtrados retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        count: { type: 'number' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parâmetros inválidos' 
  })
  async listarPorFazendaTipoPlanta(
    @Param('idFazenda', ParseIntPipe) idFazenda: number,
    @Param('tipoPlanta') tipoPlanta: TipoPlantaEnum,
  ): Promise<{ data: PlantioModel[]; count: number }> {
    return this.plantioService.listarPorFazendaTipoPlanta(idFazenda, tipoPlanta);
  }

  @Get('fazenda/:idFazenda/custo-safra')
  @ApiOperation({
    summary: 'Custo por safra',
    description:
      'Retorna custo total da safra (soma dos custos dos plantios da fazenda no ano), área total (ha), custo por ha da safra, quantidade de plantios e resumo por tipo de operação (tipoEtapa, custoTotal, quantidade). Safra = ano civil da data de plantio (RN-CUS-002 a RN-CUS-005). A fazenda deve pertencer ao usuário.',
  })
  @ApiParam({ name: 'idFazenda', description: 'ID da fazenda', type: Number, example: 1 })
  @ApiQuery({ name: 'ano', required: true, description: 'Ano da safra (ex: 2025). Deve ser entre 2000 e 2100.', type: Number, example: 2025 })
  @ApiResponse({
    status: 200,
    description: 'Resumo de custo por safra',
    schema: {
      type: 'object',
      properties: {
        ano: { type: 'number', example: 2025 },
        idFazenda: { type: 'number' },
        custoTotalSafra: { type: 'number', description: 'Soma dos custos (R$)' },
        areaTotalHa: { type: 'number', description: 'Soma das áreas plantadas (ha)' },
        custoPorHaSafra: { type: 'number', description: 'custoTotalSafra / areaTotalHa (R$/ha)' },
        quantidadePlantios: { type: 'number' },
        resumoPorOperacao: {
          type: 'array',
          items: { type: 'object', properties: { tipoEtapa: { type: 'string' }, custoTotal: { type: 'number' }, quantidade: { type: 'number' } } },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Ano inválido ou usuário não autenticado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Fazenda não encontrada' })
  async custoPorSafra(
    @Param('idFazenda', ParseIntPipe) idFazenda: number,
    @Query('ano') ano: string,
    @Req() req?: any,
  ): Promise<{
    ano: number;
    idFazenda: number;
    custoTotalSafra: number;
    areaTotalHa: number;
    custoPorHaSafra: number;
    quantidadePlantios: number;
    resumoPorOperacao: { tipoEtapa: string; custoTotal: number; quantidade: number }[];
  }> {
    const idUsuario = req.user?.id;
    if (!idUsuario) throw new BadRequestException('Usuário não autenticado.');
    const anoNum = parseInt(ano, 10);
    if (isNaN(anoNum) || anoNum < 2000 || anoNum > 2100) {
      throw new BadRequestException('Parâmetro "ano" deve ser um ano válido (ex: 2025).');
    }
    return this.plantioService.custoPorSafra(idFazenda, anoNum, idUsuario);
  }
}
