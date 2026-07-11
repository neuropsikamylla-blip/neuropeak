# ADR-002 — Prisma + PostgreSQL (Supabase) para dados; Supabase Storage só para arquivos

- **Status:** registrada retroativamente em 2026-07-10

- **Contexto:** a aplicação precisa de um banco relacional com tipos gerados e
  migrações versionadas para dados clínicos (pacientes, sessões, planos), e de um
  local para guardar documentos de verificação de CRP (arquivos binários
  sensíveis). O Supabase oferece tanto o Postgres gerenciado quanto um serviço de
  storage, mas a camada de acesso a dados precisava de um ORM tipado.

- **Decisão:** usar Prisma como ORM sobre PostgreSQL hospedado no Supabase. O
  datasource declara `provider = "postgresql"` com conexão pooled em
  `env("DATABASE_URL")` e conexão direta em `directUrl = env("DIRECT_URL")` para
  migrações (`prisma/schema.prisma:6-8`). O client é um singleton reaproveitado
  em desenvolvimento para evitar múltiplas conexões no hot-reload
  (`lib/db.ts:7-13`). O client oficial do Supabase (`@supabase/supabase-js`) é
  instanciado sob demanda e usado **apenas para storage** — as únicas chamadas
  reais são uploads/downloads/remoções no bucket `crp-documents`
  (`lib/supabase.ts:5-13`; `app/api/crp-verification/route.ts:38`,`:54`;
  `app/api/crp-verification/document/route.ts:23`). Não há consultas de dados via
  `supabase.from(...)`; todo acesso a tabelas passa pelo Prisma.

- **Alternativas consideradas:** usar o client Supabase (PostgREST/RLS) também
  para leitura/escrita de dados. Rejeitado na prática — a base inteira consulta
  via Prisma e o client Supabase permanece restrito a storage. Um proxy de
  compatibilidade em `lib/supabase.ts:16-20` mantém a forma `supabase.from(...)`
  para código legado, mas ela não é exercida para dados.

- **Consequências:**
  - Positivas: tipos gerados e migrações versionadas; uma única fonte de acesso a
    dados (Prisma), o que simplifica o raciocínio sobre isolamento multi-inquilino
    (ADR-004); separação clara entre dados (Postgres) e binários sensíveis
    (bucket dedicado).
  - Negativas / dívidas observadas: como as queries não passam por RLS do
    Supabase, toda a autorização por inquilino depende de os filtros
    `therapistId`/`patientId` estarem corretos em cada rota (ADR-004) — sem uma
    rede de segurança no banco. O bucket `crp-documents` guarda dado sensível e
    exige limpeza de órfãos manual no código (`app/api/crp-verification/route.ts:53-54`).
