
import { plainToInstance } from 'class-transformer';
import { CrudService } from 'src/crud.service';
import { PragaModel } from './interface/praga.interface';
import { CreatePragaDto } from './dto/create-praga.dto';
import { Praga, PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { LogHelper, LogContext, TipoOperacaoEnum } from 'src/common/utils/log-helper';

@Injectable()
export class PragaService extends CrudService<Praga, PragaModel> {
  protected logHelper: LogHelper;

  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'praga', PragaModel);
    this.logHelper = new LogHelper(prisma);
  }

  async createPraga(
    createPragaDto: CreatePragaDto,
    createdBy: string,
    logContext?: LogContext,
  ): Promise<PragaModel> {

    const created = await this.prisma.praga.create({
      data: {
        ...createPragaDto,
        createdBy,
      },
    });

    // Registra log da operação CREATE
    if (logContext) {
      this.logHelper.createLog(
        TipoOperacaoEnum.CREATE,
        'praga',
        logContext,
        {
          idRegistro: created.id,
          dadosNovos: created,
          descricao: `Criação de praga ID ${created.id}`,
        },
      ).catch(err => console.error('Erro ao registrar log:', err));
    }

    return plainToInstance(PragaModel, created, {
      excludeExtraneousValues: true, 
    });
  }

}

