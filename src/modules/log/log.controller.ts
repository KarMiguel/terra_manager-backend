import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { LogService } from './log.service';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TipoOperacaoEnum } from '../../common/utils/log-helper';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('log')
@ApiTags('Log')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get('tabela/:tabela')
  @ApiOperation({ 
    summary: 'Busca logs por tabela',
    description: 'Retorna os logs de operações realizadas em uma tabela específica, opcionalmente filtrado por ID do registro'
  })
  @ApiParam({ 
    name: 'tabela', 
    description: 'Nome da tabela',
    type: String,
    example: 'fazenda'
  })
  @ApiQuery({ 
    name: 'idRegistro', 
    required: false,
    description: 'ID do registro específico',
    type: Number,
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false,
    description: 'Limite de registros a retornar (padrão: 100)',
    type: Number,
    example: 50
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de logs retornada com sucesso' 
  })
  async findByTabela(
    @Param('tabela') tabela: string,
    @Query('idRegistro') idRegistro?: number,
    @Query('limit') limit?: number,
  ) {
    return this.logService.findLogsByTabela(
      tabela,
      idRegistro ? +idRegistro : undefined,
      limit ? +limit : 100,
    );
  }

  @Get('usuario/:idUsuario')
  @ApiOperation({ 
    summary: 'Busca logs por usuário',
    description: 'Retorna todos os logs de operações realizadas por um usuário específico'
  })
  @ApiParam({ 
    name: 'idUsuario', 
    description: 'ID do usuário',
    type: Number,
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false,
    description: 'Limite de registros a retornar (padrão: 100)',
    type: Number,
    example: 50
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de logs retornada com sucesso' 
  })
  async findByUsuario(
    @Param('idUsuario') idUsuario: string,
    @Query('limit') limit?: number,
  ) {
    return this.logService.findLogsByUsuario(
      +idUsuario,
      limit ? +limit : 100,
    );
  }

  @Get('operacao/:tipoOperacao')
  @ApiOperation({ 
    summary: 'Busca logs por tipo de operação',
    description: 'Retorna logs filtrados por tipo de operação (CREATE, UPDATE, DELETE, DEACTIVATE, ACTIVATE, READ)'
  })
  @ApiParam({ 
    name: 'tipoOperacao', 
    description: 'Tipo de operação',
    enum: TipoOperacaoEnum,
    example: TipoOperacaoEnum.CREATE
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false,
    description: 'Limite de registros a retornar (padrão: 100)',
    type: Number,
    example: 50
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de logs retornada com sucesso' 
  })
  async findByTipoOperacao(
    @Param('tipoOperacao') tipoOperacao: TipoOperacaoEnum,
    @Query('limit') limit?: number,
  ) {
    return this.logService.findLogsByTipoOperacao(
      tipoOperacao,
      limit ? +limit : 100,
    );
  }

  @Get()
  @ApiOperation({ 
    summary: 'Lista todos os logs com paginação',
    description: 'Retorna todos os logs do sistema com paginação e opções de filtro. Útil para visualizar todas as operações registradas.'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false,
    description: 'Número da página (padrão: 1)',
    type: Number,
    example: 1
  })
  @ApiQuery({ 
    name: 'pageSize', 
    required: false,
    description: 'Tamanho da página - quantidade de logs por página (padrão: 50)',
    type: Number,
    example: 50
  })
  @ApiQuery({ 
    name: 'tabela', 
    required: false,
    description: 'Filtrar por nome da tabela',
    type: String,
    example: 'fazenda'
  })
  @ApiQuery({ 
    name: 'tipoOperacao', 
    required: false,
    description: 'Filtrar por tipo de operação',
    enum: TipoOperacaoEnum,
    example: TipoOperacaoEnum.UPDATE
  })
  @ApiQuery({ 
    name: 'idUsuario', 
    required: false,
    description: 'Filtrar por ID do usuário',
    type: Number,
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de logs retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array de logs'
        },
        count: {
          type: 'number',
          description: 'Total de logs encontrados'
        },
        page: {
          type: 'number',
          description: 'Página atual'
        },
        pageSize: {
          type: 'number',
          description: 'Tamanho da página'
        },
        totalPages: {
          type: 'number',
          description: 'Total de páginas'
        }
      }
    }
  })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('tabela') tabela?: string,
    @Query('tipoOperacao') tipoOperacao?: TipoOperacaoEnum,
    @Query('idUsuario') idUsuario?: number,
  ) {
    const parsedPage = page && page > 0 ? page : 1;
    const parsedPageSize = pageSize && pageSize > 0 ? pageSize : 50;

    return this.logService.findAllLogs(
      parsedPage,
      parsedPageSize,
      {
        tabela,
        tipoOperacao,
        idUsuario: idUsuario ? +idUsuario : undefined,
      },
    );
  }
}
