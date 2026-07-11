# BACKLOG — NeuroPeak

> **Fonte única de pendências.** Atualizado: 2026-07-10 (após auditoria completa v2).
> 👉 Achados detalhados: `docs/auditoria/AUDITORIA-2026-07-10.md` · dívida linkada por ID:
> `docs/DIVIDA-TECNICA.md` · checkpoints: `PROGRESSO.md`.

## Onde estamos

A auditoria de 2026-07-10 revisou o código, que cresceu bastante desde a auditoria de
maio (v1.9.5 → v2.11.1), e levantou **54 itens: 0 P0 · 1 P1 · 27 P2 · 26 P3**. A base está
saudável (tsc 0, 24 testes, build ok, isolamento multi-inquilino consistente, baseline de
segurança de 2026-05-30 intacto). **Nada foi corrigido nesta sessão** — a auditoria propõe;
as correções aguardam decisão. Prioridade sugerida: SEC-001 → bloco de fidelidade clínica
dos exercícios → SEC-002/003 → dívida arquitetural.

---

## 1. 🔴 P1 — tratar primeiro

| Item | O que é | Ação sugerida |
|------|---------|---------------|
| **SEC-001** | Login por PIN sem rate limiting — credencial clínica força-brutável (`lib/auth.ts:52-64`) | Rate limit por IP+identificador + lockout progressivo nos dois providers; PIN mais longo. |

---

## 2. 🟠 P2 — fila principal

### Fidelidade da métrica clínica (exercícios)
| Item | O que é |
|------|---------|
| **CORR-001** | Progressão capa em 10 e rebaixa quem chega a 11-12 no Supermercado. |
| **CORR-004** | Alertas PERFORMANCE_DROP sem deduplicação, cruzando exercícios (consolida GER-003). |
| **CORR-005** | Dupla progressão: cliente sobe o nível e o servidor sobe de novo. |
| **CORR-008** | Compra Multifuncional: timeout avalia seleção vazia (stale closure) — distorce feedback. |
| **CORR-009** | Vigilância: falso-alarme conta várias vezes no mesmo estímulo. |
| **CORR-011** | Progressão defasada 1 rodada (stale spec) em 4 exercícios v2. |
| **CORR-012** | Semáforo: par recursivo startRound↔handleResponse com deps parciais. |
| **CORR-013** | DeductiveGrid: erros do puzzle final contados em dobro na acurácia. |
| **CORR-014** | Caça Informação: empates marcam resposta correta como errada. |
| **CORR-015** | Caça Informação: "mais conteúdo" compara unidades diferentes (g vs L). |
| **CORR-016** | LetrasSequencia: nº de distratores travado em 2 (ignora nível). |
| **CORR-017** | Cabeçalho mostra startLevel fixo, não o nível atual (vários exercícios). |
| **CORR-002/003** | Mundo Interior: poll de 8s reverte update otimista · MISSED_SESSION nunca é limpo ao treinar. |

### Segurança / acesso
| Item | O que é |
|------|---------|
| **SEC-002** | Paciente grava `therapistNotes`/`status` via PATCH da sessão terapêutica. |
| **SEC-003** | Hash do PIN devolvido ao cliente (leituras de Patient sem `select`). |

### Lógica de negócio / plataforma
| Item | O que é |
|------|---------|
| **GER-001** | `db:seed` quebrado — `ts-node` ausente do lockfile. |
| **GER-002** | Dependências declaradas e não usadas (@auth/prisma-adapter, pg, date-fns-tz). |
| **GER-004** | Engines de progressão novas (dual/story/focus/genérica) sem teste. |
| **GER-005** | Timezone divergente: bloqueio diário usa TZ do device; streak usa America/Sao_Paulo. |
| **GER-006** | Bloqueio "1x por dia" só client-side; servidor não valida. |
| **GER-007** | Resgate de licença rebaixa terapeuta ilimitado (-1) para número finito. |

### Arquitetura / performance
| Item | O que é |
|------|---------|
| **ARQ-001** | Metadados de exercício triplicados e divergentes (3 fontes de verdade). |
| **ARQ-002** | Estado de pet e skill tree só em localStorage — perde ao trocar de aparelho. |
| **ARQ-003** | `desafio-cidade` (1.146 l) órfão: renderiza mas é filtrado do catálogo. |
| **ARQ-004** | `atencao-dividida` fantasma: na taxonomia, sem definição nem rota. |
| **PERF-001** | Lista de pacientes carrega todo o histórico de sessões (sem `take`) — metade do PERF-02 antigo. |
| **PERF-002** | POST /api/sessions faz ~8-11 round-trips sequenciais no caminho quente. |

---

## 3. 🟡 P3 — menor (ver `docs/DIVIDA-TECNICA.md` para a lista completa)

Destaques: SEC-004 (fail-fast se `NEXTAUTH_SECRET` ausente), SEC-005 (enumeração por
timing), SEC-006 (CSP unsafe-inline/eval), SEC-007 (filename do PDF sem sanitizar),
SEC-008 (`/preview/bichinho` público), ARQ-005 (dead code: validateCommand, AgentGrid,
AtencaoDividida), ARQ-006/ARQ-009 (god file do switch central; pastas vazias), GER-008
(AlertsPanel sem checar resposta), GER-009 (datas do relatório misturam UTC/local),
GER-011 (5 warnings de ESLint), GER-012 (seed com credenciais fracas), CORR-010/018/019/020
e vários PERF de preload de imagens. **26 itens P3 no total.**

---

## 4. ⏸️ DEFERIDOS de auditorias anteriores (seguem válidos)

| Item | O que era | Por que ficou de fora | Estado atual |
|------|-----------|------------------------|--------------|
| **DUP-01** (→ ARQ-008) | Unificar tokens de tema em ~30 exercícios | Redesenho, não correção; risco de regressão visual | Segue aberto |
| **ARCH-02** (→ ARQ-007) | Quebrar god files >900 linhas | Alto risco / zero ganho funcional | Segue aberto e crescendo |

---

## 5. 🟢 Monitorar

| Item | Situação |
|------|----------|
| **nodemailer** | CVE moderate sem fix upstream à época — monitorar (não verificável nesta sessão, sem rede). |
| **Preview sem `NEXTAUTH_SECRET`** | Resolver no painel Vercel se/quando previews passarem a ser usados (fluxo atual: push direto na `main`). |

---

## Referência — resolvido na auditoria de 2026-05-30

Segurança C1/C2/SEC-01–09; bugs A1–A4/BUG-01–04/06; confiabilidade REL-01–05; performance
PERF-01–03 + SUP-01 (Next 15.5.18, confirmado nesta auditoria); qualidade QUAL-01–05, LINT-01,
TEST-01 (24 testes), A11Y-01; banco SCHEMA-01 (FKs + CHECK aplicadas e verificadas no Supabase).
