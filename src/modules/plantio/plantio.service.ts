import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CrudService } from 'src/crud.service';
import { PrismaClient, Fazenda, Plantio } from '@prisma/client';

import { plainToInstance } from 'class-transformer';
import { calculatePagination } from 'src/common/utils/calculatePagination';
import { CrudServiceOptions, Paginate } from 'src/common/utils/types';
import { PlantioModel } from './interface/plantio.interface';
import { CreatePlantioDto } from './dto/create-plantio.dto';

@Injectable()
export class PlantioService extends CrudService<Plantio, PlantioModel> {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'plantio', PlantioModel);
  }

  async createPlantio(
    dto: CreatePlantioDto,
    createdBy: string,
  ): Promise<PlantioModel> {
    const {
      dataPlantio,
      dataEmergencia,
      dataPrevistaColheita,
      dataMaturacao,
      densidadePlanejada,
      ...rest
    } = dto;
  
    const dataToCreate: any = {
      ...rest,
      dataPlantio: new Date(dataPlantio),
      ...(dataEmergencia && { dataEmergencia: new Date(dataEmergencia) }),
      ...(dataPrevistaColheita && { dataPrevistaColheita: new Date(dataPrevistaColheita) }),
      ...(dataMaturacao && { dataMaturacao: new Date(dataMaturacao) }),
      createdBy,
      areaPlantada: dto.areaPlantada,
      densidadePlanejada: densidadePlanejada,
      densidadePlantioReal: dto.densidadePlantioReal ?? densidadePlanejada,
      mmAguaAplicado: dto.mmAguaAplicado
    
    };
  
    const created = await this.prisma.plantio.create({
      data: dataToCreate,
    });
  
    return plainToInstance(PlantioModel, created, {
      excludeExtraneousValues: true,
    });
  }
  

  async listarPorFazenda(
    idFazenda: number,
    idUsuario: number,
    paginate?: Paginate,
    options: CrudServiceOptions = {},
  ): Promise<{ data: PlantioModel[]; count: number }> {

    const fazenda = await this.prisma.fazenda.findUnique({
      where: { id: idFazenda },
      select: { idUsuario: true },
    });
  
    if (!fazenda) {
      throw new NotFoundException(`Fazenda com ID ${idFazenda} não encontrada.`);
    }
    if (fazenda.idUsuario !== idUsuario) {
      throw new BadRequestException(
        `O usuário logado não tem permissão para acessar os plantios desta fazenda.`
      );
    }
  
    const pagination = calculatePagination(paginate);
  
    const where: any = {
      ...options.where,
      idFazenda,
    };
  
    if (options.where?.cultivarNome) {
      where.cultivar = {
        nomePopular: {
          contains: options.where.cultivarNome,
          mode: 'insensitive',
        }
      };
    }
  
    const [plantios, count] = await this.prisma.$transaction([
      this.prisma.plantio.findMany({
        ...pagination,
        where,
        include: {
          cultivar: {
            select: { id: true, nomePopular: true, nomeCientifico: true },
          },
          fazenda: {
            select: { id: true, nome: true, municipio: true, uf: true },
          },
        },
        orderBy: { dataPlantio: 'desc' },
        ...this.filterOptions(options),
      }),
      this.prisma.plantio.count({ where }),
    ]);
  
    const data = plainToInstance(PlantioModel, plantios, {
      excludeExtraneousValues: true,
    });
  
    return { data, count };
  }
}
  