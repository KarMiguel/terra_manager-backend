/** Dados para o corpo do relatório Resumo para o contador. */
export interface ResumoContadorTemplateData {
  fazendas: Array<{
    nome: string;
    municipio: string | null;
    uf: string | null;
    areaTotal: number | null;
  }>;
  areaTotal: number;
  totalPlantios: number;
  totalPago: number;
  totalFornecedores: number;
  porCultura: Record<string, number>;
  fornecedores: Array<{
    razaoSocial: string;
    cnpj: string;
    cidade: string | null;
  }>;
  /** Destaques para o contador/gestão. */
  destaques: string[];
  /** Pontos de atenção. */
  pontosAtencao: string[];
}

/** Retorna o HTML (body) do relatório Resumo para o contador / gestão. */
export function buildResumoContadorBody(data: ResumoContadorTemplateData): string {
  const {
    fazendas,
    areaTotal,
    totalPlantios,
    totalPago,
    totalFornecedores,
    porCultura,
    fornecedores,
    destaques,
    pontosAtencao,
  } = data;

  const resumoHtml =
    destaques.length > 0
      ? `<div class="insight-box">
      <h3>Destaques do período</h3>
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

  const tabelaFazendas =
    fazendas.length > 0
      ? `<h3 style="margin-top:20px;color:#2d5a27;">Fazendas</h3><table><thead><tr><th>Nome</th><th>Município/UF</th><th>Área (ha)</th></tr></thead><tbody>${fazendas.map((f) => `<tr><td>${f.nome}</td><td>${f.municipio ?? '—'}/${f.uf ?? '—'}</td><td>${f.areaTotal?.toLocaleString('pt-BR') ?? '—'}</td></tr>`).join('')}</tbody></table>`
      : '';

  const tabelaCultura =
    linhasCultura !== ''
      ? `<h3 style="margin-top:20px;color:#2d5a27;">Plantios por cultura</h3><table><thead><tr><th>Cultura</th><th>Quantidade</th></tr></thead><tbody>${linhasCultura}</tbody></table>`
      : '';

  const tabelaFornecedores =
    fornecedores.length > 0
      ? `<h3 style="margin-top:20px;color:#2d5a27;">Fornecedores</h3><table><thead><tr><th>Razão social</th><th>CNPJ</th><th>Cidade</th></tr></thead><tbody>${fornecedores.map((f) => `<tr><td>${f.razaoSocial}</td><td>${f.cnpj}</td><td>${f.cidade ?? '—'}</td></tr>`).join('')}</tbody></table>`
      : '';

  return `
    ${resumoHtml}
    ${alertasHtml}
    <table>
      <thead><tr><th>Indicador</th><th>Valor</th></tr></thead>
      <tbody>
        <tr class="totais"><td>Quantidade de fazendas</td><td>${fazendas.length}</td></tr>
        <tr class="totais"><td>Área total (ha)</td><td>${areaTotal.toLocaleString('pt-BR')}</td></tr>
        <tr class="totais"><td>Plantios no período</td><td>${totalPlantios}</td></tr>
        <tr class="totais"><td>Total pago ao sistema no período</td><td>R$ ${totalPago.toFixed(2)}</td></tr>
        <tr class="totais"><td>Fornecedores cadastrados</td><td>${totalFornecedores}</td></tr>
      </tbody>
    </table>
    ${tabelaCultura}
    ${tabelaFazendas}
    ${tabelaFornecedores}
  `;
}
