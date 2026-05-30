# Runbook Operacional — SEC-08 e SCHEMA-01

> Ações de **PRODUÇÃO** (Vercel + Supabase da Kamylla). Execução manual, fora do deploy. Rodar com calma, em horário de baixo uso.

---

## SEC-08 — Rotacionar `NEXTAUTH_SECRET` — ✅ EXECUTADO (2026-05-30)

**Por quê:** o secret antigo era fraco/previsível (`...change-in-production-2024`). Com ele, dava pra forjar sessões de qualquer usuário.

**O que foi feito (via Vercel CLI, conta `neuropsikamylla-blip`, projeto `neuropeak-5jyl`):**
1. Gerado secret forte com `openssl rand -base64 48` (64 chars) — valor pipado direto pro CLI, sem passar pelo terminal/histórico.
2. `vercel env rm NEXTAUTH_SECRET production --yes` + `vercel env add NEXTAUTH_SECRET production` (valor via stdin). Production passou a ter o secret forte.
3. Redeploy de produção: `vercel --prod --yes` → deploy `dpl_8zMx8EV4KWW2Vr8UJex4mcH2m8wd` (READY, target production, aliado a `neuropeak-5jyl.vercel.app`). Build limpo + `prisma generate` OK.
4. Verificado: `/api/version` → buildId novo (`dpl_8zMx8EV4…`, era `dpl_5B2jdGQN…`); `/api/health` → `{"ok":true}`.

> ⚠️ Invalidou todas as sessões ativas — todos relogam (efeito esperado). Feito num sábado de baixo uso.

> ⚠️ **Preview ficou SEM `NEXTAUTH_SECRET`:** o `vercel env add` não-interativo (modo agente) não cria env de preview "all branches" nesta versão (54.6.1) — exige uma branch como 3º argumento. **Não é risco de segurança** (o secret fraco foi eliminado de todos os ambientes). Só previews quebrariam o login se criados. Quando o painel web voltar a abrir, adicionar `NEXTAUTH_SECRET` em Preview (all branches) — **só é necessário se previews passarem a ser usados** (hoje o fluxo é push direto na `main` → produção).

---

## SCHEMA-01 — FK + CHECK no banco — ✅ APLICADO (2026-05-30)

**Status: CONCLUÍDO e verificado.** Aplicado no Supabase de produção em 2026-05-30, via SQL Editor (não por `prisma db push` — fizemos por SQL direto, com os nomes/ações idênticos aos que o Prisma gera, para o schema continuar alinhado).

**O que foi feito, na ordem:**
1. **Diagnóstico** — score/accuracy/difficulty todos no range (0 fora). Achadas **3 `TherapeuticSession` órfãs** (mesmo paciente já deletado, `ffc9c058…`, sessões de 25–27/mai).
2. **Limpeza** — `DELETE` das 3 órfãs (lixo da época sem FK; o Cascade passa a prevenir).
3. **FKs** — `TherapeuticSession_patientId_fkey` e `TherapeuticSession_therapistId_fkey`, ambas `ON DELETE CASCADE ON UPDATE CASCADE` (num `BEGIN/COMMIT`).
4. **CHECK** — `session_score_range` (0–100), `session_accuracy_range` (0–1), `session_difficulty_range` (1–10).
5. **Verificação** — `pg_get_constraintdef` confirmou as 6 constraints + `Patient.therapist` como `RESTRICT` (igual ao schema). Banco 100% alinhado com `schema.prisma` (commit `641bff5`).

> ⚠️ **Única pegadinha futura:** as 3 CHECK **não existem no `schema.prisma`** (o Prisma não as suporta). Um `prisma db push` futuro **pode removê-las** — reaplicar o SQL do Passo 3b (abaixo) depois, **ou** migrar para `prisma migrate`. As FKs estão no schema e não têm esse risco.

<details>
<summary>Procedimento original (referência — já executado)</summary>

### Passo 1 — Diagnóstico (no Supabase SQL Editor)
```sql
SELECT
  (SELECT count(*) FROM "Session" WHERE score < 0 OR score > 100)                                                          AS score_fora,
  (SELECT count(*) FROM "Session" WHERE accuracy < 0 OR accuracy > 1)                                                      AS accuracy_fora,
  (SELECT count(*) FROM "Session" WHERE difficulty < 1 OR difficulty > 10)                                                 AS difficulty_fora,
  (SELECT count(*) FROM "TherapeuticSession" ts WHERE NOT EXISTS (SELECT 1 FROM "Patient" p WHERE p.id = ts."patientId"))   AS ts_sem_paciente,
  (SELECT count(*) FROM "TherapeuticSession" ts WHERE NOT EXISTS (SELECT 1 FROM "User"    u WHERE u.id = ts."therapistId")) AS ts_sem_terapeuta;
```
- **Tudo 0** → pule o Passo 2.
- **Algo > 0** → rode o Passo 2 primeiro (senão a FK / CHECK falham na criação).

### Passo 2 — Limpeza (só se o Passo 1 acusou > 0)
```sql
UPDATE "Session" SET score      = LEAST(100, GREATEST(0, score))      WHERE score < 0 OR score > 100;
UPDATE "Session" SET accuracy   = LEAST(1,   GREATEST(0, accuracy))   WHERE accuracy < 0 OR accuracy > 1;
UPDATE "Session" SET difficulty = LEAST(10,  GREATEST(1, difficulty)) WHERE difficulty < 1 OR difficulty > 10;
DELETE FROM "TherapeuticSession" ts WHERE NOT EXISTS (SELECT 1 FROM "Patient" p WHERE p.id = ts."patientId");
DELETE FROM "TherapeuticSession" ts WHERE NOT EXISTS (SELECT 1 FROM "User"    u WHERE u.id = ts."therapistId");
```

### Passo 3a — Aplicar as FKs (via Prisma, no terminal com `.env.local` de produção)
> A FK está no schema, então o Prisma cria com os nomes corretos. Como o schema reflete o banco depois, um `db push` futuro NÃO as remove.
```bash
git pull                 # pega o schema.prisma com as FKs
npx prisma db push       # cria as FKs no banco (revise o que ele propõe antes de confirmar)
```
> Esperado: criar 2 foreign keys em `TherapeuticSession` + ajustar a de `Patient.therapist` (NO ACTION → Restrict). **Nenhuma perda de dados** — só políticas de integridade. Se acusar perda de dados, **pare** e me chame.

### Passo 3b — Aplicar as CHECK (SQL no Supabase)
```sql
ALTER TABLE "Session" ADD CONSTRAINT session_score_range      CHECK (score >= 0 AND score <= 100);
ALTER TABLE "Session" ADD CONSTRAINT session_accuracy_range   CHECK (accuracy >= 0 AND accuracy <= 1);
ALTER TABLE "Session" ADD CONSTRAINT session_difficulty_range CHECK (difficulty >= 1 AND difficulty <= 10);
```

### ⚠️ Nota — CHECK e `prisma db push`
As CHECK **não existem no `schema.prisma`** (o Prisma não as suporta no schema), então um `db push` futuro **pode removê-las**. Saídas: reaplicar este SQL após um `db push`, **ou** migrar de `db push` para `prisma migrate` (versiona tudo). As **FKs** não têm esse problema (estão no schema).

</details>
