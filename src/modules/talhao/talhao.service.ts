import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CrudService } from '../../crud.service';
import { PrismaClient, Talhao } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { TalhaoModel } from './interface/talhao.interface';
import { CreateTalhaoDto } from './dto/create-talhao.dto';
import { Paginate } from '../../common/utils/types';
import { calculatePagination } from '../../common/utils/calculatePagination';

export interface TalhaoMapaFeature {
  type: 'Feature';
  geometry: Record<string, unknown>;
  properties: { id: number; nome: string; areaHa: number };
}
export interface TalhaoMapaResponse {
  type: 'FeatureCollection';
  features: TalhaoMapaFeature[];
}

@Injectable()
export class TalhaoService extends CrudService<Talhao, TalhaoModel> {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma, 'talhao', TalhaoModel);
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

  async createTalhao(dto: CreateTalhaoDto, createdBy: string, idUsuario: number): Promise<TalhaoModel> {
    await this.ensureFazendaBelongsToUser(dto.idFazenda, idUsuario);
    const created = await this.prisma.talhao.create({
      data: {
        idFazenda: dto.idFazenda,
        nome: dto.nome,
        areaHa: dto.areaHa,
        geometria: dto.geometria != null ? (dto.geometria as object) : undefined,
        observacao: dto.observacao,
        ativo: dto.ativo ?? true,
        createdBy,
      },
    });
    return plainToInstance(TalhaoModel, created, { excludeExtraneousValues: true });
  }

  /**
   * GeoJSON FeatureCollection dos talhões da fazenda (para mapa).
   * Cada talhão com geometria vira um Feature; talhões sem geometria são omitidos.
   */
  async mapaPorFazenda(idFazenda: number, idUsuario: number): Promise<TalhaoMapaResponse> {
    await this.ensureFazendaBelongsToUser(idFazenda, idUsuario);
    const talhoes = await this.prisma.talhao.findMany({
      where: { idFazenda, ativo: true },
      select: { id: true, nome: true, areaHa: true, geometria: true },
      orderBy: { nome: 'asc' },
    });
    const features = talhoes
      .filter((t) => t.geometria && typeof t.geometria === 'object')
      .map((t) => ({
        type: 'Feature' as const,
        geometry: t.geometria as Record<string, unknown>,
        properties: { id: t.id, nome: t.nome, areaHa: t.areaHa },
      }));
    return { type: 'FeatureCollection', features };
  }

  async listarPorFazenda(
    idFazenda: number,
    idUsuario: number,
    paginate?: Paginate,
  ): Promise<{ data: TalhaoModel[]; count: number }> {
    await this.ensureFazendaBelongsToUser(idFazenda, idUsuario);
    const pagination = calculatePagination(paginate || { page: 1, pageSize: 50 });
    const [data, count] = await this.prisma.$transaction([
      this.prisma.talhao.findMany({
        ...pagination,
        where: { idFazenda, ativo: true },
        orderBy: { nome: 'asc' },
      }),
      this.prisma.talhao.count({ where: { idFazenda, ativo: true } }),
    ]);
    return {
      data: plainToInstance(TalhaoModel, data, { excludeExtraneousValues: true }),
      count,
    };
  }

  /**
   * Resumo por fazenda: área total e área por talhão (base para custo, rotação e mapa).
   * Referência: prática usual de gestão agrícola por talhão (EMBRAPA, CONAB).
   */
  async resumoPorFazenda(idFazenda: number, idUsuario: number): Promise<{
    areaTotalHa: number;
    totalTalhoes: number;
    talhoes: { id: number; nome: string; areaHa: number }[];
  }> {
    await this.ensureFazendaBelongsToUser(idFazenda, idUsuario);
    const talhoes = await this.prisma.talhao.findMany({
      where: { idFazenda, ativo: true },
      select: { id: true, nome: true, areaHa: true },
      orderBy: { nome: 'asc' },
    });
    const areaTotalHa = talhoes.reduce((sum, t) => sum + t.areaHa, 0);
    return {
      areaTotalHa: Math.round(areaTotalHa * 100) / 100,
      totalTalhoes: talhoes.length,
      talhoes: talhoes.map((t) => ({ id: t.id, nome: t.nome, areaHa: t.areaHa })),
    };
  }
}
