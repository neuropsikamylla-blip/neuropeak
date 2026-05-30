# NeuroPeak — Guia para Claude Code

## Visao geral do projeto

NeuroPeak e uma plataforma web de treino cognitivo clinico desenvolvida para neuropsicologos em pratica solo. Permite que terapeutas gerenciem pacientes, prescrevam planos de treino cognitivo e acompanhem evolucao; e que pacientes realizem os exercicios em casa via interface gamificada.

- **Versao atual:** 1.9.5 (em `package.json` — sempre incrementar a cada atualizacao)
- **Stack:** Next.js 15, React 18, TypeScript, Prisma ORM, PostgreSQL (Supabase), NextAuth v4, Tailwind CSS, Radix UI
- **Deploy:** Vercel (produção)
- **Diretorio:** `/Users/kamyllahonorio/neuropeak`

---

## Comandos essenciais

```bash
# Desenvolvimento
npm run dev          # Servidor local em http://localhost:3000

# Build e producao
npm run build
npm run start

# Banco de dados
npm run db:push      # Sincronizar schema com o banco (prisma db push)
npm run db:studio    # Prisma Studio (GUI do banco)
npm run db:seed      # Popular banco com dados iniciais

# Lint
npm run lint
```

---

## Arquitetura de rotas (App Router)

```
app/
  page.tsx                    # Redireciona para /dashboard ou /inicio conforme role
  layout.tsx                  # Layout raiz com Providers + Toaster
  (therapist)/                # Rotas do terapeuta (role=THERAPIST)
    dashboard/                # Visao geral dos pacientes
    pacientes/                # Lista e gerenciamento de pacientes
      [id]/                   # Perfil, plano e Mundo Interior do paciente
    treino-cognitivo/         # Painel de planos de treino
    relatorios/               # Geracao de relatorios PDF
    mundo-interior/           # Ferramenta terapeutica gamificada
    configuracoes/            # Configuracoes da conta do terapeuta
    admin/                    # Painel administrativo
  (patient)/                  # Rotas do paciente (role=PATIENT)
    inicio/                   # Home do paciente (plano + progresso + conquistas)
    treino/[exercicio]/       # Engine de exercicios (lazy-load por exercicio)
    progresso/                # Historico e evolucao cognitiva
    mundo-interior/           # Jornada terapeutica do paciente
  auth/                       # Paginas de login
  api/                        # API Routes
    sessions/                 # POST salvar sessao de exercicio
    patients/                 # GET/POST pacientes; [id]/ PUT/DELETE
    reports/                  # POST gerar PDF de relatorio
    alerts/                   # Alertas de aderencia
    cron/check-alerts/        # Cron diario (08h) — verifica pacientes sem sessao
    crp-verification/         # Upload de documento CRP para verificacao
    therapeutic-sessions/[id] # CRUD sessoes terapeuticas (Mundo Interior)
    auth/                     # NextAuth handler
    health/                   # Health check
    version/                  # Versao do app
    admin/                    # Endpoints administrativos
```

---

## Autenticacao e autorizacao

- **NextAuth v4** com JWT (8 horas de sessao)
- **Dois providers Credentials:**
  - `therapist-login` — email + senha (bcrypt), role=THERAPIST
  - `patient-pin` — codigo COGxxxxxx ou ID + PIN (bcrypt), role=PATIENT
- **Middleware** (`middleware.ts`) protege rotas por role:
  - `/dashboard`, `/pacientes`, `/relatorios` → THERAPIST only
  - `/inicio`, `/treino`, `/progresso` → PATIENT only
- Token JWT carrega: `id`, `role`, `clinicName`, `patientId`, `theme`, `crp`

---

## Modelos de dados (Prisma)

| Model | Descricao |
|-------|-----------|
| `User` | Terapeuta com licencas, CRP e status de verificacao |
| `Patient` | Paciente vinculado a terapeuta; PIN criptografado; temas: CLINICAL/COLORFUL/GAMIFIED |
| `Session` | Registro de cada execucao de exercicio (score, accuracy, reactionTime, difficulty) |
| `TrainingPlan` | Plano de treino ativo com dominios, frequencia e exercicios prescritos |
| `ExerciseConfig` | Configuracao adaptativa por paciente/exercicio (dificuldade atual, tentativas) |
| `Achievement` | Conquistas desbloqueadas por paciente |
| `Alert` | Alertas clinicos (MISSED_SESSION, PERFORMANCE_DROP, GOAL_REACHED, CYCLE_COMPLETE) |
| `LicenseCode` | Codigos de ativacao de licencas de pacientes |
| `PasswordResetToken` | Tokens de redefinicao de senha |
| `TherapeuticSession` | Sessao do Mundo Interior (narrativa gamificada, estado por fase/regiao) |

---

## Dominios cognitivos

Os exercicios sao organizados em 4 dominios:

| Dominio | Exercicios |
|---------|-----------|
| `memory` | span-numerico, span-numerico-inverso, matriz-espacial, matriz-espacial-inversa, jogo-memoria, associacao-pares, nback, desafio-supermercado, desafio-supermercado-auditivo |
| `attention` | trilha-visual, atencao-seletiva, atencao-sustentada, atencao-alternada, vigilancia, antes-depois, caca-item-barato, focus-agents, focus-agents-auditivo, mot, dual-task |
| `processing` | tempo-reacao, decisao-rapida, identificacao-simbolos, certo-ou-errado, semaforo, corrida-tempo |
| `executive` | stroop-task, torre-hanoi, labirinto, ordem-historia, desafio-cidade, desafio-orcamento, mudanca-regras, compra-multifuncional, task-switching, deductive-grid |

---

## Engine adaptativa

- `lib/adaptive.ts` — calcula nova dificuldade apos cada sessao (1-10) baseado em accuracy e trend das ultimas sessoes
- `lib/scoring.ts` — calcula scores normalizados (0-100), percentis por grupo etario, tendencias e recomendacoes clinicas
- Benchmarks normativos definidos por faixa etaria: 4-11, 12-17, 18-59, 60+

---

## Bibliotecas de conhecimento (somente leitura)

- `lib/exercise-science.ts` — embasamento neurocientific por exercicio (neuroanatomia, evidencias de treino, relevancia clinica, referencias APA)
- `lib/exercise-functional.ts` — cenarios funcionais e estrategias compensatorias por exercicio
- `lib/item-domains.ts` — catalogos de itens para exercicios contextualizados (supermercado, etc.)
- `lib/tts.ts` — sistema de text-to-speech; reproduz audio pre-gerado a partir de `data/tts-manifest.ts`

---

## Integracao Supabase

- `lib/supabase.ts` — cliente Supabase para storage (documentos CRP)
- Bucket: `crp-documents` — armazena documentos de verificacao CRP (max 5MB, JPG/PNG/PDF)
- O banco principal e PostgreSQL via Prisma/Supabase (nao usa Supabase client para queries)

---

## Variaveis de ambiente necessarias

```env
DATABASE_URL=         # PostgreSQL connection string (pooled)
DIRECT_URL=           # PostgreSQL direct connection (para migrations)
NEXTAUTH_SECRET=      # Secret JWT
NEXTAUTH_URL=         # URL base da aplicacao
CRON_SECRET=          # Bearer token para o cron job
SUPABASE_URL=              # URL do projeto Supabase
SUPABASE_SERVICE_ROLE_KEY= # Service role key (server-side only)
GMAIL_USER=                # Email Gmail para envio de emails transacionais
GMAIL_APP_PASSWORD=        # App password do Gmail (nao a senha normal)
```

---

## Convencoes de codigo

- **Componentes:** PascalCase, `.tsx`; Server Components por padrao, `"use client"` somente quando necessario
- **API Routes:** `route.ts` com `export const dynamic = "force-dynamic"` nos endpoints que leem dados dinamicos
- **Validacao:** Zod em todos os endpoints de API
- **Tipos:** centralizados em `types/index.ts`
- **Imports:** alias `@/` para a raiz do projeto
- **Internacionalizacao:** Interface completamente em portugues brasileiro; identificadores de codigo em ingles

---

## Funcionalidades criticas — cuidado ao modificar

1. **Engine adaptativa** (`lib/adaptive.ts`) — logica de dificuldade calibrada clinicamente
2. **Scoring e percentis** (`lib/scoring.ts`) — benchmarks normativos por faixa etaria
3. **Geracao de PDF** (`app/api/reports/route.ts`) — usa `@react-pdf/renderer` no servidor
4. **Autenticacao dual** (`lib/auth.ts`) — dois flows distintos (terapeuta/paciente)
5. **Cron de alertas** (`app/api/cron/check-alerts/`) — protegido por `CRON_SECRET`, roda diariamente
6. **Mundo Interior** (`components/therapeutic/MundoInterior.tsx`) — feature premium restrita a terapeutas com CRP verificado

---

## Notas de deploy

- Deploy via Vercel; cron configurado em `vercel.json` (`0 8 * * *`)
- `serverExternalPackages` em `next.config.js`: `@prisma/client`, `bcryptjs`, `@react-pdf/renderer`
- Versao exposta via `NEXT_PUBLIC_APP_VERSION` e endpoint `/api/version`
- PWA: manifest e apple-touch-icon configurados

---

## Regras de versionamento

Incrementar `package.json` a cada atualizacao:
- **patch** (x.x.+1) — correcoes pequenas, ajustes de UI, fixes
- **minor** (x.+1.0) — novas funcionalidades, novos exercicios, mudancas de fluxo
