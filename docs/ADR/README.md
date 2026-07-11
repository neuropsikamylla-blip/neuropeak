# Architecture Decision Records — NeuroPeak

Registro das decisões arquiteturais do NeuroPeak, documentadas retroativamente a
partir do código real (não de memória). Cada ADR cita a evidência em
`arquivo:linha` e referencia, quando cabível, os IDs de achados da auditoria de
2026-07-10 (`docs/auditoria/AUDITORIA-2026-07-10.md`, espelhados em
`docs/DIVIDA-TECNICA.md`).

Formato de cada ADR: Contexto · Decisão · Alternativas consideradas ·
Consequências.

## Índice

| ADR | Título | Status |
|-----|--------|--------|
| [ADR-001](./ADR-001-next-app-router-route-groups.md) | Next.js App Router com grupos de rota por papel | registrada retroativamente em 2026-07-10 |
| [ADR-002](./ADR-002-prisma-postgres-supabase-storage.md) | Prisma + PostgreSQL (Supabase) para dados; Supabase Storage só para arquivos | registrada retroativamente em 2026-07-10 |
| [ADR-003](./ADR-003-nextauth-jwt-dual-credentials.md) | NextAuth v4 com sessão JWT e dois providers Credentials | registrada retroativamente em 2026-07-10 |
| [ADR-004](./ADR-004-autorizacao-multi-inquilino-middleware.md) | Autorização multi-inquilino nas rotas; middleware por papel sem cobrir /api | registrada retroativamente em 2026-07-10 |
| [ADR-005](./ADR-005-progressao-dificuldade-no-servidor.md) | Progressão de dificuldade calculada no servidor | registrada retroativamente em 2026-07-10 |
| [ADR-006](./ADR-006-banco-fonte-verdade-localstorage-cache.md) | Banco como fonte da verdade; localStorage como cache otimista | registrada retroativamente em 2026-07-10 |
| [ADR-007](./ADR-007-pdf-servidor-react-pdf.md) | Geração de relatórios PDF no servidor com @react-pdf/renderer | registrada retroativamente em 2026-07-10 |
| [ADR-008](./ADR-008-taxonomia-exercicios-camadas.md) | Taxonomia de exercícios em camadas Domínio → Subdomínio → Exercício | registrada retroativamente em 2026-07-10 |
