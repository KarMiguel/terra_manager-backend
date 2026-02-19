import { Injectable } from '@nestjs/common';
import { PrismaClient, StatusPagamentoEnum } from '@prisma/client';
import * as puppeteer from 'puppeteer';
import { wrapHtml } from './templates/base';
import { buildPlantiosBody, PlantiosTemplateData } from './templates/plantios.html';
import { buildEstoqueBody, EstoqueTemplateData } from './templates/estoque.html';
import { buildAnalisesSoloBody, AnalisesSoloTemplateData } from './templates/analises-solo.html';
import { buildResumoContadorBody, ResumoContadorTemplateData } from './templates/resumo-contador.html';

@Injectable()
export class RelatorioService {
  constructor(private readonly prisma: PrismaClient) {}

  private async generatePdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
        printBackground: true,
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  async gerarRelatorioPlantios(
    idUsuario: number,
    ano?: number,
    idFazenda?: number,
  ): Promise<Buffer> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idUsuario },
      select: { nome: true },
    });
    const nomeUsuario = usuario?.nome ?? 'Usuário';

    const fazendasWhere = { idUsuario, ativo: true };
    if (idFazenda) (fazendasWhere as any).id = idFazenda;

    const fazendas = await this.prisma.fazenda.findMany({
      where: fazendasWhere,
      select: { id: true, nome: true },
    });
    const idsFazendas = fazendas.map((f) => f.id);

    const where: any = { fazenda: { id: { in: idsFazendas } }, ativo: true };
    if (ano) {
      where.dataPlantio = {
        gte: new Date(ano, 0, 1),
        lte: new Date(ano, 11, 31, 23, 59, 59),
      };
    }

    const plantios = await this.prisma.plantio.findMany({
      where,
      include: {
        cultivar: { select: { nomePopular: true, tipoPlanta: true } },
        fazenda: { select: { nome: true, municipio: true, uf: true } },
      },
      orderBy: [{ fazenda: { nome: 'asc' } }, { dataPlantio: 'desc' }],
    });

    const filtros: string[] = [];
    if (ano) filtros.push(`Ano: ${ano}`);
    if (idFazenda) filtros.push(`Fazenda: ${fazendas[0]?.nome ?? idFazenda}`);

    let areaTotal = 0;
    const porStatus: Record<string, number> = { PLANEJADO: 0, EXECUTADO: 0, EM_MONITORAMENTO: 0, CONCLUIDO: 0 };
    const porCulturaMap: Record<string, { areaHa: number; quantidade: number }> = {};
    const porFazendaMap: Record<string, { areaHa: number; quantidade: number }> = {};
    for (const p of plantios) {
      areaTotal += p.areaPlantada;
      porStatus[p.statusPlantio] = (porStatus[p.statusPlantio] ?? 0) + 1;
      const cultura = p.cultivar.tipoPlanta;
      if (!porCulturaMap[cultura]) porCulturaMap[cultura] = { areaHa: 0, quantidade: 0 };
      porCulturaMap[cultura].areaHa += p.areaPlantada;
      porCulturaMap[cultura].quantidade += 1;
      const faz = p.fazenda.nome;
      if (!porFazendaMap[faz]) porFazendaMap[faz] = { areaHa: 0, quantidade: 0 };
      porFazendaMap[faz].areaHa += p.areaPlantada;
      porFazendaMap[faz].quantidade += 1;
    }
    const areaMediaHa = plantios.length ? areaTotal / plantios.length : 0;
    const porCultura = Object.entries(porCulturaMap).map(([cultura, v]) => ({ cultura, ...v }));
    const porFazenda = Object.entries(porFazendaMap).map(([fazenda, v]) => ({ fazenda, ...v }));

    const alertas: string[] = [];
    if ((porStatus.PLANEJADO ?? 0) > plantios.length * 0.5)
      alertas.push(`${porStatus.PLANEJADO} plantios ainda planejados — considere priorizar execução.`);
    if ((porStatus.EM_MONITORAMENTO ?? 0) > 0)
      alertas.push(`${porStatus.EM_MONITORAMENTO} plantio(s) em monitoramento — acompanhar conclusão.`);

    const templateData: PlantiosTemplateData = {
      plantios,
      areaTotal,
      porStatus,
      porCultura,
      porFazenda,
      areaMediaHa,
      alertas,
    };
    const body = buildPlantiosBody(templateData);
    const html = wrapHtml(
      'Meus plantios por safra/cultura',
      nomeUsuario,
      body,
      filtros.length ? filtros.join(' · ') : undefined,
    );
    return this.generatePdf(html);
  }

  async gerarRelatorioEstoque(
    idUsuario: number,
    idFazenda?: number,
    categoria?: string,
  ): Promise<Buffer> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idUsuario },
      select: { nome: true },
    });
    const nomeUsuario = usuario?.nome ?? 'Usuário';

    const fazendasWhere = { idUsuario, ativo: true };
    if (idFazenda) (fazendasWhere as any).id = idFazenda;
    const fazendas = await this.prisma.fazenda.findMany({
      where: fazendasWhere,
      select: { id: true, nome: true },
    });
    const idsFazendas = fazendas.map((f) => f.id);

    const where: any = { fazenda: { id: { in: idsFazendas } }, ativo: true };
    if (categoria) where.categoria = categoria;

    const itensRaw = await this.prisma.produtosEstoque.findMany({
      where,
      include: {
        fazenda: { select: { nome: true } },
        fornecedor: { select: { nomeFantasia: true, razaoSocial: true } },
      },
      orderBy: [{ idFazenda: 'asc' }, { dataValidade: 'asc' }],
    });

    const filtros: string[] = [];
    if (idFazenda) filtros.push(`Fazenda: ${fazendas[0]?.nome ?? idFazenda}`);
    if (categoria) filtros.push(`Categoria: ${categoria}`);

    const hoje = new Date();
    let totalValor = 0;
    let valorVencido = 0;
    let valorProximoVencimento = 0;
    let qtdVencidos = 0;
    let qtdProximoVencimento = 0;
    let qtdEsgotados = 0;
    const porCategoriaMap: Record<string, { valor: number; quantidade: number }> = {};
    const itens: EstoqueTemplateData['itens'] = itensRaw.map((i) => {
      const valor = i.quantidade * i.valorUnitario;
      totalValor += valor;
      const vencido = i.dataValidade ? new Date(i.dataValidade) < hoje : false;
      const proximoVencimento =
        i.dataValidade &&
        !vencido &&
        (new Date(i.dataValidade).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24) <= 90;
      if (vencido) {
        valorVencido += valor;
        qtdVencidos += 1;
      } else if (proximoVencimento) {
        valorProximoVencimento += valor;
        qtdProximoVencimento += 1;
      }
      if (i.status === 'ESGOTADO') qtdEsgotados += 1;
      const cat = i.categoria;
      if (!porCategoriaMap[cat]) porCategoriaMap[cat] = { valor: 0, quantidade: 0 };
      porCategoriaMap[cat].valor += valor;
      porCategoriaMap[cat].quantidade += 1;
      return {
        fazenda: i.fazenda,
        nome: i.nome,
        descricao: i.descricao,
        categoria: i.categoria,
        quantidade: i.quantidade,
        unidadeMedida: i.unidadeMedida,
        valorUnitario: i.valorUnitario,
        dataValidade: i.dataValidade,
        status: i.status,
        valorTotal: valor,
        vencido,
        proximoVencimento,
      };
    });
    const porCategoria = Object.entries(porCategoriaMap).map(([categoria, v]) => ({ categoria, ...v }));

    const alertas: string[] = [];
    if (qtdVencidos > 0) alertas.push(`${qtdVencidos} item(ns) vencido(s) — valor R$ ${valorVencido.toFixed(2)}. Descarte ou reaproveite conforme procedimento.`);
    if (qtdProximoVencimento > 0) alertas.push(`${qtdProximoVencimento} item(ns) vence(m) em até 90 dias — valor em risco R$ ${valorProximoVencimento.toFixed(2)}. Planeje uso ou reposição.`);
    if (qtdEsgotados > 0) alertas.push(`${qtdEsgotados} item(ns) com status ESGOTADO. Avalie reposição.`);

    const templateData: EstoqueTemplateData = {
      itens,
      totalValor,
      valorVencido,
      valorProximoVencimento,
      qtdVencidos,
      qtdProximoVencimento,
      qtdEsgotados,
      porCategoria,
      alertas,
    };
    const body = buildEstoqueBody(templateData);
    const html = wrapHtml(
      'Meu estoque por fazenda',
      nomeUsuario,
      body,
      filtros.length ? filtros.join(' · ') : undefined,
    );
    return this.generatePdf(html);
  }

  async gerarRelatorioAnalisesSolo(idUsuario: number, ano?: number): Promise<Buffer> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idUsuario },
      select: { nome: true },
    });
    const nomeUsuario = usuario?.nome ?? 'Usuário';

    const where: any = { idUsuario, ativo: true };
    if (ano) {
      where.dateCreated = {
        gte: new Date(ano, 0, 1),
        lte: new Date(ano, 11, 31, 23, 59, 59),
      };
    }

    const analises = await this.prisma.analiseSolo.findMany({
      where,
      orderBy: { dateCreated: 'desc' },
    });

    const filtros: string[] = [];
    if (ano) filtros.push(`Ano: ${ano}`);

    const analisesMap = analises.map((a) => ({
      dateCreated: a.dateCreated,
      ph: a.ph,
      areaTotal: a.areaTotal,
      n: a.n,
      p: a.p,
      k: a.k,
      ctc: a.ctc,
      v: a.v,
      mo: a.mo,
    }));

    const nums = (key: 'ph' | 'n' | 'p' | 'k' | 'ctc' | 'v' | 'mo') => {
      const vals = analises.map((a) => (a as any)[key]).filter((v: any) => v != null && typeof v === 'number') as number[];
      return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : undefined;
    };
    const medias = {
      ph: nums('ph'),
      n: nums('n'),
      p: nums('p'),
      k: nums('k'),
      ctc: nums('ctc'),
      v: nums('v'),
      mo: nums('mo'),
    };
    const hojeAnalise = new Date();
    const ultima = analises[0];
    const ultimaAnaliseDiasAtras =
      ultima?.dateCreated
        ? Math.floor((hojeAnalise.getTime() - new Date(ultima.dateCreated).getTime()) / (1000 * 60 * 60 * 24))
        : null;
    const areaTotalCoberta = analises.reduce((s, a) => s + (a.areaTotal ?? 0), 0);
    const alertas: string[] = [];
    if (medias.ph != null && (medias.ph < 5.5 || medias.ph > 6.5))
      alertas.push(`pH médio ${medias.ph.toFixed(2)} fora da faixa ideal (5,5–6,5). Avalie correção do solo.`);
    if (ultimaAnaliseDiasAtras != null && ultimaAnaliseDiasAtras > 365)
      alertas.push(`Última análise há ${ultimaAnaliseDiasAtras} dias. Recomenda-se nova análise para decisão de adubação.`);

    const templateData: AnalisesSoloTemplateData = {
      analises: analisesMap,
      medias,
      ultimaAnaliseDiasAtras,
      areaTotalCoberta,
      alertas,
    };
    const body = buildAnalisesSoloBody(templateData);
    const html = wrapHtml(
      'Minhas análises de solo',
      nomeUsuario,
      body,
      filtros.length ? filtros.join(' · ') : undefined,
    );
    return this.generatePdf(html);
  }

  async gerarRelatorioResumoContador(
    idUsuario: number,
    ano?: number,
    mes?: number,
  ): Promise<Buffer> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: idUsuario },
      select: { nome: true },
    });
    const nomeUsuario = usuario?.nome ?? 'Usuário';

    const anoRef = ano ?? new Date().getFullYear();
    const inicio = mes
      ? new Date(anoRef, mes - 1, 1)
      : new Date(anoRef, 0, 1);
    const fim = mes
      ? new Date(anoRef, mes, 0, 23, 59, 59)
      : new Date(anoRef, 11, 31, 23, 59, 59);

    const [fazendas, plantios, usuarioPlanos, fornecedores] = await Promise.all([
      this.prisma.fazenda.findMany({
        where: { idUsuario, ativo: true },
        select: { id: true, nome: true, areaTotal: true, municipio: true, uf: true },
      }),
      this.prisma.plantio.findMany({
        where: {
          fazenda: { idUsuario },
          ativo: true,
          dataPlantio: { gte: inicio, lte: fim },
        },
        include: { cultivar: { select: { tipoPlanta: true, nomePopular: true } } },
      }),
      this.prisma.usuarioPlano.findMany({
        where: { idUsuario, ativo: true, dataCanceladoEm: null },
        include: {
          pagamentos: {
            where: {
              statusPagamento: StatusPagamentoEnum.APROVADO,
              dataPagamento: { gte: inicio, lte: fim },
            },
            select: { valor: true, dataPagamento: true, formaPagamento: true },
          },
        },
      }),
      this.prisma.fornecedor.findMany({
        where: { idUsuario, ativo: true },
        select: { razaoSocial: true, cnpj: true, cidade: true },
      }),
    ]);

    const areaTotal = fazendas.reduce((s, f) => s + (f.areaTotal ?? 0), 0);
    const porCultura: Record<string, number> = {};
    for (const p of plantios) {
      const t = p.cultivar.tipoPlanta;
      porCultura[t] = (porCultura[t] ?? 0) + 1;
    }
    const totalPago = usuarioPlanos.flatMap((up) => up.pagamentos).reduce((s, p) => s + (p.valor ?? 0), 0);

    const filtros = `Período: ${mes ? `${String(mes).padStart(2, '0')}/${anoRef}` : `Ano ${anoRef}`}`;

    const destaques: string[] = [];
    destaques.push(`${fazendas.length} fazenda(s) cadastrada(s), área total ${areaTotal.toLocaleString('pt-BR')} ha.`);
    destaques.push(`${plantios.length} plantio(s) no período.`);
    if (totalPago > 0) destaques.push(`Total pago ao sistema no período: R$ ${totalPago.toFixed(2)}.`);
    destaques.push(`${fornecedores.length} fornecedor(es) cadastrado(s).`);
    const pontosAtencao: string[] = [];
    if (fazendas.length === 0) pontosAtencao.push('Nenhuma fazenda cadastrada.');
    if (fornecedores.length === 0) pontosAtencao.push('Nenhum fornecedor cadastrado — útil para rastreabilidade e compras.');

    const templateData: ResumoContadorTemplateData = {
      fazendas,
      areaTotal,
      totalPlantios: plantios.length,
      totalPago,
      totalFornecedores: fornecedores.length,
      porCultura,
      fornecedores,
      destaques,
      pontosAtencao,
    };
    const body = buildResumoContadorBody(templateData);
    const html = wrapHtml('Resumo para o contador / gestão', nomeUsuario, body, filtros);
    return this.generatePdf(html);
  }
}
