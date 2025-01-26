import { BadRequestException, Injectable } from '@nestjs/common';
import { FazendaModel } from './interface/fazenda.interface';
import { CrudService } from 'src/crud.service';
import { Prisma, PrismaClient, Fazenda } from '@prisma/client';
import { CreateFazendaDto } from './dto/create-fazenda.dto';
import { calculatePagination } from 'src/common/utils/calculatePagination';
import { Paginate } from 'src/common/utils/types';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FazendaService extends CrudService<Fazenda, FazendaModel> {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'fazenda', FazendaModel);
  }

  async createFazenda(
    createFazendaDto: CreateFazendaDto,
    userId: number,
    createdBy: string,
  ): Promise<FazendaModel> {
    if (!userId) {
      throw new BadRequestException('O ID do usuário é obrigatório para criar uma fazenda.');
    }

    if (createFazendaDto.cnpj) {
      const existingFazenda = await this.prisma.fazenda.findUnique({
        where: { cnpj: createFazendaDto.cnpj },
      });

      if (existingFazenda) {
        throw new BadRequestException(`O CNPJ ${createFazendaDto.cnpj} já está registrado.`);
      }
    }

    const createdFazenda = await this.prisma.fazenda.create({
      data: {
        ...createFazendaDto,
        idUsuario: userId,
        createdBy,
      },
    });

    return plainToInstance(FazendaModel, createdFazenda, {
      excludeExtraneousValues: true, 
    });
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

