# 13 — Inventário REAL das atividades (auditoria, 02/ago/2026)

> Apenas leitura. Nada alterado. Fontes cruzadas: `EXERCISE_DEFINITIONS` (`types/index.ts`),
> catálogo (`lib/domain-taxonomy.ts`), `EXERCISE_ALIASES` (`lib/exercise-plan.ts`) e o `switch`
> de `app/(patient)/treino/[exercicio]/page.tsx`.

## A conta fecha exatamente

```
41 definições = 34 exercícios clínicos (catálogo) + 6 aliases/modos + 1 órfão
```

- **Todos os 34 do catálogo têm execução** no `switch` — nenhum é item visual sem funcionamento.
- **Nenhum id fantasma**: não há entrada no catálogo sem definição. (O `atencao-dividida` citado no
  `CLAUDE.md` já não existe.)
- **1 órfão:** `desafio-cidade` ("Desafio da Cidade") — tem definição e renderiza, mas foi retirado
  do catálogo. Não aparece para o terapeuta nem entra em plano novo.

## Tabela das 41 definições

| ID | Nome no código | Subdomínio | No catálogo | Seleção de modalidade | Leitura assistiva | Status | Pertence a | Justificativa |
|---|---|---|---|---|---|---|---|---|
| `antes-depois` | Caminhos para a Meta | Planejamento e Flexibilidade | sim | sim | sim | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `caca-item-barato` | Caça Informação | — | não | não | não | **ACTIVE_ALIAS** | informacao-em-foco | id antigo redirecionado |
| `certo-ou-errado` | Certo ou Errado | Resposta Rápida | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `compra-multifuncional` | Compra Multifuncional | Autonomia | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `corrida-tempo` | Busca Rápida | Resposta Rápida | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `cubo-corsi` | Cubos | Memória Visuoespacial | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `deductive-grid` | Grade Dedutiva | Raciocínio Lógico | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `desafio-cidade` | Desafio da Cidade | — | não | não | não | **ORPHANED** | — | renderiza, mas foi filtrado do catálogo |
| `desafio-orcamento` | Desafio do Orçamento | — | não | não | não | **ACTIVE_ALIAS** | compra-multifuncional | id antigo redirecionado |
| `desafio-supermercado` | Supermercado | Memória Operacional | sim | sim | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `desafio-supermercado-auditivo` | Supermercado — Auditivo | — | não | não | não | **ACTIVE_EXERCISE_MODE** | desafio-supermercado | modo auditivo virou seletor interno |
| `dual-task` | Dupla Tarefa | Atenção Dividida | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `estacionamento-logico` | Estacionamento Lógico | Planejamento | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `focus-agents` | Focus Agentes | Atenção Sustentada | sim | não | sim | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `focus-agents-auditivo` | Focus Agentes Auditivo | — | não | não | não | **ACTIVE_EXERCISE_MODE** | focus-agents | modo auditivo virou seletor interno |
| `identificacao-simbolos` | Identificação de Símbolos | Busca Visual Rápida | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `informacao-em-foco` | Informação em Foco | Atenção Seletiva | sim | não | sim | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `investigadores-sociais` | Investigadores da Situação Social | Cognição Social | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `jogo-memoria` | Jogo da Memória | Memória Visuoespacial | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `labirinto` | Labirinto | Planejamento | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `letras-sequencia` | Letras em Sequência | Memória Operacional | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `lista-distracao` | Lista com Distração | Memória Operacional | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `matriz-espacial` | Matriz Espacial | Memória Visuoespacial | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `matriz-espacial-inversa` | Matriz Espacial Inversa | Memória Visuoespacial | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `mot` | Rastreamento de Objetos | Atenção Dividida | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `mudanca-regras` | Mudança de Regras | — | não | não | não | **ACTIVE_ALIAS** | informacao-em-foco | id antigo redirecionado |
| `nback` | N-Back | Memória Operacional | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `ordem-historia` | Ordem da História | Raciocínio Lógico | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `padroes-rotacao` | Matriz com Rotações | Memória Visuoespacial | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `restaurante-ordem` | Restaurante | Memória Operacional | sim | sim | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `restaurante-ordem-auditivo` | Restaurante — Ordem de Instruções (Auditivo) | — | não | não | não | **ACTIVE_EXERCISE_MODE** | restaurante-ordem | modo auditivo virou seletor interno |
| `semaforo` | Semáforo | Tempo de Reação | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `sequencia-itens` | Sequência de Itens | Memória Operacional | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `span-numerico` | Span Numérico Auditivo Direto | Memória Operacional | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `span-numerico-inverso` | Span Numérico Auditivo Inverso | Memória Operacional | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `stroop-task` | Cores e Palavras | Controle Inibitório | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `task-switching` | Task Switching | Flexibilidade Cognitiva | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `tempo-reacao` | Tempo de Reação | Tempo de Reação | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `torre-hanoi` | Jogo das Torres | Planejamento | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `trilha-visual` | Conecta Números | Atenção Seletiva | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |
| `vigilancia` | Vigilância | Atenção Sustentada | sim | não | não | **ACTIVE_CLINICAL_EXERCISE** | — | no catálogo, com execução |

## Contagem corrigida

| Categoria | Nº |
|---|---|
| **ACTIVE_CLINICAL_EXERCISE** | **34** |
| ACTIVE_EXERCISE_MODE (modos auditivos) | 3 |
| ACTIVE_ALIAS (ids antigos redirecionados) | 3 |
| ORPHANED | 1 |
| IN_DEVELOPMENT / INACTIVE / LEGACY / UNKNOWN | 0 |

**Os 3 modos:** `restaurante-ordem-auditivo`, `desafio-supermercado-auditivo`,
`focus-agents-auditivo` — hoje são o mesmo exercício com o seletor "Configurar atividade".
**Os 3 aliases:** `desafio-orcamento` → Compra Multifuncional · `caca-item-barato` e
`mudanca-regras` → Informação em Foco.

## Por que a auditoria anterior contou 41

O documento 02 contou `EXERCISE_DEFINITIONS` inteiro, que guarda **ids históricos de propósito** —
para que planos e sessões antigas continuem abrindo. Contar aquilo como "exercícios" inflou o número
em 7. **A fonte de verdade do que é exercício clínico é o catálogo (`domain-taxonomy.ts`), não
`EXERCISE_DEFINITIONS`.**
