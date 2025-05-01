import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCultivarDto } from './dto/create-cultivar.dto';
import { CultivarModel } from './interface/cultivar.interface';
import { Cultivar, PrismaClient } from '@prisma/client';
import { CrudService } from 'src/crud.service';
import { plainToInstance } from 'class-transformer';
import { Paginate } from 'src/common/utils/types';
import { calculatePagination } from 'src/common/utils/calculatePagination';

@Injectable()
export class CultivarService extends CrudService<Cultivar, CultivarModel> {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'praga', CultivarModel);
  }

  async CreateCultivar(
    createCultivarDto: CreateCultivarDto,
    userId: number,
    createdBy: string,
  ): Promise<CultivarModel> {
    if (!userId) {
      throw new BadRequestException('O ID do usuário é obrigatório para criar uma cultivar.');
    }

    const createdCultivar = await this.prisma.cultivar.create({
      data: {
        ...createCultivarDto,
        idUsuario: userId,
        createdBy,
      },
    });

    return plainToInstance(CultivarModel, createdCultivar, {
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
      this.prisma.cultivar.findMany({
        ...pagination,
        where,
        orderBy: options.order || undefined, 
        include: {
          usuario: true,
          praga: true,
          fornecedor: true,
        },
      }),
      this.prisma.cultivar.count({ where }),
    ]);
  
    return { data, count };
  }
  
}
 