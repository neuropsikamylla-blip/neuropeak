# Spec — consolidar o catálogo canônico na documentação da auditoria

Escopo: **apenas os arquivos `docs/auditoria-plano-terapeutico/*.md`**. Não tocar em código,
`types/`, `lib/`, `components/`, banco ou qualquer outro diretório. Não commitar.

## Fonte única de verdade: 34 exercícios, com estes NOMES OFICIAIS

| # | ID técnico | Nome oficial |
|---|---|---|
| 1 | `span-numerico` | Span Numérico Auditivo Direto |
| 2 | `stroop-task` | Cores e Palavras |
| 3 | `focus-agents` | **Agentes Focus** |
| 4 | `span-numerico-inverso` | Span Numérico Auditivo Inverso |
| 5 | `matriz-espacial` | Matriz Espacial |
| 6 | `matriz-espacial-inversa` | Matriz Espacial Inversa |
| 7 | `jogo-memoria` | Jogo da Memória |
| 8 | `trilha-visual` | Conecta Números |
| 9 | `antes-depois` | Caminhos para a Meta |
| 10 | `informacao-em-foco` | Informação em Foco |
| 11 | `mot` | Rastreamento de Objetos |
| 12 | `dual-task` | Dupla Tarefa |
| 13 | `tempo-reacao` | Tempo de Reação |
| 14 | `certo-ou-errado` | Certo ou Errado |
| 15 | `semaforo` | Semáforo |
| 16 | `corrida-tempo` | Busca Rápida |
| 17 | `torre-hanoi` | Jogo das Torres |
| 18 | `labirinto` | Labirinto |
| 19 | `ordem-historia` | Ordem da História |
| 20 | `compra-multifuncional` | Compra Multifuncional |
| 21 | `task-switching` | **Alternância de Regras** |
| 22 | `deductive-grid` | Grade Dedutiva |
| 23 | `letras-sequencia` | Letras em Sequência |
| 24 | `sequencia-itens` | Sequência de Itens |
| 25 | `padroes-rotacao` | Matriz com Rotações |
| 26 | `lista-distracao` | Lista com Distração |
| 27 | `restaurante-ordem` | Restaurante |
| 28 | `desafio-supermercado` | Supermercado |
| 29 | `nback` | N-Back |
| 30 | `cubo-corsi` | Cubos |
| 31 | `vigilancia` | Vigilância |
| 32 | `identificacao-simbolos` | Identificação de Símbolos |
| 33 | `estacionamento-logico` | Estacionamento Lógico |
| 34 | `investigadores-sociais` | Investigadores da Situação Social |

**Os IDs técnicos não mudam** — são chave de planos, sessões e progresso no banco. Mudam apenas os
nomes usados na documentação.

## O que REMOVER de toda a documentação clínica

Não podem aparecer em inventário, tabelas, classificação, exemplos, contagens ou relatórios:

- `desafio-cidade` (será reformulado como exercício novo);
- `caca-item-barato`, `mudanca-regras`, `desafio-orcamento` (aliases);
- `focus-agents-auditivo`, `restaurante-ordem-auditivo`, `desafio-supermercado-auditivo` (modos).

**Exceção única:** eles podem existir numa seção final de *referência técnica de compatibilidade*,
claramente separada, dizendo apenas onde vivem no código.

## Arquivo por arquivo

1. **`13-inventario-real-atividades.md`** — reescrever: tabela só com os **34**, usando nome oficial.
   Os 7 removidos viram uma seção curta no fim: "Referência técnica de compatibilidade (fora do
   catálogo clínico)", com `desafio-cidade` marcado **`REMOVED_FROM_CURRENT_CATALOG`** e a
   localização no código (`types/index.ts` — definição; `app/(patient)/treino/[exercicio]/page.tsx`
   — case do switch). **Não remover do código.**
2. **`16-lista-canonica.md`** — vira a **lista canônica definitiva**: `ID técnico · Nome oficial ·
   Categoria cognitiva · Domínio principal · Modalidades (quando existirem) · Status = ACTIVE`.
   Nada além dos 34. Acrescentar ao fim a **tabela de correspondência**:
   `ID técnico · Nome oficial · Aliases antigos (se existirem) · Status`.
3. **`03-proposta-classificacao.md`** — trocar todos os nomes pelos oficiais; conferir que a tabela
   tem exatamente 34 linhas e que as contagens por modelo somam 34.
4. **`02-inventario-exercicios.md`** — já está marcado como superado. Manter o aviso e **não**
   reescrever a tabela histórica; apenas garantir que o aviso diz que a fonte válida é o doc 16.
5. **`01`, `04`, `05`, `06`, `07`, `08`, `14`, `15`** — substituir qualquer nome antigo pelo oficial
   e remover menções aos 7 fora do catálogo, **exceto** quando o texto fala do mecanismo de alias
   como fato técnico (ex.: doc 01 explicando `EXERCISE_ALIASES`), que deve permanecer.

## Nomes antigos a substituir na documentação

| Antigo | Oficial |
|---|---|
| Focus Agentes · Focus Agents | **Agentes Focus** |
| Task Switching | **Alternância de Regras** |
| Desafio do Supermercado | Supermercado |
| Restaurante — Ordem de Instruções | Restaurante |
| Corrida contra o Tempo | Busca Rápida |
| Cubo de Corsi | Cubos |
| Desafio da Cidade / Desafio do Orçamento / Caça Informação / Mudança de Regras | **remover** |

⚠️ **Alerta a registrar no doc 16:** existiu um exercício descontinuado chamado **"Mudança de
Regras"** (`mudanca-regras`, fundido no Informação em Foco). O nome novo de `task-switching` é
**"Alternância de Regras"** — parecido, mas outro exercício. Deixar isso explícito na tabela de
correspondência para ninguém confundir ao ler o histórico.

## Prova de aceite (verificar antes de entregar)

Rodar sobre `docs/auditoria-plano-terapeutico/*.md`:

1. `grep -rn "desafio-cidade\|Desafio da Cidade"` — só pode aparecer na seção de referência técnica
   do doc 13, marcado como `REMOVED_FROM_CURRENT_CATALOG`.
2. `grep -rn "caca-item-barato\|mudanca-regras\|desafio-orcamento\|-auditivo"` — só na seção de
   referência técnica ou em texto que explica o mecanismo de alias.
3. `grep -rn "Task Switching\|Focus Agentes\|Focus Agents"` — **zero ocorrências**.
4. O doc 16 tem exatamente **34 linhas** de exercício na lista canônica.
5. O doc 03 tem exatamente **34 linhas** e as contagens por modelo somam 34.
6. Todos os 34 nomes oficiais aparecem no doc 16, escritos exatamente como na tabela acima.

Entregar o diff no worktree. Não commitar.
