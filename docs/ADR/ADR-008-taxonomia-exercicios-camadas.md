# ADR-008 — Taxonomia de exercícios em camadas Domínio → Subdomínio → Exercício

- **Status:** registrada retroativamente em 2026-07-10

- **Contexto:** o acervo de exercícios cresce e precisa ser organizado de forma
  clínica para navegação, catálogo, seleção em planos de treino e rotulagem em
  relatórios. Uma lista plana de exercícios não expressa a estrutura clínica
  (funções e subfunções cognitivas) nem permite reservar espaço para categorias
  ainda sem exercícios.

- **Decisão:** modelar a taxonomia em três camadas — Domínio → Subdomínio →
  Exercício — com 5 domínios: `memory`, `attention`, `executive`, `processing`,
  `functional` (`types/index.ts:4`; `lib/domain-taxonomy.ts:13`). Cada domínio
  mapeia para uma lista de `Subdomain { id, label, exercises[] }` em
  `DOMAIN_SUBDOMAINS` (`lib/domain-taxonomy.ts:15-48`); subdomínios sem
  exercícios ainda aparecem como espaços vazios para crescimento futuro
  (ex.: `episodica`, `semantica`). Índices derivados são computados a partir
  desse mapa: exercícios por domínio, contagens, e os reversos
  `EXERCISE_DOMAIN` / `EXERCISE_SUBDOMAIN` / `EXERCISE_SUBDOMAIN_ID`
  (`lib/domain-taxonomy.ts:50-76`). Cada subdomínio ganha uma cor de tag para a
  UI (`lib/domain-taxonomy.ts:80-103`).

- **Alternativas consideradas:** lista plana de exercícios por domínio (sem
  subdomínio) — insuficiente para a navegação clínica em camadas adotada. Uma
  quarta camada ou taxonomia por tags livres: não documentado.

- **Consequências:**
  - Positivas: navegação e catálogo clínicos; índices reversos derivados de uma
    única definição; espaços reservados para expansão sem mudar código de UI.
  - Negativas / dívidas observadas: os metadados de exercício estão triplicados e
    divergentes entre três fontes de verdade — `types/index.ts`,
    `lib/domain-taxonomy.ts` e `lib/exercise-meta.ts` (ARQ-001), e o `domain` da
    taxonomia difere do `domain` de `EXERCISE_DEFINITIONS`
    (`lib/domain-taxonomy.ts:59`). A taxonomia referencia ids fantasma sem
    definição nem rota (ex.: `atencao-dividida` em
    `lib/domain-taxonomy.ts:26`) — ARQ-004 —, enquanto exercícios órfãos existem
    mas ficam de fora dela (ARQ-003).
