import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AnaliseSolo } from '@prisma/client';
import { CrudController } from 'src/crud.controller';

import { AnaliseSoloService } from './analise-solo.service';
import { CreateAnaliseSoloDto } from './dto/create-analise-solo.dto';
import { AdubacaoModel, AnaliseSoloModel, CalagemModel } from './interface/analise-solo.interface';

@ApiTags('Análise de Solo') 
@Controller('analise-solo')
@ApiBearerAuth('access-token')
export class AnaliseSoloController extends CrudController<AnaliseSolo, AnaliseSoloModel> {
  constructor(private readonly analiseSoloService: AnaliseSoloService) {
    super(analiseSoloService); 
  }
  
  @Post()
  @ApiOperation({ summary: 'Cria uma nova análise de solo' })
  async create(@Body() createAnaliseSoloDto: CreateAnaliseSoloDto, @Req() req): Promise<any> {
    const userId = req.user.id;
    const createdBy = req.user.email; 

    if (!userId || !createdBy) {
      throw new Error('ID ou email do usuário não encontrado no token.');
    }

    return this.analiseSoloService.createAnaliseSolo(createAnaliseSoloDto, userId, createdBy);
  }

  @Get('lista')
  @ApiOperation({ summary: 'Lista todas as análises de solo do usuário logado com contagem' })
  @ApiQuery({
    name: 'options',
    required: false,
    description: 'Opções de filtro em formato JSON (opcional)',
    type: String,
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
  async listByUser(
    @Req() req,
    @Query('options') options?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<{ data: any[]; count: number }> {
    const userId = req.user?.id;
  
    if (!userId) {
      throw new BadRequestException('ID do usuário não encontrado no token.');
    }
  
    let parsedOptions: Record<string, any> = {};
    let parsedPage = 1;
    let parsedPageSize = 10;
  
    try {
      if (options) {
        parsedOptions = JSON.parse(options); 
      }
    } catch (error) {
      throw new BadRequestException('O parâmetro "options" deve ser um JSON válido.');
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
  
    return await this.analiseSoloService.findAndCountByUser(userId, paginate, parsedOptions);
  }

  @Get('plantio/:plantioId')
  @ApiOperation({ summary: 'Busca análise de solo pelo ID do plantio' })
  async findByPlantioId(@Param('plantioId') plantioId: string): Promise<AnaliseSoloModel | null> {
    const id = parseInt(plantioId);
    
    if (isNaN(id)) {
      throw new BadRequestException('ID do plantio deve ser um número válido.');
    }

    return this.analiseSoloService.findByPlantioId(id);
  }

  @Get('calagem/:idPlantio')
  @ApiOperation({ summary: 'Calcula a calagem' })
  async calculaCalagem(@Param('idPlantio') idPlantio: string): Promise<CalagemModel> {
    return this.analiseSoloService.calculaCalagem(+idPlantio);
  }

  @Get('adubacao/:idPlantio')
  @ApiOperation({ summary: 'Calcula a adubação' })
  async calculaAdubacao(@Param('idPlantio') idPlantio: string): Promise<AdubacaoModel> {
    return this.analiseSoloService.calculoAdubacao(+idPlantio);
  }

} 