import { PlantioModel } from './interface/plantio.interface';
import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { CrudController } from 'src/crud.controller';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags, ApiParam } from '@nestjs/swagger';
import { CreatePlantioDto } from './dto/create-plantio.dto';
import { plainToInstance } from 'class-transformer';
import { Paginate } from 'src/common/utils/types';
import { PlantioService } from './plantio.service';
import { TipoPlantaEnum } from '../cultivar/enum/cultivar.enum';
import { Plantio } from '@prisma/client';

@ApiTags('Plantio')
@Controller('plantio')
@ApiBearerAuth('access-token')
export class PlantioController extends CrudController<Plantio, PlantioModel> {
  constructor(private readonly plantioService: PlantioService) {
    super(plantioService);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo registro de plantio' })
  async create(
    @Body() createPlantioDto: CreatePlantioDto,
    @Req() req,
  ): Promise<PlantioModel> {
    return this.plantioService.createPlantio(createPlantioDto, req.user?.email);
  }

  @Get('fazenda/:idFazenda')
  @ApiOperation({ summary: 'Lista plantios por ID da fazenda com paginação e filtros (opcional)' })
  @ApiQuery({ name: 'options', required: false, description: 'Filtros em JSON', type: String })
  @ApiQuery({ name: 'page', required: false, description: 'Página (padrão: 1)', type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Tamanho da página (padrão: 10)', type: Number, example: 10 })
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
  @ApiOperation({ summary: 'Lista plantios por ID da fazenda e tipo de planta do cultivar' })
  @ApiParam({
    name: 'idFazenda',
    description: 'ID da fazenda',
    type: Number,
    required: true
  })
  @ApiParam({
    name: 'tipoPlanta',
    description: 'Tipo de planta',
    enum: TipoPlantaEnum,
    required: true,
    type: 'string',
    example: TipoPlantaEnum.SOJA
  })
  async listarPorFazendaTipoPlanta(
    @Param('idFazenda', ParseIntPipe) idFazenda: number,
    @Param('tipoPlanta') tipoPlanta: TipoPlantaEnum,
  ): Promise<PlantioModel[]> {
    return this.plantioService.listarPorFazendaTipoPlanta(idFazenda, tipoPlanta);
  }
}
