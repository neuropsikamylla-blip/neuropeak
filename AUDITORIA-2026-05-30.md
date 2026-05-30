# Auditoria Consolidada — NeuroPeak

**Data:** 2026-05-30 · **Commit:** `699a34a` · **Auditor humano:** Jonathan + Claude
**Método:** 5 sub-auditores especializados, isolados e em paralelo (correctness, security, architecture, performance, general), via ferramenta `Agent`. Consolidação feita pelo Claude principal (sem alterar findings — apenas dedup, IDs e ordenação).

> **Nota de integridade.** A 1ª tentativa (skill `/auditor`) rodou em execução única (sem dispatch de sub-agentes) e cobriu `components/exercises/**` apenas por amostragem. Esta 2ª rodada corrigiu isso: os 5 agentes leram o código a fundo (~1,4M tokens, ~280 leituras). O ganho é mensurável — vários achados Críticos abaixo (incl. um IDOR no `sessions/route.ts`) **não foram detectados** na 1ª passada.

---

## Resumo executivo

| Severidade | Novos | Já conhecidos/corrigidos |
|-----------|-------|--------------------------|
| 🔴 Crítico | 6 | C2 (decisão pendente) |
| 🟠 Alto | 9 | C1, A2, A3, M6 (corrigidos) |
| 🟡 Médio | ~14 | A1-score (corrigido parcial) |
| 🟢 Baixo | ~10 | — |

**Tema dominante (confirmado por 2+ auditores): Broken Access Control multi-tenant.** A correção pontual de IDOR que apliquei em `therapeutic-sessions/[id]` e `patients/[id]` **não cobriu o mesmo padrão** em 3 rotas vizinhas. É sistêmico, não pontual.

**Segundo tema: ausência de rede de proteção.** Zero testes + 20/22 rotas sem try/catch nem logging + ESLint inoperante = falhas silenciosas em produção clínica.

---

## ⚠️ Erro na minha correção anterior (honestidade)

**SEC-02 está no `app/api/sessions/route.ts` — o arquivo que EU editei** (fix A1, `.max(100)` no score). Eu corrigi o teto do score mas **não percebi** que o gate de ownership (linha 36) só cobre `role === "PATIENT"` — um **terapeuta** pode injetar sessões forjadas no histórico de qualquer paciente. Passou na 1ª auditoria E na minha edição. É a prova concreta de por que a auditoria multi-agente era necessária.

---

## 🔴 CRÍTICOS

| ID | Achado | Local | Fonte | Status |
|----|--------|-------|-------|--------|
| **SEC-01** | IDOR: `GET /api/therapeutic-sessions?patientId=` faz `findMany` sem filtro `therapistId` → vaza `therapistNotes`, `responses`, `characterData` (dados clínicos) de qualquer paciente | `therapeutic-sessions/route.ts:49-56` | security | NOVO |
| **SEC-02** | IDOR: `POST /api/sessions` sem ownership check para THERAPIST → injeta sessões/scores forjados no histórico clínico de qualquer paciente + altera dificuldade adaptativa + dispara alertas falsos | `sessions/route.ts:36` | security | NOVO ⚠️ |
| **SEC-03** | IDOR/tampering: `POST /api/therapeutic-sessions` cria sessão para paciente alheio e **pausa** (`updateMany`) a sessão ativa de outro terapeuta | `therapeutic-sessions/route.ts:13-35` | security | NOVO |
| **SUP-01** | Next.js 15.3.9 com CVE **HIGH**: middleware bypass (toda authz por role depende do middleware) + SSRF + DoS. `npm audit fix` disponível | `package.json` | security + general | NOVO (×2) |
| **BUG-01** | `hasConsecutiveDays` sempre retorna `false` (parse de data `pt-BR` vira `NaN` + sort lexicográfico) → conquistas STREAK_3/STREAK_7 **nunca** desbloqueiam, para ninguém. **Comprovado por execução.** | `lib/adaptive.ts:384-411` | general | NOVO |
| **C2** | PIN em texto plano (`pinPlain`) persistido e exibível na UI | `schema.prisma:42` + `patients/route.ts:95` + `regenerate-pin:46` | (1ª passada) | DECISÃO PENDENTE |

---

## 🟠 ALTOS

| ID | Achado | Local | Fonte | Status |
|----|--------|-------|-------|--------|
| **REL-01** | 20 de 22 rotas de API **sem try/catch e sem logging** (`console.*` = 0 em todo o código) → falhas viram 500 silencioso, sem rastro em produção | `app/api/**` | architecture + general | NOVO (×2) |
| **TEST-01** | **Zero testes** automatizados (sem jest/vitest/playwright) em app clínico LGPD | projeto | general | NOVO |
| **REL-02** | Operações multi-write sem `$transaction`: `redeem-license` (licença paga consumida sem creditar), `reset-password` (token reutilizável), `patients PATCH` (paciente sem plano), `therapeutic-sessions POST` | 4 rotas | architecture | NOVO |
| **SEC-04** | Gate de CRP verificado só no client → terapeuta sem CRP opera Mundo Interior via API direta (contorna requisito ético-legal) | `therapeutic-sessions/*` vs `mundo-interior/page.tsx:25` | security | NOVO |
| **SEC-05** | Sem rate limiting em auth + PIN de 6 dígitos com `Math.random()` → brute-force viável de credenciais clínicas | `lib/auth.ts`, `lib/utils.ts:62` | security | parcial (M1/M3) |
| **BUG-02** | `DeductiveGrid`: validação aceita múltiplos "yes" por pessoa e valida só o 1º (`find`) → corrompe `accuracy` do exercício executivo (e a engine adaptativa) | `DeductiveGrid.tsx:512-529` | correctness | NOVO |
| **BUG-03** | `DesafioCidade`: nível inicial do "restaurante" pode ser 4, mas só existem 3 níveis → header mostra "Nível 4" sobre conteúdo L3 (rótulo mente) | `DesafioCidade.tsx:1011,1045` | correctness | NOVO |
| **AI-01** | TTS órfão: 93 áudios de voz neural (Francisca) **nunca tocados** — o manifest não bate com os comandos gerados em runtime; FocusAgents Auditivo cai sempre na voz robótica do browser. **Comprovado por cruzamento.** | `data/tts-manifest.ts` vs `generateCommand.ts`; `FocusAgents.tsx:417` | general | NOVO |
| **PERF-01** | FocusAgents re-renderiza o componente raiz inteiro a 20fps (`setFallerPositions([...])` por tick) → jank em mobile + contamina medição de `reactionTime` | `FocusAgents.tsx:435-471` | performance | NOVO |
| **ARCH-01** | Engine adaptativa central (`getDifficultyParams`/`DIFFICULTY_DEFINITIONS`) é **dead code** e **diverge** das escalas inline reais dos exercícios | `lib/adaptive.ts:5-186,240-301` | architecture | NOVO |

---

## 🟡 MÉDIOS (resumo)

| ID | Achado | Local | Fonte |
|----|--------|-------|-------|
| PERF-02 | `session.findMany` **sem `take`** no dashboard e lista de pacientes (traz histórico ilimitado p/ `.slice(0,20)`) | `dashboard/page.tsx:32`, `pacientes/page.tsx:29` | performance |
| PERF-03 | MOT re-render global a ~60fps (mesmo antipadrão do PERF-01) | `MOT.tsx:205-214` | performance |
| BUG-04 | `calculateAdherence` retorna 100% (falso) se `expectedFrequency=0` (Infinity) | `lib/scoring.ts:178` | general |
| SEC-06 | `images.remotePatterns: hostname "**"` → SSRF/DoS via Image Optimizer | `next.config.js` | security |
| SEC-07 | `CRON_SECRET`/`ADMIN_SECRET` sem `timingSafeEqual` + bypass `Bearer undefined` se var ausente (fail-open) | `cron/check-alerts:7`, `admin/backfill-codes:8` | security |
| SEC-08 | `NEXTAUTH_SECRET` fraco/previsível ("...change-in-production-2024") — se reusado em prod, permite forjar JWT | `.env.local:11` | security |
| QUAL-01 | `/api/health` (sem auth) vaza contagem de usuários + `error.message` interno | `health/route.ts:11` | general + security |
| QUAL-02 | Sem error boundaries (`app/error.tsx`, `global-error.tsx` ausentes) | `app/` | general |
| QUAL-03 | `.env.example` cobre 3 de 14 vars e ainda diz "SQLite" (app usa Postgres) | `.env.example` | general |
| QUAL-04 | E-mail pessoal hardcoded como fallback (`neuropsi.kamylla@gmail.com`) versionado | `lib/mailer.ts:55` + outros | general |
| LINT-01 | ESLint não configurado → `next lint` nunca executa | raiz | general |
| DUP-01 | Tokens de tema (CLINICAL/COLORFUL/GAMIFIED) reimplementados em ~30 exercícios | `components/exercises/**` | architecture |
| DUP-02 | `speak()` (Web Speech) reimplementado divergente em 3 exercícios vs `lib/tts.ts` | SpanNumerico, DesafioSupermercado, FocusAgents | architecture |
| A11Y-01 | Acessibilidade quase nula (2 `aria-*` em toda a app) — público com déficits cognitivos | toda UI | general |

---

## 🟢 BAIXOS (resumo)
SEC-09 (sem security headers/CSP/HSTS), QUAL-05 (`/admin`,`/configuracoes` fora do matcher do middleware), BUG-05 (MatrizEspacial `MAX_SEQ` limite morto), BUG-06 (NBack acoplamento de 5 refs — validar), REL-03 (timers sem cleanup em Semaforo/DecisaoRapida), REL-04 (mailer sem timeout), REL-05 (upload CRP órfão se update falha), DUP-03 (`patientCode` único duplicado em 3 rotas), DUP-04 (auth boilerplate em ~15 rotas), ARCH-02 (god-files: 16/37 exercícios > 500 linhas; DesafioCidade 1150), DEAD-01 (`calculatePercentile`/`generateCommand` mortos), SUP-02 (nodemailer CVE moderate, sem fix), SCHEMA-01 (sem CHECK constraints no banco).

---

## Refutações (verificadas e descartadas — honestidade)
- **Stale `useRef` em `FarmaciaMission`/`CinemaMission`** (pista inicial do correctness): **REFUTADA** — os subcomponentes remontam via `key={mission-${missionKey}}` sob `AnimatePresence mode="wait"`; o `level` é recalculado a cada montagem. Sem bug.
- **`next/image` sem lazy no layout do paciente**: **REFUTADA** — é a logo 48px above-the-fold (deve ser eager); `next/image` já lazy por padrão.
- **`package-lock.json` "modificado"**: alteração espúria, já descartada.

---

## Correções já aplicadas nesta sessão (código puro, tsc limpo)
C1 (ownership therapeutic-sessions/[id]), A4 (allowlist Zod), A1 (score `.max(100)`), A2 (over-fetch patients), A3 (`dateOfBirth`→`birthDate`), M6 (transação licença).
**Atenção:** SEC-02 mostra que `sessions/route.ts` (onde A1 foi aplicado) ainda tem IDOR de THERAPIST pendente.

---

## Cobertura e limitações honestas
- **Profundo:** todas as 22 rotas `app/api/**`, `lib/**`, `prisma/schema.prisma`, auth, middleware, e ~12 exercícios de maior complexidade de estado/timer.
- **Não lido linha-a-linha:** ~20 dos 37 exercícios (correctness ficou no orçamento de tool-uses após as 2 pistas + entry points). `MundoInterior.tsx` (734 linhas) lido só por métrica.
- **Não verificável estaticamente (requer ambiente/runtime):** valores de produção no Vercel (`NEXTAUTH_SECRET`/`CRON_SECRET`), índices reais do Postgres (PERF-05), jank real em mobile, RLS do bucket Supabase, TOCTOU em `redeem-license` sob concorrência.
