import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { FazendaModel } from './interface/fazenda.interface';
import { CrudService } from 'src/crud.service';
import { Prisma, PrismaClient, Fazenda } from '@prisma/client';
import { CreateFazendaDto } from './dto/create-fazenda.dto';
import { calculatePagination } from 'src/common/utils/calculatePagination';
import { Paginate } from 'src/common/utils/types';
import { plainToInstance } from 'class-transformer';
import { LogHelper, LogContext, TipoOperacaoEnum } from 'src/common/utils/log-helper';

@Injectable()
export class FazendaService extends CrudService<Fazenda, FazendaModel> {
  protected logHelper: LogHelper;

  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'fazenda', FazendaModel);
    this.logHelper = new LogHelper(prisma);
  }

  async createFazenda(
    createFazendaDto: CreateFazendaDto,
    userId: number,
    createdBy: string,
    logContext?: LogContext,
  ): Promise<FazendaModel> {
    if (!userId) {
      throw new BadRequestException('O ID do usuário é obrigatório para criar uma fazenda.');
    }

    if (createFazendaDto.cnpj) {
      const existingFazenda = await this.prisma.fazenda.findUnique({
        where: { cnpj: createFazendaDto.cnpj },
      });

      if (existingFazenda) {
        throw new ConflictException(`O CNPJ ${createFazendaDto.cnpj} já está registrado.`);
      }
    }

    try {
      const createdFazenda = await this.prisma.fazenda.create({
        data: {
          ...createFazendaDto,
          idUsuario: userId,
          createdBy,
        },
      });

      // Registra log da operação CREATE
      if (logContext) {
        this.logHelper.createLog(
          TipoOperacaoEnum.CREATE,
          'fazenda',
          logContext,
          {
            idRegistro: createdFazenda.id,
            dadosNovos: createdFazenda,
            descricao: `Criação de fazenda ID ${createdFazenda.id}`,
          },
        ).catch(err => console.error('Erro ao registrar log:', err));
      }

      return plainToInstance(FazendaModel, createdFazenda, {
        excludeExtraneousValues: true, 
      });
    } catch (error: any) {
      // Captura erros de unique constraint do Prisma
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        const field = target ? target.join(', ') : 'CNPJ';
        throw new ConflictException(`Já existe uma fazenda com o(s) valor(es) informado(s) para ${field}.`);
      }
      throw error;
    }
  }

  async findAndCountByUser(
    userId: number,
    paginate?: Paginate,
    options: Record<string, any> = {},
  ): Promise<{ data: any[]; count: number }> {
    const pagination = calculatePagination(paginate || { page: 1, pageSize: 10 });
  
    const where = {
      ...options.where,
      idUsuario: userId, 
    };
  
    const [data, count] = await this.prisma.$transaction([
      this.prisma.fazenda.findMany({
        ...pagination,
        where,
        orderBy: options.order || undefined, 
      }),
      this.prisma.fazenda.count({ where }),
    ]);
  
    return { data, count };
  }
  
  
}

