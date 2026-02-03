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

      console.log('[LogHelper] Tentando salvar log:', {
        tipoOperacao,
        tabela,
        idRegistro: logData.idRegistro,
        emailUsuario: logData.emailUsuario,
      });

      // Usa o modelo Log do Prisma (o modelo é Log mas a tabela é "log")
      const created = await (this.prisma as any).log.create({
        data: logData,
      });

      console.log('[LogHelper] Log salvo com sucesso, ID:', created.id);
    } catch (error) {
      // Não lança erro para não interromper a operação principal
      console.error('[LogHelper] Erro ao criar log:', error);
      console.error('[LogHelper] Detalhes do erro:', error.message);
      if (error.stack) {
        console.error('[LogHelper] Stack trace:', error.stack);
      }
    }
  }
}
