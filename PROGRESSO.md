# PROGRESSO — NeuroPeak

> Checkpoint de contexto para continuidade entre sessões. Atualizado automaticamente.
> 👉 Visão geral e handoff para o próximo Claude: **`ESTADO-DO-PROJETO.md`** (leia primeiro).

## ✅ FASE 2 DA PRESCRIÇÃO ENTREGUE (03/ago/2026) — exibição consultiva na tela de plano (`a6f61f0`)

**Não mudou dado, API, banco nem comportamento de exercício.** A Fase 1 (núcleo puro em
`lib/prescription/`, 7 módulos) segue aprovada e congelada; a Fase 2 apenas **EXIBE** ao terapeuta,
na área dele, o que o núcleo calcula. O commit não tocou `package.json` — versão segue **2.67.1**.

### O que entrou

| Arquivo criado | Papel |
|---|---|
| `lib/prescription/presentation.ts` (469 l) | camada pura de apresentação — **sem React** |
| `lib/prescription/presentation.test.ts` (144 l) | testes da camada pura |
| `lib/prescription/__tests__/save-button-guard.test.ts` (63 l) | teste **estático**: lê o fonte e garante que o "Salvar plano" não some |
| `lib/prescription/__tests__/library-coverage.test.ts` | regressão criada pelo VP na revisão (ver achado abaixo) |
| `components/plano/prescription/PrescriptionSummary.tsx` (98 l) | resumo da sessão prescrita |
| `components/plano/prescription/ExercisePrescriptionMeta.tsx` (28 l) | metadados de prescrição por exercício |

**Alterados:** `app/(therapist)/pacientes/[id]/plano/page.tsx` · `components/plano/PlanBuilderSidebar.tsx` ·
`components/plano/ExerciseCard.tsx` · `components/plano/ExerciseRow.tsx`.

### Roteamento (regra 8)

Codificação no **Codex `gpt-5.6-sol`, esforço high, lab `impl2b`**. O primeiro disparo (lab `impl2`)
**panicou com bug de Rust em `std::env`** e não produziu nada — lab recriado e redisparado, aí com
sucesso. Dois consertos pequenos pós-colheita foram do **Claude Opus 5 xhigh (exceção 1 da regra 8)**:
tipagem em `presentation.ts` (acesso a propriedade opcional numa união criada por `satisfies`) e a
criação do `library-coverage.test.ts`.

### Provas (repositório real)

`npx tsc --noEmit` exit 0 · `npx vitest run` **330/330 em 28 arquivos** (eram 296 → **+34 testes**) ·
`npm run build` exit 0.

### ⚠️ Achado da revisão do VP — já blindado por teste

A **biblioteca de exercícios da tela de plano** passou a montar cada cartão a partir do catálogo de
prescrição e **descarta com `flatMap` quem não tem entrada**. Hoje a cobertura é total (**34 de 34**),
mas o descarte seria **silencioso** — um exercício sumiria da tela sem erro nenhum.
`library-coverage.test.ts` transforma esse caso em teste vermelho.

### ⏸️ PRÓXIMO PASSO — validação VISUAL dela; **NÃO iniciar a Fase 3**

Ela pediu explicitamente para não começar a Fase 3 automaticamente. Não há teste de renderização,
então estes cenários da tela de plano só se conferem com olho humano: **plano vazio · dentro do
esperado · acima do esperado · excesso importante · fadiga alta consecutiva · planejamento
consecutivo · plano legado** — e, em **todos**, confirmar que o botão **"Salvar plano"** continua
disponível.

### 🔷 Decisões dela pendentes

1. **Paredão de alertas:** numa sessão muito sobrecarregada os alertas chegam a **~21**, com "fadiga
   alta em sequência" e "interferência alta em sequência" repetidos par a par. Decidir se a Fase 3
   agrupa ou limita visualmente.
2. **`ExerciseRow`:** a descrição do exercício saiu da linha principal e foi para dentro de **"Ver
   detalhes"** (fiel à spec, que mandava "o resto atrás de Ver detalhes"). Decidir se fica assim.


## 🧊 FASE 1 CONCLUÍDA E CONGELADA (02/ago/2026) — perfil cognitivo dos 34

**Decisão dela:** *"Considere toda a Fase 1 concluída e congelada até nova solicitação."*
**NÃO iniciar a Fase 2 (carga cognitiva) sem pedido explícito dela.**

### O que está pronto e é fonte de verdade

| Documento | Conteúdo |
|---|---|
| `docs/architecture/CANONICAL_EXERCISES.md` | **Constituição:** 34 exercícios ACTIVE, nomes oficiais, Legacy IDs, modalidades |
| `docs/architecture/NOMENCLATURA-EXERCICIOS.md` | por que Cubos ≠ Corsi, Cores e Palavras ≠ Stroop, etc. |
| `docs/clinical-architecture/01-cognitive-domain-taxonomy.md` | 8 famílias, ~60 domínios finos, escala 0–3, limites |
| `docs/clinical-architecture/02-exercise-cognitive-profiles.md` | 34 fichas de 20 itens, lidas do código real |
| `docs/clinical-architecture/03-cognitive-matrix.md` + `cognitive-matrix.json` | matriz fina 34 × 36 — **DESCRITIVA da mecânica, nunca aspiracional** |
| `docs/clinical-architecture/04-clinical-review-questions.md` | 150 questões clínicas por exercício |
| `docs/clinical-architecture/05-associated-cognitive-profiles.md` + `associated-profiles.json` | **camada macro:** 21 macros + tags funcionais |

### Decisões clínicas que valem daqui em diante

- **Quatro campos convivem:** `catalogDomain`/`catalogSubdomain` (organizam a TELA, intocados) ·
  `mechanicalPrimary` (o que a mecânica recruta) · `associatedCognitiveProfiles` (macros) ·
  `functionalClinicalTags` (aplicação). **Divergência entre catálogo e mecânica NÃO é erro** —
  são 21 de 34, e a matriz continua descritiva.
- **21 macros cognitivos** (o 21º = Cognição Social e Inferência Social) + **tags funcionais**
  separadas. O mesmo conceito pode viver nos dois níveis sem duplicação: macro = processo mental,
  tag = aplicação clínica.
- **Nunca inflar rótulo:** duração não vira Atenção Sustentada · ordem inversa não vira
  Flexibilidade · leitura não vira Linguagem-alvo · movimento rápido não vira Velocidade.
- **Caminhos para a Meta = `PROVISIONAL_PROFILE`** — será reformulado para virar treino real de
  Planejamento. Até lá **não usar como modelo para a engine** nem tratar seu perfil como definitivo.
- Máx. 4 associados na camada resumida, **sem forçar 4** (há um com 2, dois com 1).

### Quando a Fase 2 começar

Ela usará: `mechanicalPrimary` + associados + intensidade dos domínios finos + modificadores de
nível + modalidade + duração + interferência + pressão temporal. **Não só o `mechanicalPrimary`.**

### Achados de código registrados nas fichas (NÃO corrigidos — fora do escopo da auditoria)

- **Lista com Distração:** a tarefa distratora aceita **qualquer** resposta (o código não valida).
- **Alternância de Regras:** **não há modificador por nível** — não fica mais difícil com a progressão.
- **Certo ou Errado:** sem janela por item, sem aumento de alternativas; dificuldade só editorial.
- **Matriz Espacial / Cubos / Matriz com Rotações:** o bipe é idêntico para todas as posições — não
  é pista auditiva e não conta como demanda auditiva.


## (histórico) EM ANDAMENTO — FASE 1 da arquitetura clínica: perfil cognitivo dos 34

> **Encerrado em 02/ago/2026:** os três lotes foram entregues e ela declarou a Fase 1 concluída e
> congelada. Mantido como registro do fatiamento e do roteamento usados.

**Regra da etapa (dela):** só análise e documentos. Nada de código, progressão, níveis, duração,
carga, banco, interface, catálogo ou engine.

**Fonte única:** `docs/architecture/CANONICAL_EXERCISES.md` (34 ACTIVE) — a Constituição dos
exercícios, criada no cleanup anterior.

**Roteamento fixado por ela:** Codex para tudo que cabe numa spec sobre o HEAD commitado; Claude
direto só em ajuste pós-colheita, integração com contexto vivo ou Codex indisponível.
`sol xhigh` = arquitetura/alto risco · `sol high` = acoplado · `terra high` = comum/testável ·
`luna high` = repetitivo e barato de validar.

**Fatiado em 3 lotes** (34 fichas de 20 itens não cabem num disparo):

| Lote | Conteúdo | Motor | Estado |
|---|---|---|---|
| **A** | doc 01 (taxonomia) + 12 fichas: Atenção e Velocidade | `sol xhigh` | ✅ |
| **B** | 12 fichas: Memória | `sol xhigh` | ✅ |
| **C** | 10 fichas (Executivas/Funcional/Social) + matriz + JSON + doc 04 | `sol xhigh` | ✅ |

**Documentos-alvo:** `docs/clinical-architecture/01-cognitive-domain-taxonomy.md` ·
`02-exercise-cognitive-profiles.md` · `03-cognitive-matrix.md` · `cognitive-matrix.json` ·
`04-clinical-review-questions.md`.

**Proibido nesta fase:** atribuir carga, duração, dose, ordem ideal ou fadiga — só o PERFIL
(quais processos a mecânica recruta, 0–3). Fatores que influenciarão carga podem ser registrados.


## 📌 CATÁLOGO CANÔNICO CONSOLIDADO (02/ago/2026) — decisão dela, DEFINITIVA

**Fonte única de verdade: `docs/auditoria-plano-terapeutico/16-lista-canonica.md` — 34 exercícios ACTIVE.**

- **Nomes oficiais congelados** (a lista dos 34 está no doc 16). Dois nomes mudaram por decisão dela:
  `focus-agents` → **"Agentes Focus"** · `task-switching` → **"Alternância de Regras"**.
- **IDs técnicos NÃO mudam** — são chave de planos, sessões e progresso no banco.
- **Fora da arquitetura conceitual:** `desafio-cidade` (marcado `REMOVED_FROM_CURRENT_CATALOG`, será
  reformulado como exercício NOVO — o código fica onde está), os 3 aliases e os 3 modos auditivos.
- ⚠️ **Desambiguação:** "Mudança de Regras" (`mudanca-regras`) foi exercício DESCONTINUADO, fundido
  no Informação em Foco. Não confundir com "Alternância de Regras" (`task-switching`), que é outro.
- **Modalidade** (visual · visual+áudio · só áudio): exclusiva de **5** — Restaurante, Supermercado,
  Caminhos para a Meta, Agentes Focus e Compra Multifuncional (os 2 últimos aprovados, a implementar).
  Os spans são **auditivos intrínsecos**, sem seletor.

Toda análise futura usa exclusivamente essa lista.

## 🔖 RETOMADA IMEDIATA (02/ago/2026, fim da tarde) — ela trocou de conta AQUI

**Estado:** produção = local = **v2.67.1** · 250 testes · tsc 0 · git limpo.

### O que está EM CURSO: auditoria do plano terapêutico (só análise, NADA de código)

Regra da etapa, dita por ela: **não implementar, não alterar código/banco/rotas/progressão**.
Os documentos ficam em `docs/auditoria-plano-terapeutico/`. Já escritos:

| Doc | Conteúdo |
|---|---|
| `01-estado-atual.md` | onde a tela vive, duração/frequência/tentativas/níveis/retomada, 7 inconsistências |
| `02-inventario-exercicios.md` | tabela das 41 definições (⚠️ **superada** pelo doc 13 — contou alias como exercício) |
| `03-proposta-classificacao.md` | 4 modelos de execução (A contínuo · B planejamento · C alta fadiga · D bloco) |
| `04-proposta-carga-cognitiva.md` | escala **1–3** + modificadores; fórmula da carga da sessão |
| `05-proposta-interface.md` | card, painel da sessão, alertas, "Ajustar" |
| `06-modelo-de-dados.md` | `ExerciseDefinition` · `ExercisePrescription` · `PatientExerciseProgress` … |
| `07-riscos-e-migracao.md` | 8 riscos, ordem segura em 6 fases |
| `08-decisoes-pendentes.md` | 5 bloqueantes · 5 importantes · 4 refinamentos |
| `13-inventario-real-atividades.md` | **fonte de verdade:** 41 = **34 clínicos** + 3 modos + 3 aliases + 1 órfão |
| `14-nomes-oficiais.md` | divergências de nome; id histórico não muda |
| `15-modalidades-e-acessibilidade.md` | modalidade × leitura assistiva (conceitos diferentes) |
| `16-lista-canonica.md` | os 34 canônicos com categoria, modalidades e aliases |

### ⛔ Decisões dela que TRAVAM a continuação

1. **`desafio-cidade`** (órfão: renderiza mas saiu do catálogo) — reativar ou remover?
2. **Focus Agentes e Compra Multifuncional recebem seletor de modalidade?** Hoje
   `focus-agents-auditivo` existe como id e a tela NÃO oferece o seletor — promessa sem entrega.
3. **Nomes em inglês:** "Task Switching" (único 100% inglês exibido ao paciente), "Focus Agentes"
   (meio inglês/meio português), "N-Back".
4. Os 5 bloqueantes do doc 08 (carga basal · durações · duração/frequência fechadas · repetição de
   áudio · se o nível prescrito sobrescreve o progresso do paciente).

### ⚠️ O que refazer quando ela validar

O **doc 03** classificou modo e alias como exercícios independentes. Precisa ser **refeito sobre os
34 canônicos** do doc 16 antes de qualquer decisão de carga/duração.

### Próximo passo concreto

Aguardar as decisões acima. Nada mais a executar na auditoria sem elas.


## ⏸️ AUDITORIA DO PLANO TERAPÊUTICO — pedida 02/ago, SUSPENSA por decisão dela

Ela mandou a spec completa (auditoria + 8 documentos em `docs/auditoria-plano-terapeutico/`:
estado atual · inventário de exercícios · classificação por modelo de execução · carga cognitiva ·
interface · modelo de dados · riscos/migração · decisões pendentes). **Regra da etapa: só análise,
nada de alterar código, sem commit, sem push.**

**Decisão dela:** *"vamos esperar finalizar o focus, para quando vc for fazer, fazer de tudo"* —
a auditoria começa depois que o Focus (modo único) fechar.

**Achados já levantados (não repetir o trabalho):**
- `estimatedMinutes` é **hardcoded** em `types/index.ts`: 38 exercícios com `7`, dois com `8`, um
  com `9` (41 definições). Não vem de configuração, tentativas nem do exercício.
- O total da sessão é a **soma** desses valores (`components/plano/PlanBuilderSidebar.tsx:38`) —
  na prática "nº de exercícios × 7".
- Tela do plano: `app/(therapist)/pacientes/[id]/plano/page.tsx` (259 l) + `components/plano/*.tsx`
  (10 arquivos, 1.146 l no total). O seletor de duração da sessão está em `PlanBuilderSidebar.tsx:55`.

## ✅ CONCLUÍDO (02/ago/2026) — Focus Agentes: MODO ÚNICO + 3 defeitos que ela achou (v2.67.0)

**Tudo em produção (`2.67.0`), 250 testes, tsc 0, build OK.** Os 5 passos do plano fechados:
1. Decisão em arquivo (`docs/FOCUS-AGENTES-MODO-UNICO.md`) · 2. Chuva órfã removida (1.056 linhas) ·
3. Comandos novos + escada de 13 passos (Codex `sol`) · 4. Fim do seletor de modo + relatório por
FUNÇÃO COGNITIVA (Codex `terra`) · 5. Consertos + fundo claro.

**Os 3 defeitos que ela reportou testando, todos resolvidos:**
- **Dois alvos contando acerto com um toque só** (o mais grave — era falha da MINHA spec: criei
  `alvoIds[]` no motor e proibi mexer no componente). Agora o 1º toque certo marca (anel verde) e a
  rodada segue; só encerra com os dois. Erro no meio → "Achou 1 de 2", e o metadata grava
  `multiAlvo {rodadas, completos, parciais}`.
- **Personagens se cobrindo** → `separarPersonagens()` a cada quadro (eixo de menor penetração; na
  queda só horizontal). Importa para a MEDIDA: alvo coberto infla o tempo de detecção, que decide a
  subida de nível.
- **Tamanhos diferentes** → medição das 144 artes por grupo: 135 consistentes, **9 fora** (o
  `amarelo_chapeu` a 81%, o `verde_balao` a 110%). Reescaladas para a mediana do grupo, ancoradas
  pelos pés. Backup em `~/neuropeak-asset-backups/agentes-personagens-bak-20260802`. `IMG_V` → `?v=2`.

**Fundo `#F3F6F9`** (borda `#DDE3EC`) no lugar do navy: o agente azul se camuflava no `#0d2244` —
num exercício em que a COR é o critério, isso era viés contra uma cor. Textos e cards invertidos junto.

**Achado extra:** teste instável (`inclui distrator semelhante`) falhava ~1 em 3. Causa real:
`compartilhaParte()` aceitava o LADO sozinho como semelhança ("pipa à direita" ~ "bola à direita"),
então a cena "com semelhantes" podia sair sem nenhum distrator parecido. Gerador corrigido.

**Aguardando o teste dela em produção.** Depois: auditoria do plano terapêutico (já registrada acima).

<details><summary>Plano original dos 5 passos</summary>

## (histórico) EM ANDAMENTO — Focus Agentes: MODO ÚNICO

**Decisão dela, aprovada:** `docs/FOCUS-AGENTES-MODO-UNICO.md` (escada de 13 passos, relatório por
função cognitiva, fundo `#F3F6F9`, Chuva órfã removida).

**Passos (cada um termina com prova + commit):**
1. ✅ Decisão em arquivo + este plano.
2. **Remover a Chuva órfã** (`FocusRain.tsx`, 1.056 linhas, ninguém importa) — antes, extrair a
   lógica de comando multi-alvo sem sobreposição. *Pronto quando:* `tsc` 0 e testes verdes sem ela.
3. **Comandos novos + escada** (Codex): dois alvos · mudança de regra · `STEPS` conforme a tabela.
   *Pronto quando:* testes de `lib/focus/commands.ts` cobrindo alvo único por sub-regra, sem
   sobreposição, e a escada com uma variável nova por passo.
4. **Tirar o seletor de modo + relatório por função cognitiva** (`lib/focus-report.ts`, página do
   paciente do terapeuta). *Pronto quando:* relatório mostra as 4 funções e sessões antigas não quebram.
5. **Fundo `#F3F6F9`** + inversão dos textos da barra de comando. *Pronto quando:* conferência
   VISUAL minha nos 3 temas antes de publicar.

## ✅ CORR-021 RESOLVIDO (02/ago/2026) — teto da progressão do Focus vira parâmetro (v2.65.4)

**Ciclo Codex completo:** spec (`docs/spec-corr-021-focus-teto.md`) → `gpt-5.6-terra` high no lab
`corr021` → colheita revisada linha a linha pelo VP → aplicada e **provada no repositório real**
(o lab não tem `node_modules` nem rede, então o Codex não conseguiu rodar as provas) → commit
`9202ebc` → lab removido.

**O que mudou**
- `lib/focus/progression.ts` exporta **`FOCUS_MAX_LEVEL`** (`LAST_FOCUS_STEP + 1` = 13): fonte única
  do teto, sem constante nova solta.
- `calculateFocusProgression` ganhou 4º parâmetro **`maxLevel = FOCUS_MAX_LEVEL`**, no mesmo padrão
  do `maxLevel` de `calculateProgression`. Os dois literais `9` saíram (`lib/adaptive.ts:149,151`).
- **Régua de detecção estendida a 13 valores** — 11 = 1400 ms · 12 = 1300 · 13 = 1200, marcados no
  código como **calibração PROVISÓRIA, a confirmar com a Kamylla**. O clamp usa o tamanho do array.
- 6 testes novos em `lib/adaptive.test.ts` (o antigo `focusDetectTargetMs(15) === 1500` virou
  `(99) === 1200`, coerente com a régua nova).

**Provas:** `tsc` exit 0 · **236 testes / 18 arquivos** · build OK · produção `2.65.4` conferida.
Único chamador (`app/api/sessions/route.ts:152`) passa 3 argumentos e herda o default 13 — nada a
mudar na rota.

**Achado durante a revisão (NÃO é regressão nova, é o próximo degrau):** `FocusRain.tsx` (a Chuva,
modo Foco) tem **teto próprio `MAX_LEVEL = 10`** e `RAIN_CFG` com 10 níveis. Quem usa os 13 passos é
`FocusAgents.tsx` (arena). Então um paciente restaurado nos níveis 11-13 é clampado para 10 ao
entrar na Chuva. Decidir com ela: estender `RAIN_CFG` até 13 ou manter a Chuva com escala própria.

**Pendente de decisão dela:** os valores 11-13 da régua de detecção (1400/1300/1200) são proposta
minha seguindo a curva com desaceleração — ela aprovou só até o nível 10 (1500 ms).

## 🚩 (02/ago/2026) — Focus Agentes + teto de difficulty · **v2.65.2 e v2.65.3** (ESTREIA do ciclo Codex)

**Estado real:** `main` = `d4734b1` = produção · versão **2.65.3** · **231 testes** (18 arquivos) ·
`npx tsc --noEmit` exit 0 · `npm run build` exit 0.

### ⚠️ ARMADILHA PARA A PRÓXIMA SESSÃO — o teto de `difficulty` vive em DOIS lugares

1. **Zod:** `app/api/sessions/route.ts:18` — `difficulty: z.number().min(1).max(13)`.
2. **Banco de produção:** CHECK `session_difficulty_range` na tabela `Session` (hoje **1-13**).

**Os dois têm que casar. Mexer num sem o outro cria defeito SILENCIOSO:** o paciente termina o
exercício, o `INSERT` é recusado e a sessão dele se perde sem aviso na tela. A CHECK **não** está no
`prisma/schema.prisma` (foi aplicada por SQL direto), então um `db push` pode recriá-la errada —
reaplicar sempre pelo SQL da seção **SCHEMA-02** do `RUNBOOK-OPERACIONAL.md`, que tem o SQL aplicado
e o SQL de reversão. Reaplicar a versão antiga (teto 10) quebra 3 exercícios.

### v2.65.2 (`e37ddef`) — progressão do Focus Agentes volta a funcionar

O paciente nunca voltava no nível em que parou. Três falhas encadeadas no mesmo fluxo, nenhuma
listada em dívida técnica:
1. o exercício emitia `metadata.nivel` e `sessions/route.ts` lia `metadata.level` — a condição era
   sempre falsa, `calculateFocusProgression` **nunca** rodava;
2. não emitia `mode`, então `patients/[id]/route.ts` nunca montava `focusLevels` e a página de treino
   não tinha o que restaurar;
3. a conversão de volta era destrutiva (`difficulty = passo+1` na ida, `(difficulty-1)*0.4` na volta):
   passo 12 voltava como 5, passo 6 voltava como 2.

**Correção:** `FocusAgents` passa a consumir `settings.mode` e `settings.startLevel`; a montagem do
metadata e a conversão viraram funções puras em **`lib/focus/progression.ts`**, testáveis sem DOM.
A conversão `*0.4` sobrevive só como fallback de sessões antigas (as que não têm `startLevel`).

### v2.65.3 (`d4734b1`) — teto de difficulty vai a 13 no banco e no schema

Defeito **encontrado pelo Codex** e confirmado no banco vivo: o Zod aceitava até 12, mas a CHECK
recusava acima de 10 (aplicada em 30/05/2026 e nunca ajustada quando o CORR-001 liberou 11-12).
Paciente que passasse do nível 10 teria a sessão recusada e perdida — e a correção do v2.65.2 é
justamente o que o faz chegar lá.

**Medido antes:** ZERO sessões com `difficulty > 10` em todo o banco; Ordem da História parada
exatamente em 10 (o teto). Com 29 sessões no total, era **risco iminente, não perda em massa**.

**Aplicado:** CHECK ampliada de 1-10 para **1-13** no banco de produção, com verificação antes
(0 sessões ficariam fora) e depois (as 3 CHECKs de pé, 29 sessões intactas, nenhum dado tocado);
`sessionSchema` de `max(12)` para `max(13)`; `RUNBOOK-OPERACIONAL.md` ganhou a seção **SCHEMA-02**
com o SQL aplicado e o de reversão.

**Provado contra o banco real:** `difficulty` 10, 12 e 13 aceitos; **14 recusado** pela CHECK — a
validação não foi desligada, só ajustada. Sessões de teste removidas, contagem final 29 = inicial.

### Provas das duas entregas (rodadas no repositório real, não no lab)

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npx vitest run` | **231 testes / 18 arquivos**, todos passando (eram 223/17) |
| `npm run build` | exit 0 |

### Nota de método (estreia do ciclo Codex)

Origem: lab `estreia-focus`, `gpt-5.6-sol` esforço `high`, **duas rodadas**. Na primeira o Codex
**parou sem implementar** (59.926 tokens): relatou que o conserto pedido deixaria a restauração
quebrada e pediu autorização de escopo, como a spec mandava. A segunda rodada, com o escopo
autorizado, entregou o conserto (65.975 tokens). **O Codex não conseguiu rodar teste nenhum** — o lab
é clone do código versionado e `node_modules` não é versionado (`ENOTCACHED`); ele declarou isso em
vez de fingir. Toda prova acima é do repositório real.

### Próximo passo daqui (Focus Agentes)

**`CORR-021` — o teto da progressão do Foco ficou pela metade.** A correção de hoje fez o nível
ser salvo e restaurado, mas `calculateFocusProgression` (`lib/adaptive.ts:149-151`) clampa em 9
enquanto o exercício tem **13 passos** (`FocusAgents.tsx:45-51`). Na prática: o paciente sobe
dentro da sessão até o passo 13, mas o nível que o servidor grava e devolve nunca passa de 9 —
os quatro últimos passos não se consolidam entre sessões. É a continuação direta do trabalho de
02/08, está em P2 no `docs/DIVIDA-TECNICA.md`, e é candidato natural ao próximo ciclo Codex.

Também aberto no mesmo dia: **`ARQ-010`** (P3) — `utils/generateCommand.ts` (1.477 linhas) e
`components/exercises/attention/FocusRain.tsx` (1.056) estão órfãos, zero importadores.
`FocusRain` aparece citado como "Modo Foco" no histórico deste arquivo, mas quem o switch
renderiza é `FocusAgents` — antes de apagar, confirmar que não é peça planejada e esquecida.

## 🔒 FECHAMENTO (02/ago/2026) — Informação em Foco: FASES 1 e 2 · **v2.64.1 → v2.65.1**

**Estado real:** git limpo · local = produção = **2.65.1** · **223 testes** (17 arquivos) · `tsc` 0 · build OK.

**Entregue nesta sessão**
1. **FASE 1 fechada** (v2.64.1): catálogo central de 73 produtos com atributos fixos lidos das
   embalagens · **um gerador parametrizado** (9 tipos, sem pontuação nem peso de tipo) ·
   **motor antigo apagado** · validação com motivo nomeado · não repetição · snapshot estável ·
   progresso coerente ("Atividade N · Tempo da sessão · X%").
2. **FASE 2 (núcleo)** (v2.65.0 → 2.65.1): **leitura direta da embalagem** (o quadro nunca entrega a
   resposta — `campoReveladoPor` + validação `quadroEntregaResposta`) · composição 70/10/20 ·
   **cartão com embalagem `clamp(110px, 30vw, 155px)`** e botão "Ampliar" que não seleciona ·
   **modal acessível** (Esc, foco contido, alt descritivo) · quadro sem repetir o que o título diz ·
   feedback com `aria-live` · foco visível no cartão.

**Decisões dela registradas**
- Autorizou a Fase 2 com **validação parcial** ("não testei ela inteira") — se aparecer defeito do
  motor durante a Fase 2, corrigir antes de seguir.
- Dificuldade só por carga cognitiva; nada de pontuação, peso de tipo ou gamificação
  (memória `dificuldade-por-carga-cognitiva`).

**Próximo passo (abrir com `claude --continue`)**
**Conferência VISUAL dela em produção**, que é o que falta da Fase 2 e só se vê usando: cartão com a
embalagem maior (inclusive no celular), ampliação abrindo/fechando, uma situação do cotidiano
aparecendo, e se o quadro fica apertado com 6 campos em tela pequena. Depois disso a **FASE 3**
(adaptativa, spec em `docs/INFORMACAO-EM-FOCO-FASE3-ADAPTATIVA.md`) fica liberada.

**Limitação declarada:** o tipo "ingredientes" usa lactose/glúten/açúcar adicionado — lista completa
de ingredientes não existe no catálogo porque não está legível nas embalagens.

## ✅ FASE 2 (núcleo) ENTREGUE (02/ago/2026) — Informação em Foco (v2.65.0 → v2.65.1)

- **F2.4a leitura direta da embalagem:** tipo novo, só com produto autorizado
  (`directPackageReadingEnabled`) e frase confirmada; `campoReveladoPor()` tira do quadro o campo
  que a frase entregaria (validação `quadroEntregaResposta`). 800 questões testadas.
- **F2.4b composição:** a cada 10 atividades ~7 quadro · ~2 situação · ~1 embalagem; níveis 1-4 só
  quadro, situação a partir do 5, embalagem a partir do 6.
- **F2.1 cartão:** embalagem de 88 px → `clamp(110px, 30vw, 155px)` (inteira, sem corte nem
  deformação) + botão "Ampliar embalagem" que NÃO seleciona o produto.
- **F2.3 modal acessível:** `role=dialog`, foco inicial no fechar, foco contido no Tab, Escape e
  clique fora fecham, alt descritivo; não responde, não avança, não revela nada.
- **F2.5/F2.6:** quadro sem repetir o que o título já diz · feedback com `aria-live` e prefixo para
  leitor de tela · foco visível no cartão · grid 2 colunas até `lg`.

**Provas:** 223 testes, `tsc` 0, build OK, produção `2.65.1`.

**Falta da Fase 2 (próxima fatia):** conferência VISUAL dela em produção (cartão, ampliação e
situação nos 3 temas) e o que só se vê usando — se o quadro ficou apertado com 6 campos no celular.

<details><summary>Plano original da Fase 2</summary>

## (histórico) EM ANDAMENTO — Informação em Foco: FASE 2

**Autorização dela:** *"dei uma olhada agora e parece que está ok, não testei ela inteira, mas pare
ok! podemos ir para fase 2"*. ⚠️ **Validação PARCIAL** — ela não rodou uma sessão inteira. Se
aparecer defeito do motor (Fase 1) durante a Fase 2, corrigir na hora, antes de seguir.

**Spec:** `docs/INFORMACAO-EM-FOCO-FASE2-CARTOES-E-SITUACOES.md`.

**Passos (cada um termina com prova + commit):**
- **F2.4a** motor: tipo **leitura direta da embalagem** (só produtos com `directPackageReadingEnabled`
  e frase confirmada; o quadro NÃO pode repetir a informação avaliada). *Prova:* teste que verifica,
  para toda frase do catálogo, qual campo ela revela — e que esse campo fica fora do quadro.
- **F2.4b** composição da sessão: ~70% quadro · ~10% leitura da embalagem · ~20% situação.
- **F2.1** ProductCard novo: imagem 150–175 px, botão "Ampliar embalagem" que NÃO seleciona o
  cartão, quadro funcional em linhas.
- **F2.3** modal de ampliação acessível (Escape, foco contido, retorno de foco, teclado).
- **F2.5** feedback pedagógico em 2 tentativas + destaque só depois da resposta.
- **F2.6** responsividade (4/2/1 cartões) e acessibilidade (teclado, leitor de tela, sem info só por cor).

</details>

</details>

## 🔒 FECHAMENTO (02/ago/2026, madrugada) — v2.60.2 → **v2.64.1**, tudo em produção

**Estado real:** git limpo · local = produção = **2.64.1** · **217 testes** (17 arquivos) · `tsc` 0 ·
build OK.

**Entregue nesta sessão**
1. **Vigilância** (v2.61.0 → 2.63.2): alvos regerados por ela e medidos por ΔE Lab · **8 pares**
   (entraram verde musgo e vinho) · **sessão por TEMPO ~8 min com linha de progressão** (como
   Estacionamento e Torre) · fim de bloco silencioso · erro mostra melhor onde estava a certa
   (2,6 s + linha até o lugar certo) · **par ameixa desativado** a pedido dela, escada refeita.
2. **Informação em Foco — FASE 1 COMPLETA** (v2.64.0 → 2.64.1): catálogo central de 73 produtos com
   atributos fixos lidos das embalagens · **um gerador parametrizado** com 9 tipos ·
   **motor antigo apagado** (era ele que sorteava lactose e sabor) · validação com motivo nomeado ·
   não repetição · snapshot estável · progresso coerente.
3. **Specs das 3 fases gravadas** em `docs/` (Fase 1, Fase 2 e Fase 3 do Informação em Foco).

**Decisões dela registradas**
- Dificuldade sobe por **carga cognitiva**, nunca por pontuação, peso de tipo ou gamificação —
  memória `dificuldade-por-carga-cognitiva`.
- Sessão por TEMPO com barra é o padrão do projeto; a dificuldade sobe com os acertos.
- Ao receber a spec de uma fase, **conferir no código se a anterior foi aplicada** antes de avançar.
- Vigilância: rabiola ondulada é intencional; par ameixa fora por ser fácil demais.

**Próximo passo (abrir com `claude --continue`)**
**Ela testar uma sessão inteira do Informação em Foco em produção.** É esse teste que autoriza a
**FASE 2** (`docs/INFORMACAO-EM-FOCO-FASE2-CARTOES-E-SITUACOES.md`: cartão novo, imagem 150–175 px,
modal de ampliação, 70/10/20 entre quadro · leitura da embalagem · situação). Depois a **FASE 3**
(adaptativa, `docs/INFORMACAO-EM-FOCO-FASE3-ADAPTATIVA.md`). Se o teste dela apontar algo, corrigir
ANTES de avançar de fase.

**Limitação declarada:** o tipo "ingredientes" usa lactose/glúten/açúcar adicionado — lista completa
de ingredientes não existe no catálogo porque não está legível nas embalagens (não se inventa dado).

## ✅ FASE 1 CONCLUÍDA (02/ago/2026) — Informação em Foco: motor estabilizado (v2.64.1)

**Todas as fatias entregues, com prova e em produção:**
- **F1.1** `data/informacao-foco-catalogo.ts` — 73 produtos com atributos FIXOS lidos das embalagens (sem OCR). Relatório: `docs/auditoria/INFORMACAO-EM-FOCO-CATALOGO-2026-08-02.md`.
- **F1.2** campos aplicáveis por categoria + faixas de preço plausíveis (dentro do catálogo e testadas).
- **F1.3** `lib/informacao-foco-questoes.ts` — **um gerador parametrizado** com 9 tipos; nada de gerador por nível, pontuação ou peso de tipo. **Motor antigo (`lib/informacao-foco.ts`) APAGADO** — era ele que sorteava lactose e sabor.
- **F1.4** regra de não repetição com motivo nomeado + snapshot no `sessionStorage` (refresh não muda mais o preço no meio da sessão).
- **F1.5** progresso coerente: a barra é de TEMPO e agora diz isso ("Atividade N · Tempo da sessão · X%").

**Provas:** 217 testes (16 só do gerador, ~40 mil questões em 500 sessões × 8 níveis), `tsc` 0, build OK, produção `2.64.1`. Exemplos gerados em `docs/auditoria/INFORMACAO-EM-FOCO-EXEMPLOS.md`.

**Limitação declarada:** "ingredientes" usa lactose/glúten/açúcar adicionado — lista completa de ingredientes não existe no catálogo porque não está legível nas embalagens (não se inventa dado).

**Próximo:** FASE 2 (cartões, quadro funcional, ampliação, situações) — só quando ela testar uma sessão inteira. Depois FASE 3 (adaptativa).

<details><summary>Plano original das 3 fases</summary>

## 🚧 (histórico) EM ANDAMENTO (02/ago/2026) — Informação em Foco: FASE 1 + FASE 2

**Pedido dela (02/ago):** mandou a FASE 2 dizendo *"Antes de iniciar, verifique se a Fase 1 foi
realmente aplicada no código. Caso ainda existam bloqueadores estruturais, informe-os objetivamente,
corrija-os conforme as regras já definidas na Fase 1 e depois prossiga."*

**Verificação: a FASE 1 NÃO estava aplicada** (só a spec existia). Bloqueadores medidos no código:
`lib/informacao-foco.ts:315` sorteia `lactose` para qualquer produto · `:335` sorteia `sabor` ·
peso/volume/unidades/validade inventados por questão (margarina muda de 500 g para 800 g) · sem
snapshot de sessão · sem histórico anti-repetição · sem `directPackageReadingEnabled`.

**Passos (cada um termina com prova rodada + commit):**
- **F1.1** Catálogo com atributos FIXOS, lendo o conteúdo impresso nas 73 embalagens (o que não der
  para ler vira `revisar: true` e sai das perguntas de conteúdo). *Prova:* relatório de auditoria +
  teste de coerência por categoria.
- **F1.2** Campos aplicáveis por categoria (`null` quando não se aplica) + faixas de preço plausíveis.
- **F1.3** Gerador passa a LER o catálogo (fim do sorteio de atributo). *Prova:* 500×/nível sem
  atributo contraditório, uma resposta correta.
- **F1.4** Snapshot de sessão (preço/validade estáveis) + histórico anti-repetição.
- **F1.5** Progresso 0/10/…/100 + validação obrigatória antes de exibir.
- **F2.1** ProductCard novo (imagem 150–175 px, botão Ampliar sem selecionar o cartão, quadro funcional).
- **F2.2** Campos por nível + ordem previsível no inicial.
- **F2.3** Modal de ampliação acessível (Escape, foco contido, teclado).
- **F2.4** Modalidades: 70% quadro · 10% leitura direta da embalagem · 20% situação do cotidiano.
- **F2.5** Feedback pedagógico em 2 tentativas + destaque só depois da resposta.
- **F2.6** Distribuição da sessão de 10 + responsividade + acessibilidade.
- **F3.x** FASE 3 (spec recebida 02/ago, `docs/INFORMACAO-EM-FOCO-FASE3-ADAPTATIVA.md`): adaptativo
  por DIMENSÃO (produtos · campos · condições · semelhança dos distratores · tipo · ordem dos campos ·
  proximidade dos valores), 3 acertos↑ com 2 na 1ª tentativa / 2 erros em 3↓, histerese anti-oscilação,
  classificação do erro pela condição ignorada, uso do zoom, continuidade pelo ÚLTIMO NÍVEL ESTÁVEL,
  relatório profissional por campo e por tipo (linguagem descritiva, sem diagnóstico), controles do
  profissional. **Depende da Fase 2** (modal de ampliação e tipos de pergunta) e da Fase 1 (dados).

**Estado em 02/ago 01h:** F1.1 FEITA (catálogo de 73 produtos com atributos fixos lidos das
embalagens, 9 testes, relatório de auditoria). Próxima: F1.3.

</details>

## 🔒 FECHAMENTO DA SESSÃO (01→02/ago/2026) — v2.59.0 → **v2.63.1**, tudo em produção

**Estado real ao fechar:** git limpo · local = produção = **2.63.1** · **205 testes** (16 arquivos) ·
`tsc` 0 · build OK · imagens conferidas visualmente uma a uma.

**O que foi entregue hoje**
1. **Informação em Foco — catálogo 50 → 73 produtos com fundo TRANSPARENTE** (v2.60.0–2.60.2).
   As 80 imagens dela: 50 já eram as fontes do que estava no jogo · 20 viraram produto novo ·
   7 repetidas (regra dela: produto igual, só um) · 3 regeradas por marca real. Motor: marca virou
   dado do produto, nomes únicos por questão, "Conteúdo" só em líquido e "Peso" só em sólido.
2. **Vigilância** (v2.61.0–2.63.0): alvos regerados por ela (ΔE Lab caiu de 46/25/33 para 19/13/23),
   **8 pares** (entraram verde musgo e vinho), escada dos 10 níveis reordenada pela dificuldade
   MEDIDA, e **sessão por TEMPO (~8 min) com linha de progressão**, sem tela de fim de bloco.
3. **Specs gravadas** (nada iniciado): Fase 1 e Fase 2 do Informação em Foco, em `docs/`.

**Decisões dela registradas**
- Produto repetido: mantém só um. · Marca real não entra (ela regera com marca fictícia).
- Sessão por TEMPO com barra é o padrão do projeto (Estacionamento, Torre, Vigilância…), e a
  dificuldade sobe com os acertos. Nada de tela de "resultado do bloco" no meio.
- A rabiola ondulada das pipas novas é **intencional** — não uniformizar.

**Próximo passo (abrir com `claude --continue`)**
**FASE 1 do Informação em Foco** — `docs/INFORMACAO-EM-FOCO-FASE1-CORRECAO-ESTRUTURAL.md`, fatia 1
(catálogo com atributos fixos, lendo o conteúdo impresso nas 73 embalagens). Raiz já localizada:
`lib/informacao-foco.ts:315` (lactose) e `:335` (sabor) sorteiam atributo para qualquer produto.
Depois: Fase 2 (cartões/situações) só após ela testar 10 questões; Fase 3 (adaptativa) por último.

**Nada ficou por salvar.** Único ponto em aberto, por escolha: `PEDIDOS-LOG.md` e
`PEDIDOS-RECENTES.md` (gerados pelo gancho) seguem **fora do versionamento** — se ela quiser que
entrem no repo, é só dizer.

## ✅ CONCLUÍDO (2026-08-02, madrugada) — Vigilância: 8 pares, alvos regerados e SESSÃO POR TEMPO (v2.61.0 → v2.63.0)

**Terceira rodada (v2.63.0) — regra dela:** *"vigilancia nao é por exercicio... segue a mesma regra do estacionamento, torre (é por tempo e tem a linha de progressao) tem de ter uns 7 a 10 min"* + *"vamos aumentando a dificuldade com os acertos"*.
- **`useTimedProgress(8 min)`** + **linha de progressão** no topo (tempo ATIVO: só corre com o paciente interagindo).
- **Fim de bloco silencioso:** saiu a tela "Bloco concluído" (com botões Continuar/Encerrar). Agora avalia, sobe de nível quando merece e emenda o bloco seguinte sem interromper — mesmo princípio aplicado no Focus.
- **Quem encerra é o tempo**, e sempre DEPOIS do feedback da tentativa: a barra nunca corta o paciente no meio de uma decisão.
- **Dificuldade sobe com os acertos** (já era assim no motor, agora roda contínuo): degrau de exposição por tentativa (`adaptar`) + nível visual a cada bloco de 12 (`avaliarBloco`).

### Rodada anterior (v2.62.0) — 8 pares

**Segunda rodada (v2.62.0):** ela regerou também o **terracota** e mandou **2 pares novos** — **P07 verde musgo** e **P08 vinho**. ΔE Lab final: P04 22,8 · P01 19,3 · P03 **14,3** (era 19,4) · P07 13,8 · P02 13,0 · P08 11,3. **Escada dos 10 níveis refeita:** os 6 pares de tom entram em ordem de dificuldade medida (níveis 1-6), os 2 mais difíceis (P02, P08) voltam com arranjo irregular (7-8), laços no 9 e faixa diagonal no 10. `PIPA_V=3`. **A rabiola ondulada dos pares novos é INTENCIONAL — ela pediu assim** (os antigos têm rabiola reta). Não "uniformizar" achando que é defeito.

### Primeira rodada (v2.61.0)

**Pedido dela:** *"vigilancia percebi que a pipa está mto diferente... atualizei as pipas ALVOS verifica"*.

- **Ela tinha razão, e dá para medir.** ΔE Lab entre o corpo do alvo e o do distrator:
  Ameixa **46,3 → 19,3** · Azul ardósia **25,3 → 13,0** · Verde sálvia **33,3 → 22,8**. Os alvos
  antigos eram de outra família de cor (ameixa quase branco contra rosa escuro) — o alvo saltava aos
  olhos e o exercício perdia a função de vigilância.
- **Formato:** as 3 imagens novas vieram com o **xadrez de transparência achatado** (fundo
  quadriculado gravado como pixel). Removido por limiar (o xadrez fica em `dif` 2–11, a pipa passa de
  30) + `fill_holes`; alfa real restaurado, 400×600 RGBA como as demais. ⚠️ Se der para exportar PNG
  com transparência de verdade, é melhor — mas dá para consertar assim.
- **Escada de níveis reordenada pela dificuldade REAL** (`lib/vigilancia-dados.ts`): P04 (22,8) →
  P03 (19,4) → P01 (19,3) → P02 (13,0). Antes começava em 19,3, **caía para o par mais difícil no
  nível 3** e terminava no mais fácil nos níveis 7-8. `dificuldadeVisual` e `deltaELab` gravados no
  `pipas_manifest.json`.
- **`PIPA_V=2`** (cache-bust) porque o arquivo mudou mantendo o nome — sem isso o navegador serviria
  a pipa antiga.
- **Pendente:** o par **P03 (terracota)** não foi regerado por ela (segue o alvo de 31/jul). Por
  coincidência o ΔE dele (19,4) ficou coerente com os novos, então está usável — mas, se ela quiser
  uniformizar o critério, é o próximo a regerar.
- Backup das pipas antigas: `~/neuropeak-asset-backups/vigilancia-pipas-bak-20260802`.

## ⏭️ PRÓXIMAS TAREFAS — Informação em Foco em 3 FASES (specs dela gravadas, NADA iniciado)

**Sequência definida por ela — não inverter:**
1. **FASE 1 — correção estrutural** (`docs/INFORMACAO-EM-FOCO-FASE1-CORRECAO-ESTRUTURAL.md`):
   estabilizar produtos, unidades, dados e geração das perguntas.
2. **FASE 2 — cartões, etiquetas, ampliação e situações do cotidiano**
   (`docs/INFORMACAO-EM-FOCO-FASE2-CARTOES-E-SITUACOES.md`, recebida 02/ago): quadro funcional,
   embalagem maior (145–175 px), modal de ampliação, 3 modalidades (70% quadro · 10% leitura direta
   da embalagem · 20% situação do cotidiano), campos por dificuldade, distratores parciais,
   distribuição da sessão de 10, feedback processual. **Só depois da Fase 1 concluída E testada por
   ela numa sessão inteira de 10 questões** — senão as situações do cotidiano só reaproveitam dados errados.
3. **FASE 3 — dificuldade adaptativa**, ajustada depois de observar sessões completas.

**Detalhe da FASE 1 (a próxima a executar):** spec de 19 seções + plano em 5 fatias.

**Raiz confirmada no código:** os atributos do produto são sorteados por questão em vez de virem do
cadastro — `lib/informacao-foco.ts:315` joga `lactose` em qualquer produto (por isso "chá de camomila
contém lactose") e `:335` sorteia `sabor` entre morango/uva/laranja/chocolate para qualquer produto
(por isso "lasanha sabor chocolate", "pão de forma sabor morango"). Peso/volume/validade idem. A
v2.60.0 corrigiu só a metade das unidades ("Conteúdo" em líquido, "Peso" em sólido).

**Não começar sem ler a spec.** A fatia 1 exige LER o conteúdo impresso em cada uma das 73
embalagens (trabalho visual, só o Claude faz) — o que não der para confirmar vira `revisar: true` e
sai das perguntas sobre conteúdo, nunca se inventa o dado.

**Ordem combinada com ela:** terminar a Fase 1 → ela testa uma sessão inteira de 10 questões →
só então historinhas do cotidiano, dificuldade e melhorias visuais.

## ✅ CONCLUÍDO (2026-08-01, tarde) — Informação em Foco: catálogo 50 → 73 produtos com FUNDO TRANSPARENTE (v2.60.2)

**Pedido dela (palavras dela):** *"na verdade são 80 imagens, vamos integrar as 80 imagens no informação em foco, lembrando fundo transparente ok?"*

**Entregue e publicado (produção `2.60.2-dpl_H2n8PBo9fh251MdbHFHFq61Abz1E`; 205 testes, tsc 0, build OK):**
- **73 PNG 360×360 RGBA com alfa real** em `public/exercises/informacao-foco-produtos/` — as **50 antigas refeitas** (eram opacas, fundo branco: no tema GAMIFIED viravam um quadrado branco no cartão escuro) + **20 novas**.
- **Destino das 80 imagens da pasta dela:** 50 já eram as fontes dos produtos que estavam no jogo · 20 viraram produto novo · 7 eram produto REPETIDO (decisão dela: "produto igual, mantém só 1" — azeite, farinha de trigo, açúcar refinado, aveia, 2ª pasta de amendoim, 2ª geleia, 2º mel) · 3 fora por marca REAL.
- **Técnica do recorte** (script em `docs/scripts/recorte-fundo-branco.py`): contorno por **bordas (Canny 8/24)** somado ao núcleo colorido (`dif > 18`) → fechamento 9×9 → `fill_holes` (devolve o branco interno) → abertura 5×5 (solta a sombra) → maior corpo → erosão 1 px → antialias. Se a imagem já vier com alfa (ela mandou 3 assim), o alfa dela é respeitado. ⚠️ **Duas tentativas reprovaram antes**: flood fill com tolerância alta e núcleo puro `dif>18` COMEM a parte branca da embalagem (adoçante, leite semidesnatado, biscoito sem açúcar, suco de laranja) — quem pegou foi a Kamylla, olhando. Conferência VISUAL das imagens é obrigatória neste tipo de trabalho.
- **Motor (`lib/informacao-foco.ts`):** `Produto.marca` deixou de ser derivada do nome (a marca é dado do produto); `modelos()` nunca põe dois cartões de mesmo nome na mesma questão; **"Conteúdo" (mL/L) só em líquido e "Peso" (g/kg) só em sólido** (antes um pacote de arroz podia aparecer com "1 litro"); nível 4 monta as cenas a partir do catálogo. `CATALOGO` exportado.
- **6 testes de integridade novos** (imagem existe em disco, PNG RGBA, marca por produto, **nomes únicos e catálogo = 73**, campo coerente com o estado). 205 testes no total.

**✅ RESOLVIDO no mesmo dia — as 3 embalagens de marca real:** ela regerou com marca fictícia (gelatina **Doce Flora**, fermento **Casa Nobre**, leite em pó **Vale do Campo**) e foram integradas (v2.60.2) → catálogo em **73**. Ao recortar apareceu um caso novo: a gelatina veio com **fundo CREME, não branco**, e o método deixava mancha — o script passou a **amostrar a cor do fundo nas bordas** em vez de assumir branco.

<details><summary>Plano original (passos e provas)</summary>

**Fatos medidos antes de começar** (pasta `~/Downloads/Informação em foco`, 80 PNG):
- 20 arquivos `31_…50_` = produtos NOVOS (pasta de amendoim, azeite, mel, geleia, farinha de trigo, açúcar refinado, adoçante, café torrado, achocolatado, leite em pó, aveia fina, chia, linhaça, 2 vinagres, sal rosa, mix de pimentas, ervas finas, gelatina, fermento).
- 50 arquivos `ChatGPT…14:4x` = as ORIGINAIS dos 50 produtos já integrados (nada novo).
- 10 arquivos `ChatGPT…17:18` = produtos NOVOS (pasta de amendoim NutriVale, geleia Frutallis, mel Melora, farinha de mandioca, polvilho doce, goma de tapioca, chocolate 70%, chá verde, molho barbecue, shoyu).
- ⇒ **30 produtos novos** (50 → **80 no catálogo**) e as 80 imagens precisam ficar transparentes.
- Estado atual das imagens do jogo: `public/exercises/informacao-foco-produtos/*.png` são RGBA 360×360 mas **100% opacas** (fundo branco) — no tema GAMIFIED o cartão é escuro (`bg-[#0D2547]`), então o fundo branco vira um quadrado feio. É exatamente o que ela apontou.

**Passos (cada um termina com prova + commit):**
1. **Recorte com alfa real** — pipeline PIL: remove o fundo branco conectado às bordas (inclui a sombra), preserva partes brancas internas da embalagem, normaliza em 360×360 RGBA. *Pronto quando:* verificação automática (cantos com alpha 0, área do produto preservada, 80/80 arquivos) **+ conferência visual minha** das 80 sobre fundo escuro, sem buraco na embalagem nem sobra de fundo.
2. **Catálogo (`lib/informacao-foco.ts`)** — +30 modelos com marca fictícia, categoria, estado e flags coerentes (lactose/açúcar/alérgeno). *Pronto quando:* teste novo de integridade (toda imagem do catálogo existe em disco, nome único, marca definida) + `npm run test` verde + `npx tsc --noEmit` 0.
3. **Exibição** — cartão renderiza o PNG transparente nos 3 temas; bump de versão + `npm run build`. *Pronto quando:* build OK e versão nova no `package.json`.
4. **Publicação** — push na `main` e conferência de `/api/version` em produção.

**Regra do trabalho:** as imagens originais dela ficam intocadas em `~/Downloads/Informação em foco`; o que for sobrescrito em `public/` tem backup datado antes (feito: `~/neuropeak-asset-backups/informacao-foco-produtos-bak-20260801`).

</details>

## Checkpoint (2026-08-01) — Unificação + reescritas: Informação em Foco · Vigilância · Focus · Compra · Dupla Tarefa (v2.47.2 → v2.59.0)

**Sessão longa de refinamento guiado pela Kamylla (ela testava em produção e devolvia ajustes).** Tudo em produção, git limpo, `local = ar = 2.59.0`, **199 testes** (16 arquivos), tsc 0, build OK.

### Decisões de design que valem para TODO o projeto (memória `principio-sem-dica-apos-instrucao`)
- **Depois da instrução, NENHUMA dica ao paciente.** Comando/alvo não fica visível durante a execução (senão vira busca guiada e não treina memória de trabalho/percepção). Focus: barra "ALVO" removida + card com botão **OK**. Vigilância: modelo da pipa só no tutorial, nunca a cada rodada.
- **Cor não pode entregar a resposta** — valores dos cartões em tom neutro; destaque só no feedback, depois de responder.
- **Sessão por TEMPO (~5-7 min), não por nº fixo de questões.**
- **Adaptativo por sequência: 3 acertos ↑ / 3 erros ↓**, silencioso — sem tela de "resultado do bloco" interrompendo.
- **Imagens reais, não emoji**, sempre que houver acervo. **Estímulos não podem ser ambíguos entre si** (óculos de grau × escuros nunca na mesma cena).

### 1. INFORMAÇÃO EM FOCO — NOVO, unifica 2 exercícios (v2.54.0 → v2.59.0) ✅
- **Unifica "Caça Informação" (`caca-item-barato`) + "Mudança de Regras" (`mudanca-regras`)** num só (`informacao-em-foco`, attention/seletiva). Os antigos **saíram do menu** (taxonomia), redirecionam no switch e em `EXERCISE_ALIASES` (`lib/exercise-plan.ts`) — inclusive nos **planos já salvos** do paciente (era por isso que continuavam aparecendo no Início). Ícone herdado do Caça Informação.
- `lib/informacao-foco.ts` (motor PURO, 9 testes rodando 500×/nível): 4 níveis (localizar → comparar → duas condições → situações funcionais), tipos variados (preço/peso/volume/unidades/validade/lactose/açúcar/conservação/sabor/alérgeno), **validação de resposta única**, distratores plausíveis, **balanceamento de posição**.
- Componente: mecânica única (tocar no cartão), tutorial **PARE→LEIA→PROCURE→CONFIRA→RESPONDA**, feedback que ensina onde achar o dado, pista na 1ª errada (2 tentativas), sem auto-avanço.
- **Catálogo 14 → 50 produtos com embalagem real** (imagens que a Kamylla gerou), com slug + **marca fictícia** (`MARCAS`) em `/exercises/informacao-foco-produtos/`. Cartão: imagem grande + nome + marca + campos em linhas. Sem OCR: dados continuam gerados pela lógica.

### 2. VIGILÂNCIA — reescrita completa (v2.55.0 → v2.56.0) ✅
- Era um CPT de letras A/X → virou **8 pipas (7 iguais + 1 diferente)** com **resposta por REGIÃO espacial** (não precisa tocar em cima).
- `lib/vigilancia.ts` (motor PURO, 13 testes): escada de 15 degraus de exposição; adaptativo (2 acertos aceleram / 1 erro mantém / 2 erros desaceleram / 3 erros voltam ao estável); classificação espacial (exata/aproximada = certo, adjacente/distante = erro); contrabalanceamento das 8 posições; ponto estável; bloco de 12.
- **Assets dela** (`~/Desktop/Exercicio Vigilancia`): 6 pares de pipas (tom / nº de laços / orientação) + 4 fundos → `/exercises/vigilancia/` com manifests JSON.
- **v2.56.0 (correção importante):** NÃO reapresentar o modelo a cada rodada. Tutorial de 2 telas + fluxo automático (fixação → pipas piscam → somem → clique na região) + linha-guia no cursor.

### 3. FOCUS AGENTES (v2.51.1 → v2.58.0) ✅
- **Delay das imagens resolvido:** preload das 144 imagens no mount (PNG mantido — WebP ficou maior).
- Personagens **sempre espalhados em 2D** (a queda em linha concentrava numa faixa); mais movimento com a dificuldade.
- **Comando com botão OK** + barra "ALVO" removida; **sem tela de resultado do bloco**; **adaptativo 3↑/3↓**; **não repete o comando anterior**; **óculos de grau × escuros nunca na mesma cena**.

### 4. COMPRA MULTIFUNCIONAL (v2.49.0 → v2.51.0) ✅
- **Layout de 2 painéis** (história sobre fundo temático | missão) conforme mockup dela.
- **Jornadas por LOCAIS nos 6 temas** (`ROTEIRO` em `lib/compra-missoes.ts`): cada missão passeia por lugares coerentes e o fundo alterna por cena — resolveu "só neve, fica repetitivo" e "viajar ao frio e comprar leite".
- **18 fundos aquarela** (`/exercises/compra-fundos/`). Itens com **imagem real** (`IMG_BUSCA` em `data/compra-itens.ts`; resolveu o gorro com cara de boné → `touca.png`). **Auto-avanço ao acertar**. Modo "Variado" **não repete o tema anterior**. Opções de resposta só nos níveis 1-3.

### 5. DUPLA TAREFA (v2.52.0) ✅
- Alvo agora é **CONJUNÇÃO forma+cor: só o TRIÂNGULO VERDE** (era "círculo verde"). Distratores testam as 2 dimensões; losango adicionado. Validado nos 7 casos exigidos.
- Bloco de instruções redesenhado (ícones lucide, sem emoji), layout do mockup, **aviso "REGRA ALTERADA"** nos níveis 8-10.

### 6. TEMPO DE REAÇÃO (v2.48.1) ✅
- **Velocidade proporcional ao nº de alvos** (+40% de travessia por alvo extra) — com 2-3 balões ficava impossível.
- **Uma direção por leva** (sem misturar lados) + **distratores azul-esverdeados** com aviso no tutorial.

### 7. MOT (v2.48.0) ✅
- Arena finalmente maior: passou a medir `window.innerWidth/innerHeight` direto (o `clientWidth` do wrapper vinha travado pequeno); bolas menores e mais espaçadas.

### Pendências para a próxima sessão
1. **Informação em Foco:** integrar as **20 imagens restantes** (mel, geleia, adoçante, chia, linhaça, vinagres, sal rosa, ervas… em `~/Downloads/Informação em foco` — precisam virar produtos novos no catálogo); **Fase 2** = painel de config do profissional (~40 opções), relatório detalhado por categoria, custo-benefício (off por padrão), acessibilidade completa, confirmação de impulsividade.
2. **Vigilância — Fase 3:** salvamento/retomada individual (não voltar ao nível 1), registro por tentativa, precisão técnica (`performance.now`), relatório profissional, config, calibração formal.
3. **Focus — Fases 3/4:** registros detalhados do profissional e painel de acessibilidade (spec de 18 seções).
4. **Compra Multifuncional:** gerar embalagens variadas (vários leites/iogurtes) se ela quiser comparações do mesmo tipo.
5. **Aguardando teste dela** em tudo que subiu hoje (ela valida em produção e devolve ajustes).

---

## Checkpoint (2026-07-12) — Sessão de reformas: Focus Chuva · Cubo Corsi · Span Auditivo · Perf de imagens (v2.17.1 → v2.27.1)

**Modelo de operação (CORRIGIDO em 01/ago/2026):** a sessão **orquestra em Opus 5, esforço xhigh FIXO** — padrão definido pela Kamylla, **não negociável**; nunca baixar modelo/esforço (fatiar o trabalho, sim). O que vale do método: verificar TUDO com evidência própria (probes, geometria, build, produção) antes de aceitar; loop de devolução até passar. Memória: `modelo-operacao-opus5-xhigh`. ⚠️ O texto original deste checkpoint dizia "Fable orquestra" — **estava errado** (veio de uma sessão cujo orquestrador era outro modelo) e foi corrigido; a memória antiga foi apagada.

### 1. Performance de imagens (v2.17.1-2.17.3) ✅
- Todas as pastas de imagem usadas otimizadas: 421→110 MB (historias 193→51, pet 136→7…); 1530 PNGs verificados vs backup (0 perda de alfa). Backups em `~/neuropeak-asset-backups/`.
- Cache 7 dias p/ `/exercises|/pet|/petimg|/skilltree` (next.config.js) — ⚠️ trocar imagem mantendo nome = usar cache-bust (`AGENT_V` etc.).
- Restaurante: preload da cena com prioridade, plaquinha vidro translúcido; repo: ~486 MB de matéria-prima removida do versionamento (backup + .gitignore).

### 2. Restaurante — som ambiente (v2.18.x) ✅
- Gravação REAL de restaurante (domínio público/Wikimedia) em loop sem emenda 74s, ganho 0.20 (bem baixo, distrator de fundo), botão 🔊/🔇. Arquivo: `audio/ambience-restaurante-real.m4a`.

### 3. FOCUS AGENTS — épico "Chuva de Agentes" (v2.19-2.27) ✅ APROVADO ("agora ficou muito bom")
- **Modo Foco = FocusRain.tsx** (queda vertical); Inibição/Alternância/Desafio seguem na arena (intocados, guard `mode==="foco"`).
- **Ciclo da tarefa (modelo da Kamylla):** card com comando + botão Começar → chuva cai (distratores 1º; alvo NUNCA antes de ≥7 distratores e ≥2,6 s) → 1 toque decide: acertou→próximo card · errou→tarefa ACABA na hora→próximo card (nota "Não foi dessa vez") · alvo escapa 2×→omissão. **3 acertos seguidos = SOBE nível · 2 falhas seguidas = DESCE nível (piso 1)** — nível/velocidade novos valem só a partir do comando seguinte.
- **Comandos:** SÓ combinados (cor+feature, 102 regras; "Ache o agente amarelo com skate", 1 linha no card); multi-alvo N5-6=2, N7=3 ("…e o vermelho de bermuda"); comando SOME durante a busca (memória de trabalho).
- **Física:** velocidade UNIFORME calculada por quadro (ninguém ultrapassa; exceção = 2ª chance do alvo, mais rápida); chuva CONTÍNUA (fallers ficam entre comandos, congelam atrás do card; `ruleOk`+cull garantem 0 conflito com o novo comando); entrada ritmada (fallMs/maxC) + distância mínima no nascimento (0.8×CHAR_SIZE, banda 1.2×CHAR_H).
- **Calibração FINAL (decisão dela):** tamanho (CHAR_SIZE=100) e densidade (areaPerAgent=42000) PADRÃO em todos os níveis; progressão = só velocidade (fallMs 7200→3900) + comandos mais complexos (nearFrac 0.90→1.0 + multi-alvo).
- **Elenco:** 144 imagens (42 base + 102 features da Kamylla: futebol/basquete±lado, skate/bermuda, óculos-escuro, balão/pipa/guarda-chuva, chapéu/coroa/gorro, alegria/tristeza/raiva, luva). Símbolos e cinza REMOVIDOS. Imagens NORMALIZADAS PELO BONECO (360px fixos em canvas 360×540, âncora rosto→pés) — boneco na tela = CHAR_SIZE. Cache `?v=9`.
- **Pendente (único degrau):** comando com correção ("à esquerda… não, à direita").

### 4. CUBO CORSI — redesign completo (v2.24.4-2.25.2) ✅
- **Ciclo:** cubo VIRA primeiro (1,1 s, ease-in-out sem overshoot) → face ~80% de frente (desvio 9-13°, provado por geometria) → peça PISCA de frente (0,85 s) → volta suave ao canto. TODA peça faz o ciclo (mesma face repetida também). Tutorial usa o MESMO ciclo (pose controlada — antes truncava).
- **Visual (paleta da Kamylla, estilo Cogmed):** estrutura #9EBEDD, bordas #82A9CF (finas, 1px, gap 3,2%), placas #F7FBFF, luz #4F8FEA, fundo #F4F7FB, sombra = ELIPSE separada no chão (⚠️ NUNCA `filter` no elemento 3D — achata o preserve-3d; já quebrou 1×).
- Cubo maior: S=0.52×size, size 540 (jogo) / 380-420 (tutorial).

### 5. SPAN NUMÉRICO AUDITIVO (Direto+Inverso) — redesign (v2.27.0-2.27.1) ✅
- Painel 3×3 (1-9, SEM 0) estilo referência, paleta azul-clara (luz #4F8FEA); sequência sorteia 1-9 SEM repetição (shuffle+slice).
- Apresentação: tecla do número falado PISCA em sincronia com o áudio (ambos os modos); bolinhas preenchem na fala.
- INVERSO: bolinhas VIRAM 1× ao fim da fala (rotate 180, anel marca o início→vai pro outro lado) — dica sutil sem números; fileira do input nasce já virada (fix do giro duplo).
- Resposta clicando no painel, sem dica de texto. Tema claro em tudo (Ready/feedback).

### Lições/regras de trabalho (memória `licao-regressoes-visuais`)
- NUNCA `filter/drop-shadow` em elemento 3D. Mudança em coisa APROVADA = verificação visual/geométrica ANTES de publicar. Normalizar personagens pelo BONECO, não pelo bbox. `tsc` via pipe esconde o exit code (usar `npx tsc --noEmit; echo $?`).

### Pendências para a próxima sessão
1. Focus: degrau "comando com correção" ("…não, à direita").
2. Focus: replicar a chuva (ou decidir) p/ Inibição/Alternância/Desafio — hoje seguem na arena antiga.
3. Compra Multifuncional: redesign cognitivo pendente (spec em COMPRA-MULTIFUNCIONAL-REDESIGN.md).
4. Skate azul: Kamylla mencionou versão corrigida fora da pasta do projeto — se reaparecer, lembrar que o jogo lê `public/exercises/agentes-personagens/` (e subir AGENT_V).
5. Dívida técnica: docs/DIVIDA-TECNICA.md e BACKLOG.md.

---

## Checkpoint (2026-07-10) — Auditoria completa v2 + documentação · Fases 0-2 concluídas

**Sessão de auditoria + documentação. Regra: código-fonte intocável; escritas restritas a relatório de auditoria, docs, PROGRESSO.md e BACKLOG.md. Sem commit/push sem ordem explícita.**

**Fases 1-2 concluídas — relatório em `docs/auditoria/AUDITORIA-2026-07-10.md`.** 5 dimensões auditadas em Opus (Correção em 2 passadas por causa do volume; Segurança precisou de 3 tentativas por falha de saída estruturada, entregue em markdown; nenhuma dimensão ficou sem cobertura). **55 findings brutos → 54 ativos** (GER-003 consolidado em CORR-004). Verificação adversarial dos 8 P1: **8 CONFIRMADOS, 0 refutados**, mas 6 rebaixados por mitigadores reais. Placar final verificado: **0 P0 · 1 P1 · 27 P2 · 26 P3**. Único P1: **SEC-001** (sem rate limiting no login por PIN — brute-force de credencial clínica). Eixos principais: (a) fidelidade da métrica clínica dos exercícios (CORR-001/004/008/009/013/014/015…), (b) acesso/segurança (SEC-001/002/003), (c) dívida arquitetural (ARQ-001 metadados triplicados; ARQ-002 pet/skill só em localStorage; ARQ-003/004 exercícios órfãos) e supply chain (GER-001 db:seed quebrado; GER-002 deps não usadas). Descoberta relevante: **next instalado é 15.5.18** (não o 15.3.9 do package.json) → CVE-2025-29927 não se aplica. Nada corrigido (auditoria só propõe). Avaliação geral: base saudável (tsc 0, 24 testes, build ok, isolamento multi-tenant consistente, baseline de 30/05 intacto); trabalho recomendado lidera por SEC-001 + bloco de fidelidade clínica.

**Fase 0 — inventário (tudo medido em 2026-07-10):**
- Versão: 2.11.1 (`package.json:3`). Código: ~40.8k linhas TS/TSX — app/ 52 arq (7.353 l), components/ 102 (27.214, sendo 47 .tsx em exercises/), lib/ 31 (29+2 testes; 3.570 l), data/ 7 (2.096), types/ 3 (585), prisma/schema.prisma (156 l).
- Verificações executadas: `npm run test` → 24/24 OK (vitest 4.1.7); `npx tsc --noEmit` → exit 0; `npm run lint` → 5 warnings/0 errors; `npm run build` → OK nesta sessão.
- Superfície externa: 22 rotas em `app/api/**/route.ts` (autoprotegidas; middleware NÃO cobre /api) + `middleware.ts` com 12 prefixos por role + cron `0 8 * * *` UTC (`vercel.json`). Auth: NextAuth v4 JWT 8h, providers `therapist-login` e `patient-pin` (`lib/auth.ts`).
- Fluxo central: `app/(patient)/treino/[exercicio]/page.tsx` (37 exercícios lazy via switch) → `ExerciseWrapper` (instructions→exercise→results) → `POST /api/sessions` → progressão server-side em `lib/adaptive.ts` (progressionV2 genérica, story-trail, dual-task, legado) → upsert `ExerciseConfig` + achievements + alerts.
- Persistência: banco é fonte-da-verdade (Session/ExerciseConfig); localStorage só caches (np_session_dia, XP jornada, pet, np-focus-day).
- Sinais levantados pelos scouts (A CONFIRMAR na Fase 1/2, não são findings ainda): página `/admin` sem checagem server-side de ADMIN_EMAIL (APIs subjacentes protegem); `reset-password`/`redeem-license` fora do `withApiHandler`; `useAdaptiveLevel` sem importadores; `calculateDomainScore` cobre 4 dos 5 domínios (functional fora); percentis/NORMATIVE_BENCHMARKS documentados mas inexistentes no código; CSP com unsafe-inline/unsafe-eval; PIN retornado em claro na criação de paciente; `app/auth/` e `components/reports/` vazias.
- Docs da raiz (ciclo 2026-05-30/06-03) gravemente defasadas: versões 1.9.5/1.16.6 vs 2.11.1; "4 domínios" vs 5 reais (`types/index.ts:4`); ids inexistentes citados (associacao-pares, decisao-rapida, atencao-*); contagens erradas (attention 11 vs 8; memory 9 vs 15; "~36 componentes" vs 47). Reescrita prevista na Fase 3.

**Plano de fases:** F1 = 5 auditores independentes (CORRETUDE/SEGURANÇA/ARQUITETURA/PERFORMANCE/GERAL; ondas ≤3; finding padronizado P0–P3 com evidência e confiança) → F2 = verificação adversarial de todo P0/P1 + consolidação em `docs/auditoria/AUDITORIA-2026-07-10.md` (sem corrigir nada) → F3 = docs derivadas do código real (CLAUDE.md, README.md, docs/ARCHITECTURE.md, docs/ADR/, docs/DIVIDA-TECNICA.md, CHANGELOG.md, PROGRESSO/BACKLOG) → F4 = validação independente das docs.

**Fase 3 concluída (docs derivadas do código real, tudo medido):** `CLAUDE.md` reescrito (145 l, <200) · `README.md` novo · `CHANGELOG.md` novo · `docs/ARCHITECTURE.md` (385 l, agente Opus) · `docs/ADR/ADR-001..008` + índice (agente Opus) · `docs/DIVIDA-TECNICA.md` (54 findings por ID) · `BACKLOG.md` reescrito · `ARCHITECTURE.md` da raiz virou stub → aponta para `docs/ARCHITECTURE.md`. Inventário-base: 39 exercícios (switch=EXERCISE_DEFINITIONS=39), 5 domínios, taxonomia mapeia 35, fantasma `atencao-dividida`, órfão `desafio-cidade`.

**Fase 4 concluída (validação independente por 2 doc-reviewer Opus, read-only).** Validador 1 (CLAUDE/README/ARCHITECTURE): **0 bloqueadores** — CLAUDE e README APROVADOS; ARCHITECTURE com 4 menores (linhas TS/TSX 40.933→40.8k, schema 157→156, "~37 componentes"→39, "componente fantasma"→"id fantasma/componente órfão") — **todos corrigidos**. Validador 2 (ADRs/DIVIDA/CHANGELOG/BACKLOG): 1 bloqueador + 3 menores — o bloqueador era o CHANGELOG atribuir o RLS à auditoria de 05-30; na verdade o RLS foi habilitado em ação separada de 2026-06-02 (PROGRESSO.md:27), então **corrigido atribuindo ao evento certo** (não removido); menores (452 commits "no total", CORR-004 "(consolida GER-003)" na Dívida, afirmação de linhas do BACKLOG suavizada) — **todos corrigidos**. Contagens 1 P1/27 P2/26 P3/54 batem entre auditoria, Dívida e Backlog; 24 âncoras das ADRs verificadas; testes/tsc/lint reexecutados pelos validadores e confirmados. **Documentação declarada pronta.** Nenhum código foi tocado em toda a sessão.

---

## Checkpoint (2026-06-02) — RLS habilitado no banco de produção

**Contexto:** Supabase enviou alerta de segurança (`rls_disabled_in_public` + `sensitive_columns_exposed`) em 31/05. Causa: o Prisma cria as tabelas no schema `public` e nunca habilita RLS, mas o Supabase expõe esse schema via API REST (PostgREST) pública — sem RLS, qualquer um com URL+`anon` poderia ler/editar tudo. Mitigação prévia (não-defesa): o app **não** expõe `anon`/URL no client (zero `NEXT_PUBLIC_SUPABASE_*`); supabase-js só roda server-side com `service_role`, e só para storage de CRP. Toda query de dado é via Prisma.

**Correção aplicada (via SQL Editor do Supabase, role `postgres`, prod):** `ENABLE ROW LEVEL SECURITY` em todas as 10 tabelas do `public` (Achievement, Alert, ExerciseConfig, LicenseCode, PasswordResetToken, Patient, Session, TherapeuticSession, TrainingPlan, User) — **sem políticas e sem FORCE**. Verificação `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public'` retornou `rowsecurity = true` nas 10. O Prisma continua acessando porque conecta como **dono** das tabelas (ignora RLS sem FORCE); a API `anon` vira deny-all.

**⚠️ Pendências relacionadas:**
- **Validação funcional do app** após o RLS (login + dashboard carrega pacientes + salvar sessão) — confirmar que o role do app realmente bypassa RLS. Rollback de emergência se quebrar: `... DISABLE ROW LEVEL SECURITY`.
- **RLS não cobre a `service_role`** (ela ignora RLS). A rotação de `service_role key` + senha do banco (exposição de 30/05) **continua pendente** — adiada por decisão do usuário.
- Incidente de processo: dois blocos SQL quase idênticos (ENABLE/DISABLE) na mesma mensagem causaram execução acidental do DISABLE primeiro (sem dano — tabelas já estavam sem RLS). Corrigido na sequência.

---

## Estado atual (2026-05-30)

**Versão:** 1.9.5 (`699a34a`) — sincronizada com `origin/main` após `git pull`.
**Atividade:** Auditoria completa + correção de quase todo o backlog (sessão ultracode — workflow + agentes). Status detalhado em `AUDITORIA-2026-05-30.md`.

### Backlog — fechamento da sessão ultracode (2026-05-30)

**✅ RESOLVIDO e validado (tsc + lint + build + 24 testes, todos exit 0). 5 commits LOCAIS (NÃO pushed): 28fdc32, ce147db, 964f646, e9bb59f, 1b3060d.**
- Backend/segurança/qualidade: SEC-04 (CRP gate server-side), SEC-06 (images host), SEC-07 (timingSafeEqual+fail-closed), SEC-09 (security headers/CSP), QUAL-01 (health), QUAL-02 (error boundaries), QUAL-03 (.env.example), QUAL-04 (email hardcoded), QUAL-05 (middleware matcher), BUG-04 (adesão÷0), CSPRNG (randomInt), REL-04 (mailer), REL-05 (CRP upload), DUP-03/04 (helpers), LINT-01 (ESLint8 + fix useId condicional).
- Exercícios: PERF-01 (FocusAgents rAF), PERF-03 (MOT rAF), REL-03 (timers cleanup), BUG-06 (race NBack), DUP-02 (TTS — parcial), ARCH-01+DEAD-01 (dead code).
- TEST-01 (Vitest, 24 testes, regressão de BUG-01/BUG-04). A11Y-01 (aria-labels). BUG-05 avaliado e descartado (não era bug).

**⏸️ DEFERIDO (não são fixes seguros — justificativa honesta):**
- **DUP-01** (tokens de tema em ~30 exercícios): NÃO é refactor "mesmas strings" — os exercícios HOJE divergem no tema; consolidar = unificar visual = mudança de DESIGN + regressão visual garantida. É projeto de design dedicado + smoke test, não fix cego.
- ~~**PERF-02** (over-fetch dashboard)~~ → ✅ **RESOLVIDO 2026-05-30**: `dashboard/page.tsx` agora usa `$queryRaw` com window function (`ROW_NUMBER() OVER (PARTITION BY patientId ORDER BY completedAt DESC) <= 20`) — top-20 sessões por paciente em vez do histórico inteiro. Equivale ao `.slice(0,20)` que o código já fazia (sem regressão). Validado: tsc 0 + eslint 0 + build 0 + query no banco real (`ok=true`, nomes de coluna e window function corretos). Ganho atual ~zero (1 paciente/6 sessões), preventivo contra crescimento sem limite.
- **ARCH-02** (quebrar god-files de ~1150 linhas): refatoração estrutural de alto risco / zero valor funcional em produção. Pular.

**✅ SCHEMA-01 — APLICADO NO BANCO DE PRODUÇÃO (2026-05-30):**
- Código: FKs `TherapeuticSession.patient/therapist` (`onDelete: Cascade`) + `Patient.therapist` (`onDelete: Restrict`) no `schema.prisma` (commit `641bff5`). Validado: prisma generate + tsc + build, todos 0.
- Banco (Supabase prod, via SQL Editor): diagnóstico (score/accuracy/difficulty 0 fora; 3 `TherapeuticSession` órfãs de paciente deletado) → `DELETE` das 3 órfãs → `BEGIN/COMMIT` criando 2 FKs (`ON DELETE CASCADE`) + 3 CHECK (`session_score_range` 0–100, `session_accuracy_range` 0–1, `session_difficulty_range` 1–10).
- Verificação independente: `pg_get_constraintdef` confirmou as 6 constraints + `Patient.therapist` = `RESTRICT` (= schema). Banco 100% alinhado com `schema.prisma` → `db push` futuro não mexe nas FKs (só as CHECK ficam fora do schema — reaplicar se houver `db push`).
- Impacto no código verificado (benigno): create de TherapeuticSession usa therapistId/patientId comprovadamente existentes; delete de paciente agora cascateia (corrige o bug das órfãs); não há rota que delete terapeuta.

**✅ SEC-08 — EXECUTADO (2026-05-30):** `NEXTAUTH_SECRET` rotacionado via Vercel CLI (conta `neuropsikamylla-blip`, projeto `neuropeak-5jyl`). Secret forte (64 chars, `openssl rand -base64 48`) em Production; redeploy `vercel --prod` → `dpl_8zMx8EV4KWW2Vr8UJex4mcH2m8wd` (READY, aliado a `neuropeak-5jyl.vercel.app`); verificado por buildId novo + `/api/health ok`. Secret fraco (`…2024`) eliminado de todos os ambientes. **Preview ficou sem o secret** (CLI não-interativo não cria preview "all branches"; resolver na web se previews forem usados — não é risco de segurança).

**🔧 OPERACIONAL (restante):**
- **SUP-02**: nodemailer CVE moderate — sem fix disponível; monitorar.

**⚠️ Antes de push/deploy:** smoke test visual dos exercícios com animação (MOT, FocusAgents — PERF-01/03 trocaram o mecanismo de animação; build não pega regressão visual).

> A 1ª auditoria (skill `/auditor`) rodou em execução única (sem dispatch de sub-agentes) e só amostrou os exercícios. A 2ª rodada (5 agentes via ferramenta `Agent`) encontrou **6 críticos + 9 altos NOVOS** não detectados antes — incluindo IDORs sistêmicos e SEC-02 no `sessions/route.ts` (arquivo que eu havia editado para o fix A1 sem notar o IDOR de THERAPIST).

---

## Auditoria — sessão 2026-05-30

Auditoria completa das 5 dimensões (correctness, architecture, security, performance, general)
sobre toda a base (~149 arquivos). Cada achado Crítico/Alto foi **verificado lendo o código real**
antes de corrigir (regra: zero suposições como fatos).

### ✅ Corrigido nesta sessão (código puro, sem migração, tsc limpo)

| ID | Severidade | Arquivo | Correção |
|----|-----------|---------|----------|
| C1+A4 | Crítico/Alto | `app/api/therapeutic-sessions/[id]/route.ts` | Ownership check (GET+PATCH) + allowlist Zod (anti mass-assignment) + paciente não recebe `therapistNotes` |
| A1 | Alto | `app/api/sessions/route.ts` | `score: z.number().min(0).max(100)` (era sem teto) |
| A2 | Alto | `app/api/patients/[id]/route.ts` | GET com `select` restrito por role — paciente só recebe `id/birthDate/theme/exerciseConfigs`, nunca dados clínicos |
| A3 | Alto | `app/(patient)/treino/[exercicio]/page.tsx` | Bug: `dateOfBirth` → `birthDate` (campo não existia; `patientAge` era sempre `undefined`) |
| M6 | Médio | `app/api/patients/route.ts` | Decremento de licença em `$transaction` com `updateMany` condicional (anti race) |

**Validação:** `npx tsc --noEmit` → exit 0. **Ainda NÃO commitado nem deployado.**

### ⏳ Pendente de DECISÃO do usuário (envolvem migração de banco / mudança de produto)

- **C2 (Crítico)** — `pinPlain` (PIN em texto plano) em `schema.prisma:42`, gravado em `patients/route.ts:83`
  e exibível em `PatientCredentials.tsx`. Remover exige migração Prisma (drop column) + decisão de UX
  (como o terapeuta passa o PIN ao paciente). **Não tocar sem aval.**
- **M5 (Médio)** — `TherapeuticSession` sem FK/relação (`patientId`/`therapistId` são strings soltas);
  `Patient.therapist` sem `onDelete`. Exige migração de schema.
- **A1-completo** — recalcular score no servidor (refatoração; `lib/scoring.ts` roda no cliente hoje).

### 📋 Achados não corrigidos (menor severidade — backlog)

M1 (sem rate limit em auth), M2 (comparação não time-safe de segredos), M3 (`Math.random()` em PIN/código),
M4 (`images.remotePatterns: "**"`), B1 (componente órfão `AtencaoDividida.tsx`), B2 (shuffle enviesado em
`selectTargets.ts`), B3 (timezone em reports), B4 (XSS baixo em mailer), B5 (`.gitignore` sem `.env`),
B6 (scoring acoplado cliente/servidor), B7 (admin por e-mail).

---

## Próximos passos (revisados após auditoria completa)

Prioridade por bloco — ver `AUDITORIA-2026-05-30.md` para detalhes/IDs:
1. ✅ **CONCLUÍDO (2026-05-30) — Bloco crítico de código puro:** SEC-01/02/03 (3 IDORs multi-tenant fechados: GET/POST therapeutic-sessions + POST sessions THERAPIST), BUG-01 (`hasConsecutiveDays` corrigido com locale en-CA — comprovado por execução), SUP-01 (Next.js 15.3.9→15.5.18 via `npm audit fix`, CVE HIGH resolvido). Validado: `tsc` exit 0 + `npm run build` exit 0 + `npm audit` 0 high. **Não commitado (acumulando).**
1b. ✅ **CONCLUÍDO — Bugs clínicos de exercício:** BUG-02 (DeductiveGrid — múltiplos "yes" por pessoa impedidos na raiz no `cycleCellState`) e BUG-03 (DesafioCidade — nível inicial clampado ao teto real de cada ambiente via `MAX_LVL`). Validados tsc+build.
2. **C2 ✅ CONCLUÍDO COMPLETAMENTE (2026-05-30):** pinPlain removido do código (commit 59b8539) + coluna dropada do Supabase de produção via `ALTER TABLE "Patient" DROP COLUMN IF EXISTS "pinPlain"`. PINs em texto plano eliminados de todas as camadas (código + banco). SEC-04 (CRP gate server-side) e A1-completo (score server-side) seguem pendentes.
3. **Rede de proteção:** REL-02 ✅ CONCLUÍDO (transações + claim atômico em redeem-license, reset-password, therapeutic-sessions POST, patients PATCH). REL-01 ✅ CONCLUÍDO: helper `lib/api-handler.ts` (`withApiHandler`) em TODAS as 20 rotas que fazem I/O (try/catch + logging padronizado). Só `auth/[...nextauth]` (gerenciado) e `version` (sem I/O) ficaram de fora, com justificativa. Mapa de cobertura: 0 faltas. TEST-01 (Vitest p/ lib/) e LINT-01 (ESLint) ainda pendentes. Validado: tsc + build exit 0.
4. **Backlog médio/baixo:** ver relatório.
5. Subir: commit + push (e deploy Vercel se aprovado) — **com aval humano**. Decisão: acumular até fechar os críticos.

## Performance — FocusAgents (2026-05-30)

Refatoração de `components/exercises/attention/FocusAgents.tsx` (frente paralela ao redesign visual):

- **PERF-01 ✅ CONCLUÍDO** — Loop de queda dos "fallers" migrado de `setInterval(~TICK_MS, ~20fps)` +
  `setFallerPositions` por tick (que re-renderizava SceneBg/HUD/órbitas ~20x/s) para
  `requestAnimationFrame` + mutação direta de `node.style.transform` via `Map<uid, HTMLDivElement>`
  (callback ref). Padrão idêntico ao já aplicado em `MOT.tsx` (PERF-03). Detalhes:
  - Física viva em `fallersRef`; base renderizada (top px / left %) capturada em `fallerBaseRef` no
    início do play; transform = delta sobre a base. Helper puro `fallerXPct(f, y)` compartilhado entre
    render e rAF (garante paridade exata; X depende do Y via `xBase + xAmp*sin(y/xFreq...)`).
  - Velocidade normalizada por `dt/TICK_MS` (com clamp de dt a 100ms) → física idêntica ao interval
    antigo independente da taxa de frames do rAF. **Crítico**: sem isso a queda triplicaria a 60fps.
  - `setState` só em eventos discretos: init de round, mudança de passagem do alvo (`setTargetPass`,
    agora disparado só na transição via `targetPassRef`), timeout e `handleResult`.
  - `transform` omitido do style durante `playing` (rAF controla); zerado no feedback. `handleResult`
    e o ramo de timeout fazem `setFallerPositions([...fallersRef.current])` para congelar na posição
    real e evitar "salto" dos agentes na transição playing→feedback.
  - Cleanup: `stopFallAnimation` agora faz `cancelAnimationFrame`; o useEffect de unmount já o chama.
- **DUP-02 ✅ JÁ RESOLVIDO** — FocusAgents já consumia `playTTS`/`cancelTTS` de `@/lib/tts` (não havia
  Web Speech local; `speakFn` é só um wrapper que respeita `forceMode === "visual"`). Nada alterado.
- **Validação:** `npx tsc --noEmit` exit 0 + `eslint` no arquivo exit 0. Build NÃO rodado (orquestrador
  roda depois com NEXTAUTH_URL setada). Comportamento preservado: física/velocidade/posições, hit-test
  por agente, fluxo de comandos, TTS e visual — verificados por trace matemático do delta de transform.

## Notas importantes

- App clínico (LGPD): dados sensíveis de pacientes. Achados de segurança têm peso real.
- A skill `auditor` não conseguiu usar dispatch de sub-agentes neste ambiente; auditoria foi
  feita em execução direta + verificação manual de cada Crítico/Alto.
- `package-lock.json` tinha alteração local espúria (descartada — usuário nunca editou o app localmente).
