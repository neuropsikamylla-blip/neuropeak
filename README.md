# NeuroPeak

Plataforma web de treino cognitivo clínico para neuropsicólogos em prática solo.
O terapeuta cadastra pacientes, prescreve planos de treino e acompanha a evolução;
o paciente executa exercícios cognitivos em casa por uma interface gamificada.

> **Nota:** o NeuroPeak é um instrumento de avaliação. As métricas produzidas
> (score, acurácia, dificuldade adaptativa) têm uso clínico — mudanças na engine
> de scoring/progressão exigem cautela e teste.

## Stack

- **Framework:** Next.js 15 (App Router) · React 18 · TypeScript 5 (strict)
- **Banco:** PostgreSQL (Supabase) via Prisma 5.18
- **Auth:** NextAuth v4 (JWT, sessão de 8h) — dois fluxos (terapeuta e paciente)
- **UI:** Tailwind CSS 3 · Radix UI · Framer Motion · Recharts
- **PDF:** `@react-pdf/renderer` (relatórios no servidor)
- **Testes:** Vitest 4
- **Deploy:** Vercel (push na `main` → produção)

## Pré-requisitos

- Node.js 20+ e npm
- Uma instância PostgreSQL (o projeto usa Supabase; qualquer Postgres serve para dev)
- Conta Vercel (deploy) e projeto Supabase (storage de documentos CRP), opcionais para rodar local

## Instalação

```bash
git clone <repo-url>
cd neuropeak
npm install                 # roda `prisma generate` no postinstall
cp .env.example .env.local  # preencha as variáveis (ver abaixo)
npm run db:push             # cria o schema no banco apontado por DATABASE_URL
```

### Variáveis de ambiente (`.env.example`)

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Postgres (connection pooled) |
| `DIRECT_URL` | Postgres (conexão direta, migrations) |
| `NEXTAUTH_SECRET` | Segredo de assinatura do JWT |
| `NEXTAUTH_URL` | URL base da aplicação |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Storage de documentos CRP (server-side) |
| `ADMIN_EMAIL` / `NEXT_PUBLIC_ADMIN_EMAIL` | Habilita ações administrativas (verificação de CRP) |
| `ADMIN_SECRET` | Header de endpoints administrativos de máquina |
| `CRON_SECRET` | Bearer do cron de alertas |
| `REGISTRATION_CODE` | Código exigido no cadastro de terapeuta |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Envio de e-mails transacionais (Gmail SMTP) |

## Rodar

```bash
npm run dev      # http://localhost:3000
```

Fluxos: `/login` (terapeuta e paciente), `/cadastro` (novo terapeuta, exige `REGISTRATION_CODE`).
A raiz `/` redireciona por papel (terapeuta → `/dashboard`, paciente → `/inicio`).

## Testar e validar

```bash
npm run test        # Vitest — 24 testes (lib/scoring, lib/adaptive)
npx tsc --noEmit    # type-check
npm run lint        # ESLint (next lint)
npm run build       # build de produção
```

Estado verificado em 2026-07-10: `test` 24/24 · `tsc` exit 0 · `lint` 5 warnings/0 errors · `build` OK.

> **Aviso:** `npm run db:seed` está **quebrado** — depende de `ts-node`, ausente do
> lockfile (ver `docs/DIVIDA-TECNICA.md`, GER-001). Popular o banco manualmente ou
> corrigir o script antes de usar.

## Deploy

Push na branch `main` dispara o deploy de produção na Vercel. Após publicar, confira
a versão em `/api/version` (deve refletir `package.json`). Cron de alertas configurado
em `vercel.json` (`0 8 * * *` UTC).

## Estrutura

```
app/            # rotas (App Router): (therapist), (patient), (auth), api/
components/     # UI e exercícios (components/exercises/<domínio>/)
lib/            # engine adaptativa, scoring, auth, taxonomia, integrações
data/           # catálogos (tts-manifest, agentes, histórias, compra-multifuncional)
types/          # tipos centrais (types/index.ts)
prisma/         # schema.prisma + seed.ts
docs/           # ARQUITETURA, ADRs, auditoria, dívida técnica
```

Guia detalhado para desenvolvimento assistido: [`CLAUDE.md`](./CLAUDE.md).
Arquitetura: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Licença

Projeto privado. Todos os direitos reservados.
