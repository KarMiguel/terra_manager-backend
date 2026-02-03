import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PrismaClient } from '@prisma/client';
import { TipoOperacaoEnum, LogHelper } from '../utils/log-helper';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logHelper: LogHelper;

  constructor(private readonly prisma: PrismaClient) {
    this.logHelper = new LogHelper(prisma);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, params, query, user } = request;

    // Ignora rotas que não devem ser logadas
    if (this.shouldSkipLogging(url)) {
      return next.handle();
    }

    // Extrai informações do contexto
    // Para registro de usuário, pega email do body
    const emailFromBody = body?.email || body?.emailUsuario;
    const logContext = {
      idUsuario: user?.id || user?.sub || undefined,
      emailUsuario: user?.email || emailFromBody || undefined,
      ipAddress: request.ip || 
                 request.headers['x-forwarded-for'] || 
                 request.socket?.remoteAddress || 
                 undefined,
      userAgent: request.headers['user-agent'] || undefined,
    };

    // Determina a tabela baseada na rota
    const tabela = this.extractTableName(url);
    
    // Determina o tipo de operação baseado no método HTTP
    const tipoOperacao = this.getTipoOperacao(method, url);

    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (data) => {
        // Registra o log de forma assíncrona sem bloquear a resposta
        setImmediate(async () => {
          try {
            // Captura dados anteriores (para UPDATE/DELETE) - só quando necessário
            let dadosAnteriores = undefined;
            if (tipoOperacao === TipoOperacaoEnum.UPDATE || tipoOperacao === TipoOperacaoEnum.DELETE) {
              dadosAnteriores = await this.captureInitialData(context, tipoOperacao, params);
            }

            const idRegistro = this.extractIdRegistro(data, params, body);
            const dadosNovos = this.sanitizeData(data);

            // Atualiza o contexto com o ID do usuário criado (para registro)
            const finalLogContext = { ...logContext };
            if (tipoOperacao === TipoOperacaoEnum.CREATE && tabela === 'usuario' && idRegistro && !finalLogContext.idUsuario) {
              finalLogContext.idUsuario = idRegistro;
            }

            // Registra log para todas as operações importantes (exceto READ simples)
            // CREATE, UPDATE, DELETE, DEACTIVATE, ACTIVATE sempre são logados
            const shouldLog = tipoOperacao !== TipoOperacaoEnum.READ || 
                             (tipoOperacao === TipoOperacaoEnum.READ && (finalLogContext.idUsuario || finalLogContext.emailUsuario));
            
            if (shouldLog && tabela !== 'unknown') {
              // Debug: log para verificar se está entrando aqui
              console.log(`[LoggingInterceptor] Registrando log: ${tipoOperacao} na tabela ${tabela}, ID: ${idRegistro}`);
              
              await this.logHelper.createLog(
                tipoOperacao,
                tabela,
                finalLogContext,
                {
                  idRegistro,
                  dadosAnteriores: dadosAnteriores ? this.sanitizeData(dadosAnteriores) : undefined,
                  dadosNovos,
                  descricao: this.generateDescription(tipoOperacao, tabela, idRegistro, method, url),
                },
              );
              
              console.log(`[LoggingInterceptor] Log registrado com sucesso para ${tabela} ID ${idRegistro}`);
            } else {
              console.log(`[LoggingInterceptor] Log não registrado - shouldLog: ${shouldLog}, tabela: ${tabela}`);
            }
          } catch (error) {
            // Não interrompe a operação principal se o log falhar
            console.error('Erro ao registrar log automaticamente:', error);
            console.error('Detalhes do erro:', error.message, error.stack);
          }
        });
      }),
      catchError(async (error) => {
        // Log de erro também pode ser registrado aqui se necessário
        return Promise.reject(error);
      }),
    );
  }

  private shouldSkipLogging(url: string): boolean {
    // Rotas que não devem ser logadas
    const skipRoutes = [
      '/api-docs',
      '/health',
      '/favicon.ico',
      '/log', // Evita loop infinito
    ];

    return skipRoutes.some(route => url.includes(route));
  }

  private extractTableName(url: string): string {
    // Extrai o nome da tabela da rota
    // Ex: /fazenda/1 -> fazenda
    // Ex: /analise-solo -> analiseSolo
    // Ex: /auth/register -> usuario
    const parts = url.split('/').filter(p => p && !p.match(/^\d+$/));
    
    if (parts.length === 0) return 'unknown';
    
    const resource = parts[0];
    const subResource = parts[1];
    
    // Mapeia rotas para nomes de tabela
    const routeToTable: Record<string, string> = {
      'fazenda': 'fazenda',
      'fornecedor': 'fornecedor',
      'produto-estoque': 'produtosEstoque',
      'analise-solo': 'analiseSolo',
      'plantio': 'plantio',
      'cultivar': 'cultivar',
      'praga': 'praga',
      'user': 'usuario',
      'auth': 'usuario', // Registro de usuário via /auth/register
    };

    // Se for /auth/register, retorna 'usuario'
    if (resource === 'auth' && subResource === 'register') {
      return 'usuario';
    }

    return routeToTable[resource] || resource;
  }

  private getTipoOperacao(method: string, url: string): TipoOperacaoEnum {
    const upperMethod = method.toUpperCase();

    // Verifica rotas especiais primeiro
    if (url.includes('/desativar') || url.includes('/deactivate')) {
      return TipoOperacaoEnum.DEACTIVATE;
    }
    if (url.includes('/ativar') || url.includes('/activate')) {
      return TipoOperacaoEnum.ACTIVATE;
    }

    // Mapeia métodos HTTP para tipos de operação
    switch (upperMethod) {
      case 'POST':
        return TipoOperacaoEnum.CREATE;
      case 'PUT':
      case 'PATCH':
        return TipoOperacaoEnum.UPDATE;
      case 'DELETE':
        return TipoOperacaoEnum.DELETE;
      case 'GET':
        return TipoOperacaoEnum.READ;
      default:
        return TipoOperacaoEnum.READ;
    }
  }

  private async captureInitialData(
    context: ExecutionContext,
    tipoOperacao: TipoOperacaoEnum,
    params: any,
  ): Promise<any> {
    // Para UPDATE e DELETE, tenta capturar dados anteriores do Prisma
    if ((tipoOperacao === TipoOperacaoEnum.UPDATE || tipoOperacao === TipoOperacaoEnum.DELETE) && params?.id) {
      try {
        const request = context.switchToHttp().getRequest();
        const url = request.url;
        const tabela = this.extractTableName(url);
        
        // Mapeia nome da tabela para o modelo do Prisma
        const tableToModel: Record<string, string> = {
          'fazenda': 'fazenda',
          'fornecedor': 'fornecedor',
          'produtosEstoque': 'produtosEstoque',
          'analiseSolo': 'analiseSolo',
          'plantio': 'plantio',
          'cultivar': 'cultivar',
          'praga': 'praga',
          'usuario': 'usuario',
        };

        const modelName = tableToModel[tabela];
        if (modelName && this.prisma[modelName]) {
          const existing = await (this.prisma as any)[modelName].findUnique({
            where: { id: +params.id },
          });
          return existing;
        }
      } catch (error) {
        // Se não conseguir, retorna undefined (não é crítico)
        return undefined;
      }
    }
    return undefined;
  }

  private extractIdRegistro(data: any, params: any, body: any): number | undefined {
    // Tenta extrair o ID do registro de várias fontes
    if (data?.id) return typeof data.id === 'number' ? data.id : +data.id;
    if (params?.id) return +params.id;
    if (body?.id) return typeof body.id === 'number' ? body.id : +body.id;
    if (data?.data?.id) return typeof data.data.id === 'number' ? data.data.id : +data.data.id;
    
    // Para criação, tenta pegar o ID da resposta
    if (data && typeof data === 'object' && 'id' in data) {
      const id = (data as any).id;
      return typeof id === 'number' ? id : +id;
    }
    
    return undefined;
  }

  private sanitizeData(data: any): any {
    if (!data) return undefined;
    
    // Remove campos sensíveis
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    
    const sanitize = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item));
      }
      
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            sanitized[key] = '[HIDDEN]';
          } else if (value && typeof value === 'object') {
            sanitized[key] = sanitize(value);
          } else {
            sanitized[key] = value;
          }
        }
        return sanitized;
      }
      
      return obj;
    };

    return sanitize(data);
  }

  private generateDescription(
    tipoOperacao: TipoOperacaoEnum,
    tabela: string,
    idRegistro: number | undefined,
    method: string,
    url: string,
  ): string {
    const idStr = idRegistro ? ` ID ${idRegistro}` : '';
    const operacao = {
      [TipoOperacaoEnum.CREATE]: 'Criação',
      [TipoOperacaoEnum.UPDATE]: 'Atualização',
      [TipoOperacaoEnum.DELETE]: 'Exclusão',
      [TipoOperacaoEnum.DEACTIVATE]: 'Desativação',
      [TipoOperacaoEnum.ACTIVATE]: 'Ativação',
      [TipoOperacaoEnum.READ]: 'Leitura',
    }[tipoOperacao] || 'Operação';

    return `${operacao} de registro${idStr} na tabela ${tabela} via ${method} ${url}`;
  }
}
