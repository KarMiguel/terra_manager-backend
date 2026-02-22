# Referências bibliográficas – Cálculos e funcionalidades agronômicas

Este documento relaciona as fontes utilizadas para os cálculos e as boas práticas de plantio e gestão implementadas no Terra Manager (talhões, operações/etapas do plantio, aplicações e custo por safra).

---

## 1. Talhões e área por talhão

- **Uso no sistema:** Cadastro de talhão (parcela de terra) com área em hectares; resumo de área total e área por talhão por fazenda; base para custo, rotação e mapa.
- **Referências:**
  - EMBRAPA. Sistema de produção, planejamento e gestão por talhão. Divulgação de práticas de manejo por unidade de área (talhão) para rotação, custo e mapeamento. Disponível em: [Agência de Informação Tecnológica – EMBRAPA](https://www.embrapa.br/agencia-de-informacao-tecnologica).
  - CONAB. Custos de produção e informações por cultura e região. Área e unidade de gestão (talhão/fazenda) como base de análise. Disponível em: [CONAB – Custos de Produção](https://www.conab.gov.br/info-agro/custos-de-producao).

---

## 2. Etapas do plantio e operações (rastreabilidade)

- **Uso no sistema:** Tipos de etapa: PREPARO_SOLO, SEMEADURA, APLICACAO_DEFENSIVO, APLICACAO_FERTILIZANTE, IRRIGACAO, COLHEITA, OUTROS. Registro de data, área (ha), custo total e custo por ha por operação.
- **Referências:**
  - EMBRAPA. Planejamento da adubação e calagem; etapas do sistema de produção (preparo, semeadura, aplicações, colheita). Disponível em: [Planejamento da Adubação e Calagem – EMBRAPA](https://www.embrapa.br/agencia-de-informacao-tecnologica/cultivos/milho/producao/manejo-do-solo-e-adubacao/adubacao-e-fertilidade-do-solo/planejamento-da-adubacao-e-calagem).
  - Boas práticas agronômicas: sequência preparo → semeadura → aplicações (defensivos/fertilizantes) → colheita, com registro por área e data para rastreabilidade.

---

## 3. Custo por operação (R$/ha)

- **Fórmula utilizada:**  
  **custoPorHa = custoTotal / areaHa**  
  (custo total da operação dividido pela área em que foi realizada, em hectares.)
- **Uso no sistema:** Campo `custoPorHa` em `OperacaoPlantio`, calculado automaticamente a partir de `custoTotal` e `areaHa`.
- **Referências:**
  - CONAB. Custos de produção por unidade de área (R$/ha) e por operação. Portal de Informações Agropecuárias – Custos de produção, produtividade e rentabilidade. Disponível em: [CONAB – Custos de produção e rentabilidade](https://portaldeinformacoes.conab.gov.br/custos-de-producao-rentabilidade-evolucao.html).
  - EMBRAPA. Sistemas de produção e indicadores econômicos por área (hectare) e por etapa de manejo.

---

## 4. Aplicação de defensivos e fertilizantes – dose por ha e quantidade total

- **Fórmula utilizada:**  
  **quantidadeTotal = dosePorHa × areaHa**  
  (quantidade de produto aplicada = dose por unidade de área × área tratada.)
- **Uso no sistema:** Campo `quantidadeTotal` em `Aplicacao`, calculado a partir de `dosePorHa` (e da área da operação vinculada). Unidades: KG_HA, G_HA, ML_HA, L_HA, TON_HA.
- **Referências:**
  - EMBRAPA / extensão rural. Cálculo de dosagem por área: quantidade de produto por hectare; volume de calda (L/ha); taxa de aplicação. Documentos técnicos (ex.: CT144, ID19). Disponível em: [Infoteca EMBRAPA](https://www.infoteca.cnptia.embrapa.br).
  - ANDEF / bulas e receituário agronômico. Dosagem em g/ha, L/ha ou ml/ha; aplicação conforme área tratada. Todo uso de defensivos deve seguir bula e receituário agronômico.
  - KS Pulverizadores / Agro Receita. Cálculo da dosagem para aplicação de defensivos: quantidade = (dosagem por ha) × (área em ha); volume de calda e taxa de aplicação. Disponível em: [Como calcular a dosagem para aplicação de defensivos agrícolas](https://www.kspulverizadores.com.br/blog-ks/como-calcular-a-dosagem-para-aplicacao-de-defensivos-agricolas.html).

---

## 5. Custo por safra

- **Definição de safra:** Ano civil da data de plantio (ex.: safra 2025 = plantios com `dataPlantio` no ano 2025). Compatível com levantamentos anuais (ex.: CONAB).
- **Fórmulas utilizadas:**
  - **custoTotalSafra** = soma dos `custoTotal` dos plantios da fazenda com `dataPlantio` no ano.
  - **areaTotalHa** = soma das `areaPlantada` desses plantios.
  - **custoPorHaSafra** = custoTotalSafra / areaTotalHa (quando areaTotalHa > 0).
- **Uso no sistema:** Endpoint `GET /plantio/fazenda/:idFazenda/custo-safra?ano=YYYY`; retorno inclui resumo por tipo de operação.
- **Referências:**
  - CONAB. Levantamentos de safra (ex.: safra 2025/26); custos de produção por cultura e por ano/safra. Disponível em: [CONAB – Notícias e levantamentos](https://www.gov.br/conab/pt-br/assuntos/noticias), [Custos de produção](https://portaldeinformacoes.conab.gov.br/custos-de-producao-produtividade).
  - EMBRAPA. Indicadores econômicos e gestão por ciclo/safra.

---

## 6. Recomendações de adubação e análise de solo

- **Contexto no sistema:** Campos de dose de N, P, K e análise de solo no plantio; recomendações por talhão/cultura (ideias de evolução no `IDEIAS_EVOLUCAO.md`).
- **Referências:**
  - CFSEMG (Comissão de Fertilidade do Solo do Estado de Minas Gerais) / CQFS-RS/SC. Metodologias de recomendação de calagem e adubação a partir de análise de solo (pH, P, K, CTC, matéria orgânica, etc.). Uso de fórmulas (ex.: N-P-K em kg/ha) e interpretação de análise.
  - EMBRAPA. Recomendação de calagem e adubação por cultura; documentos como “Recomendação de adubação e calagem” (ex.: LV-RecomendacaoSolo). Disponível em: [Infoteca EMBRAPA](https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1127244/1/LV-RecomendacaoSolo-2020-115-122.pdf).

---

## Resumo das fórmulas implementadas

| Funcionalidade        | Fórmula / regra                                      | Onde no código / modelo                         |
|-----------------------|--------------------------------------------------------|-------------------------------------------------|
| Área por talhão       | Cadastro manual de `areaHa` (ha)                      | `Talhao.areaHa`; resumo em `GET talhao/fazenda/:id/resumo` |
| Custo por operação    | custoPorHa = custoTotal / areaHa                      | `OperacaoPlantioService.calcularCustoPorHa`     |
| Quantidade aplicada   | quantidadeTotal = dosePorHa × areaHa                   | `AplicacaoService.calcularQuantidadeTotal`      |
| Custo por safra       | custoTotalSafra = Σ plantio.custoTotal; custoPorHaSafra = custoTotalSafra / areaTotalHa | `PlantioService.custoPorSafra`                  |

As implementações seguem as boas práticas agronômicas e de gestão citadas e devem ser complementadas, em uso real, com receituário agronômico e recomendações técnicas locais (estado/cultura).
