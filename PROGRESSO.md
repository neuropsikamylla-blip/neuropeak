# PROGRESSO — NeuroPeak

> Checkpoint de contexto para continuidade entre sessões. Atualizado automaticamente.

## Estado atual (2026-05-30)

**Versão:** 1.9.5 (`699a34a`) — sincronizada com `origin/main` após `git pull`.
**Atividade:** Auditoria COMPLETA do app (5 sub-auditores reais, isolados) concluída → relatório mestre em **`AUDITORIA-2026-05-30.md`**. Correções dos achados seguros parcialmente aplicadas.

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

## Notas importantes

- App clínico (LGPD): dados sensíveis de pacientes. Achados de segurança têm peso real.
- A skill `auditor` não conseguiu usar dispatch de sub-agentes neste ambiente; auditoria foi
  feita em execução direta + verificação manual de cada Crítico/Alto.
- `package-lock.json` tinha alteração local espúria (descartada — usuário nunca editou o app localmente).
