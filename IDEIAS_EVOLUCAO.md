# Ideias de evolução do Terra Manager

Documento de ideias em nível de sistema para ampliar e melhorar o Terra Manager, com foco em **gestão**, **plantio** e **agronomia**.

---

## Status do que já foi feito (atualizado)

| Ideia (prioridade) | Status | O que existe no sistema |
|--------------------|--------|--------------------------|
| **Talhões + área por talhão** | ✅ Feito | Modelo `Talhao` (nome, areaHa por fazenda). Endpoints: `POST/GET /talhao`, `GET /talhao/fazenda/:id`, `GET /talhao/fazenda/:id/resumo` (área total e por talhão). Plantio com `idTalhao` opcional. |
| **Operações/etapas do plantio + aplicações** | ✅ Feito | `OperacaoPlantio` (preparo, semeadura, aplicação defensivo/fertilizante, irrigação, colheita, etc.) com custo por operação. `Aplicacao` (defensivo/fertilizante) com dose/ha → quantidade total calculada. Endpoints: `POST /operacao-plantio`, `GET /operacao-plantio/plantio/:id`, `POST /aplicacao`, `GET /aplicacao/operacao/:id`. |
| **Custo por operação e por safra** | ✅ Feito | Custo por operação: `custoTotal` e `custoPorHa` (calculado) em cada operação. Custo por safra: `GET /plantio/fazenda/:id/custo-safra?ano=YYYY` (custo total, área, R$/ha, resumo por tipo de operação). Safra = ano da data de plantio. |

O restante do documento continua válido como backlog de evolução. **O que cada plano não tem** está na **§6** (BASICO, PRO, PREMIUM).

---

## 1. Gestão


### 1.3. Mão de obra e equipe
- **Cadastro de funcionários/terceirizados**: nome, função, vínculo (fixo/empreiteiro), custo/hora ou por tarefa.
- **Alocação em atividades**: quem fez o quê, em qual talhão/plantio, quando; horas/dias por atividade.
- **Benefício**: controle de pessoal, custo de mão de obra por cultura/safra, histórico de quem aplicou onde (rastreabilidade).
---

## 2. Plantio

### 2.1. Planejamento de safra
- **Safra**: período (ex.: 2025/26); conjunto de plantios planejados; área por cultura; previsão de insumos.
- **Cenários**: “e se” plantar mais soja e menos milho; impacto em área, custo e rotação.
- **Benefício**: decisão antes de plantar; alinhamento com mercado e capacidade da propriedade.

### 2.3. Previsão de colheita
- **Produtividade esperada**: por cultivar/talhão (baseada em histórico ou padrão da cultura).
- **Previsão de volume**: área × produtividade esperada; por cultura e por período.
- **Benefício**: planejamento de logística, venda e estoque pós-colheita.

### 2.4. Irrigação
- **Cadastro de sistemas**: pivô, gotejamento, sulco; área irrigada por talhão.
- **Registro de uso**: horas/dia de irrigação; volume (se houver medidor); vínculo ao plantio.
- **Benefício**: controle de uso de água e custo; suporte a outorga e sustentabilidade.

### 2.6. Histórico de uso do solo (rotação)
- **Histórico por talhão**: últimas culturas e anos; intervalo entre culturas iguais.
- **Sugestão de rotação**: “não plantar soja de novo neste talhão”; “sugestão: milho ou algodão”.
- **Benefício**: rotação mais saudável; menor risco de pragas e degradação do solo.

---

## 3. Agronomia

### 3.1. Recomendações de adubação e calagem
- **Por análise + cultura**: a partir da análise de solo e da cultura/cultivar, sugerir dose de N, P, K, calcário (já existe cálculo no sistema — evoluir para “recomendação” salva e aplicada).
- **Por talhão**: recomendações por talhão e safra; histórico de o que foi recomendado x aplicado.
- **Benefício**: uso mais preciso de insumos; economia e menor impacto ambiental.

### 3.3. Pragas e doenças
- **Cadastro**: além de “praga”, incluir doenças (fungos, vírus, bactérias); sintomas; épocas de risco.
- **Ocorrência no campo**: registrar ocorrência em talhão/plantio (data, intensidade, foto); vincular a praga/doença.
- **Benefício**: alertas e histórico para manejo integrado.

---

## 4. Sistema e produto

### 4.2. Permissões e multi-usuário
- **Perfis**: dono, gerente, operador, consultor (só leitura em algumas fazendas).
- **Permissão por fazenda**: usuário X só vê/edita fazendas A e B.
- **Benefício**: time na propriedade ou consultoria usando o mesmo sistema com segurança.

### 4.3. Notificações e lembretes
- **Lembretes**: análise de solo pendente, manutenção de máquina, vencimento de contrato, carência de defensivo.
- **Canal**: e-mail, push (se tiver app), ou aviso dentro do sistema.
- **Benefício**: nada importante “esquecido”.

### 4.4. Integrações

### 4.5. Planos e funcionalidades por assinatura
- **Benefício**: produto escalável; receita por valor entregue. Cada plano desbloqueia módulos e features conforme tabelas abaixo.

---

## 6. Planos — o que NÃO tem em cada plano

Cada plano inclui tudo que está nos planos anteriores. Abaixo: **apenas o que cada um NÃO tem**. *(Hoje o sistema ainda não aplica restrição por plano nos endpoints; esta seção serve como definição para implementação futura.)*

---

### BASICO — não tem

- Talhão (cadastro, área por talhão, resumo)
- Operação do plantio (etapas, custo por operação)
- Aplicação (defensivo/fertilizante, dose × área)
- Custo por safra (endpoint e relatório)
- Planejamento de safra, rotação, recomendações por talhão
- Pragas/doenças + ocorrência no campo, clima (API)
- Mapa (shape/GeoJSON), zonas de manejo
- Integração clima, aplicativo, multi-usuário avançado
- Notificações, integrações externas, mão de obra, irrigação

---

### PRO — não tem

- Mapa (shape/GeoJSON), zonas de manejo
- Integração clima (estação/API na propriedade), aplicativo mobile
- Multi-usuário avançado (perfis, permissão por fazenda)
- Notificações (lembretes por e-mail/push)
- Integrações externas (contabilidade, mercado)
- Mão de obra e equipe (funcionários, alocação em atividades)
- Irrigação (cadastro de sistemas, registro de uso)
- Suporte prioritário

---

### PREMIUM — não tem

- Nada: inclui todas as funcionalidades previstas para o produto.

---

## 7. Priorização sugerida (por impacto x esforço)

| Prioridade | Ideia                               | Motivo | Status |
|-----------|--------------------------------------|--------|--------|
| Alta      | Talhões + área por talhão            | Base para custo, rotação e mapa | ✅ Feito |
| Alta      | Operações/etapas do plantio + aplicações | Rastreabilidade e gestão do dia a dia | ✅ Feito |
| Alta      | Custo por operação e por safra        | Gestão financeira real | ✅ Feito |
| Média     | Planejamento de safra (cenários)      | Decisão antes de plantar | Pendente |
| Média     | Pragas/doenças + ocorrência no campo | Agronomia e alertas | Pendente |
| Média     | Recomendações por talhão/cultura      | Aproveitar análise de solo | Pendente |
| Média     | Clima (API ou estação)                | Alertas e irrigação | Pendente |
| Baixa     | Mapa (shape/GeoJSON)                  | Diferencial, mais complexo | Pendente |
