# ADR-004 — Autorização multi-inquilino nas rotas; middleware por papel sem cobrir /api

- **Status:** registrada retroativamente em 2026-07-10

- **Contexto:** a plataforma é multi-inquilino: cada terapeuta só pode ver e
  operar seus próprios pacientes, e cada paciente só os próprios dados. Como as
  queries usam Prisma direto (ADR-002), não há RLS do banco como rede de
  segurança — a fronteira de inquilino tem de ser imposta em código. Além disso é
  preciso barrar acesso de página por papel (paciente não entra em `/dashboard`,
  terapeuta não entra em `/treino`).

- **Decisão:** dois mecanismos complementares.
  1. **Middleware por papel para páginas.** `middleware.ts` usa `withAuth`;
     exige token para qualquer rota do matcher (`middleware.ts:44-46`) e
     redireciona ao `/login` quem não tem o papel certo: prefixos de terapeuta
     (`/dashboard`, `/pacientes`, `/relatorios`, `/treino-cognitivo`,
     `/mundo-interior`, `/configuracoes`, `/admin`) e de paciente (`/inicio`,
     `/treino`, `/progresso`, `/jornada`, `/bichinho`) — os últimos checados com
     `else if` para não colidir `/treino-cognitivo` com `/treino`
     (`middleware.ts:9-39`). O `matcher` lista **apenas rotas de página**; nenhum
     padrão `/api` aparece (`middleware.ts:50-64`).
  2. **Cada rota de API se autoprotege.** Guards centralizados em
     `lib/auth-helpers.ts` (`requireAuth`, `requireTherapist`,
     `requireVerifiedCrp`) resolvem a sessão via `getServerSession` e retornam a
     `Response` de erro pronta (`lib/auth-helpers.ts:33-82`). O escopo de
     inquilino é aplicado por filtros na query: listar pacientes usa
     `where: { therapistId }` (`app/api/patients/route.ts:36`); gravar sessão
     confere que o paciente pertence ao terapeuta antes de escrever
     (`app/api/sessions/route.ts:41-47`) e que um paciente só grava a própria
     sessão (`:37-39`); a sessão terapêutica checa
     `therapistId === user.id` ou `patientId === user.patientId`
     (`app/api/therapeutic-sessions/[id]/route.ts:28-32`).

- **Alternativas consideradas:** incluir `/api` no matcher do middleware para uma
  checagem única de papel. Não adotado — o middleware cobre só páginas e cada
  rota se protege. RLS do Supabase como fronteira de inquilino: descartado pela
  decisão de acessar dados só via Prisma (ADR-002).

- **Consequências:**
  - Positivas: escopo de inquilino explícito e visível em cada query; guards
    reutilizáveis reduzem duplicação de casts e de checagens de papel.
  - Negativas / dívidas observadas: com o middleware fora de `/api`, esquecer um
    filtro `therapistId`/`patientId` numa rota vira falha de autorização silenciosa
    — não há segunda barreira. Ocorrências reais: paciente consegue gravar campos
    clínicos do terapeuta via PATCH da sessão terapêutica (SEC-002); o hash do PIN
    do paciente é devolvido ao cliente por faltar `select` (SEC-003). A rota
    pública `/preview/bichinho` fica fora do matcher (SEC-008). A ausência de rate
    limiting no login (SEC-001) decorre da escolha de auth (ADR-003), não do
    middleware.
