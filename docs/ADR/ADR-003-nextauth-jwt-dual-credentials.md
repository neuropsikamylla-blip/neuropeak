# ADR-003 — NextAuth v4 com sessão JWT e dois providers Credentials

- **Status:** registrada retroativamente em 2026-07-10

- **Contexto:** existem dois fluxos de login incompatíveis — terapeuta
  (e-mail + senha) e paciente (código `COGxxxxxx` ou id + PIN). Ambas as
  credenciais são validadas contra hashes bcrypt no próprio banco. A sessão
  precisa carregar atributos usados na UI e nas rotas (papel, `patientId`,
  `clinicName`, `theme`, `crp`) sem uma ida ao banco a cada requisição.

- **Decisão:** usar NextAuth v4 com `session.strategy = "jwt"` e
  `maxAge = 8 * 60 * 60` (8 horas) (`lib/auth.ts:7-10`). São registrados dois
  `CredentialsProvider`: `therapist-login`, que valida e-mail + senha com
  `bcrypt.compare` (`lib/auth.ts:16-44`), e `patient-pin`, que resolve o paciente
  por `patientCode` (regex `^COG\d{4,6}$`) ou por id e valida o PIN com
  `bcrypt.compare` (`lib/auth.ts:45-75`). Os callbacks `jwt` e `session` copiam
  `role`, `clinicName`, `patientId`, `theme` e `crp` para o token e de volta para
  a sessão (`lib/auth.ts:77-99`). **Não** se usa `PrismaAdapter` — não há tabela
  de sessão; o estado da sessão vive só no JWT assinado por `NEXTAUTH_SECRET`
  (`lib/auth.ts:101`).

- **Alternativas consideradas:** sessão de banco via `@auth/prisma-adapter`
  (declarado em `package.json` como dependência mas nunca importado — GER-002).
  Rejeitado de fato: a estratégia adotada é JWT sem adapter. Um único provider
  com discriminador de papel foi preterido em favor de dois providers explícitos,
  refletindo os dois fluxos de credencial distintos.

- **Consequências:**
  - Positivas: sessão sem estado (sem round-trip ao banco por requisição);
    dois fluxos de login claramente separados; atributos de papel disponíveis no
    token para o middleware e as rotas.
  - Negativas / dívidas observadas: como atributos ficam no token por 8h,
    dados que mudam no banco não se refletem na sessão até novo login. Por isso a
    verificação de CRP é revalidada **no banco**, não lida do token —
    `requireVerifiedCrp` consulta `crpStatus` em `prisma.user` a cada chamada
    (`lib/auth-helpers.ts:60-82`). O `authorize` roda `bcrypt.compare` sem
    qualquer rate limiting, expondo o PIN de paciente a força bruta (SEC-001).
    Não há fail-fast se `NEXTAUTH_SECRET` faltar ou for fraco (SEC-004), e o
    tempo de resposta vaza existência de conta porque o bcrypt só roda quando o
    registro existe (SEC-005).
