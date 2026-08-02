# Dívida técnica — NeuroPeak

> ## ⚠️ AVISO — LISTA PODADA EM 02/08/2026 CONTRA O CÓDIGO
> **Leia isto antes de usar qualquer item desta página.**
>
> As listas **P1/P2/P3** eram a fotografia congelada da auditoria de 2026-07-10 e nunca tinham
> sido podadas: item já corrigido continuava aparecendo como pendente, em contradição com o
> bloco de progresso. Em **02/08/2026** cada item foi reauditado **no código**: os resolvidos
> saíram das listas e foram para a seção [Resolvidos (histórico)](#resolvidos-histórico--verificados-no-código-em-02082026),
> cada um com a evidência `arquivo:linha` que sustenta o veredito. As listas P1/P2/P3 abaixo
> contêm agora **só o que estava pendente naquela data**.
>
> **Ressalva honesta:** esta também é uma foto, e foto envelhece. Nada garante que ela continue
> verdadeira daqui a algumas versões — e a poda de hoje não substitui a verificação de amanhã.
> **A regra segue valendo: antes de abrir tarefa sobre qualquer item, confirmar no repositório
> que o defeito ainda existe. Na dúvida, o código manda, não este arquivo.**
>
> Quem resolver um item: **mover** para "Resolvidos (histórico)" com a evidência, nunca apagar —
> o histórico é o que impede alguém de reconsertar o que já está feito.

> Espelho dos achados da auditoria de 2026-07-10. Cada item referencia o ID
> estável do relatório completo em [`auditoria/AUDITORIA-2026-07-10.md`](./auditoria/AUDITORIA-2026-07-10.md),
> onde estão a evidência `arquivo:linha`, o cenário e a verificação adversarial.
> Severidades já refletem o ajuste da verificação (Fase 2). Os itens `ARQ-010` e `CORR-021`
> **não** vêm daquela auditoria: nasceram da reauditoria de 02/08/2026.

## Panorama

Contagem **de pendentes**, após a poda de 02/08/2026:

| Severidade | Pendentes |
|---|---|
| P1 — impacto alto | 0 |
| P2 — médio / dívida relevante | 10 |
| P3 — menor | 18 |
| **Resolvidos (histórico)** | **28** |

Total de itens rastreados: 56 (54 da auditoria de 2026-07-10 + 2 abertos em 02/08/2026).

**Eixos do que resta:** (a) segurança/acesso (SEC-002/003/004/006/008); (b) dívida arquitetural
(3 fontes de verdade de metadados, god files, tokens de tema, exercício órfão, código morto);
(c) fidelidade da métrica em pontos específicos (tetos de progressão, dupla progressão,
sessões abandonadas). Nenhum P0. O eixo de segurança de autenticação (SEC-001/005/007) saiu.

## P1 — tratar primeiro

(vazia)

## P2 — médio / dívida relevante

- **[ARQ-003]** Exercício órfão: desafio-cidade **REMOVED_FROM_CURRENT_CATALOG** (1.146 linhas) existe, é filtrado de planos e invisível no catálogo — `components/exercises/executive/DesafioCidade.tsx`. _Adiado de propósito: precisa decisão de produto (aposentar ou reativar)._
- **[CORR-005]** Dupla progressão: exercícios progressionV2 sobem o nível no cliente e o servidor sobe de novo — `app/api/sessions/route.ts`.
- **[CORR-012]** Semáforo: startRound dentro de handleResponse pode usar closure obsoleto — `components/exercises/processing/Semaforo.tsx`.
- **[CORR-016]** LetrasSequencia: número de distratores travado em 2 (Math.min(2,4)) — `components/exercises/memory/LetrasSequencia.tsx`.
- **[CORR-021]** _(aberto em 02/08/2026 — ressalva herdada do CORR-006)_ Teto da progressão do Foco é 9, mas Agentes Focus tem **13 passos**: `calculateFocusProgression` clampa em 9 e só sobe enquanto `lvl < 9`, então a progressão salva no servidor nunca alcança os 4 últimos passos do exercício — `lib/adaptive.ts:149-151` × `components/exercises/attention/FocusAgents.tsx:59-67`.
- **[GER-004]** Cobertura de testes: novas engines de progressão (dual-task, story-trail, focus, genérica) sem teste — `lib/adaptive.ts`.
- **[GER-006]** Bloqueio '1x por dia' é só client-side; servidor não valida — `app/(patient)/treino/[exercicio]/page.tsx`. _Adiado de propósito: mudança de maior risco e baixo benefício prático — o cliente já bloqueia e o fuso está consistente desde v2.11.4._
- **[PERF-002]** POST /api/sessions executa ~8-11 round-trips sequenciais ao banco no caminho quente — `app/api/sessions/route.ts`. _Adiado de propósito: sem impacto no volume real._
- **[SEC-002]** Paciente pode gravar campos clínicos do terapeuta via PATCH da sessão terapêutica — `app/api/therapeutic-sessions/[id]/route.ts`.
- **[SEC-003]** Hash do PIN do paciente devolvido ao cliente (findMany/findUnique sem select) — `app/api/patients/route.ts`.

## P3 — menor

- **[ARQ-001]** Metadados de exercício triplicados e divergentes entre 3 fontes de verdade — `types/index.ts / lib/domain-taxonomy.ts / lib/exercise-meta.ts`. ⚠️ O registro por versão preservado abaixo dá ARQ-001 como resolvido em v2.12.1; a reauditoria de 02/08/2026 o manteve **pendente**. Divergência sinalizada, não arbitrada aqui — resolver no código antes de agir.
- **[ARQ-006]** Fluxo central em god file: switch de 39 casos + EXERCISE_INSTRUCTIONS + HIDE_PROGRESS_WIDGET forçam registro do exercício em 6+ lugares — `app/(patient)/treino/[exercicio]/page.tsx`. _Adiado de propósito: refactor de alto risco e ganho funcional zero._
- **[ARQ-007]** God files crescentes e novos desde a auditoria de 30/05 (ARCH-02 deferido segue piorando) — `components/exercises/attention/FocusAgents.tsx / utils/generateCommand.ts / components/exercises/executive/DesafioCidade.tsx`. _Adiado de propósito, junto com ARQ-006._
- **[ARQ-008]** Objeto themeStyles CLINICAL/COLORFUL/GAMIFIED reimplementado por arquivo (DUP-01 deferido segue aberto) — `components/exercises/ExerciseWrapper.tsx (e ~7 outros)`. _Adiado de propósito: unificar tokens é mudança de design._
- **[ARQ-010]** _(aberto em 02/08/2026 — ressalva herdada do ARQ-005)_ Dead code **novo e maior** que o do ARQ-005: `utils/generateCommand.ts` (1.477 linhas, inclui o `buildRound` do achado original em :607) e `components/exercises/attention/FocusRain.tsx` (1.056 linhas) estão órfãos — **zero importadores** em todo o repositório — `utils/generateCommand.ts / components/exercises/attention/FocusRain.tsx`.
- **[CORR-007]** Sessoes abandonadas (score 0) da Ordem da Historia poluem PERFORMANCE_DROP e conquistas de outros exercicios — `app/api/sessions/route.ts`.
- **[CORR-018]** TempoReacao: IDs de balões podem colidir no mesmo lote — `components/exercises/attention/TempoReacao.tsx`.
- **[GER-009]** Parsing de datas do relatório mistura UTC e hora local do servidor — `app/api/reports/route.ts`.
- **[GER-010]** next-lint deprecado; migração para ESLint CLI pendente (Next 16) — `package.json`.
- **[GER-011]** **13** warnings de ESLint (eram 5 na auditoria de 2026-07-10): `react-hooks/exhaustive-deps` (FocusAgents ×2, Labirinto, CaminhosMeta, MatrizEspacial), ref-cleanup (CuboCorsi, PadroesRotacao) e `@next/next/no-img-element` (Vigilancia ×4, AssetImage, EstacionamentoLogico) — `components/exercises/executive/Labirinto.tsx (e mais 7 arquivos)`.
- **[GER-012]** Seed cria credenciais fracas e previsíveis (senha e PINs hardcoded) — `prisma/seed.ts`.
- **[PERF-003]** FocusAgents pré-carrega e decodifica ~42 PNGs de personagem (~2 MB) no mount — `components/exercises/attention/FocusAgents.tsx`.
- **[PERF-004]** DesafioSupermercado pré-carrega 77 PNGs de produto no mount independentemente do nível — `components/exercises/memory/DesafioSupermercado.tsx`.
- **[PERF-005]** Imagens de exercício servidas como <img> full-res sem otimização (next/image não usado no hot path) — `components/exercises/attention/FocusAgents.tsx`.
- **[PERF-006]** Polling do Mundo Interior a cada 8s continua mesmo com a aba em segundo plano — `components/therapeutic/MundoInterior.tsx`.
- **[SEC-004]** Sem fail-fast se NEXTAUTH_SECRET ausente/fraco — `lib/auth.ts`.
- **[SEC-006]** CSP com 'unsafe-inline' e 'unsafe-eval' em script-src — `next.config.js`.
- **[SEC-008]** /preview/bichinho pública fora do matcher do middleware (superfície, sem PII) — `app/preview/bichinho/page.tsx`.

## Resolvidos (histórico) — verificados no código em 02/08/2026

Não reabrir sem antes conferir no código. Formato: **[ID]** o que era → **hoje:** o que existe no
lugar, com a evidência levantada na reauditoria de 02/08/2026.

### Segurança

- **[SEC-001]** Sem rate limiting em autenticação (brute-force de PIN) → **hoje:** `lib/rate-limit.ts` (80 linhas, `isAllowed`/`registerFailure`/`clearFailures`/`clientIp`) aplicado aos dois providers, por IP e por identificador — `lib/auth.ts:6`, `lib/auth.ts:18-19`; teste em `lib/rate-limit.test.ts`.
- **[SEC-005]** Enumeração de código/e-mail por timing (bcrypt só rodava se o registro existia) → **hoje:** bcrypt sempre roda, contra `DUMMY_HASH` quando não há registro — `lib/auth.ts:25`, `:55-56` (terapeuta), `:93-94` (paciente).
- **[SEC-007]** Content-Disposition montava filename com nome do paciente sem sanitizar → **hoje:** nome passa por `replace(/[^A-Za-z0-9]+/g, "_")` com fallback `"paciente"` — `app/api/reports/route.ts:324`.

### Arquitetura

- **[ARQ-002]** Pet e Skill Tree só em localStorage (perda ao trocar de aparelho) → **hoje:** API `app/api/gamification/route.ts` + cliente `lib/gamification-sync.ts:9`, consumido por `lib/pet.ts:7`, `lib/skilltree.ts:6`, `lib/gamification.ts:7` e `app/(patient)/treino/[exercicio]/page.tsx:16`.
- **[ARQ-004]** Id fantasma `atencao-dividida` na taxonomia sem componente nem rota → **hoje:** zero ocorrências em `lib/domain-taxonomy.ts` e `types/index.ts`; `components/exercises/attention/AtencaoDividida.tsx` não existe mais. _Resíduo inócuo:_ a string ainda sobra no set `HIDE_PROGRESS_WIDGET` — `app/(patient)/treino/[exercicio]/page.tsx:659`.
- **[ARQ-005]** Dead code: `utils/validateCommand.ts`, `buildRound`, AgentGrid/FallingAgentsDemo/AtencaoDividida → **hoje:** os quatro arquivos não existem mais (`utils/validateCommand.ts`, `components/characters/AgentGrid.tsx`, `components/characters/FallingAgentsDemo.tsx`, `components/exercises/attention/AtencaoDividida.tsx` — todos ausentes). ⚠️ **Ressalva:** apareceu resíduo NOVO e maior, rastreado em **ARQ-010** (P3). O achado original está fechado; o problema de classe, não.
- **[ARQ-009]** Pastas vazias e export sem consumidores (`useAdaptiveLevel`) → **hoje:** `components/reports/` e `app/auth/` não existem; zero ocorrências de `useAdaptiveLevel` no repositório.

### Correção / fidelidade da métrica

- **[CORR-001]** Progressão genérica limitada a 10 rebaixava quem estava em 11-12 no Supermercado → **hoje:** `maxLevel` é parâmetro (`lib/adaptive.ts:93`, `:95`, `:115-116`) e o servidor passa 12 para `desafio-supermercado` — `app/api/sessions/route.ts:128`, `:137`; coberto por teste em `lib/adaptive.test.ts:60`, `:66`.
- **[CORR-002]** Mundo Interior: polling de 8s sobrescrevia o update otimista → **hoje:** o polling não aplica o estado do servidor enquanto há gravação em voo — `components/therapeutic/MundoInterior.tsx:588-590`, intervalo em `:605`.
- **[CORR-003]** Alerta MISSED_SESSION nunca limpo ao treinar (código morto) → **hoje:** `alert.deleteMany` remove o MISSED_SESSION não lido ao gravar a sessão — `app/api/sessions/route.ts:228-233`.
- **[CORR-004]** PERFORMANCE_DROP sem dedup gerava spam _(consolidava GER-003)_ → **hoje:** só cria se não houver alerta não lido nos últimos 7 dias, e a mensagem não atribui a um exercício — `app/api/sessions/route.ts:242-257`.
- **[CORR-006]** `calculateFocusProgression` desconhecia o teto do modo Foco e podia salvar nível acima dele → **hoje:** clampa em 9 e só sobe com `lvl < 9` — `lib/adaptive.ts:149`, `:151`. ⚠️ **Ressalva:** resolvido porque o cenário original virou impossível, mas o teto 9 ficou **incompatível com os 13 passos** de Agentes Focus — rastreado em **CORR-021** (P2).
- **[CORR-008]** Compra Multifuncional: timeout da rodada lia seleção VAZIA (stale closure) → **hoje:** `stateRef` espelha o estado e o timeout lê dele — `components/exercises/executive/CompraMultifuncional.tsx:251-252`, uso em `:267`, `:271`, `:275`.
- **[CORR-009]** Vigilância: falso-alarme contado várias vezes no mesmo estímulo → **hoje:** exercício reescrito (8 pipas / resposta por região) com guarda `respondidoRef` por estímulo — `components/exercises/attention/Vigilancia.tsx:72`.
- **[CORR-010]** Vigilância: loop de estímulos sem cleanup (setState após unmount) → **hoje:** `clearTimers()` centraliza os timers e roda no cleanup do unmount — `components/exercises/attention/Vigilancia.tsx:75-76`.
- **[CORR-011]** Progressão de nível atrasava uma rodada (stale spec) em 4 exercícios v2 → **hoje:** `levelRef` sincronizado por efeito e a rodada lê o nível atual, não o do closure — `components/exercises/memory/LetrasSequencia.tsx:63`, `:84`, `:112`.
- **[CORR-013]** DeductiveGrid: erros do puzzle final contados em dobro na acurácia → **hoje:** a fórmula usa só `totalErrors` (que já inclui o puzzle atual) — `components/exercises/executive/DeductiveGrid.tsx:560-561`.
- **[CORR-014]** Caça Informação: empates marcavam resposta correta como errada → **hoje:** `tiedBest()` devolve todos os empatados e a rodada valida contra `acceptIds` — `components/exercises/attention/CacaItemBarato.tsx:98`, `:120`, `:215`, `:258`, `:272`.
- **[CORR-015]** Caça Informação: "mais conteúdo" comparava unidades diferentes (g × L × ml) → **hoje:** tudo é convertido à unidade base antes de comparar (`1 kg = 1000 g`) — `components/exercises/attention/CacaItemBarato.tsx:80`, `:236-237`.
- **[CORR-017]** Cabeçalho mostrava o startLevel fixo, não o nível atual → **hoje:** cabeçalho usa o `level` corrente — `components/exercises/memory/ListaDistracao.tsx:212` (o `startLevel` só aparece na tela de instruções, `:197`, onde é o texto correto).
- **[CORR-019]** CorridaContraOTempo: rodada sem alvos válidos virava inderrotável (imagens quebradas) → **hoje:** fase `loading` valida as imagens antes de montar a grade e troca de categoria se não sobrar alvo válido — `components/exercises/processing/CorridaContraOTempo.tsx:184`, `:189`.
- **[CORR-020]** Reports: `Math.max(...[])` quando não havia sessões válidas → **hoje:** zero ocorrências de `Math.max(` em `app/api/reports/route.ts` (`grep -c` = 0).

### Ferramental / operação

- **[GER-001]** Script `db:seed` quebrado (ts-node ausente do lockfile) → **hoje:** `"db:seed": "tsx prisma/seed.ts"` — `package.json:14`, com `tsx` declarado em `package.json:67`.
- **[GER-002]** Dependências declaradas e nunca usadas (`@auth/prisma-adapter`, `pg`, `date-fns-tz`) → **hoje:** nenhuma das três consta em `package.json` (grep sem resultado).
- **[GER-005]** Timezone divergente entre bloqueio diário (TZ do navegador) e streak (America/Sao_Paulo) → **hoje:** o "dia" é calculado em `America/Sao_Paulo` — `app/(patient)/treino/[exercicio]/page.tsx:296-300`.
- **[GER-007]** Resgate de licença rebaixava terapeuta de ilimitado (-1) para número finito → **hoje:** resgate é rejeitado se já é ilimitado (`app/api/auth/redeem-license/route.ts:41-48`) e a transação preserva o -1 como defesa extra (`:71-74`).
- **[GER-008]** AlertsPanel: marcar-como-lido sem checar resposta; markAllRead sem try/catch → **hoje:** `try` + checagem de `res.ok` (`components/dashboard/AlertsPanel.tsx:60-63`) e `markAllRead` com `try` e `.catch` por requisição (`:74-77`).
- **[PERF-001]** Lista de pacientes carregava TODO o histórico de sessões (sem `take`) → **hoje:** janela de 30 sessões por paciente — `app/(therapist)/pacientes/page.tsx:54`.

### Registro anterior por versão (preservado da versão pré-poda)

Texto original do bloco "Progresso das correções", mantido porque amarra cada correção à versão
em que entrou. Onde ele divergir da reauditoria de 02/08/2026, **vale a reauditoria** (ver o aviso
no ARQ-001).

- **SEC-001** — ✅ resolvido em v2.11.2 (rate limiting no login).
- **Fidelidade de pontuação (Etapa 2)** — ✅ resolvidos em v2.11.3: CORR-001, CORR-008,
  CORR-009, CORR-013, CORR-014, CORR-015 e CORR-011 (LetrasSequencia, SequenciaItens,
  ListaDistracao, PadroesRotacao).
- **Alertas e regras do dia a dia (Etapa 3)** — ✅ resolvidos em v2.11.4: CORR-003
  (MISSED_SESSION limpo ao treinar), CORR-004+GER-003 (dedup de PERFORMANCE_DROP),
  GER-005 (fuso de Brasília no bloqueio diário), GER-007 (resgate de licença não
  rebaixa terapeuta ilimitado). **GER-006 adiado** (validação server-side do "1x por
  dia").
- **Robustez (Etapa 4, parcial)** — ✅ resolvidos em v2.11.5: CORR-002 (Mundo Interior
  não reverte resposta em gravação), GER-001 (`db:seed` usa `tsx`), GER-002 (remoção de
  dependências sem uso).
- **Pet/Jornada persistidos (Etapa 4)** — ✅ resolvido em v2.12.0: ARQ-002 (pet e árvore
  de habilidades salvos no servidor, não só em localStorage; API `/api/gamification` +
  migração aditiva aplicada e verificada em produção).
- **Organização interna (Etapa 5)** — ✅ resolvidos em v2.12.1: ARQ-001 (badges do catálogo
  + teste), ARQ-004 (ghost removido), ARQ-005 e ARQ-009 (código morto + pastas vazias +
  `useAdaptiveLevel`), PERF-001 (lista de pacientes com janela de 30), GER-008 (AlertsPanel).
  **Adiados de propósito:** ARQ-007/ARQ-006, ARQ-008/DUP-01, ARQ-003, PERF-002.

## Deferidos em auditorias anteriores (contexto)

- **ARCH-02** (2026-05-30) — quebrar god files (>900 linhas). Segue aberto e piorando
  (finding ARQ-007: FocusAgents 1.618 l, DesafioCidade 1.146, Labirinto 1.072…).
- **DUP-01** (2026-05-30) — tokens de tema duplicados em ~30 exercícios. Segue aberto
  (finding ARQ-008). Consolidar = mudança de design com risco de regressão visual.

## Nota metodológica

Os 8 findings originalmente classificados P1 pelos auditores passaram por verificação
adversarial independente: **todos confirmados, nenhum refutado**, mas 6 rebaixados por
mitigadores reais (auto-cura, impacto cosmético, ausência de crash, baixo volume). A
severidade aqui é a verificada. Detalhes na seção "Apêndice A" do relatório.

**Poda de 02/08/2026:** os 54 itens da auditoria de 2026-07-10 foram reconferidos um a um no
código; 28 saíram como resolvidos (com evidência `arquivo:linha` acima) e 26 permaneceram
pendentes. Dois itens novos (`ARQ-010`, `CORR-021`) nasceram de ressalvas de itens fechados —
o achado original morreu, o problema de classe não. A contagem de warnings do `GER-011` foi
atualizada de 5 para 13 (`npm run lint`, 2026-08-02).
