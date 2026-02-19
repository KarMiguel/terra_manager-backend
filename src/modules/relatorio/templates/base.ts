/** CSS base para todos os relatórios PDF. */
export const BASE_CSS = `
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 24px; color: #1a1a1a; font-size: 12px; }
  .header { border-bottom: 3px solid #2d5a27; padding-bottom: 12px; margin-bottom: 20px; }
  .header h1 { margin: 0; color: #2d5a27; font-size: 22px; }
  .header .sub { color: #555; font-size: 11px; margin-top: 4px; }
  .meta { background: #f5f7f5; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { border: 1px solid #c8d4c8; padding: 8px 10px; text-align: left; }
  th { background: #2d5a27; color: #fff; font-weight: 600; }
  tr:nth-child(even) { background: #f9fbf9; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 10px; color: #666; }
  .totais { font-weight: 600; background: #e8f0e8 !important; }
  .empty { text-align: center; padding: 24px; color: #888; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; }
  .badge-success { background: #d4edda; color: #155724; }
  .badge-warning { background: #fff3cd; color: #856404; }
  .badge-danger { background: #f8d7da; color: #721c24; }
  .insight-box { background: #e8f4e8; border-left: 4px solid #2d5a27; padding: 12px 16px; margin-bottom: 16px; border-radius: 0 8px 8px 0; font-size: 11px; }
  .insight-box h3 { margin: 0 0 8px 0; color: #2d5a27; font-size: 13px; }
  .alert-box { background: #fff8e6; border-left: 4px solid #d4a017; padding: 12px 16px; margin-bottom: 16px; border-radius: 0 8px 8px 0; font-size: 11px; }
  .alert-box.danger { background: #fff0f0; border-left-color: #c53030; }
  .alert-box h3 { margin: 0 0 8px 0; color: #856404; font-size: 13px; }
  .alert-box.danger h3 { color: #721c24; }
  .indicator-grid { margin-bottom: 16px; }
  .indicator-grid td { padding: 8px 12px; background: #f5f7f5; border: 1px solid #c8d4c8; font-size: 11px; }
  .indicator-grid strong { color: #2d5a27; }
  .recommendation { background: #f0f7ff; border: 1px solid #90cdf4; padding: 10px 14px; margin-top: 16px; border-radius: 8px; font-size: 11px; color: #2c5282; }
  .recommendation strong { color: #2b6cb0; }
`;

/** Monta o HTML completo do relatório (cabeçalho + body + rodapé). */
export function wrapHtml(
  title: string,
  userName: string,
  body: string,
  filtros?: string,
): string {
  const dataGeracao = new Date().toLocaleString('pt-BR');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${BASE_CSS}</style>
</head>
<body>
  <div class="header">
    <h1>Terra Manager · ${title}</h1>
    <div class="sub">Relatório gerado para ${userName}</div>
  </div>
  ${filtros ? `<div class="meta"><strong>Filtros:</strong> ${filtros}</div>` : ''}
  ${body}
  <div class="footer">Gerado em ${dataGeracao} · Terra Manager</div>
</body>
</html>`;
}
