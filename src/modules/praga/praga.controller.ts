import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { Praga } from '@prisma/client';
import { CrudController } from '../../crud.controller';
import { PragaModel } from './interface/praga.interface';
import { PragaService } from './praga.service';
import { CreatePragaDto } from './dto/create-praga.dto';

@ApiTags('Praga') 
@Controller('praga')
@ApiBearerAuth('access-token')
export class PragaController extends CrudController<Praga, PragaModel> {
  constructor(private readonly pragaService: PragaService) {
    super(pragaService); 
  }
  
  @Post()
  @ApiOperation({ 
    summary: 'Cria uma nova praga',
    description: 'Cria um novo registro de praga agrícola. Pragas podem ser associadas a plantios para controle e monitoramento.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Praga criada com sucesso' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos ou usuário não autenticado' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Não autorizado - Token JWT inválido ou ausente' 
  })
  async create(@Body() createPragaDto: CreatePragaDto, @Req() req): Promise<any> {
    const createdBy = req.user.email; 

    if (!createdBy) {
      throw new Error('Email do usuário não encontrado no token.');
    }

    return this.pragaService.createPraga(createPragaDto, createdBy);
  }


}
