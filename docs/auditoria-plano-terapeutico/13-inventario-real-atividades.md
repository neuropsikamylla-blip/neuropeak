# 13 — Inventário real das atividades clínicas (auditoria, 02/ago/2026)

> Fonte clínica oficial: [`docs/architecture/CANONICAL_EXERCISES.md`](../architecture/CANONICAL_EXERCISES.md).
> IDs técnicos são estáveis; os nomes abaixo são os nomes oficiais de documentação.

## Catálogo clínico atual

| # | ID técnico | Nome oficial | Domínio principal | Status |
|---|---|---|---|---|
| 1 | `span-numerico` | Span Numérico Auditivo Direto | Memória Operacional | ACTIVE |
| 2 | `stroop-task` | Cores e Palavras | Controle Inibitório | ACTIVE |
| 3 | `focus-agents` | Agentes Focus | Atenção Sustentada | ACTIVE |
| 4 | `span-numerico-inverso` | Span Numérico Auditivo Inverso | Memória Operacional | ACTIVE |
| 5 | `matriz-espacial` | Matriz Espacial | Memória Visuoespacial | ACTIVE |
| 6 | `matriz-espacial-inversa` | Matriz Espacial Inversa | Memória Visuoespacial | ACTIVE |
| 7 | `jogo-memoria` | Jogo da Memória | Memória Visuoespacial | ACTIVE |
| 8 | `trilha-visual` | Conecta Números | Atenção Seletiva | ACTIVE |
| 9 | `antes-depois` | Caminhos para a Meta | Planejamento e Flexibilidade | ACTIVE |
| 10 | `informacao-em-foco` | Informação em Foco | Atenção Seletiva | ACTIVE |
| 11 | `mot` | Rastreamento de Objetos | Atenção Dividida | ACTIVE |
| 12 | `dual-task` | Dupla Tarefa | Atenção Dividida | ACTIVE |
| 13 | `tempo-reacao` | Tempo de Reação | Tempo de Reação | ACTIVE |
| 14 | `certo-ou-errado` | Certo ou Errado | Resposta Rápida | ACTIVE |
| 15 | `semaforo` | Semáforo | Tempo de Reação | ACTIVE |
| 16 | `corrida-tempo` | Busca Rápida | Resposta Rápida | ACTIVE |
| 17 | `torre-hanoi` | Jogo das Torres | Planejamento | ACTIVE |
| 18 | `labirinto` | Labirinto | Planejamento | ACTIVE |
| 19 | `ordem-historia` | Ordem da História | Raciocínio Lógico | ACTIVE |
| 20 | `compra-multifuncional` | Compra Multifuncional | Autonomia | ACTIVE |
| 21 | `task-switching` | Alternância de Regras | Flexibilidade Cognitiva | ACTIVE |
| 22 | `deductive-grid` | Grade Dedutiva | Raciocínio Lógico | ACTIVE |
| 23 | `letras-sequencia` | Letras em Sequência | Memória Operacional | ACTIVE |
| 24 | `sequencia-itens` | Sequência de Itens | Memória Operacional | ACTIVE |
| 25 | `padroes-rotacao` | Matriz com Rotações | Memória Visuoespacial | ACTIVE |
| 26 | `lista-distracao` | Lista com Distração | Memória Operacional | ACTIVE |
| 27 | `restaurante-ordem` | Restaurante | Memória Operacional | ACTIVE |
| 28 | `desafio-supermercado` | Supermercado | Memória Operacional | ACTIVE |
| 29 | `nback` | N-Back | Memória Operacional | ACTIVE |
| 30 | `cubo-corsi` | Cubos | Memória Visuoespacial | ACTIVE |
| 31 | `vigilancia` | Vigilância | Atenção Sustentada | ACTIVE |
| 32 | `identificacao-simbolos` | Identificação de Símbolos | Busca Visual Rápida | ACTIVE |
| 33 | `estacionamento-logico` | Estacionamento Lógico | Planejamento | ACTIVE |
| 34 | `investigadores-sociais` | Investigadores da Situação Social | Cognição Social | ACTIVE |

## Referência técnica de compatibilidade (fora do catálogo clínico)

| ID técnico | Situação técnica | Onde vive no código |
|---|---|---|
| `desafio-cidade` | **REMOVED_FROM_CURRENT_CATALOG** | `types/index.ts` — definição; `app/(patient)/treino/[exercicio]/page.tsx` — case do switch |
| `caca-item-barato` | Legacy ID histórico de Informação em Foco | `types/index.ts`; `lib/exercise-plan.ts` — `EXERCISE_ALIASES`; `app/(patient)/treino/[exercicio]/page.tsx` — case do switch |
| `mudanca-regras` | Legacy ID histórico de Informação em Foco | `types/index.ts`; `lib/exercise-plan.ts` — `EXERCISE_ALIASES`; `app/(patient)/treino/[exercicio]/page.tsx` — case do switch |
| `desafio-orcamento` | Legacy ID histórico de Compra Multifuncional | `types/index.ts`; `lib/exercise-plan.ts` — `EXERCISE_ALIASES`; `app/(patient)/treino/[exercicio]/page.tsx` — case do switch |
| `focus-agents-auditivo` | Legacy ID histórico de Agentes Focus | `types/index.ts`; `lib/exercise-plan.ts` — `EXERCISE_ALIASES`; `app/(patient)/treino/[exercicio]/page.tsx` — case do switch |
| `restaurante-ordem-auditivo` | Legacy ID histórico de Restaurante | `types/index.ts`; `lib/exercise-plan.ts` — `EXERCISE_ALIASES`; `app/(patient)/treino/[exercicio]/page.tsx` — case do switch |
| `desafio-supermercado-auditivo` | Legacy ID histórico de Supermercado | `types/index.ts`; `lib/exercise-plan.ts` — `EXERCISE_ALIASES`; `app/(patient)/treino/[exercicio]/page.tsx` — case do switch |
