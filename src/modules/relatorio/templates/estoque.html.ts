/** Dados para o corpo do relatório de estoque. */
export interface EstoqueTemplateData {
  itens: Array<{
    fazenda: { nome: string };
    fornecedor: { nomeFantasia: string | null; razaoSocial: string } | null;
    nome: string | null;
    descricao: string | null;
    categoria: string;
    quantidade: number;
    unidadeMedida: string;
    valorUnitario: number;
    dataValidade: Date | null;
    status: string;
    valorTotal: number;
    vencido: boolean;
    proximoVencimento: boolean;
  }>;
  totalValor: number;
  /** Valor em itens vencidos (perda / descarte). */
  valorVencido: number;
  /** Valor em itens que vencem em até 90 dias (atenção). */
  valorProximoVencimento: number;
  qtdVencidos: number;
  qtdProximoVencimento: number;
  qtdEsgotados: number;
  /** Valor total por categoria. */
  porCategoria: Array<{ categoria: string; valor: number; quantidade: number }>;
  alertas: string[];
}

/** Retorna o HTML (body) do relatório Meu estoque por fazenda. */
export function buildEstoqueBody(data: EstoqueTemplateData): string {
  const { itens, totalValor, valorVencido, valorProximoVencimento, qtdVencidos, qtdProximoVencimento, qtdEsgotados, porCategoria, alertas } = data;
  if (!itens.length) {
    return '<p class="empty">Nenhum item em estoque para os filtros informados.</p>';
  }

  const resumoHtml = `
    <div class="insight-box">
      <h3>Resumo para decisão</h3>
      <table class="indicator-grid" style="width:100%;"><tr>
        <td><strong>Valor total estoque</strong><br>R$ ${totalValor.toFixed(2)}</td>
        <td><strong>Itens</strong><br>${itens.length}</td>
        <td><strong>Valor em risco (próx. 90 dias)</strong><br>R$ ${valorProximoVencimento.toFixed(2)}</td>
        <td><strong>Vencidos (valor)</strong><br>R$ ${valorVencido.toFixed(2)} (${qtdVencidos} itens)</td>
      </tr></table>
      ${porCategoria.length ? `<p><strong>Por categoria:</strong> ${porCategoria.map((c) => `${c.categoria}: R$ ${c.valor.toFixed(2)} (${c.quantidade} itens)`).join(' · ')}</p>` : ''}
    </div>`;

  const alertasHtml =
    alertas.length > 0
      ? `<div class="alert-box ${qtdVencidos > 0 || qtdEsgotados > 0 ? 'danger' : ''}">
      <h3>Pontos de atenção</h3>
      <ul style="margin: 0; padding-left: 18px;">${alertas.map((a) => `<li>${a}</li>`).join('')}</ul>
    </div>`
      : '';

  const rows = itens
    .map(
      (i) => `<tr>
          <td>${i.fazenda.nome}</td>
          <td>${i.fornecedor ? (i.fornecedor.nomeFantasia ?? i.fornecedor.razaoSocial) : '—'}</td>
          <td>${i.nome ?? i.descricao ?? '—'}</td>
          <td>${i.categoria}</td>
          <td>${i.quantidade} ${i.unidadeMedida}</td>
          <td>R$ ${i.valorUnitario.toFixed(2)}</td>
          <td>R$ ${i.valorTotal.toFixed(2)}</td>
          <td>${i.dataValidade ? new Date(i.dataValidade).toLocaleDateString('pt-BR') : '—'}</td>
          <td><span class="badge badge-${i.status === 'ESGOTADO' || i.vencido ? 'danger' : i.proximoVencimento ? 'warning' : 'success'}">${i.status}${i.vencido ? ' (vencido)' : ''}</span></td>
        </tr>`,
    )
    .join('');
  return `
    ${resumoHtml}
    ${alertasHtml}
    <table>
      <thead><tr><th>Fazenda</th><th>Fornecedor</th><th>Produto</th><th>Categoria</th><th>Qtd</th><th>Valor unit.</th><th>Total</th><th>Validade</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr class="totais"><td colspan="6">Total estimado</td><td>R$ ${totalValor.toFixed(2)}</td><td colspan="2">—</td></tr></tfoot>
    </table>`;
}
