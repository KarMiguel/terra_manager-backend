import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CrudService } from '../../crud.service';
import { PrismaClient, ZonaManejo } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ZonaManejoModel } from './interface/zona-manejo.interface';
import { CreateZonaManejoDto } from './dto/create-zona-manejo.dto';
import { Paginate } from '../../common/utils/types';
import { calculatePagination } from '../../common/utils/calculatePagination';

@Injectable()
export class ZonaManejoService extends CrudService<ZonaManejo, ZonaManejoModel> {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'zonaManejo', ZonaManejoModel);
  }

  private async ensureFazendaBelongsToUser(idFazenda: number, idUsuario: number): Promise<void> {
    const fazenda = await this.prisma.fazenda.findUnique({
      where: { id: idFazenda },
      select: { idUsuario: true },
    });
    if (!fazenda) {
      throw new NotFoundException(`Fazenda com ID ${idFazenda} não encontrada.`);
    }
    if (fazenda.idUsuario !== idUsuario) {
      throw new BadRequestException('O usuário não tem permissão para esta fazenda.');
    }
  }

  async createZonaManejo(dto: CreateZonaManejoDto, createdBy: string, idUsuario: number): Promise<ZonaManejoModel> {
    await this.ensureFazendaBelongsToUser(dto.idFazenda, idUsuario);
    if (dto.idTalhao != null) {
      const talhao = await this.prisma.talhao.findFirst({
        where: { id: dto.idTalhao, idFazenda: dto.idFazenda },
      });
      if (!talhao) {
        throw new BadRequestException('Talhão não encontrado ou não pertence à fazenda informada.');
      }
    }
    const created = await this.prisma.zonaManejo.create({
      data: {
        idFazenda: dto.idFazenda,
        idTalhao: dto.idTalhao ?? null,
        nome: dto.nome,
        descricao: dto.descricao ?? null,
        tipo: dto.tipo ?? null,
        geometria: dto.geometria as object,
        cor: dto.cor ?? null,
        ativo: dto.ativo ?? true,
        createdBy,
      },
    });
    return plainToInstance(ZonaManejoModel, created, { excludeExtraneousValues: true });
  }

  async listarPorFazenda(
    idFazenda: number,
    idUsuario: number,
    paginate?: Paginate,
  ): Promise<{ data: ZonaManejoModel[]; count: number }> {
    await this.ensureFazendaBelongsToUser(idFazenda, idUsuario);
    const pagination = calculatePagination(paginate || { page: 1, pageSize: 50 });
    const [data, count] = await this.prisma.$transaction([
      this.prisma.zonaManejo.findMany({
        ...pagination,
        where: { idFazenda, ativo: true },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.zonaManejo.count({ where: { idFazenda, ativo: true } }),
    ]);
    return {
      data: plainToInstance(ZonaManejoModel, data, { excludeExtraneousValues: true }),
      count,
    };
  }

  /**
   * GeoJSON FeatureCollection das zonas de manejo da fazenda (para mapa).
   */
  async mapaPorFazenda(idFazenda: number, idUsuario: number): Promise<{
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      geometry: Record<string, unknown>;
      properties: { id: number; nome: string; tipo?: string; cor?: string; idTalhao?: number };
    }>;
  }> {
    await this.ensureFazendaBelongsToUser(idFazenda, idUsuario);
    const zonas = await this.prisma.zonaManejo.findMany({
      where: { idFazenda, ativo: true },
      select: { id: true, nome: true, tipo: true, cor: true, idTalhao: true, geometria: true },
      orderBy: { nome: 'asc' },
    });
    const features = zonas.map((z) => ({
      type: 'Feature' as const,
      geometry: z.geometria as Record<string, unknown>,
      properties: {
        id: z.id,
        nome: z.nome,
        tipo: z.tipo ?? undefined,
        cor: z.cor ?? undefined,
        idTalhao: z.idTalhao ?? undefined,
      },
    }));
    return { type: 'FeatureCollection', features };
  }

  async ensureZonaBelongsToUser(idZona: number, idUsuario: number): Promise<ZonaManejo> {
    const zona = await this.prisma.zonaManejo.findUnique({
      where: { id: idZona },
      include: { fazenda: { select: { idUsuario: true } } },
    });
    if (!zona) {
      throw new NotFoundException(`Zona de manejo com ID ${idZona} não encontrada.`);
    }
    if (zona.fazenda.idUsuario !== idUsuario) {
      throw new BadRequestException('O usuário não tem permissão para esta zona de manejo.');
    }
    return zona;
  }

  async updateWithUser(id: number, data: Record<string, unknown>, modifiedBy: string, idUsuario: number): Promise<ZonaManejoModel> {
    await this.ensureZonaBelongsToUser(id, idUsuario);
    return super.update(id, data, modifiedBy);
  }

  async findOneByIdAndUser(id: number, idUsuario: number): Promise<ZonaManejoModel | null> {
    await this.ensureZonaBelongsToUser(id, idUsuario);
    return this.findOneById(id);
  }

  async deleteAndCheckUser(id: number, idUsuario: number): Promise<ZonaManejoModel> {
    await this.ensureZonaBelongsToUser(id, idUsuario);
    return this.delete(id);
  }
}
