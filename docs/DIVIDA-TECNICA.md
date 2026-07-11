# Dívida técnica — NeuroPeak

> Espelho dos achados da auditoria de 2026-07-10. Cada item referencia o ID
> estável do relatório completo em [`auditoria/AUDITORIA-2026-07-10.md`](./auditoria/AUDITORIA-2026-07-10.md),
> onde estão a evidência `arquivo:linha`, o cenário e a verificação adversarial.
> Severidades já refletem o ajuste da verificação (Fase 2).
>
> **Progresso das correções:**
> - **SEC-001** — ✅ resolvido em v2.11.2 (rate limiting no login).
> - **Fidelidade de pontuação (Etapa 2)** — ✅ resolvidos em v2.11.3: CORR-001, CORR-008,
>   CORR-009, CORR-013, CORR-014, CORR-015 e CORR-011 (LetrasSequencia, SequenciaItens,
>   ListaDistracao, PadroesRotacao).
> - Demais itens: pendentes (lista abaixo).

## Panorama

| Severidade | Qtde |
|---|---|
| P1 — impacto alto | 1 |
| P2 — médio / dívida relevante | 27 |
| P3 — menor | 26 |

**Eixos:** (a) fidelidade da métrica clínica dos exercícios; (b) segurança/acesso
(SEC-001/002/003); (c) dívida arquitetural (fontes de verdade divergentes, estado só
em localStorage, exercícios órfãos) e supply chain. Nenhum P0.

## P1 — tratar primeiro

- **[SEC-001]** Sem rate limiting em autenticação — brute-force de PIN de paciente — `lib/auth.ts`. Rate limit por IP+identificador nos dois providers + lockout progressivo; PIN mais longo.

## P2 — médio / dívida relevante

- **[ARQ-002]** Progresso de Pet e da Skill Tree persistido só em localStorage — perda silenciosa ao trocar de aparelho — `lib/pet.ts / lib/skilltree.ts`.
- **[ARQ-003]** Exercício órfão: desafio-cidade (1.146 linhas) existe, é filtrado de planos e invisível no catálogo — `components/exercises/executive/DesafioCidade.tsx`.
- **[ARQ-004]** Componente e id fantasma atencao-dividida: taxonomia referencia exercício sem definição nem rota — `lib/domain-taxonomy.ts / components/exercises/attention/AtencaoDividida.tsx`.
- **[CORR-001]** Progressao generica limita a 10, mas Desafio Supermercado usa niveis 11-12 e o paciente de alto desempenho e rebaixado — `lib/adaptive.ts`.
- **[CORR-002]** Mundo Interior: polling de 8s sobrescreve o update otimista e causa perda de progresso — `components/therapeutic/MundoInterior.tsx`.
- **[CORR-003]** Alerta MISSED_SESSION nunca e limpo ao treinar (codigo morto: recentCount jamais e 0) — `app/api/sessions/route.ts`.
- **[CORR-004]** PERFORMANCE_DROP sem deduplicacao e cruzando exercicios diferentes gera spam de alertas com mensagem enganosa — `app/api/sessions/route.ts` _(consolida GER-003)_.
- **[CORR-005]** Dupla progressao: exercicios progressionV2 sobem o nivel no cliente e o servidor sobe de novo — `app/api/sessions/route.ts`.
- **[CORR-008]** Compra Multifuncional: timeout da rodada lê seleção VAZIA (stale closure) — `components/exercises/executive/CompraMultifuncional.tsx`.
- **[CORR-009]** Vigilância: falso-alarme conta múltiplas vezes no mesmo estímulo — `components/exercises/attention/Vigilancia.tsx`.
- **[CORR-011]** Progressão de nível atrasa uma rodada (stale spec) em 4 exercícios v2 — `components/exercises/memory/LetrasSequencia.tsx`.
- **[CORR-012]** Semáforo: startRound dentro de handleResponse pode usar closure obsoleto — `components/exercises/processing/Semaforo.tsx`.
- **[CORR-013]** DeductiveGrid: erros do puzzle final contados em dobro na acurácia — `components/exercises/executive/DeductiveGrid.tsx`.
- **[CORR-014]** Caça Informação: empates marcam resposta correta como errada — `components/exercises/attention/CacaItemBarato.tsx`.
- **[CORR-015]** Caça Informação: 'mais conteúdo' compara unidades diferentes (g vs L vs ml) — `components/exercises/attention/CacaItemBarato.tsx`.
- **[CORR-016]** LetrasSequencia: número de distratores travado em 2 (Math.min(2,4)) — `components/exercises/memory/LetrasSequencia.tsx`.
- **[CORR-017]** ListaDistracao/PadroesRotacao/etc: cabeçalho mostra startLevel fixo, não o nível atual — `components/exercises/memory/ListaDistracao.tsx`.
- **[GER-001]** Script db:seed quebrado — ts-node ausente do node_modules e do lockfile — `package.json`.
- **[GER-002]** Dependências declaradas e nunca usadas (@auth/prisma-adapter, pg, date-fns-tz) — `package.json`.
- **[GER-004]** Cobertura de testes: novas engines de progressão (dual-task, story-trail, focus, genérica) sem teste — `lib/adaptive.ts`.
- **[GER-005]** Timezone divergente: bloqueio/aquecimento diário usa TZ do navegador; streak usa America/Sao_Paulo — `app/(patient)/treino/[exercicio]/page.tsx`.
- **[GER-006]** Bloqueio '1x por dia' é só client-side; servidor não valida — `app/(patient)/treino/[exercicio]/page.tsx`.
- **[GER-007]** Resgate de licença rebaixa terapeuta de ilimitado (-1) para número finito — `app/api/auth/redeem-license/route.ts`.
- **[PERF-001]** Lista de pacientes carrega TODO o histórico de sessões (sem take) — PERF-02 corrigido só pela metade — `app/(therapist)/pacientes/page.tsx`.
- **[PERF-002]** POST /api/sessions executa ~8-11 round-trips sequenciais ao banco no caminho quente — `app/api/sessions/route.ts`.
- **[SEC-002]** Paciente pode gravar campos clínicos do terapeuta via PATCH da sessão terapêutica — `app/api/therapeutic-sessions/[id]/route.ts`.
- **[SEC-003]** Hash do PIN do paciente devolvido ao cliente (findMany/findUnique sem select) — `app/api/patients/route.ts`.

## P3 — menor

- **[ARQ-001]** Metadados de exercício triplicados e divergentes entre 3 fontes de verdade — `types/index.ts / lib/domain-taxonomy.ts / lib/exercise-meta.ts`.
- **[ARQ-005]** Dead code: módulo utils/validateCommand.ts, função buildRound e componentes AgentGrid/FallingAgentsDemo/AtencaoDividida — `utils/validateCommand.ts / utils/generateCommand.ts / components/characters/AgentGrid.tsx / components/characters/FallingAgentsDemo.tsx`.
- **[ARQ-006]** Fluxo central em god file: switch de 39 casos + EXERCISE_INSTRUCTIONS + HIDE_PROGRESS_WIDGET forçam registro do exercício em 6+ lugares — `app/(patient)/treino/[exercicio]/page.tsx`.
- **[ARQ-007]** God files crescentes e novos desde a auditoria de 30/05 (ARCH-02 deferido segue piorando) — `components/exercises/attention/FocusAgents.tsx / utils/generateCommand.ts / components/exercises/executive/DesafioCidade.tsx`.
- **[ARQ-008]** Objeto themeStyles CLINICAL/COLORFUL/GAMIFIED reimplementado por arquivo (DUP-01 deferido segue aberto) — `components/exercises/ExerciseWrapper.tsx (e ~7 outros)`.
- **[ARQ-009]** Pastas vazias e export sem consumidores (useAdaptiveLevel) — `components/reports/ ; app/auth/ ; components/exercises/useExerciseEngine.ts`.
- **[CORR-006]** calculateFocusProgression desconhece o teto do modo Foco (7) e pode salvar nivel 8/9 num modo capado em 7 — `lib/adaptive.ts`.
- **[CORR-007]** Sessoes abandonadas (score 0) da Ordem da Historia poluem PERFORMANCE_DROP e conquistas de outros exercicios — `app/api/sessions/route.ts`.
- **[CORR-010]** Vigilância: loop de estímulos sem cleanup — setState após unmount — `components/exercises/attention/Vigilancia.tsx`.
- **[CORR-018]** TempoReacao: IDs de balões podem colidir no mesmo lote — `components/exercises/attention/TempoReacao.tsx`.
- **[CORR-019]** CorridaContraOTempo: rodada sem alvos válidos vira inderrotável (imagens quebradas) — `components/exercises/processing/CorridaContraOTempo.tsx`.
- **[CORR-020]** Reports: divisão por zero evitada, mas Math.max(...[]) quando não há sessões válidas — `app/api/reports/route.ts`.
- **[GER-008]** AlertsPanel: marcar-como-lido sem checar resposta; markAllRead sem try/catch — `components/dashboard/AlertsPanel.tsx`.
- **[GER-009]** Parsing de datas do relatório mistura UTC e hora local do servidor — `app/api/reports/route.ts`.
- **[GER-010]** next-lint deprecado; migração para ESLint CLI pendente (Next 16) — `package.json`.
- **[GER-011]** 5 warnings de ESLint: exhaustive-deps e ref-cleanup em exercícios — `components/exercises/executive/Labirinto.tsx`.
- **[GER-012]** Seed cria credenciais fracas e previsíveis (senha e PINs hardcoded) — `prisma/seed.ts`.
- **[PERF-003]** FocusAgents pré-carrega e decodifica ~42 PNGs de personagem (~2 MB) no mount — `components/exercises/attention/FocusAgents.tsx`.
- **[PERF-004]** DesafioSupermercado pré-carrega 77 PNGs de produto no mount independentemente do nível — `components/exercises/memory/DesafioSupermercado.tsx`.
- **[PERF-005]** Imagens de exercício servidas como <img> full-res sem otimização (next/image não usado no hot path) — `components/exercises/attention/FocusAgents.tsx`.
- **[PERF-006]** Polling do Mundo Interior a cada 8s continua mesmo com a aba em segundo plano — `components/therapeutic/MundoInterior.tsx`.
- **[SEC-004]** Sem fail-fast se NEXTAUTH_SECRET ausente/fraco — `lib/auth.ts`.
- **[SEC-005]** Enumeração de código/e-mail por timing (bcrypt só roda se registro existe) — `lib/auth.ts`.
- **[SEC-006]** CSP com 'unsafe-inline' e 'unsafe-eval' em script-src — `next.config.js`.
- **[SEC-007]** Content-Disposition monta filename com nome do paciente sem sanitizar aspas — `app/api/reports/route.ts`.
- **[SEC-008]** /preview/bichinho pública fora do matcher do middleware (superfície, sem PII) — `app/preview/bichinho/page.tsx`.

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
