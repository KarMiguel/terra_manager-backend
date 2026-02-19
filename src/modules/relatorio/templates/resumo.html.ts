/** Dados para o corpo do relatório Resumo geral do sistema para o cliente. */
export interface ResumoRelatorioTemplateData {
  /** Período do relatório (ex.: "Ano 2025" ou "01/2025"). */
  periodoLabel: string;
  /** Plano atual do cliente. */
  plano: {
    tipoPlano: string;
    nomePlano: string;
    dataInicioPlano: Date;
    dataFimPlano: Date;
    planoValido: boolean;
    mensagem?: string;
  } | null;
  /** Resumo geral (números principais). */
  resumo: {
    totalFazendas: number;
    areaTotalHa: number;
    totalTalhoes: number;
    totalZonasManejo: number;
    totalPlantiosPeriodo: number;
    totalFornecedores: number;
    totalCultivaresUsados: number;
    totalPagoSistemaPeriodo: number;
    /** Custo total da safra (ano do período) agregado das fazendas do usuário. */
    custoSafraAnoAtual: number;
    anoReferenciaSafra: number;
  };
  /** Resumo de estoque (todas as fazendas do cliente). */
  estoque: {
    totalItens: number;
    valorTotal: number;
    itensProximoVencimento: number;
    itensVencidos: number;
  };
  /** Resumo de análises de solo. */
  analisesSolo: {
    totalAnalises: number;
    ultimaAnaliseData: Date | null;
    areaCobertaHa: number;
  };
  porCultura: Record<string, number>;
  /** Zonas de manejo por fazenda (para seção no relatório). */
  zonasManejo: Array<{
    nomeFazenda: string;
    nome: string;
    tipo: string | null;
    nomeTalhao: string | null;
  }>;
  fazendas: Array<{
    nome: string;
    municipio: string | null;
    uf: string | null;
    areaTotal: number | null;
  }>;
  fornecedores: Array<{
    razaoSocial: string;
    cnpj: string;
    cidade: string | null;
  }>;
  destaques: string[];
  pontosAtencao: string[];
}

/** Retorna o HTML (body) do relatório Resumo geral do sistema para o cliente. */
export function buildResumoRelatorioBody(data: ResumoRelatorioTemplateData): string {
  const {
    periodoLabel,
    plano,
    resumo,
    estoque,
    analisesSolo,
    porCultura,
    zonasManejo,
    fazendas,
    fornecedores,
    destaques,
    pontosAtencao,
  } = data;

  const planoHtml = plano
    ? `<div class="insight-box">
      <h3>Seu plano</h3>
      <table class="indicator-grid" style="width:100%;"><tr>
        <td><strong>Plano</strong><br>${plano.nomePlano} (${plano.tipoPlano})</td>
        <td><strong>Vigência</strong><br>${new Date(plano.dataInicioPlano).toLocaleDateString('pt-BR')} a ${new Date(plano.dataFimPlano).toLocaleDateString('pt-BR')}</td>
        <td><strong>Status</strong><br>${plano.planoValido ? 'Válido' : 'Atenção'}</td>
        ${plano.mensagem ? `<td><strong>Observação</strong><br>${plano.mensagem}</td>` : ''}
      </tr></table>
    </div>`
    : '<div class="alert-box danger"><h3>Plano</h3><p>Nenhum plano ativo. Contrate um plano para usar o sistema.</p></div>';

  const resumoNumerosHtml = `
    <div class="insight-box">
      <h3>Resumo do sistema (${periodoLabel})</h3>
      <table class="indicator-grid" style="width:100%;"><tr>
        <td><strong>Fazendas</strong><br>${resumo.totalFazendas}</td>
        <td><strong>Área total</strong><br>${resumo.areaTotalHa.toLocaleString('pt-BR')} ha</td>
        <td><strong>Talhões</strong><br>${resumo.totalTalhoes}</td>
        <td><strong>Zonas de manejo</strong><br>${resumo.totalZonasManejo}</td>
        <td><strong>Plantios no período</strong><br>${resumo.totalPlantiosPeriodo}</td>
        <td><strong>Fornecedores</strong><br>${resumo.totalFornecedores}</td>
      </tr><tr>
        <td><strong>Cultivares em uso</strong><br>${resumo.totalCultivaresUsados}</td>
        <td><strong>Custo safra ${resumo.anoReferenciaSafra}</strong><br>R$ ${resumo.custoSafraAnoAtual.toFixed(2)}</td>
        <td colspan="4"><strong>Pago ao sistema (período)</strong><br>R$ ${resumo.totalPagoSistemaPeriodo.toFixed(2)}</td>
      </tr></table>
    </div>`;

  const estoqueHtml = `
    <div class="insight-box">
      <h3>Estoque (resumo)</h3>
      <table class="indicator-grid" style="width:100%;"><tr>
        <td><strong>Itens em estoque</strong><br>${estoque.totalItens}</td>
        <td><strong>Valor total estimado</strong><br>R$ ${estoque.valorTotal.toFixed(2)}</td>
        <td><strong>Itens próximos a vencer (90 dias)</strong><br>${estoque.itensProximoVencimento}</td>
        <td><strong>Itens vencidos</strong><br>${estoque.itensVencidos}</td>
      </tr></table>
    </div>`;

  const analisesHtml = `
    <div class="insight-box">
      <h3>Análises de solo (resumo)</h3>
      <table class="indicator-grid" style="width:100%;"><tr>
        <td><strong>Total de análises</strong><br>${analisesSolo.totalAnalises}</td>
        <td><strong>Última análise</strong><br>${analisesSolo.ultimaAnaliseData ? new Date(analisesSolo.ultimaAnaliseData).toLocaleDateString('pt-BR') : '—'}</td>
        <td><strong>Área coberta (ha)</strong><br>${analisesSolo.areaCobertaHa.toLocaleString('pt-BR')}</td>
      </tr></table>
    </div>`;

  const destaquesHtml =
    destaques.length > 0
      ? `<div class="insight-box">
      <h3>Destaques</h3>
      <ul style="margin: 0; padding-left: 18px;">${destaques.map((d) => `<li>${d}</li>`).join('')}</ul>
    </div>`
      : '';

  const alertasHtml =
    pontosAtencao.length > 0
      ? `<div class="alert-box">
      <h3>Pontos de atenção</h3>
      <ul style="margin: 0; padding-left: 18px;">${pontosAtencao.map((p) => `<li>${p}</li>`).join('')}</ul>
    </div>`
      : '';

  const linhasCultura = Object.entries(porCultura)
    .map(([c, q]) => `<tr><td>${c}</td><td>${q}</td></tr>`)
    .join('');

  const tabelaZonasManejo =
    zonasManejo.length > 0
      ? `<h3 style="margin-top:20px;color:#2d5a27;">Zonas de manejo</h3><p style="margin:0 0 8px 0;color:#555;font-size:0.95em;">Listagem das zonas de manejo por fazenda (fertilidade, irrigação, produtividade, etc.).</p><table><thead><tr><th>Fazenda</th><th>Zona</th><th>Tipo</th><th>Talhão</th></tr></thead><tbody>${zonasManejo.map((z) => `<tr><td>${z.nomeFazenda}</td><td>${z.nome}</td><td>${z.tipo ?? '—'}</td><td>${z.nomeTalhao ?? '—'}</td></tr>`).join('')}</tbody></table>`
      : '';

  const tabelaFazendas =
    fazendas.length > 0
      ? `<h3 style="margin-top:20px;color:#2d5a27;">Fazendas</h3><table><thead><tr><th>Nome</th><th>Município/UF</th><th>Área (ha)</th></tr></thead><tbody>${fazendas.map((f) => `<tr><td>${f.nome}</td><td>${f.municipio ?? '—'}/${f.uf ?? '—'}</td><td>${f.areaTotal?.toLocaleString('pt-BR') ?? '—'}</td></tr>`).join('')}</tbody></table>`
      : '';

  const tabelaCultura =
    linhasCultura !== ''
      ? `<h3 style="margin-top:20px;color:#2d5a27;">Plantios por cultura (período)</h3><table><thead><tr><th>Cultura</th><th>Quantidade</th></tr></thead><tbody>${linhasCultura}</tbody></table>`
      : '';

  const tabelaFornecedores =
    fornecedores.length > 0
      ? `<h3 style="margin-top:20px;color:#2d5a27;">Fornecedores</h3><table><thead><tr><th>Razão social</th><th>CNPJ</th><th>Cidade</th></tr></thead><tbody>${fornecedores.map((f) => `<tr><td>${f.razaoSocial}</td><td>${f.cnpj}</td><td>${f.cidade ?? '—'}</td></tr>`).join('')}</tbody></table>`
      : '';

  return `
    ${planoHtml}
    ${resumoNumerosHtml}
    ${estoqueHtml}
    ${analisesHtml}
    ${destaquesHtml}
    ${alertasHtml}
    <h3 style="margin-top:20px;color:#2d5a27;">Indicadores do período</h3>
    <table>
      <thead><tr><th>Indicador</th><th>Valor</th></tr></thead>
      <tbody>
        <tr class="totais"><td>Quantidade de fazendas</td><td>${resumo.totalFazendas}</td></tr>
        <tr class="totais"><td>Área total (ha)</td><td>${resumo.areaTotalHa.toLocaleString('pt-BR')}</td></tr>
        <tr class="totais"><td>Talhões cadastrados</td><td>${resumo.totalTalhoes}</td></tr>
        <tr class="totais"><td>Zonas de manejo</td><td>${resumo.totalZonasManejo}</td></tr>
        <tr class="totais"><td>Plantios no período</td><td>${resumo.totalPlantiosPeriodo}</td></tr>
        <tr class="totais"><td>Custo total safra ${resumo.anoReferenciaSafra}</td><td>R$ ${resumo.custoSafraAnoAtual.toFixed(2)}</td></tr>
        <tr class="totais"><td>Total pago ao sistema no período</td><td>R$ ${resumo.totalPagoSistemaPeriodo.toFixed(2)}</td></tr>
        <tr class="totais"><td>Fornecedores cadastrados</td><td>${resumo.totalFornecedores}</td></tr>
        <tr class="totais"><td>Itens em estoque</td><td>${estoque.totalItens} (valor R$ ${estoque.valorTotal.toFixed(2)})</td></tr>
        <tr class="totais"><td>Análises de solo</td><td>${analisesSolo.totalAnalises}</td></tr>
      </tbody>
    </table>
    ${tabelaCultura}
    ${tabelaFazendas}
    ${tabelaZonasManejo}
    ${tabelaFornecedores}
  `;
}
