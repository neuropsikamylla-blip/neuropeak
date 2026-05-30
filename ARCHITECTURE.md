# NeuroPeak — Arquitetura do Sistema

**Versao:** 1.9.5  
**Data:** 2026-05-30  
**Stack:** Next.js 15 · React 18 · TypeScript · Prisma · PostgreSQL (Supabase) · NextAuth v4 · Tailwind CSS

---

## 1. Visao geral

NeuroPeak e uma plataforma SaaS de treino cognitivo clinico para neuropsicologos. O sistema serve dois perfis de usuario com fluxos completamente separados:

- **Terapeuta** — gerencia pacientes, prescreve planos, acompanha evolucao, gera relatorios PDF, conduz sessoes terapeuticas (Mundo Interior)
- **Paciente** — realiza exercicios cognitivos em casa, acompanha progresso, desbloqueia conquistas

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Next.js SSR/CSR)             │
│                                                          │
│   ┌──────────────────┐    ┌──────────────────────────┐   │
│   │  Interface        │    │  Interface do Paciente   │   │
│   │  do Terapeuta     │    │  (gamificada)            │   │
│   │  /dashboard       │    │  /inicio, /treino        │   │
│   │  /pacientes       │    │  /progresso              │   │
│   │  /relatorios      │    │  /mundo-interior         │   │
│   │  /mundo-interior  │    │                          │   │
│   └──────────┬────────┘    └──────────────┬───────────┘   │
│              │                            │               │
│              └────────────┬───────────────┘               │
│                           │                               │
│                  ┌────────▼────────┐                      │
│                  │   API Routes    │                      │
│                  │   /api/*        │                      │
│                  └────────┬────────┘                      │
└───────────────────────────┼─────────────────────────────-─┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
   ┌─────▼──────┐    ┌──────▼──────┐   ┌──────▼──────┐
   │ PostgreSQL  │    │  Supabase   │   │   Vercel    │
   │ (Prisma)    │    │  Storage    │   │   Cron      │
   │             │    │  (CRP docs) │   │   (08h/dia) │
   └─────────────┘    └─────────────┘   └─────────────┘
```

---

## 2. Estrutura de diretorios

```
neuropeak/
├── app/                        # Next.js App Router
│   ├── (therapist)/            # Route group — terapeutas
│   ├── (patient)/              # Route group — pacientes
│   ├── api/                    # API Routes
│   ├── auth/                   # Paginas de autenticacao
│   ├── layout.tsx              # Layout raiz
│   └── page.tsx                # Redirect inteligente por role
├── components/
│   ├── exercises/              # Engine de exercicios cognitivos
│   │   ├── memory/             # 9 exercicios de memoria
│   │   ├── attention/          # 11 exercicios de atencao
│   │   ├── processing/         # 6 exercicios de processamento
│   │   └── executive/          # 10 exercicios executivos
│   ├── dashboard/              # Componentes do painel terapeuta
│   ├── therapeutic/            # Mundo Interior (MundoInterior.tsx)
│   ├── charts/                 # Graficos de evolucao (Recharts)
│   ├── gamification/           # Sistema de conquistas
│   ├── patient/                # Componentes de gerenciamento
│   ├── reports/                # Visualizacao de relatorios
│   └── ui/                     # Componentes base (Radix UI + shadcn)
├── lib/
│   ├── auth.ts                 # Configuracao NextAuth
│   ├── db.ts                   # Singleton Prisma Client
│   ├── scoring.ts              # Calculos de score e percentis
│   ├── adaptive.ts             # Engine adaptativa de dificuldade
│   ├── exercise-science.ts     # Embasamento neurocientific
│   ├── exercise-functional.ts  # Cenarios funcionais por exercicio
│   ├── item-domains.ts         # Catalogos de itens contextualizados
│   ├── supabase.ts             # Cliente Supabase (storage)
│   ├── mailer.ts               # Envio de e-mails (Nodemailer)
│   ├── tts.ts                  # Text-to-speech
│   └── utils.ts                # Utilitarios gerais
├── prisma/
│   ├── schema.prisma           # Schema do banco
│   ├── migrations/             # Historico de migracoes
│   └── seed.ts                 # Dados iniciais
├── types/
│   └── index.ts                # Tipos TypeScript centralizados
├── middleware.ts               # Protecao de rotas por role
├── next.config.js              # Configuracao Next.js
└── vercel.json                 # Cron jobs
```

---

## 3. Autenticacao

### Fluxo duplo (NextAuth v4 — JWT)

```
Terapeuta                          Paciente
   │                                  │
   │  POST /api/auth/signin            │  POST /api/auth/signin
   │  {email, password}               │  {patientId (ou COGxxxxxx), pin}
   │                                  │
   ▼                                  ▼
CredentialsProvider               CredentialsProvider
"therapist-login"                 "patient-pin"
   │  bcrypt.compare()               │  bcrypt.compare()
   │  role = "THERAPIST"             │  role = "PATIENT"
   ▼                                  ▼
         JWT Token (8 horas)
         { id, role, clinicName, patientId, theme, crp }
```

### Protecao por middleware

```
/dashboard, /pacientes, /relatorios  →  role === "THERAPIST"
/inicio, /treino, /progresso         →  role === "PATIENT"
Demais rotas protegidas              →  token valido (qualquer role)
```

---

## 4. Banco de dados

### Modelo de dados

```
User (Terapeuta)
  │ id, email, password (bcrypt), name, clinicName
  │ role, patientLicenses, crp, crpStatus, crpDocument
  │
  └──< Patient
        │ id, name, birthDate, pin (bcrypt), patientCode (COGxxxxxx)
        │ theme (CLINICAL|COLORFUL|GAMIFIED)
        │ diagnosis, cid, medications, therapeuticGoals
        │
        ├──< Session              -- cada execucao de exercicio
        │     exerciseId, domain, score, accuracy
        │     reactionTime, difficulty (1-10), duration
        │
        ├──< TrainingPlan         -- plano ativo prescrito
        │     domains, exercises, sessionDuration, frequency
        │
        ├──< ExerciseConfig       -- dificuldade atual por exercicio
        │     exerciseId, currentDifficulty, totalAttempts
        │
        ├──< Achievement          -- conquistas desbloqueadas
        │     type, title, icon, unlockedAt
        │
        └──< Alert                -- alertas clinicos
              type (MISSED_SESSION|PERFORMANCE_DROP|GOAL_REACHED|CYCLE_COMPLETE)
              isRead

TherapeuticSession               -- sessao do Mundo Interior
  patientId, therapistId, status, phase
  characterData (JSON), currentRegion, unlockedTools (JSON)
  completedRegions (JSON), responses (JSON)

LicenseCode                      -- codigos de ativacao de licencas
PasswordResetToken               -- tokens de redefinicao de senha
```

---

## 5. Engine cognitiva

### 5.1 Sistema adaptativo

```
Sessao concluida
      │
      ▼
calculateNewDifficulty() [lib/adaptive.ts]
      │
      ├── accuracy das ultimas 5 sessoes
      ├── tendencia (melhora/queda)
      └── regras de ajuste (+1, -1, 0)
      │
      ▼
ExerciseConfig.currentDifficulty atualizado (1-10)
```

### 5.2 Scoring e percentis

```
Session data
      │
      ▼
calculateExerciseScore() [lib/scoring.ts]
  ├── accuracy (peso maior)
  ├── reactionTime (normalizado por exercicio)
  └── difficulty multiplier
      │
      ▼
calculateDomainScore()
  └── media ponderada das sessoes recentes
      │
      ▼
Percentil via NORMATIVE_BENCHMARKS
  Faixas: 4-11, 12-17, 18-59, 60+
  Dominios: memory, attention, processing, executive
```

### 5.3 Exercicios por dominio

| Dominio | Quantidade | Exemplos |
|---------|-----------|---------|
| Memoria | 10 | Span Numerico, N-Back, Associacao de Pares, Desafio Supermercado, Desafio Supermercado Auditivo |
| Atencao | 11 | Trilha Visual, MOT, Dual Task, Focus Agents, Focus Agents Auditivo |
| Processamento | 6 | Tempo de Reacao, Decisao Rapida, Semaforo, Corrida Tempo (id: corrida-tempo) |
| Executivo | 10 | Torre de Hanoi, Labirinto, Deductive Grid, Task Switching |

Todos os exercicios sao lazy-loaded (`next/dynamic`) na pagina `/treino/[exercicio]`.

---

## 6. API Routes

| Rota | Metodo | Autorizacao | Funcao |
|------|--------|-------------|--------|
| `/api/sessions` | POST | PATIENT ou THERAPIST | Salvar resultado de sessao + adaptar dificuldade + checar conquistas |
| `/api/patients` | GET | THERAPIST | Listar pacientes |
| `/api/patients` | POST | THERAPIST | Criar paciente (gera PIN + codigo COGxxxxxx) |
| `/api/patients/[id]` | PUT/DELETE | THERAPIST | Atualizar/remover paciente |
| `/api/patients/[id]/regenerate-pin` | POST | THERAPIST | Regenerar PIN |
| `/api/reports` | POST | THERAPIST | Gerar relatorio PDF (@react-pdf/renderer) |
| `/api/alerts` | GET/PATCH | THERAPIST | Listar/marcar alertas como lidos |
| `/api/cron/check-alerts` | GET | CRON_SECRET | Detectar pacientes sem sessao na semana |
| `/api/crp-verification` | POST | THERAPIST | Upload de documento CRP para Supabase Storage |
| `/api/therapeutic-sessions/[id]` | GET/PUT/DELETE | THERAPIST | CRUD sessoes do Mundo Interior |
| `/api/auth/[...nextauth]` | * | — | NextAuth handler |
| `/api/health` | GET | — | Health check |
| `/api/version` | GET | — | Versao do app |

---

## 7. Feature: Mundo Interior

Ferramenta narrativa gamificada de apoio ao acompanhamento psicologico.

- **Restricao:** apenas terapeutas com CRP verificado (`crpStatus === "verified"`)
- **Modelo:** `TherapeuticSession` com estado JSON (fases, regioes, ferramentas desbloqueadas, respostas)
- **Fluxo:** criacao de personagem → navegacao por regioes → desbloqueio de ferramentas → registro de respostas
- **Aviso obrigatorio:** disclaimer de que nao substitui acompanhamento profissional

---

## 8. Cron job

```
vercel.json
  cron: "0 8 * * *"  (todos os dias as 08h UTC)
  path: /api/cron/check-alerts

Logica:
  1. Busca todos os TrainingPlans ativos
  2. Conta sessoes dos ultimos 7 dias por paciente
  3. Se sessoes == 0 E sem alerta MISSED_SESSION pendente:
     → cria Alert tipo MISSED_SESSION
```

---

## 9. Geracao de PDF

- Endpoint: `POST /api/reports`
- Biblioteca: `@react-pdf/renderer` (server-side, via `serverExternalPackages`)
- Conteudo: dados do paciente, scores por dominio, percentis, evolucao temporal, recomendacoes clinicas geradas por `generateRecommendations()`

---

## 10. Temas do paciente

Tres temas visuais para a interface do paciente:

| Tema | Perfil de uso |
|------|--------------|
| `CLINICAL` | Interface neutra, adultos e idosos |
| `COLORFUL` | Cores vibrantes, criancas e adolescentes |
| `GAMIFIED` | Visual de jogo, maior engajamento |

---

## 11. Dependencias principais

| Pacote | Versao | Uso |
|--------|--------|-----|
| `next` | ^15.3.9 | Framework fullstack |
| `next-auth` | ^4.24.7 | Autenticacao dual |
| `@prisma/client` | ^5.18.0 | ORM |
| `@supabase/supabase-js` | ^2.106.0 | Storage de documentos |
| `@react-pdf/renderer` | ^3.4.4 | Geracao de PDF |
| `recharts` | ^2.12.7 | Graficos de evolucao |
| `framer-motion` | ^11.3.30 | Animacoes |
| `zod` | ^3.23.8 | Validacao de schemas |
| `bcryptjs` | ^2.4.3 | Hash de senha/PIN |
| `date-fns` | ^3.6.0 | Manipulacao de datas |
| `nodemailer` | ^7.0.13 | Envio de emails (Gmail, reset de senha) |

---

## 12. Decisoes arquiteturais relevantes

### ADR-001: Server Components por padrao
Paginas do terapeuta sao Server Components para buscar dados diretamente com Prisma, evitando round-trips desnecessarios. Componentes de exercicios sao Client Components (`"use client"`) por necessidade de estado local e interatividade.

### ADR-002: Dois providers de autenticacao separados
Em vez de unificar o login, mantemos dois Credentials Providers distintos — um para terapeuta (email/senha) e um para paciente (codigo/PIN) — para garantir isolamento total de contexto e simplificar a logica de autorizacao.

### ADR-003: Lazy loading de exercicios
Todos os ~36 componentes de exercicio sao carregados via `next/dynamic` somente quando o exercicio e acessado, evitando bundle gigante na pagina de treino.

### ADR-004: Prisma como unica fonte de verdade
Queries de dados usam Prisma diretamente (nao o Supabase JS client), exceto para storage de arquivos. Isso simplifica o modelo de dados e evita duplicidade de logica.

### ADR-005: Score normalizado 0-100 com percentis
Scores sao normalizados para 0-100 independente do exercicio, e convertidos para percentil usando benchmarks normativos por faixa etaria. Isso permite comparacao entre dominios e interpretacao clinica direta.
