# 02 — Inventário dos exercícios (auditoria do plano terapêutico)

> Levantado em 02/ago/2026 por cruzamento automático de `types/index.ts`
> (`EXERCISE_DEFINITIONS`), do `switch` de `app/(patient)/treino/[exercicio]/page.tsx`
> e do código de cada componente. **41 exercícios** — nenhum omitido.

## Como cada coluna foi obtida

- **min. exibidos** — `estimatedMinutes` em `types/index.ts`. É o número que aparece no card e
  que alimenta o total do plano.
- **Por tempo** — o componente importa `useTimedProgress` (engine de sessão por tempo ativo).
- **`trials`** — o código tem a variável `trials` (dose por número de tentativas).
- **Áudio** — o componente usa `playTTS`/TTS.
- **Config. própria** — o componente lê `settings` vindas da prescrição.

## Tabela

| ID | Nome | Domínio | min. exibidos | Componente | Por tempo | `trials` | Áudio | Config. própria |
|---|---|---|---|---|---|---|---|---|
| `antes-depois` | Caminhos para a Meta | Executivas | 7 | `executive/caminhos-meta/CaminhosMeta.tsx` | sim | não | sim | sim |
| `caca-item-barato` | Caça Informação | Atenção | 7 | `attention/InformacaoEmFoco.tsx` | sim | não | sim | não |
| `certo-ou-errado` | Certo ou Errado | Velocidade | 7 | `processing/CertoOuErrado.tsx` | sim | sim | não | não |
| `compra-multifuncional` | Compra Multifuncional | Executivas | 7 | `executive/CompraMultifuncional.tsx` | sim | não | não | não |
| `corrida-tempo` | Busca Rápida | Velocidade | 7 | `processing/CorridaContraOTempo.tsx` | sim | não | não | não |
| `cubo-corsi` | Cubos | Memória | 7 | `memory/CuboCorsi.tsx` | sim | não | sim | não |
| `deductive-grid` | Grade Dedutiva | Executivas | 7 | `executive/DeductiveGrid.tsx` | sim | não | não | não |
| `desafio-cidade` | Desafio da Cidade | Executivas | 7 | `executive/DesafioCidade.tsx` | sim | não | não | não |
| `desafio-orcamento` | Desafio do Orçamento | Executivas | 7 | `executive/CompraMultifuncional.tsx` | sim | não | não | não |
| `desafio-supermercado` | Supermercado | Memória | 7 | `memory/DesafioSupermercado.tsx` | sim | sim | sim | não |
| `desafio-supermercado-auditivo` | Supermercado — Auditivo | Memória | 9 | `—` | não | não | não | não |
| `dual-task` | Dupla Tarefa | Atenção | 7 | `attention/DualTask.tsx` | sim | não | não | não |
| `estacionamento-logico` | Estacionamento Lógico | Executivas | 7 | `executive/EstacionamentoLogico.tsx` | sim | não | não | não |
| `focus-agents` | Focus Agentes | Atenção | 7 | `attention/FocusAgents.tsx` | sim | sim | sim | sim |
| `focus-agents-auditivo` | Focus Agentes Auditivo | Atenção | 8 | `—` | não | não | não | não |
| `identificacao-simbolos` | Identificação de Símbolos | Velocidade | 7 | `processing/IdentificacaoSimbolos.tsx` | sim | sim | não | não |
| `informacao-em-foco` | Informação em Foco | Atenção | 7 | `—` | não | não | não | não |
| `investigadores-sociais` | Investigadores da Situação Social | Funcional | 8 | `social/InvestigadoresSociais.tsx` | sim | não | não | não |
| `jogo-memoria` | Jogo da Memória | Memória | 7 | `memory/JogoMemoria.tsx` | sim | não | não | não |
| `labirinto` | Labirinto | Executivas | 7 | `executive/Labirinto.tsx` | sim | não | não | não |
| `letras-sequencia` | Letras em Sequência | Memória | 7 | `memory/LetrasSequencia.tsx` | sim | não | não | não |
| `lista-distracao` | Lista com Distração | Memória | 7 | `memory/ListaDistracao.tsx` | sim | não | não | não |
| `matriz-espacial` | Matriz Espacial | Memória | 7 | `memory/MatrizEspacial.tsx` | sim | sim | não | não |
| `matriz-espacial-inversa` | Matriz Espacial Inversa | Memória | 7 | `memory/MatrizEspacialInversa.tsx` | não | não | não | não |
| `mot` | Rastreamento de Objetos | Atenção | 7 | `attention/MOT.tsx` | sim | não | não | não |
| `mudanca-regras` | Mudança de Regras | Executivas | 7 | `—` | não | não | não | não |
| `nback` | N-Back | Memória | 7 | `memory/NBack.tsx` | sim | não | não | não |
| `ordem-historia` | Ordem da História | Executivas | 7 | `executive/OrdemHistoria.tsx` | sim | não | não | sim |
| `padroes-rotacao` | Matriz com Rotações | Memória | 7 | `memory/PadroesRotacao.tsx` | sim | não | não | não |
| `restaurante-ordem` | Restaurante | Memória | 7 | `memory/RestauranteOrdem.tsx` | sim | não | não | não |
| `restaurante-ordem-auditivo` | Restaurante — Ordem de Instruções (Auditivo) | Memória | 7 | `—` | não | não | não | não |
| `semaforo` | Semáforo | Velocidade | 7 | `processing/Semaforo.tsx` | sim | sim | não | não |
| `sequencia-itens` | Sequência de Itens | Memória | 7 | `memory/SequenciaItens.tsx` | sim | não | não | não |
| `span-numerico` | Span Numérico Auditivo Direto | Memória | 7 | `memory/SpanNumerico.tsx` | sim | sim | não | sim |
| `span-numerico-inverso` | Span Numérico Auditivo Inverso | Memória | 7 | `memory/SpanNumericoInverso.tsx` | não | não | não | sim |
| `stroop-task` | Cores e Palavras | Executivas | 7 | `executive/StroopTask.tsx` | sim | não | não | não |
| `task-switching` | Task Switching | Executivas | 7 | `executive/TaskSwitching.tsx` | sim | sim | não | não |
| `tempo-reacao` | Tempo de Reação | Velocidade | 7 | `processing/TempoReacao.tsx` | sim | sim | não | não |
| `torre-hanoi` | Jogo das Torres | Executivas | 7 | `executive/TorreHanoi.tsx` | sim | não | não | não |
| `trilha-visual` | Conecta Números | Atenção | 7 | `attention/TrilhaVisual.tsx` | sim | não | não | não |
| `vigilancia` | Vigilância | Atenção | 7 | `attention/Vigilancia.tsx` | sim | não | não | não |

## Contagens

- **Por tempo (`useTimedProgress`):** 34 de 41
- **Com `trials` no código:** 9
- **Com áudio:** 5
- **Sem componente mapeado no `switch`:** `restaurante-ordem-auditivo`, `desafio-supermercado-auditivo`, `informacao-em-foco`, `mudanca-regras`, `focus-agents-auditivo`

## Observações que saltaram do cruzamento

1. **A dose por tentativas é exceção, não regra.** Só os dois spans
   (`span-numerico`, `span-numerico-inverso`) têm o controle de 10/15/20/30 na interface do plano
   (`components/plano/ExerciseCard.tsx:194`, ativo apenas quando `isSpan`), e só eles encerram por
   contagem (`SpanNumerico.tsx:298` — `newAttempts.length >= cfg.trials`). Os demais já encerram por
   tempo. A menção a `trials` em outros arquivos é de métrica (contar tentativas feitas), não de dose.
2. **Cinco ids não resolvem componente pelo `switch`** — são aliases (`*-auditivo`) e ids
   redirecionados (`informacao-em-foco`, `mudanca-regras`), resolvidos por `EXERCISE_ALIASES` em
   `lib/exercise-plan.ts`. Não são exercícios órfãos.
3. **`estimatedMinutes` é literal.** 38 exercícios com `7`, dois com `8`, um com `9` — nenhum
   derivado de configuração, tentativas ou medição real.
