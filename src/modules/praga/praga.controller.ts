import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Praga } from '@prisma/client';
import { CrudController } from 'src/crud.controller';
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
  @ApiOperation({ summary: 'Cria uma nova Praga' })
  async create(@Body() createPragaDto: CreatePragaDto, @Req() req): Promise<any> {
    const createdBy = req.user.email; 

    if (!createdBy) {
      throw new Error('Email do usuário não encontrado no token.');
    }

    return this.pragaService.createPraga(createPragaDto, createdBy);
  }


}
