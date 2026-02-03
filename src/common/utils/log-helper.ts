import { PrismaClient } from '@prisma/client';

export enum TipoOperacaoEnum {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  DEACTIVATE = 'DEACTIVATE',
  ACTIVATE = 'ACTIVATE',
  READ = 'READ',
}

export interface LogContext {
  idUsuario?: number;
  emailUsuario?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class LogHelper {
  constructor(private readonly prisma: PrismaClient) {}

  async createLog(
    tipoOperacao: TipoOperacaoEnum,
    tabela: string,
    context: LogContext,
    options?: {
      idRegistro?: number;
      dadosAnteriores?: any;
      dadosNovos?: any;
      descricao?: string;
    },
  ): Promise<void> {
    try {
      const logData: any = {
        tipoOperacao,
        tabela,
        idRegistro: options?.idRegistro,
        descricao: options?.descricao,
        idUsuario: context.idUsuario,
        emailUsuario: context.emailUsuario,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      };

      // Serializa objetos para JSON se necessário
      if (options?.dadosAnteriores !== undefined) {
        logData.dadosAnteriores = typeof options.dadosAnteriores === 'object' 
          ? JSON.parse(JSON.stringify(options.dadosAnteriores))
          : options.dadosAnteriores;
      }

      if (options?.dadosNovos !== undefined) {
        logData.dadosNovos = typeof options.dadosNovos === 'object'
          ? JSON.parse(JSON.stringify(options.dadosNovos))
          : options.dadosNovos;
      }

      await this.prisma.log.create({
        data: logData,
      });
    } catch (error) {
      // Não lança erro para não interromper a operação principal
      console.error('Erro ao criar log:', error);
    }
  }
}
