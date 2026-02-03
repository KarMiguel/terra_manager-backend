import {
  Injectable,
  Query,
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Type,
  Req,
} from '@nestjs/common';
import { CrudService } from './crud.service';
import { Paginate } from '../src/common/utils/types';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ApiBody, ApiQuery, ApiOperation, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Injectable()
export abstract class CrudController<T extends object, R extends object = T> {
  constructor(
    private readonly service: CrudService<T, R>,
  ) {}

  // @Post()  
  // async create(@Body() body: any): Promise<R> {
  //   return this.service.create(body as any);
  // }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualiza um registro existente',
    description: 'Atualiza um registro pelo ID. O usuário autenticado será registrado como modificador do registro.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do registro a ser atualizado',
    type: Number,
    example: 1
  })
  @ApiBody({
    description: 'Dados para atualização do registro',
    required: true,
    type: Object,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Registro atualizado com sucesso' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Não autorizado - Token JWT inválido ou ausente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Registro não encontrado' 
  })
  @ApiBearerAuth('access-token')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req,
  ): Promise<R> {
    const modifiedBy = req.user?.email || 'unknown';
    
    // Se o serviço tiver um método update específico, use-o
    if (typeof this.service.update === 'function') {
      return this.service.update(+id, body, modifiedBy);
    }
    
    // Caso contrário, use o método genérico do CrudService
    return this.service.update(+id, body, modifiedBy);
  }
  
  // @Get()
  // async findAll(
  //   @Query('options') options?: string,
  //   @Query('paginate') paginate?: Paginate,
  // ): Promise<R[]> {
  //   try {
  //     const parsedOptions = options ? JSON.parse(options) : {};
  //     return this.service.findAll(paginate, parsedOptions);
  //   } catch (error) {
  //     throw new Error('O parâmetro "options" deve ser um JSON válido.');
  //   }
  // }
  
  @Get()
  @ApiOperation({ 
    summary: 'Lista todos os registros com paginação e filtros',
    description: 'Retorna uma lista paginada de registros com opção de filtros. O parâmetro "options" aceita um JSON com condições de filtro.'
  })
  @ApiQuery({
    name: 'options',
    required: false,
    description: 'Opções de filtro em formato JSON. Exemplo: {"nome": "valor", "status": "ativo"}',
    type: String,
    example: '{"nome": "exemplo"}'
  })
  @ApiQuery({
    name: 'paginate',
    required: false,
    description: 'Objeto com page e pageSize para paginação',
    type: Object,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de registros retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' }
        },
        count: {
          type: 'number',
          description: 'Total de registros encontrados'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Não autorizado - Token JWT inválido ou ausente' 
  })
  @ApiBearerAuth('access-token')
  async listCountAll(
    @Query('options') options?: string,
    @Query('paginate') paginate?: Paginate,
  ): Promise<{ data: R[]; count: number }> {
  try {
    const parsedOptions = options ? JSON.parse(options) : {};
    return this.service.findAndCountAll(paginate, parsedOptions);
  } catch (error) {
    throw new Error('O parâmetro "options" deve ser um JSON válido.');
  }
}



  // @Get('count')
  // async count(@Query('options') options?: Record<string, any>): Promise<number> {
  //   return this.service.count(options);
  // }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Busca um registro pelo ID',
    description: 'Retorna um único registro baseado no ID fornecido'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do registro a ser buscado',
    type: Number,
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Registro encontrado com sucesso' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Não autorizado - Token JWT inválido ou ausente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Registro não encontrado' 
  })
  @ApiBearerAuth('access-token')
  async findOne(@Param('id') id: string): Promise<R | null> {
    if (!id) {
      throw new Error('O parâmetro "id" é obrigatório.');
    }
  
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new Error('O parâmetro "id" deve ser um número válido.');
    }
  
    return this.service.findOneById(numericId);
  }
  
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Deleta um registro pelo ID',
    description: 'Remove permanentemente um registro do sistema'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do registro a ser deletado',
    type: Number,
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Registro deletado com sucesso' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Não autorizado - Token JWT inválido ou ausente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Registro não encontrado' 
  })
  @ApiBearerAuth('access-token')
  async delete(@Param('id') id: string): Promise<R> {
    return this.service.delete(+id);
  }
  
  // @Get('list/user')
  // @ApiQuery({
  //   name: 'options',
  //   required: false,
  //   description: 'Opções de filtro em formato JSON',
  //   type: String,
  // })
  // @ApiQuery({
  //   name: 'paginate',
  //   required: false,
  //   description: 'Opções de paginação (page e pageSize)',
  //   type: Object,
  // })
  // async listByUser(
  //   @Req() req,
  //   @Query('options') options?: string,
  //   @Query('paginate') paginate?: Paginate,
  // ): Promise<{ data: R[]; count: number }> {
  //   const userId = req.user?.id;
  
  //   if (!userId) {
  //     throw new Error('ID do usuário não encontrado no token.');
  //   }
  
  //   try {
  //     const parsedOptions = options ? JSON.parse(options) : {};
  //     return this.service.findAndCountByUserId(userId, paginate, parsedOptions);
  //   } catch (error) {
  //     throw new Error('O parâmetro "options" deve ser um JSON válido.');
  //   }
  // }
    
}
