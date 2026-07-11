# NeuroPeak — Guia para Claude Code

> Documento derivado do código real em 2026-07-10 (v2.11.1). Fatos medidos por
> comando; ao editar, remeça o valor em vez de copiar de memória.

## O que é

Plataforma web de **treino** cognitivo clínico para neuropsicólogos em prática solo:
o terapeuta cadastra pacientes, prescreve planos de treino e acompanha a evolução;
o paciente executa os exercícios em casa por uma interface gamificada. É uma ferramenta
de **treino** (não de avaliação/diagnóstico). Ainda assim, a fidelidade das métricas
(score/acurácia/progressão) importa: a **dificuldade adaptativa** decide o próximo nível a
partir da acurácia, e o terapeuta acompanha a evolução do paciente por elas.

- **Versão:** 2.11.1 (`package.json:3` — incrementar a cada atualização; exposta em `/api/version`)
- **Stack medida:** Next.js 15.5.18 (instalado; `package.json` declara `^15.3.9`), React 18,
  TypeScript 5 strict, Prisma 5.18 + PostgreSQL (Supabase), NextAuth v4, Tailwind 3, Radix UI, Vitest 4.
- **Deploy:** Vercel (push na `main` → produção). Diretório: `/Users/kamyllahonorio/neuropeak`.

## Comandos (verificados nesta sessão)

```bash
npm run dev          # dev server em http://localhost:3000
npm run build        # build de produção — OK
npm run start        # serve o build
npm run lint         # next lint — 5 warnings, 0 errors
npm run test         # vitest run — 24/24 passam (lib/scoring + lib/adaptive)
npm run test:watch   # vitest em watch
npm run db:push      # prisma db push (sincroniza schema)
npm run db:studio    # Prisma Studio (GUI)
npm run db:seed      # ⚠️ QUEBRADO: usa ts-node, ausente do lockfile (finding GER-001)
npx tsc --noEmit     # type-check — exit 0
```

## Arquitetura de rotas (App Router)

```
app/
  page.tsx                 # redireciona por role: THERAPIST→/dashboard, PATIENT→/inicio
  (therapist)/             # role=THERAPIST — dashboard, pacientes/[id] (perfil/plano/mundo-interior),
                           #   treino-cognitivo (catálogo), relatorios, mundo-interior, configuracoes, admin
  (patient)/               # role=PATIENT — inicio, treino/[exercicio] (engine), progresso,
                           #   jornada (skill tree), bichinho (pet), treino/mundo-interior
  auth/                    # ⚠️ diretório VAZIO (leftover; páginas de login ficam em (auth): login, cadastro,
                           #   recuperar-senha, nova-senha, fora de grupo protegido)
  preview/bichinho/        # rota PÚBLICA (fora do middleware) — só arte estática, sem dados
  api/                     # 22 route.ts (ver "Superfície de API")
```

## Autenticação e autorização

- **NextAuth v4, estratégia JWT, sessão de 8h** (`lib/auth.ts`). Sem PrismaAdapter (JWT puro).
- **Dois providers Credentials:**
  - `therapist-login` — email + senha (bcrypt custo 12), role=THERAPIST.
  - `patient-pin` — código `COGxxxxxx` ou id + PIN (bcrypt), role=PATIENT.
- **JWT/session carregam:** `id`, `role`, `clinicName`, `patientId`, `theme`, `crp`.
- **`middleware.ts`** protege 12 prefixos por role (`/dashboard`, `/pacientes`, `/relatorios`,
  `/treino-cognitivo`, `/mundo-interior`, `/configuracoes`, `/admin` → THERAPIST; `/inicio`,
  `/treino`, `/progresso`, `/jornada`, `/bichinho` → PATIENT). **O middleware NÃO cobre `/api`** —
  cada rota se autoprotege com `getServerSession` (ou `CRON_SECRET`/`ADMIN_SECRET`).
- **Guards** em `lib/auth-helpers.ts`: `requireTherapist`, `requireVerifiedCrp`, `safeSecretCompare` (timing-safe, fail-closed).

## Superfície de API (`app/api/**/route.ts` — 22 rotas)

- **auth/**: `[...nextauth]`, `register` (gate `REGISTRATION_CODE`), `forgot-password`, `reset-password`, `profile`, `redeem-license`, `request-license`.
- **patients/**: `route` (GET lista por `therapistId`, POST cria+decrementa licença), `[id]` (GET/PATCH/DELETE, ownership por `therapistId`; paciente lê só a si), `[id]/regenerate-pin`.
- **sessions/** (POST): grava `Session`, calcula progressão server-side, upsert `ExerciseConfig`, achievements e alertas. **Caminho quente.**
- **reports/** (GET, PDF via `@react-pdf/renderer`), **alerts/[id]** (PATCH), **therapeutic-sessions/** e `[id]` (Mundo Interior), **crp-verification/** (POST/PATCH/GET; PATCH/GET exigem `email===ADMIN_EMAIL`), **cron/check-alerts** (Bearer `CRON_SECRET`), **admin/backfill-codes** (header `ADMIN_SECRET`), **health**, **version**.
- **Validação:** Zod na maioria dos POST/PATCH; várias leituras validam query manualmente.

## Domínios e exercícios (fonte: `lib/domain-taxonomy.ts` + `types/index.ts`)

**5 domínios** (`Domain` em `types/index.ts:4`). **39 exercícios** definidos em `EXERCISE_DEFINITIONS`
e renderizados por `switch` em `treino/[exercicio]/page.tsx` (contagens alinhadas 39=39).

| Domínio (`id`) | Rótulo | Exercícios (na taxonomia) |
|---|---|---|
| `memory` | Memória | span-numerico(+inverso), letras-sequencia, sequencia-itens, lista-distracao, restaurante-ordem, desafio-supermercado, nback, jogo-memoria, matriz-espacial(+inversa), padroes-rotacao, cubo-corsi |
| `attention` | Atenção | trilha-visual, focus-agents, vigilancia, dual-task, mot, ~~atencao-dividida~~ |
| `executive` | Funções Executivas | torre-hanoi, labirinto, estacionamento-logico, stroop-task, mudanca-regras, task-switching, deductive-grid, ordem-historia, antes-depois |
| `processing` | Velocidade de Processamento | tempo-reacao, semaforo, identificacao-simbolos, certo-ou-errado, corrida-tempo |
| `functional` | Desenvolvimento Funcional | caca-item-barato, compra-multifuncional |

> **Armadilha:** `atencao-dividida` está na taxonomia mas **não** em `EXERCISE_DEFINITIONS` nem no
> switch (id fantasma — finding ARQ-004). `desafio-cidade` é o inverso: existe e renderiza, mas é
> filtrado do catálogo (órfão — ARQ-003). Nomes de exibição divergem do id: `corrida-tempo` = "Busca
> Rápida"; `antes-depois` = "Sequência Temporal". Aliases em `lib/exercise-plan.ts` (`EXERCISE_ALIASES`):
> `desafio-orcamento`→`compra-multifuncional`, `*-auditivo`→base.

## Engine de exercícios e persistência

- **Fluxo:** `treino/[exercicio]/page.tsx` (lazy-load + `switch`) → `ExerciseWrapper`
  (fases `instructions`→`exercise`→`results`) → `onComplete(ExerciseResult)` → `POST /api/sessions`.
- **Progressão (server-side, `lib/adaptive.ts`):** 4 caminhos — `calculateDualTaskProgression`,
  `calculateStoryTrailProgression` (ordem-historia), `calculateProgression` (genérica, exercícios
  `progressionV2`) e `calculateNewDifficulty` (legado, sobre as 20 últimas sessões). Grava `ExerciseConfig.currentDifficulty`.
- **`useTimedProgress`** (`useExerciseEngine.ts`): barra por TEMPO ATIVO (só corre com interação nos últimos 15s), sessão-alvo ~7min.
- **Fonte da verdade = banco** (`Session`, `ExerciseConfig`). `localStorage` é só cache: `np_session_<data>` (progresso do dia), XP da jornada, pet, `np-focus-day`. **Exceção (dívida ARQ-002):** estado do pet e da skill tree vive **só** em `localStorage` — perde-se ao trocar de aparelho.

## Modelos de dados (Prisma — `prisma/schema.prisma`)

`User` (terapeuta; `patientLicenses` default -1 = ilimitado), `Patient` (PIN/patientCode bcrypt;
theme CLINICAL/COLORFUL/GAMIFIED), `Session` (score/accuracy/reactionTime/difficulty/duration/metadata),
`TrainingPlan`, `ExerciseConfig` (`@@unique[patientId,exerciseId]`), `Achievement`, `Alert`,
`LicenseCode`, `PasswordResetToken`, `TherapeuticSession` (Mundo Interior). Quase todos os filhos de
`Patient` são `onDelete: Cascade`; `Patient.therapist` é `Restrict`. As 3 CHECK de `Session`
(score 0-100, accuracy 0-1, difficulty 1-10) foram aplicadas por SQL direto, **não** estão no schema
(reaplicar após `db push` — ver `RUNBOOK-OPERACIONAL.md`).

## Bibliotecas de conhecimento (somente leitura)

`lib/exercise-science.ts` (embasamento neurocientífico + refs APA), `lib/exercise-functional.ts`
(cenários funcionais), `lib/scoring.ts` (score 0-100; `calculateDomainScore` cobre **4 dos 5**
domínios — `functional` não pontua; **não** há cálculo de percentil/`NORMATIVE_BENCHMARKS`, apenas o
tipo), `lib/item-domains.ts`, `lib/tts.ts` (áudio pré-gerado de `data/tts-manifest.ts` + fallback Web Speech).

## Variáveis de ambiente (`.env.example`)

`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, `NEXT_PUBLIC_ADMIN_EMAIL`, `ADMIN_SECRET`, `CRON_SECRET`,
`REGISTRATION_CODE`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`.

## Convenções

- Componentes PascalCase `.tsx`; Server Components por padrão, `"use client"` só quando necessário.
- API Routes: `route.ts` com `export const dynamic = "force-dynamic"` onde há leitura dinâmica; Zod nos corpos.
- Tipos centrais em `types/index.ts`; alias `@/` para a raiz. Interface 100% pt-BR; identificadores de código em inglês.
- Deploy: push na `main`. `serverExternalPackages` em `next.config.js`: `@prisma/client`, `bcryptjs`, `@react-pdf/renderer`. Cron em `vercel.json` (`0 8 * * *` UTC).

## Funcionalidades críticas — cuidado ao modificar

1. **Engine adaptativa** (`lib/adaptive.ts`) — dificuldade calibrada clinicamente; teto 10 na
   genérica conflita com exercícios de nível 11-12 (finding CORR-001).
2. **Scoring** (`lib/scoring.ts`) — normalização 0-100.
3. **Geração de PDF** (`app/api/reports/route.ts`) — `@react-pdf/renderer` no servidor.
4. **Auth dual** (`lib/auth.ts`) — sem rate limiting hoje (finding SEC-001).
5. **Cron de alertas** (`app/api/cron/check-alerts`) — `CRON_SECRET`, diário.
6. **Mundo Interior** (`components/therapeutic/MundoInterior.tsx`) — restrito a CRP verificado; polling de 8s com update otimista (finding CORR-002).

## Versionamento

Incrementar `package.json` a cada atualização: **patch** (fixes/UI), **minor** (novos exercícios/fluxos).

## Estado e dívida

Auditoria completa em `docs/auditoria/AUDITORIA-2026-07-10.md`; dívida priorizada em
`docs/DIVIDA-TECNICA.md` e `BACKLOG.md`. Arquitetura detalhada em `docs/ARCHITECTURE.md` e ADRs em `docs/ADR/`.
