import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Fornecedor, PrismaClient } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { calculatePagination } from 'src/common/utils/calculatePagination';
import { Paginate } from 'src/common/utils/types';
import { CrudService } from 'src/crud.service';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { FornecedorModel } from './interface/fornecedor.interface';
import { LogHelper, LogContext, TipoOperacaoEnum } from 'src/common/utils/log-helper';

@Injectable()
export class FornecedorService extends CrudService<Fornecedor, FornecedorModel> {
  protected logHelper: LogHelper;

  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'fornecedor', FornecedorModel);
    this.logHelper = new LogHelper(prisma);
  }

  async createFornecedor(
    createFornecedorDto: CreateFornecedorDto,
    userId: number,
    createdBy: string,
    logContext?: LogContext,
  ): Promise<FornecedorModel> {
    if (!userId) {
      throw new BadRequestException('O ID do usuário é obrigatório para criar um Fornecedor .');
    }

    if (createFornecedorDto.cnpj) {
      const existingCNPJ = await this.prisma.fornecedor.findUnique({
        where: { cnpj: createFornecedorDto.cnpj },
      });

      if (existingCNPJ) {
        throw new ConflictException(`O CNPJ ${createFornecedorDto.cnpj} já está registrado.`);
      }
    }

    try {
      const createdFornecedor = await this.prisma.fornecedor.create({
        data: {
          ...createFornecedorDto,
          idUsuario: userId,
          createdBy,
        },
      });

      // Registra log da operação CREATE
      if (logContext) {
        this.logHelper.createLog(
          TipoOperacaoEnum.CREATE,
          'fornecedor',
          logContext,
          {
            idRegistro: createdFornecedor.id,
            dadosNovos: createdFornecedor,
            descricao: `Criação de fornecedor ID ${createdFornecedor.id}`,
          },
        ).catch(err => console.error('Erro ao registrar log:', err));
      }

      return plainToInstance(FornecedorModel, createdFornecedor, {
        excludeExtraneousValues: true, 
      });
    } catch (error: any) {
      // Captura erros de unique constraint do Prisma
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        const field = target ? target.join(', ') : 'CNPJ';
        throw new ConflictException(`Já existe um fornecedor com o(s) valor(es) informado(s) para ${field}.`);
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
      this.prisma.fornecedor.findMany({
        ...pagination,
        where,
        orderBy: options.order || undefined,
      }),
      this.prisma.fornecedor.count({ where }),
    ]);

    const dataPlainInstance: any[] = plainToInstance(FornecedorModel, data, {
      excludeExtraneousValues: true,
    });
  
    return { data: dataPlainInstance, count };
  }
  
}

