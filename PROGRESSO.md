# PROGRESSO — NeuroPeak

> Checkpoint de contexto para continuidade entre sessões. Atualizado automaticamente.
> 👉 Visão geral e handoff para o próximo Claude: **`ESTADO-DO-PROJETO.md`** (leia primeiro).

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
