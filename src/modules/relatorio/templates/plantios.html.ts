/** Dados para o corpo do relatório de plantios. */
export interface PlantiosTemplateData {
  plantios: Array<{
    fazenda: { nome: string };
    talhao: { nome: string } | null;
    cultivar: { nomePopular: string; tipoPlanta: string };
    dataPlantio: Date;
    areaPlantada: number;
    custoTotal: number | null;
    quantidadeOperacoes: number;
    statusPlantio: string;
  }>;
  areaTotal: number;
  /** Custo total dos plantios listados (soma de custoTotal). */
  custoTotalGeral: number;
  porStatus: Record<string, number>;
  porCultura: Array<{ cultura: string; areaHa: number; quantidade: number }>;
  porFazenda: Array<{ fazenda: string; areaHa: number; quantidade: number }>;
  areaMediaHa: number;
  alertas: string[];
}

/** Retorna o HTML (body) do relatório Meus plantios por safra/cultura. */
export function buildPlantiosBody(data: PlantiosTemplateData): string {
  const { plantios, areaTotal, custoTotalGeral, porStatus, porCultura, porFazenda, areaMediaHa, alertas } = data;
  if (!plantios.length) {
    return '<p class="empty">Nenhum plantio encontrado para os filtros informados.</p>';
  }

  const pctConcluido = plantios.length ? Math.round(((porStatus.CONCLUIDO ?? 0) / plantios.length) * 100) : 0;
  const custoPorHa = areaTotal > 0 ? custoTotalGeral / areaTotal : 0;
  const resumoHtml = `
    <div class="insight-box">
      <h3>Resumo para decisão</h3>
      <table class="indicator-grid" style="width:100%;"><tr>
        <td><strong>Área total</strong><br>${areaTotal.toLocaleString('pt-BR')} ha</td>
        <td><strong>Plantios</strong><br>${plantios.length}</td>
        <td><strong>Custo total</strong><br>R$ ${custoTotalGeral.toFixed(2)}</td>
        <td><strong>Custo/ha (médio)</strong><br>R$ ${custoPorHa.toFixed(2)}</td>
        <td><strong>Concluídos</strong><br>${porStatus.CONCLUIDO ?? 0} (${pctConcluido}%)</td>
      </tr></table>
      ${porCultura.length ? `<p><strong>Por cultura:</strong> ${porCultura.map((c) => `${c.cultura}: ${c.areaHa.toLocaleString('pt-BR')} ha (${c.quantidade} plantio(s))`).join(' · ')}</p>` : ''}
      ${porFazenda.length ? `<p><strong>Por fazenda:</strong> ${porFazenda.map((f) => `${f.fazenda}: ${f.areaHa.toLocaleString('pt-BR')} ha`).join(' · ')}</p>` : ''}
    </div>`;

  const alertasHtml =
    alertas.length > 0
      ? `<div class="alert-box ${alertas.some((a) => a.includes('vencido') || a.includes('atraso')) ? 'danger' : ''}">
      <h3>Pontos de atenção</h3>
      <ul style="margin: 0; padding-left: 18px;">${alertas.map((a) => `<li>${a}</li>`).join('')}</ul>
    </div>`
      : '';

  const rows = plantios
    .map(
      (p) => `
        <tr>
          <td>${p.fazenda.nome}</td>
          <td>${p.talhao?.nome ?? '—'}</td>
          <td>${p.cultivar.nomePopular}</td>
          <td>${p.cultivar.tipoPlanta}</td>
          <td>${new Date(p.dataPlantio).toLocaleDateString('pt-BR')}</td>
          <td>${p.areaPlantada.toLocaleString('pt-BR')} ha</td>
          <td>${p.custoTotal != null ? 'R$ ' + p.custoTotal.toFixed(2) : '—'}</td>
          <td>${p.quantidadeOperacoes}</td>
          <td><span class="badge badge-${p.statusPlantio === 'CONCLUIDO' ? 'success' : p.statusPlantio === 'EXECUTADO' ? 'warning' : 'danger'}">${p.statusPlantio}</span></td>
        </tr>`,
    )
    .join('');
  return `
    ${resumoHtml}
    ${alertasHtml}
    <table>
      <thead><tr><th>Fazenda</th><th>Talhão</th><th>Cultivar</th><th>Cultura</th><th>Data plantio</th><th>Área (ha)</th><th>Custo (R$)</th><th>Operações</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr class="totais"><td colspan="5">Total</td><td>${areaTotal.toLocaleString('pt-BR')} ha</td><td>R$ ${custoTotalGeral.toFixed(2)}</td><td colspan="2">—</td></tr>
        <tr class="totais"><td colspan="9">Por status: PLANEJADO ${porStatus.PLANEJADO ?? 0} · EXECUTADO ${porStatus.EXECUTADO ?? 0} · EM_MONITORAMENTO ${porStatus.EM_MONITORAMENTO ?? 0} · CONCLUIDO ${porStatus.CONCLUIDO ?? 0}</td></tr>
      </tfoot>
    </table>`;
}
