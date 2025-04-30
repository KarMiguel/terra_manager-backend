import { BadRequestException, Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Fornecedor } from '@prisma/client';
import { CrudController } from 'src/crud.controller';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { FornecedorService } from './fornecedor.service';
import { FornecedorModel } from './interface/fornecedor.interface';

@ApiTags('Fornecedor') 
@Controller('fornecedor')
@ApiBearerAuth('access-token')
export class FornecedorController extends CrudController<Fornecedor, FornecedorModel> {
  constructor(private readonly fornecedorService: FornecedorService) {
    super(fornecedorService); 
  }
  
  @Post()
  @ApiOperation({ summary: 'Cria um novo fornecedor' })
  async create(@Body() createFornecedorDto: CreateFornecedorDto, @Req() req): Promise<any> {
    const userId = req.user.id;
    const createdBy = req.user.email; 

    if (!userId || !createdBy) {
      throw new Error('ID ou email do usuário não encontrado no token.');
    }

    return this.fornecedorService.createFornecedor(createFornecedorDto, userId, createdBy);
  }

  @Get('lista')
  @ApiOperation({ summary: 'Lista todos os fornecedores do usuário logado com contagem' })
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
  
    return await this.fornecedorService.findAndCountByUser(userId, paginate, parsedOptions);
  }
  

}
