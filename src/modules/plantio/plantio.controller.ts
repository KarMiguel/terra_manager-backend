import { PlantioModel } from './interface/plantio.interface';
import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { CrudController } from 'src/crud.controller';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreatePlantioDto } from './dto/create-plantio.dto';
import { plainToInstance } from 'class-transformer';
import { Paginate } from 'src/common/utils/types';
import { PlantioService } from './plantio.service';
import { TipoPlantaEnum } from '../cultivar/enum/cultivar.enum';
import { Plantio } from '@prisma/client';
import { LogContext } from 'src/common/utils/log-helper';

@ApiTags('Plantio')
@Controller('plantio')
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
    const logContext: LogContext = {
      idUsuario: req.user?.id,
      emailUsuario: req.user?.email,
      ipAddress: req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
    return this.plantioService.createPlantio(createPlantioDto, req.user?.email, logContext);
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
  @ApiQuery({ name: 'options', required: false, description: 'Filtros em formato JSON (opcional)', type: String, example: '{"tipoPlanta": "SOJA"}' })
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
}
