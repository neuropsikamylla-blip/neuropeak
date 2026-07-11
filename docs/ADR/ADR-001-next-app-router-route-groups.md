# ADR-001 — Next.js App Router com grupos de rota por papel

- **Status:** registrada retroativamente em 2026-07-10

- **Contexto:** a plataforma serve dois públicos com jornadas e layouts
  distintos (terapeuta e paciente), além de páginas de autenticação. Era
  necessário separar essas áreas em nível de roteamento, aplicar layouts próprios
  a cada uma e renderizar no servidor por padrão para reduzir JavaScript enviado
  ao cliente. O redirecionamento pós-login precisa levar cada papel à sua home
  (`app/page.tsx:12-19`).

- **Decisão:** adotar o App Router do Next.js 15 com grupos de rota que não
  afetam a URL: `app/(therapist)/`, `app/(patient)/` e `app/(auth)/`. A raiz
  `app/page.tsx` é um Server Component que lê a sessão via `getServerSession` e
  redireciona por papel para `/dashboard` (THERAPIST) ou `/inicio` (PATIENT)
  (`app/page.tsx:5-20`). Componentes são Server Components por padrão; a diretiva
  `"use client"` aparece só onde há estado/efeitos de UI — no repositório atual
  20 de 52 arquivos `.ts/.tsx` sob `app/` usam `"use client"`, entre eles os
  layouts de área `app/(therapist)/layout.tsx:1` e `app/(patient)/layout.tsx:1`,
  que dependem de `useSession`/`signOut`.

- **Alternativas consideradas:** não documentado. O projeto nasceu no App Router;
  não há evidência de Pages Router anterior nem de app único sem grupos de rota.

- **Consequências:**
  - Positivas: separação física clara das áreas; layouts de terapeuta e paciente
    isolados; renderização no servidor por padrão; redirecionamento por papel
    centralizado em um único Server Component.
  - Negativas / dívidas observadas: o fluxo de exercícios concentra-se num
    único arquivo cliente muito grande — `app/(patient)/treino/[exercicio]/page.tsx`
    hospeda um switch de ~39 casos e listas de metadados que obrigam a registrar
    cada exercício em vários pontos (ARQ-006). A rota pública
    `app/preview/bichinho/page.tsx` fica fora dos grupos protegidos e do matcher
    do middleware (SEC-008; ver ADR-004). O redirecionamento por papel duplica a
    checagem de role já feita no middleware (ADR-004).
