import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCultivarDto } from './dto/create-cultivar.dto';
import { CultivarModel } from './interface/cultivar.interface';
import { Cultivar, PrismaClient } from '@prisma/client';
import { CrudService } from 'src/crud.service';
import { plainToInstance } from 'class-transformer';
import { Paginate } from 'src/common/utils/types';
import { calculatePagination } from 'src/common/utils/calculatePagination';
import { TipoPlantaEnum } from './enum/cultivar.enum';

@Injectable()
export class CultivarService extends CrudService<Cultivar, CultivarModel> {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'cultivar', CultivarModel);
  }

  async CreateCultivar(
    createCultivarDto: CreateCultivarDto,
    userId: number,
    createdBy: string,
  ): Promise<CultivarModel> {
    if (!userId) {
      throw new BadRequestException('O ID do usuário é obrigatório para criar uma cultivar.');
    }
  
    const { praga, ...rest } = createCultivarDto;
  
    let idPraga: number | undefined = rest.idPraga;
    
    if (praga) {
      const createdPraga = await this.prisma.praga.create({
        data: {
          nomeCientifico: praga.nomeCientifico,
          nomeComum: praga.nomeComum,
          descricao: praga.descricao,
          createdBy,
        }
      });
      idPraga = createdPraga.id;
    }
  
    const dataToCreate: any = {
      ...rest,
      dataPlantioInicio: new Date(rest.dataPlantioInicio),
      dataPlantioFim:    new Date(rest.dataPlantioFim),
      idUsuario:         userId,
      idPraga:           idPraga,
      createdBy,
    };
  
    const createdCultivar = await this.prisma.cultivar.create({
      data: dataToCreate,
      include: {
        praga: {
          select: {
            id: true,
            nomeCientifico: true,
            nomeComum: true,
            descricao: true
          }
        },
        fornecedor: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cnpj: true,
            email: true,
            telefone: true
          }
        }
      }
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
      ...(options.where?.nomeCientifico && {
        nomeCientifico: {
          mode: 'insensitive',
          contains: options.where.nomeCientifico
        }
      }),
      ...(options.where?.nomePopular && {
        nomePopular: {
          mode: 'insensitive',
          contains: options.where.nomePopular
        }
      }),
    };
  
    const [data, count] = await this.prisma.$transaction([
      this.prisma.cultivar.findMany({
        ...pagination,
        where,
        orderBy: options.order || undefined, 
        include: {
          praga: {
            select: {
              id: true,
              nomeCientifico: true,
              nomeComum: true,
              descricao: true
            }
          },
          fornecedor: {
            select: {
              id: true,
              razaoSocial: true,
              cnpj: true,
              nomeFantasia: true,
              email: true,
              telefone: true
            }
          }
        },
      }),
      this.prisma.cultivar.count({ where }),
    ]);
  
    const dataPlainInstance: any[] = plainToInstance(CultivarModel, data, {
      excludeExtraneousValues: true,
    });
  
    return { data: dataPlainInstance, count };
  }
  
  async checkUserCultivars(userId: number): Promise<Record<string, boolean>> {
    if (!userId) {
      throw new BadRequestException('O ID do usuário é obrigatório.');
    }

    const userCultivars = await this.prisma.cultivar.findMany({
      where: {
        idUsuario: userId
      },
      select: {
        tipoPlanta: true
      }
    });

    const userCultivarSet = new Set(userCultivars.map(c => c.tipoPlanta.toUpperCase()));

    const result: Record<string, boolean> = {};
    Object.values(TipoPlantaEnum).forEach(cultivar => {
      result[cultivar] = userCultivarSet.has(cultivar);
    });

    return result;
  }

}
 