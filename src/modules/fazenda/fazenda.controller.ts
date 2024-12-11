import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { CrudController } from 'src/crud.controller';
import { FazendaModel } from './interface/fazenda.interface';
import { FazendaService } from './fazenda.service';
import { Fazenda } from '@prisma/client';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateFazendaDto } from './dto/create-fazenda.dto';
import { Paginate } from 'src/common/utils/types';

@ApiTags('Fazenda') 
@Controller('fazenda')
export class FazendaController extends CrudController<Fazenda, FazendaModel> {
  constructor(private readonly fazendaService: FazendaService) {
    super(fazendaService);
    
  }

  
  @Post()
  @ApiOperation({ summary: 'Cria uma nova fazenda' })
  async create(@Body() createFazendaDto: CreateFazendaDto, @Req() req): Promise<any> {
    const userId = req.user.id;
    const createdBy = req.user.email; 

    if (!userId || !createdBy) {
      throw new Error('ID ou email do usuário não encontrado no token.');
    }

    return this.fazendaService.createFazenda(createFazendaDto, userId, createdBy);
  }


  @Get('list/user')
  @ApiOperation({ summary: 'Lista todas as fazendas do usuário logado com contagem' })
  @ApiQuery({
    name: 'options',
    required: false,
    description: 'Opções de filtro em formato JSON',
    type: String,
  })
  async listByUser(
    @Req() req,
    @Query('options') options?: string,
    @Query('paginate') paginate?: Paginate,
  ): Promise<{ data: any[]; count: number }> {
    const userId = req.user.id;

    if (!userId) {
      throw new Error('ID do usuário não encontrado no token.');
    }

    const parsedOptions = options ? JSON.parse(options) : {};

    return this.fazendaService.findAndCountByUser(userId, paginate, parsedOptions);
  }

}
