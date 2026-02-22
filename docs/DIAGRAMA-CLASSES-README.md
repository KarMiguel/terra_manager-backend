# Diagrama de Classes – Terra Manager

Diagrama de classes em **Mermaid** com **atributos e métodos** no padrão de engenharia de software (nomes sem sufixo "Service").

## Conteúdo

- **Enums (completos):** ROLE, TipoPlanoEnum, TipoPlantaEnum, TipoSoloEnum, StatusPlantioEnum, UnidadeDoseEnum, TipoEtapaOperacaoEnum, TipoAplicacaoEnum, StatusPagamentoEnum, FormaPagamentoEnum, StatusCobrancaEnum, CategoriaEstoqueEnum, StatusEstoqueEnum, UnidadeMedidaEnum, TipoOperacaoEnum.
- **Classes de domínio (atributos + métodos):** Usuario, Plano, UsuarioPlano, Cobranca, PagamentoPlano, Fazenda, Talhao, ZonaManejo, Cultivar, Praga, Fornecedor, AnaliseSolo, Plantio, OperacaoPlantio, Aplicacao, ProdutosEstoque, Mapa, CalculosUtil.
- **Removidas (mistura de camadas / métodos técnicos):** Auth, Dashboard, Relatorio. **Unificado:** Usuario (User removido).
- **Relações:** entre entidades (FK) e dependências entre classes (Auth → User, Auth → Plano, Mapa → Talhao, etc.).

## Como visualizar

1. **Mermaid Live Editor**  
   Copie o conteúdo de `diagrama-classes.mmd` e cole em: https://mermaid.live

2. **VS Code**  
   Instale a extensão "Mermaid" ou "Markdown Preview Mermaid Support" e abra `diagrama-classes.mmd` (preview do diagrama).

3. **GitHub / GitLab**  
   Repositórios que renderizam Mermaid em `.md` podem usar um bloco:

   ````markdown
   ```mermaid
   classDiagram
       ...
   ```
   ````

   Para o diagrama completo, use o conteúdo de `diagrama-classes.mmd` dentro do bloco.

## Arquivos

| Arquivo | Descrição |
|--------|-----------|
| `diagrama-classes.mmd` | Código Mermaid (atributos de domínio + métodos de negócio + relações com multiplicidade). |
| **`DIAGRAMA-CLASSES-BOAS-PRATICAS.md`** | **Checklist de boas práticas** (estrutura, atributos, métodos, relacionamentos). |
| `diagrama-classes-atributos-metodos.md` | Lista em tabelas por classe (referência para editar o .mmd). |
| `diagrama-classes-domínio.md` | Critério “o que entra” no diagrama (domínio vs persistência). |

## Convenções no diagrama

- **Métodos de negócio (regra de negócio):** são os que aparecem no diagrama. Representam **ações que fazem sentido no domínio** do sistema (criar fazenda, calcular custo por safra, gerar cobrança, calcular calagem, etc.). Não inclui getters/acessores (getId, getNome, etc.).
- **Nomes:** sem sufixo "Service" (Auth, User, Plano, Fazenda, Relatorio, Dashboard, Mapa).
- **Atributos:** `-` privado; tipo após `:` (ex.: `-id: Int`, `-nome: String`).
- **Métodos:** `+` público, `-` privado; formato `+nome(params): TipoRetorno`; apenas comportamento de negócio.
- **Enums:** todos listados com valores completos (<<enumeration>>).
- **Relações:** setas entre classes indicam FK ou dependência ("usa").
