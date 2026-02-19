# Ideias de evolução do Terra Manager

Documento de ideias em nível de sistema para ampliar e melhorar o Terra Manager, com foco em **gestão**, **plantio** e **agronomia**.

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
- **Ocorrência no campo**: registrar ocorrência em talhão/plantio (data, intensidade, foto); vincular a 

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
- **BASICO**: fazendas, plantios, estoque, relatórios atuais.
- **PRO**: + talhões, custos, operações detalhadas, mais relatórios.
- **PREMIUM**: + mapa, zonas de manejo, integração clima, aplicativo, multi-usuário avançado.
- **Benefício**: produto escalável; receita por valor entregue.

---

## 5. Priorização sugerida (por impacto x esforço)

| Prioridade | Ideia                               | Motivo |
|-----------|--------------------------------------|--------|
| Alta      | Talhões + área por talhão            | Base para custo, rotação e mapa |
| Alta      | Operações/etapas do plantio + aplicações | Rastreabilidade e gestão do dia a dia |
| Alta      | Custo por operação e por safra        | Gestão financeira real |
| Média     | Planejamento de safra (cenários)      | Decisão antes de plantar |
| Média     | Pragas/doenças + ocorrência no campo | Agronomia e alertas |
| Média     | Recomendações por talhão/cultura      | Aproveitar análise de solo |
| Média     | Clima (API ou estação)                | Alertas e irrigação |
| Baixa     | Mapa (shape/GeoJSON)                  | Diferencial, mais complexo |
| Baixa     | App mobile / PWA                      | Uso no campo, maior desenvolvimento |