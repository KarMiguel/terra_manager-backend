
import { plainToInstance } from 'class-transformer';
import { CrudService } from 'src/crud.service';
import { PragaModel } from './interface/praga.interface';
import { CreatePragaDto } from './dto/create-praga.dto';
import { Praga, PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PragaService extends CrudService<Praga, PragaModel> {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'praga', PragaModel);
  }

  async createPraga(
    createPragaDto: CreatePragaDto,
    createdBy: string,
  ): Promise<PragaModel> {

    const created = await this.prisma.praga.create({
      data: {
        ...createPragaDto,
        createdBy,
      },
    });

    return plainToInstance(PragaModel, created, {
      excludeExtraneousValues: true, 
    });
  }

}

