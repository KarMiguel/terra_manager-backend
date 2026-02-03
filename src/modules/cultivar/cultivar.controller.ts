import { BadRequestException, Body, Controller, Get, Post, Query, Req, } from '@nestjs/common';
import { CultivarService } from './cultivar.service';

import { CultivarModel } from './interface/cultivar.interface';
import { CrudController } from 'src/crud.controller';
import { Cultivar } from '@prisma/client';
import { CreateCultivarDto } from './dto/create-cultivar.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags, ApiResponse } from '@nestjs/swagger';
import { LogContext } from 'src/common/utils/log-helper';


@ApiTags('Cultivar') 
@Controller('cultivar')
@ApiBearerAuth('access-token')
export class CultivarController extends CrudController<Cultivar, CultivarModel> {
  constructor(private readonly cultivarService: CultivarService) {
    super(cultivarService); 
  }
  
  @Post()
  @ApiOperation({ 
    summary: 'Cria uma nova cultivar',
    description: 'Cria um novo registro de cultivar com suas características e exigências nutricionais. A cultivar será associada ao usuário autenticado.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Cultivar criada com sucesso' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos ou usuário não autenticado' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Não autorizado - Token JWT inválido ou ausente' 
  })
  async create(@Body() createCultivarDto: CreateCultivarDto, @Req() req): Promise<any> {
    const userId = req.user.id;
    const createdBy = req.user.email; 

    if (!userId || !createdBy) {
      throw new Error('ID ou email do usuário não encontrado no token.');
    }

    const logContext: LogContext = {
      idUsuario: userId,
      emailUsuario: createdBy,
      ipAddress: req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    return this.cultivarService.CreateCultivar(createCultivarDto, userId, createdBy, logContext);
  }

  @Get('lista')
  @ApiOperation({ 
    summary: 'Lista todos os cultivares do usuário logado',
    description: 'Retorna uma lista paginada de todos os cultivares criados pelo usuário autenticado, com opção de filtros.'
  })
  @ApiQuery({
    name: 'options',
    required: false,
    description: 'Opções de filtro em formato JSON (opcional). Exemplo: {"tipoPlanta": "SOJA"}',
    type: String,
    example: '{"tipoPlanta": "SOJA"}'
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
    description: 'Lista de cultivares retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        count: { type: 'number', description: 'Total de cultivares encontrados' }
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
  
    return await this.cultivarService.findAndCountByUser(userId, paginate, parsedOptions);
  }
  
  @Get('check-cultivars')
  @ApiOperation({ 
    summary: 'Verifica quais tipos de planta o usuário possui cultivares',
    description: 'Retorna um objeto indicando quais tipos de planta (SOJA, MILHO, ALGODAO, etc.) o usuário possui cultivares cadastradas.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Verificação retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        SOJA: { type: 'boolean', description: 'Usuário possui cultivares de soja' },
        MILHO: { type: 'boolean', description: 'Usuário possui cultivares de milho' },
        ALGODAO: { type: 'boolean', description: 'Usuário possui cultivares de algodão' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Usuário não autenticado' 
  })
  async checkUserCultivars(@Req() req): Promise<Record<string, boolean>> {
    const userId = req.user?.id;
  
    if (!userId) {
      throw new BadRequestException('ID do usuário não encontrado no token.');
    }
  
    return await this.cultivarService.checkUserCultivars(userId);
  }

}
