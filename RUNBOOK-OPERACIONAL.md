# Runbook Operacional — SEC-08 e SCHEMA-01

> Ações de **PRODUÇÃO** (Vercel + Supabase da Kamylla). Execução manual, fora do deploy. Rodar com calma, em horário de baixo uso.

---

## SEC-08 — Rotacionar `NEXTAUTH_SECRET`

**Por quê:** o secret atual é fraco/previsível (`...change-in-production-2024`). Se vazar/for adivinhado, dá pra forjar sessões de qualquer usuário.

**Passos:**
1. Gerar um secret forte (o valor não precisa passar por aqui):
   ```bash
   openssl rand -base64 48
   ```
2. **Vercel** → projeto `neuropeak-5jyl` → **Settings → Environment Variables** → `NEXTAUTH_SECRET` (Production) → colar o novo valor.
3. **Redeploy**.

> ⚠️ Invalida todas as sessões ativas — todos relogam. Faça em horário tranquilo.

---

## SCHEMA-01 — FK + CHECK no banco

**Status:** a **FK já está no código** (`prisma/schema.prisma`, commitada — relações `TherapeuticSession.patient/therapist` com `onDelete: Cascade`). Falta **aplicar no banco** + adicionar as **CHECK** (que o Prisma não suporta no schema). Tudo no **Supabase → SQL Editor**, na ordem.

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
