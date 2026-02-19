import { BadRequestException, Injectable } from '@nestjs/common';
import {
  PrismaClient,
  Plano,
  TipoPlanoEnum,
  StatusPagamentoEnum,
  FormaPagamentoEnum,
  StatusCobrancaEnum,
} from '@prisma/client';
import { CancelarPlanoResponseDto } from './dto/cancelar-plano.dto';
import { CreatePlanoDto } from './dto/create-plano.dto';
import {
  GerarCobrancaRequestDto,
  GerarCobrancaResponseDto,
} from './dto/gerar-cobranca.dto';
import { RegistrarPagamentoRequestDto, RegistrarPagamentoResponseDto } from './dto/registrar-pagamento.dto';

/** Gera string alfanumérica aleatória (0-9, A-Z). */
function randomAlfanumerico(length: number): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/** Gera apenas dígitos numéricos. */
function randomNumerico(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

/** Formato timestamp para código: YYYYMMDDHHmmss */
function timestampCodigo(): string {
  const d = new Date();
  return (
    d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0') +
    String(d.getSeconds()).padStart(2, '0')
  );
}

/**
 * Gera código de identificação da cobrança conforme a forma de pagamento (regra de negócio).
 * Simulação: PIX = chave copia-e-cola; BOLETO = código boleto; CARTAO = referência transação.
 */
function gerarCodigoCobranca(formaPagamento: FormaPagamentoEnum): string {
  const ts = timestampCodigo();
  switch (formaPagamento) {
    case FormaPagamentoEnum.PIX:
      return `PIX-${ts}-${randomAlfanumerico(20)}`;
    case FormaPagamentoEnum.BOLETO:
      return `BOL-${ts}-${randomNumerico(10)}`;
    case FormaPagamentoEnum.CARTAO_CREDITO:
      return `CC-${ts}-${randomAlfanumerico(8)}`;
    default:
      return `OUT-${ts}-${randomAlfanumerico(25)}`;
  }
}

export interface StatusPlanoUsuario {
  planoValido: boolean;
  tipoPlano: TipoPlanoEnum;
  nomePlano: string;
  dataFimPlano: Date;
  dataInicioPlano: Date;
  pagamentoAprovado: boolean | null;
  mensagem?: string;
}

@Injectable()
export class PlanoService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAllAtivos(): Promise<Plano[]> {
    return this.prisma.plano.findMany({
      where: { ativo: true },
      orderBy: { valorPlano: 'asc' },
    });
  }

  async findById(id: number): Promise<Plano | null> {
    return this.prisma.plano.findFirst({
      where: { id, ativo: true },
    });
  }

  async findByTipo(tipo: TipoPlanoEnum): Promise<Plano | null> {
    return this.prisma.plano.findFirst({
      where: { tipoPlano: tipo, ativo: true },
    });
  }

  /**
   * Cria um novo plano (apenas ADMIN).
   */
  async create(dto: CreatePlanoDto, createdBy?: string): Promise<Plano> {
    return this.prisma.plano.create({
      data: {
        nome: dto.nome,
        tipoPlano: dto.tipoPlano,
        valorPlano: dto.valorPlano,
        tempoPlanoDias: dto.tempoPlanoDias ?? undefined,
        descricao: dto.descricao ?? undefined,
        ativo: dto.ativo ?? true,
        createdBy: createdBy ?? undefined,
      },
    });
  }

  /** Retorna o plano BASICO para vincular novo usuário no cadastro. */
  async getPlanoInicial(): Promise<Plano> {
    const plano = await this.findByTipo(TipoPlanoEnum.BASICO);
    if (!plano) {
      throw new BadRequestException(
        'Plano BASICO não encontrado. Execute o seed de planos: npm run seed:plano',
      );
    }
    return plano;
  }

  /**
   * Retorna o status do plano atual do usuário (assinatura ativa, não cancelada).
   * Para plano pago: exige último pagamento APROVADO e vigência por tempoPlanoDias (dias de cobertura).
   * Se passou a data de vencer e não há pagamento aprovado no período, plano inválido (não pode logar).
   */
  async getStatusPlanoUsuario(idUsuario: number): Promise<StatusPlanoUsuario | null> {
    const usuarioPlano = await this.prisma.usuarioPlano.findFirst({
      where: { idUsuario, ativo: true, dataCanceladoEm: null },
      orderBy: { dataFimPlano: 'desc' },
      include: {
        plano: true,
        pagamentos: {
          where: { ativo: true },
          orderBy: { dataPagamento: 'desc' },
          take: 100,
        },
      },
    });

    if (!usuarioPlano) return null;

    const now = new Date();
    const prazoContratoValido = usuarioPlano.dataFimPlano >= now;

    const ultimoPagamentoAprovado = usuarioPlano.pagamentos.find(
      (p) => p.statusPagamento === StatusPagamentoEnum.APROVADO,
    );
    const diasCobertura = usuarioPlano.plano.tempoPlanoDias ?? 365;
    const dataReferenciaPagamento = ultimoPagamentoAprovado
      ? new Date(ultimoPagamentoAprovado.dataPagamento)
      : new Date(usuarioPlano.dataInicioPlano);
    const dataLimiteCobertura = new Date(dataReferenciaPagamento);
    dataLimiteCobertura.setDate(dataLimiteCobertura.getDate() + diasCobertura);
    const pagamentoNoPeriodo = !!ultimoPagamentoAprovado && now <= dataLimiteCobertura;
    const planoValido = prazoContratoValido && pagamentoNoPeriodo;

    let mensagem: string | undefined;
    if (!prazoContratoValido) {
      mensagem = 'Plano vencido. Renove para continuar.';
    } else if (!ultimoPagamentoAprovado) {
      mensagem = 'Nenhum pagamento aprovado. Regularize para acessar.';
    } else if (now > dataLimiteCobertura) {
      mensagem = `Pagamento em atraso (período de ${diasCobertura} dias). Regularize para acessar.`;
    }

    return {
      planoValido,
      tipoPlano: usuarioPlano.plano.tipoPlano,
      nomePlano: usuarioPlano.plano.nome,
      dataFimPlano: usuarioPlano.dataFimPlano,
      dataInicioPlano: usuarioPlano.dataInicioPlano,
      pagamentoAprovado: !!ultimoPagamentoAprovado,
      mensagem,
    };
  }

  /**
   * Cria vínculo do usuário com o plano (ex.: ao se cadastrar, plano inicial).
   * Regra: cada usuário pertence a um único plano ativo — as demais assinaturas são desativadas.
   */
  async criarUsuarioPlano(
    idUsuario: number,
    idPlano: number,
    createdBy?: string,
  ): Promise<void> {
    const plano = await this.findById(idPlano);
    if (!plano) {
      throw new BadRequestException('Plano não encontrado ou inativo.');
    }

    await this.prisma.usuarioPlano.updateMany({
      where: { idUsuario },
      data: { ativo: false },
    });

    const dias = plano.tempoPlanoDias ?? 365;
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() + dias);

    await this.prisma.usuarioPlano.create({
      data: {
        idUsuario,
        idPlano,
        dataFimPlano: dataFim,
        createdBy: createdBy ?? null,
      },
    });
  }

  /**
   * Verifica se o usuário já tem pagamento aprovado cobrindo o período atual.
   * Se sim, não pode gerar cobrança nem registrar novo pagamento até passar a data de vencimento do plano.
   */
  private async getCoberturaPagamento(idUsuario: number): Promise<{
    jaPagouNoPeriodo: boolean;
    dataVencimentoPlano?: Date;
  }> {
    const usuarioPlano = await this.prisma.usuarioPlano.findFirst({
      where: { idUsuario, ativo: true, dataCanceladoEm: null },
      orderBy: { dataFimPlano: 'desc' },
      include: {
        plano: true,
        pagamentos: {
          where: { ativo: true },
          orderBy: { dataPagamento: 'desc' },
          take: 100,
        },
      },
    });
    if (!usuarioPlano) return { jaPagouNoPeriodo: false };

    const now = new Date();
    const ultimoPagamentoAprovado = usuarioPlano.pagamentos.find(
      (p) => p.statusPagamento === StatusPagamentoEnum.APROVADO,
    );
    if (!ultimoPagamentoAprovado) return { jaPagouNoPeriodo: false };

    const diasCobertura = usuarioPlano.plano.tempoPlanoDias ?? 365;
    const dataReferencia = new Date(ultimoPagamentoAprovado.dataPagamento);
    const dataLimiteCobertura = new Date(dataReferencia);
    dataLimiteCobertura.setDate(dataLimiteCobertura.getDate() + diasCobertura);

    const jaPagouNoPeriodo = now <= dataLimiteCobertura;
    return {
      jaPagouNoPeriodo,
      dataVencimentoPlano: jaPagouNoPeriodo ? dataLimiteCobertura : undefined,
    };
  }

  /**
   * Retorna a assinatura ativa do usuário (cada usuário tem no máximo uma ativa).
   * Resolve pelo id do usuário logado — vigente, ativa e não cancelada.
   */
  private async getAssinaturaAtiva(idUsuario: number) {
    const now = new Date();
    return this.prisma.usuarioPlano.findFirst({
      where: {
        idUsuario,
        ativo: true,
        dataCanceladoEm: null,
        dataFimPlano: { gte: now },
      },
      orderBy: { dataFimPlano: 'desc' },
      include: { plano: true },
    });
  }

  /**
   * Cancela a assinatura ativa do usuário (registra data e motivo, desativa renovação).
   */
  async cancelarAssinatura(
    idUsuario: number,
    motivoCancelamento?: string,
  ): Promise<CancelarPlanoResponseDto> {
    const assinatura = await this.getAssinaturaAtiva(idUsuario);
    if (!assinatura) {
      throw new BadRequestException('Nenhuma assinatura ativa encontrada para cancelar.');
    }

    const now = new Date();
    await this.prisma.usuarioPlano.update({
      where: { id: assinatura.id },
      data: {
        dataCanceladoEm: now,
        motivoCancelamento: motivoCancelamento ?? null,
        renovacaoAutomatica: false,
        ativo: false,
      },
    });

    return {
      id: assinatura.id,
      canceladoEm: now.toISOString(),
      motivoCancelamento: motivoCancelamento ?? undefined,
      message: 'Assinatura cancelada com sucesso.',
    };
  }

  /**
   * Vincula um plano a um usuário por idUsuario. Se já tiver assinatura ativa, cancela (dataCanceladoEm) e depois cria a nova.
   * Atualiza também Usuario.idPlano.
   */
  async vincularPlanoUsuario(
    idUsuario: number,
    idPlano: number,
    createdBy?: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.usuario.findUnique({ where: { id: idUsuario } });
    if (!user) {
      throw new BadRequestException('Usuário não encontrado.');
    }
    const plano = await this.findById(idPlano);
    if (!plano) {
      throw new BadRequestException('Plano não encontrado ou inativo.');
    }

    const now = new Date();
    const assinaturasAtivas = await this.prisma.usuarioPlano.findMany({
      where: { idUsuario, ativo: true, dataCanceladoEm: null },
    });
    for (const a of assinaturasAtivas) {
      await this.prisma.usuarioPlano.update({
        where: { id: a.id },
        data: {
          dataCanceladoEm: now,
          motivoCancelamento: 'Troca de plano',
          renovacaoAutomatica: false,
          ativo: false,
        },
      });
    }

    await this.prisma.usuario.update({
      where: { id: idUsuario },
      data: { idPlano },
    });

    await this.criarUsuarioPlano(idUsuario, idPlano, createdBy);

    const novaAssinatura = await this.getAssinaturaAtiva(idUsuario);
    if (!novaAssinatura) {
      throw new BadRequestException('Falha ao criar nova assinatura.');
    }

    return {
      message: assinaturasAtivas.length > 0
        ? 'Assinatura anterior cancelada e novo plano vinculado com sucesso.'
        : 'Plano vinculado ao usuário com sucesso.',
    };
  }

  /**
   * Gera cobrança (boleto, PIX ou cartão) na assinatura vigente do usuário.
   * Gera código de identificação conforme a forma de pagamento (regra de negócio).
   * Simulação: sem gateway real; o código retornado pode ser usado em POST /plano/me/pagamento (codigoCobranca) para simular o pagamento.
   */
  async gerarCobranca(
    idUsuario: number,
    body: GerarCobrancaRequestDto,
    createdBy?: string,
  ): Promise<GerarCobrancaResponseDto> {
    const assinatura = await this.getAssinaturaAtiva(idUsuario);
    if (!assinatura) {
      throw new BadRequestException(
        'Nenhuma assinatura ativa encontrada. Contrate um plano antes de gerar cobrança.',
      );
    }

    const cobertura = await this.getCoberturaPagamento(idUsuario);
    if (cobertura.jaPagouNoPeriodo && cobertura.dataVencimentoPlano) {
      const dataFmt = cobertura.dataVencimentoPlano.toLocaleDateString('pt-BR');
      throw new BadRequestException(
        `Você já pagou. Só poderá gerar nova cobrança quando passar a data de vencimento do seu plano (${dataFmt}).`,
      );
    }

    const valor = body.valor ?? assinatura.plano.valorPlano;
    // Data de vencimento calculada: 3 dias a partir de hoje (fim do dia).
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 3);
    dataVencimento.setHours(23, 59, 59, 999);

    let codigoCobranca = gerarCodigoCobranca(body.formaPagamento);
    const maxTentativas = 5;
    for (let i = 0; i < maxTentativas; i++) {
      const existe = await this.prisma.cobranca.findUnique({
        where: { codigoCobranca },
      });
      if (!existe) break;
      codigoCobranca = gerarCodigoCobranca(body.formaPagamento);
    }

    const cobranca = await this.prisma.cobranca.create({
      data: {
        idUsuarioPlano: assinatura.id,
        formaPagamento: body.formaPagamento,
        valor,
        dataVencimento,
        codigoCobranca,
        status: StatusCobrancaEnum.PENDENTE,
        createdBy: createdBy ?? null,
      },
    });

    const mensagens: Record<FormaPagamentoEnum, string> = {
      [FormaPagamentoEnum.PIX]:
        'Use o código PIX (copia e cola) acima para pagar. Após pagar, chame POST /plano/me/pagamento com codigoCobranca e statusPagamento APROVADO.',
      [FormaPagamentoEnum.BOLETO]:
        'Use o código do boleto acima para pagar. Após pagar, chame POST /plano/me/pagamento com codigoCobranca e statusPagamento APROVADO.',
      [FormaPagamentoEnum.CARTAO_CREDITO]:
        'Use a referência acima para pagamento com cartão. Após aprovação, chame POST /plano/me/pagamento com codigoCobranca e statusPagamento APROVADO.',
    };
    const message = mensagens[body.formaPagamento] ?? 'Cobrança gerada. Use codigoCobranca em POST /plano/me/pagamento para registrar o pagamento.';

    return {
      id: cobranca.id,
      codigoCobranca: cobranca.codigoCobranca,
      formaPagamento: cobranca.formaPagamento,
      valor: cobranca.valor,
      dataVencimento: cobranca.dataVencimento.toISOString(),
      status: cobranca.status,
      idUsuarioPlano: cobranca.idUsuarioPlano,
      message,
    };
  }

  /**
   * Registra um pagamento (simulação) na assinatura vigente do usuário.
   * codigoCobranca vem na query (não no body). Quando igual ao da cobrança PENDENTE, vincula e marca como PAGO na hora.
   */
  async registrarPagamento(
    idUsuario: number,
    body: RegistrarPagamentoRequestDto,
    createdBy?: string,
    codigoCobranca?: string,
  ): Promise<RegistrarPagamentoResponseDto> {
    const assinatura = await this.getAssinaturaAtiva(idUsuario);
    if (!assinatura) {
      throw new BadRequestException(
        'Nenhuma assinatura ativa encontrada. Contrate um plano antes de registrar pagamento.',
      );
    }

    const cobertura = await this.getCoberturaPagamento(idUsuario);
    if (cobertura.jaPagouNoPeriodo && cobertura.dataVencimentoPlano) {
      const dataFmt = cobertura.dataVencimentoPlano.toLocaleDateString('pt-BR');
      throw new BadRequestException(
        `Você já pagou. Só poderá pagar novamente quando passar a data de vencimento do seu plano (${dataFmt}).`,
      );
    }

    const valorPlano = assinatura.plano.valorPlano;
    const TOLERANCIA_VALOR = 0.01;

    let idCobranca: number | undefined;
    let dataVencimento: Date | undefined;
    let cobranca: { id: number; codigoCobranca: string; valor: number; dataVencimento: Date } | null = null;
    if (codigoCobranca) {
      const c = await this.prisma.cobranca.findFirst({
        where: {
          codigoCobranca,
          idUsuarioPlano: assinatura.id,
          status: StatusCobrancaEnum.PENDENTE,
        },
      });
      if (c) {
        const now = new Date();
        if (now > c.dataVencimento) {
          throw new BadRequestException(
            'Cobrança vencida. Gere uma nova em POST /plano/me/cobranca e pague até a data de vencimento.',
          );
        }
        // Só aceita a última cobrança PENDENTE (código antigo não vale).
        const ultimaCobranca = await this.prisma.cobranca.findFirst({
          where: { idUsuarioPlano: assinatura.id, status: StatusCobrancaEnum.PENDENTE },
          orderBy: { id: 'desc' },
        });
        if (!ultimaCobranca || ultimaCobranca.id !== c.id) {
          throw new BadRequestException(
            'Código de cobrança antigo. Gere uma nova cobrança em POST /plano/me/cobranca e use o último código retornado.',
          );
        }
        cobranca = {
          id: c.id,
          codigoCobranca: c.codigoCobranca,
          valor: c.valor,
          dataVencimento: c.dataVencimento,
        };
        idCobranca = c.id;
        dataVencimento = c.dataVencimento;
      }
    }

    // Valor pago: deve ser igual ao valor da cobrança (quando há cobrança) ou ao valor do plano.
    let valor: number;
    if (cobranca) {
      valor = body.valor ?? cobranca.valor;
      if (Math.abs(valor - cobranca.valor) > TOLERANCIA_VALOR) {
        throw new BadRequestException(
          `O valor pago (${valor}) deve ser igual ao valor da cobrança (R$ ${cobranca.valor.toFixed(2)}).`,
        );
      }
    } else {
      valor = body.valor ?? valorPlano;
      if (body.valor != null && Math.abs(body.valor - valorPlano) > TOLERANCIA_VALOR) {
        throw new BadRequestException(
          `O valor pago (${body.valor}) deve ser igual ao valor do plano (R$ ${valorPlano.toFixed(2)}).`,
        );
      }
    }

    // Quando o codigoCobranca (query) for igual ao da cobrança PENDENTE, aprova na hora (não vem no body).
    let statusPagamento: StatusPagamentoEnum = StatusPagamentoEnum.PROCESSANDO;
    if (codigoCobranca && codigoCobranca === cobranca?.codigoCobranca) {
      statusPagamento = StatusPagamentoEnum.APROVADO;
    }

    const pagamento = await this.prisma.pagamentoPlano.create({
      data: {
        idUsuarioPlano: assinatura.id,
        valor,
        statusPagamento,
        formaPagamento: body.formaPagamento ?? undefined,
        dataVencimento: dataVencimento ?? undefined, // vem da cobrança quando codigoCobranca na query
        createdBy: createdBy ?? null,
      },
    });

    if (idCobranca) {
      await this.prisma.cobranca.update({
        where: { id: idCobranca },
        data: {
          status: statusPagamento === StatusPagamentoEnum.APROVADO ? StatusCobrancaEnum.PAGO : StatusCobrancaEnum.PENDENTE,
          idPagamentoPlano: statusPagamento === StatusPagamentoEnum.APROVADO ? pagamento.id : null,
          modifiedBy: createdBy ?? null,
        },
      });
    }

    return {
      id: pagamento.id,
      valor: pagamento.valor ?? undefined,
      statusPagamento: pagamento.statusPagamento,
      formaPagamento: pagamento.formaPagamento ?? undefined,
      dataPagamento: pagamento.dataPagamento.toISOString(),
      dataVencimento: pagamento.dataVencimento?.toISOString(),
      idUsuarioPlano: assinatura.id,
      message:
        statusPagamento === StatusPagamentoEnum.APROVADO
          ? 'Pagamento registrado e aprovado na hora.'
          : `Pagamento registrado com status: ${pagamento.statusPagamento}. Use codigoCobranca em POST /plano/me/pagamento para registrar o pagamento.`,
    };
  }
}
