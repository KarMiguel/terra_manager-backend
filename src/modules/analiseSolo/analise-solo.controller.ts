import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AnaliseSolo } from '@prisma/client';
import { CrudController } from 'src/crud.controller';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PlanoGuard } from 'src/common/guards/plano.guard';
import { RequerPlanoMinimo } from 'src/common/guards/plano.decorator';
import { TipoPlanoEnum } from 'src/common/guards/plano.constants';

import { AnaliseSoloService } from './analise-solo.service';
import { CreateAnaliseSoloDto } from './dto/create-analise-solo.dto';
import { AdubacaoResponseModel, AnaliseSoloModel, CalagemResponseModel, NutrienteComparacaoResponseModel } from './interface/analise-solo.interface';

@ApiTags('Análise de Solo') 
@Controller('analise-solo')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class AnaliseSoloController extends CrudController<AnaliseSolo, AnaliseSoloModel> {
  constructor(private readonly analiseSoloService: AnaliseSoloService) {
    super(analiseSoloService); 
  }
  
  @Post()
  @ApiOperation({ 
    summary: 'Cria uma nova análise de solo',
    description: 'Cria um registro de análise de solo associado a um plantio. A análise inclui dados químicos e físicos do solo que serão usados para cálculos de calagem e adubação.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Análise de solo criada com sucesso' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos ou usuário não autenticado' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Não autorizado - Token JWT inválido ou ausente' 
  })
  async create(@Body() createAnaliseSoloDto: CreateAnaliseSoloDto, @Req() req): Promise<AnaliseSoloModel> {
    const userId = req.user?.id;
    const createdBy = req.user?.email; 

    if (!userId || !createdBy) {
      throw new BadRequestException('ID ou email do usuário não encontrado no token.');
    }

    return this.analiseSoloService.createAnaliseSolo(createAnaliseSoloDto, userId, createdBy);
  }

  @Get('lista')
  @ApiOperation({ 
    summary: 'Lista todas as análises de solo do usuário logado',
    description: 'Retorna uma lista paginada de todas as análises de solo criadas pelo usuário autenticado, com opção de filtros.'
  })
  @ApiQuery({
    name: 'options',
    required: false,
    description: 'Opções de filtro em formato JSON (opcional). Exemplo: {"idPlantio": 1}',
    type: String,
    example: '{"idPlantio": 1}'
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
    description: 'Lista de análises retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        count: { type: 'number', description: 'Total de análises encontradas' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parâmetros inválidos ou usuário não autenticado' 
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

  @Get('plantio/:idPlantio')
  @ApiOperation({ 
    summary: 'Busca análise de solo pelo ID do plantio',
    description: 'Retorna a análise de solo associada a um plantio específico, se existir.'
  })
  @ApiParam({ 
    name: 'idPlantio', 
    description: 'ID do plantio',
    type: Number,
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Análise de solo encontrada ou null se não existir' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Não autorizado - Token JWT inválido ou ausente' 
  })
  async findByPlantioId(@Param('idPlantio') idPlantio: string): Promise<AnaliseSoloModel | null> {
    return this.analiseSoloService.findByPlantioId(+idPlantio);
  }

  @Get('calagem/:idPlantio')
  @UseGuards(JwtAuthGuard, PlanoGuard)
  @RequerPlanoMinimo(TipoPlanoEnum.PRO)
  @ApiOperation({
    summary: 'Calcula a necessidade de calagem',
    description: '**Requer plano: Pro ou Premium.** Calcula a quantidade de calcário (em t/ha) necessária para corrigir a acidez do solo baseado na análise de solo e nas exigências da cultivar do plantio.',
  })
  @ApiParam({ name: 'idPlantio', description: 'ID do plantio', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Cálculo de calagem retornado com sucesso',
    schema: {
      type: 'object',
      properties: {
        quantidadeCalagem: { type: 'number', description: 'Quantidade de calcário em t/ha' },
        observacoes: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Plantio não encontrado ou sem análise de solo associada' })
  @ApiResponse({ status: 401, description: 'Não autorizado. Faça login.' })
  @ApiResponse({ status: 403, description: 'Este recurso exige plano Pro ou Premium. Seu plano atual não possui permissão.' })
  async calculaCalagem(@Param('idPlantio') idPlantio: string): Promise<CalagemResponseModel> {
    return this.analiseSoloService.calculaCalagem(+idPlantio);
  }

  @Get('adubacao/:idPlantio')
  @UseGuards(JwtAuthGuard, PlanoGuard)
  @RequerPlanoMinimo(TipoPlanoEnum.PRO)
  @ApiOperation({
    summary: 'Calcula a necessidade de adubação NPK',
    description: '**Requer plano: Pro ou Premium.** Calcula as quantidades de nitrogênio (N), fósforo (P) e potássio (K) necessárias para o plantio, baseado na análise de solo e nas exigências da cultivar.',
  })
  @ApiParam({ name: 'idPlantio', description: 'ID do plantio', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Cálculo de adubação retornado com sucesso',
    schema: {
      type: 'object',
      properties: {
        nitrogenio: { type: 'number', description: 'Quantidade de N em kg/ha' },
        fosforo: { type: 'number', description: 'Quantidade de P2O5 em kg/ha' },
        potassio: { type: 'number', description: 'Quantidade de K2O em kg/ha' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Plantio não encontrado ou sem análise de solo associada' })
  @ApiResponse({ status: 401, description: 'Não autorizado. Faça login.' })
  @ApiResponse({ status: 403, description: 'Este recurso exige plano Pro ou Premium. Seu plano atual não possui permissão.' })
  async calculaAdubacao(@Param('idPlantio') idPlantio: string): Promise<AdubacaoResponseModel> {
    return this.analiseSoloService.calculoAdubacao(+idPlantio);
  }

  @Get('comparativo-nutrientes/:idPlantio')
  @UseGuards(JwtAuthGuard, PlanoGuard)
  @RequerPlanoMinimo(TipoPlanoEnum.PRO)
  @ApiOperation({
    summary: 'Compara exigências da cultivar com análise de solo',
    description: '**Requer plano: Pro ou Premium.** Retorna uma comparação detalhada entre as exigências nutricionais da cultivar do plantio e os valores encontrados na análise de solo, indicando deficiências ou excessos.',
  })
  @ApiParam({ name: 'idPlantio', description: 'ID do plantio', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Comparativo de nutrientes retornado com sucesso',
    schema: {
      type: 'object',
      properties: {
        nutrientes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              nome: { type: 'string' },
              exigencia: { type: 'number' },
              disponivel: { type: 'number' },
              diferenca: { type: 'number' },
              status: { type: 'string', enum: ['deficiente', 'adequado', 'excesso'] },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Plantio não encontrado ou sem análise de solo associada' })
  @ApiResponse({ status: 401, description: 'Não autorizado. Faça login.' })
  @ApiResponse({ status: 403, description: 'Este recurso exige plano Pro ou Premium. Seu plano atual não possui permissão.' })
  async comparativo(@Param('idPlantio') idPlantio: string): Promise<any> {
    return this.analiseSoloService.comparativoNutrientes(+idPlantio);
  }

} 