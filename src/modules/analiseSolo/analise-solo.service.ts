import { BadRequestException, Injectable } from '@nestjs/common';
import { AnaliseSolo, PrismaClient } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { calculatePagination } from 'src/common/utils/calculatePagination';
import { Paginate } from 'src/common/utils/types';
import { CrudService } from 'src/crud.service';

import { CreateAnaliseSoloDto } from './dto/create-analise-solo.dto';
import { AnaliseSoloModel } from './interface/analise-solo.interface';

@Injectable()
export class AnaliseSoloService extends CrudService<AnaliseSolo, AnaliseSoloModel> {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'analiseSolo', AnaliseSoloModel);
  }

  async createAnaliseSolo(
    createAnaliseSoloDto: CreateAnaliseSoloDto,
    userId: number,
    createdBy: string,
  ): Promise<AnaliseSoloModel> {
    if (!userId) {
      throw new BadRequestException('O ID do usuário é obrigatório para criar uma análise de solo.');
    }

    const createdAnaliseSolo = await this.prisma.analiseSolo.create({
      data: {
        ...createAnaliseSoloDto,
        idUsuario: userId,
        createdBy,
      },
    });

    return plainToInstance(AnaliseSoloModel, createdAnaliseSolo, {
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
      this.prisma.analiseSolo.findMany({
        ...pagination,
        where,
        orderBy: options.order || { dateCreated: 'desc' }, 
      }),
      this.prisma.analiseSolo.count({ where }),
    ]);
  
    return { data, count };
  }

  async findByPlantioId(plantioId: number): Promise<AnaliseSoloModel | null> {
    if (!plantioId) {
      throw new BadRequestException('O ID do plantio é obrigatório.');
    }

    const plantio = await this.prisma.plantio.findUnique({
      where: { id: plantioId },
      include: {
        analiseSolo: true,
      },
    });

    if (!plantio) {
      throw new BadRequestException('Plantio não encontrado.');
    }

    if (!plantio.analiseSolo) {
      return null;
    }

    return plainToInstance(AnaliseSoloModel, plantio.analiseSolo, {
      excludeExtraneousValues: true,
    });
  }
} 