import { BadRequestException, Body, Controller, Get, Post, Query, Req, } from '@nestjs/common';
import { CultivarService } from './cultivar.service';

import { CultivarModel } from './interface/cultivar.interface';
import { CrudController } from 'src/crud.controller';
import { Cultivar } from '@prisma/client';
import { CreateCultivarDto } from './dto/create-cultivar.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';


@ApiTags('Cultivar') 
@Controller('cultivar')
@ApiBearerAuth('access-token')
export class CultivarController extends CrudController<Cultivar, CultivarModel> {
  constructor(private readonly cultivarService: CultivarService) {
    super(cultivarService); 
  }
  
  @Post()
  @ApiOperation({ summary: 'Cria uma nova cultivar' })
  async create(@Body() createCultivarDto: CreateCultivarDto, @Req() req): Promise<any> {
    const userId = req.user.id;
    const createdBy = req.user.email; 

    if (!userId || !createdBy) {
      throw new Error('ID ou email do usuário não encontrado no token.');
    }

    return this.cultivarService.CreateCultivar(createCultivarDto, userId, createdBy);
  }

  @Get('lista')
  @ApiOperation({ summary: 'Lista todos os cultivares do usuário logado com contagem' })
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
  
    return await this.cultivarService.findAndCountByUser(userId, paginate, parsedOptions);
  }
  
  @Get('check-cultivars')
  @ApiOperation({ summary: 'Retorna quais cultivares o usuário possui acesso' })
  async checkUserCultivars(@Req() req): Promise<Record<string, boolean>> {
    const userId = req.user?.id;
  
    if (!userId) {
      throw new BadRequestException('ID do usuário não encontrado no token.');
    }
  
    return await this.cultivarService.checkUserCultivars(userId);
  }

}
