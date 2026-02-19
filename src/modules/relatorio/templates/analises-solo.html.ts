/** Dados para o corpo do relatório de análises de solo. */
export interface AnalisesSoloTemplateData {
  analises: Array<{
    dateCreated: Date;
    ph: number | null;
    areaTotal: number | null;
    n: number | null;
    p: number | null;
    k: number | null;
    ctc: number | null;
    v: number | null;
    mo: number | null;
  }>;
  /** Médias dos indicadores (apenas onde há dados). */
  medias: { ph?: number; n?: number; p?: number; k?: number; ctc?: number; v?: number; mo?: number };
  /** Última análise: quantos dias atrás. */
  ultimaAnaliseDiasAtras: number | null;
  /** Área total coberta pelas análises (soma areaTotal). */
  areaTotalCoberta: number;
  alertas: string[];
}

/** Retorna o HTML (body) do relatório Minhas análises de solo. */
export function buildAnalisesSoloBody(data: AnalisesSoloTemplateData): string {
  const { analises, medias, ultimaAnaliseDiasAtras, areaTotalCoberta, alertas } = data;
  if (!analises.length) {
    return '<p class="empty">Nenhuma análise de solo encontrada para os filtros informados.</p>';
  }

  const mediasStr = Object.entries(medias)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k.toUpperCase()}: ${typeof v === 'number' ? v.toFixed(2) : v}`)
    .join(' · ');
  const resumoHtml = `
    <div class="insight-box">
      <h3>Resumo para decisão</h3>
      <table class="indicator-grid" style="width:100%;"><tr>
        <td><strong>Análises no período</strong><br>${analises.length}</td>
        <td><strong>Área coberta (ha)</strong><br>${areaTotalCoberta.toLocaleString('pt-BR')}</td>
        <td><strong>Última análise</strong><br>${ultimaAnaliseDiasAtras != null ? (ultimaAnaliseDiasAtras === 0 ? 'Hoje' : ultimaAnaliseDiasAtras === 1 ? '1 dia atrás' : `${ultimaAnaliseDiasAtras} dias atrás`) : '—'}</td>
        <td><strong>Médias (quando disponível)</strong><br>${mediasStr || '—'}</td>
      </tr></table>
    </div>`;

  const alertasHtml =
    alertas.length > 0
      ? `<div class="alert-box">
      <h3>Pontos de atenção</h3>
      <ul style="margin: 0; padding-left: 18px;">${alertas.map((a) => `<li>${a}</li>`).join('')}</ul>
    </div>`
      : '';

  const rows = analises
    .map(
      (a) => `
        <tr>
          <td>${new Date(a.dateCreated).toLocaleDateString('pt-BR')}</td>
          <td>${a.ph ?? '—'}</td>
          <td>${a.areaTotal ?? '—'}</td>
          <td>${a.n ?? '—'}</td>
          <td>${a.p ?? '—'}</td>
          <td>${a.k ?? '—'}</td>
          <td>${a.ctc ?? '—'}</td>
          <td>${a.v ?? '—'}</td>
          <td>${a.mo ?? '—'}</td>
        </tr>`,
    )
    .join('');
  return `
    ${resumoHtml}
    ${alertasHtml}
    <table>
      <thead><tr><th>Data</th><th>pH</th><th>Área (ha)</th><th>N</th><th>P</th><th>K</th><th>CTC</th><th>V%</th><th>MO</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}
