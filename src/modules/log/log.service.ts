import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TipoOperacaoEnum } from '../../common/utils/log-helper';

export interface CreateLogDto {
  tipoOperacao: TipoOperacaoEnum;
  tabela: string;
  idRegistro?: number;
  dadosAnteriores?: any;
  dadosNovos?: any;
  descricao?: string;
  idUsuario?: number;
  emailUsuario?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class LogService {
  constructor(private readonly prisma: PrismaClient) {}

  async createLog(data: CreateLogDto): Promise<any> {
    try {
      const logData: any = {
        tipoOperacao: data.tipoOperacao,
        tabela: data.tabela,
        idRegistro: data.idRegistro,
        descricao: data.descricao,
        idUsuario: data.idUsuario,
        emailUsuario: data.emailUsuario,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      };

      // Serializa objetos para JSON se necessário
      if (data.dadosAnteriores !== undefined) {
        logData.dadosAnteriores = typeof data.dadosAnteriores === 'object' 
          ? JSON.parse(JSON.stringify(data.dadosAnteriores))
          : data.dadosAnteriores;
      }

      if (data.dadosNovos !== undefined) {
        logData.dadosNovos = typeof data.dadosNovos === 'object'
          ? JSON.parse(JSON.stringify(data.dadosNovos))
          : data.dadosNovos;
      }

      return await (this.prisma as any).log.create({
        data: logData,
      });
    } catch (error) {
      // Não lança erro para não interromper a operação principal
      console.error('Erro ao criar log:', error);
      throw error;
    }
  }

  async findLogsByTabela(
    tabela: string,
    idRegistro?: number,
    limit: number = 100,
  ): Promise<any[]> {
    const where: any = { tabela };
    if (idRegistro) {
      where.idRegistro = idRegistro;
    }

    return await (this.prisma as any).log.findMany({
      where,
      orderBy: { dateCreated: 'desc' },
      take: limit,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
  }

  async findLogsByUsuario(
    idUsuario: number,
    limit: number = 100,
  ): Promise<any[]> {
    return await (this.prisma as any).log.findMany({
      where: { idUsuario },
      orderBy: { dateCreated: 'desc' },
      take: limit,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
  }

  async findLogsByTipoOperacao(
    tipoOperacao: TipoOperacaoEnum,
    limit: number = 100,
  ): Promise<any[]> {
    return await (this.prisma as any).log.findMany({
      where: { tipoOperacao },
      orderBy: { dateCreated: 'desc' },
      take: limit,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
  }

  async findAllLogs(
    page: number = 1,
    pageSize: number = 50,
    options?: {
      tabela?: string;
      tipoOperacao?: TipoOperacaoEnum;
      idUsuario?: number;
    },
  ): Promise<{ data: any[]; count: number; page: number; pageSize: number; totalPages: number }> {
    const skip = (page - 1) * pageSize;
    
    const where: any = {};
    if (options?.tabela) {
      where.tabela = options.tabela;
    }
    if (options?.tipoOperacao) {
      where.tipoOperacao = options.tipoOperacao;
    }
    if (options?.idUsuario) {
      where.idUsuario = options.idUsuario;
    }

    const [data, count] = await this.prisma.$transaction([
      (this.prisma as any).log.findMany({
        where,
        orderBy: { dateCreated: 'desc' },
        skip,
        take: pageSize,
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
        },
      }),
      (this.prisma as any).log.count({ where }),
    ]);

    const totalPages = Math.ceil(count / pageSize);

    return {
      data,
      count,
      page,
      pageSize,
      totalPages,
    };
  }
}
