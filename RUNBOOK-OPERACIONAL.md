# Runbook Operacional — SEC-08 e SCHEMA-01

> Ações de **PRODUÇÃO** (Vercel + Supabase da Kamylla). **Não são código** — execução manual, fora do deploy. Rodar com calma, em horário de baixo uso.

---

## SEC-08 — Rotacionar `NEXTAUTH_SECRET`

**Por quê:** o secret atual é fraco/previsível (`...change-in-production-2024`). Se vazar/for adivinhado, dá pra forjar sessões de qualquer usuário. Um secret forte e único fecha isso.

**Passos:**
1. Gerar um secret forte (no terminal — o valor **não** precisa passar por aqui):
   ```bash
   openssl rand -base64 48
   ```
2. **Vercel** → projeto `neuropeak-5jyl` → **Settings → Environment Variables** → `NEXTAUTH_SECRET` (Production) → colar o novo valor (substituir o antigo).
3. **Redeploy** (Deployments → ⋯ → Redeploy) para aplicar.

> ⚠️ **Efeito:** todas as sessões ativas (terapeutas e pacientes logados) são invalidadas — todos relogam. Faça num horário tranquilo.

---

## SCHEMA-01 — Travas de integridade no banco

**Por quê:** hoje o banco aceita qualquer número em `score/accuracy/difficulty`, e as `TherapeuticSession` apontam pra paciente/terapeuta sem ligação formal (FK). A validação só existe no código (Zod). Estas travas são uma **segunda camada** (defesa em profundidade).

**Onde:** Supabase da Kamylla → **SQL Editor**. Rodar **na ordem**.

### Passo 1 — Diagnóstico (ver se há dados que impedem as travas)
```sql
SELECT
  (SELECT count(*) FROM "Session" WHERE score < 0 OR score > 100)                                                          AS score_fora,
  (SELECT count(*) FROM "Session" WHERE accuracy < 0 OR accuracy > 1)                                                      AS accuracy_fora,
  (SELECT count(*) FROM "Session" WHERE difficulty < 1 OR difficulty > 10)                                                 AS difficulty_fora,
  (SELECT count(*) FROM "TherapeuticSession" ts WHERE NOT EXISTS (SELECT 1 FROM "Patient" p WHERE p.id = ts."patientId"))   AS ts_sem_paciente,
  (SELECT count(*) FROM "TherapeuticSession" ts WHERE NOT EXISTS (SELECT 1 FROM "User"    u WHERE u.id = ts."therapistId")) AS ts_sem_terapeuta;
```
- **Tudo 0** → pule o Passo 2, vá direto ao Passo 3.
- **Algum > 0** → rode o Passo 2 antes.

### Passo 2 — Limpeza (SÓ se o Passo 1 acusou algo > 0)
```sql
-- Clampa valores fora do range (mantém o registro, corrige o valor):
UPDATE "Session" SET score      = LEAST(100, GREATEST(0, score))      WHERE score < 0 OR score > 100;
UPDATE "Session" SET accuracy   = LEAST(1,   GREATEST(0, accuracy))   WHERE accuracy < 0 OR accuracy > 1;
UPDATE "Session" SET difficulty = LEAST(10,  GREATEST(1, difficulty)) WHERE difficulty < 1 OR difficulty > 10;

-- Remove sessões terapêuticas órfãs (paciente/terapeuta já não existe):
DELETE FROM "TherapeuticSession" ts WHERE NOT EXISTS (SELECT 1 FROM "Patient" p WHERE p.id = ts."patientId");
DELETE FROM "TherapeuticSession" ts WHERE NOT EXISTS (SELECT 1 FROM "User"    u WHERE u.id = ts."therapistId");
```

### Passo 3 — Aplicar as travas
```sql
ALTER TABLE "Session" ADD CONSTRAINT session_score_range      CHECK (score >= 0 AND score <= 100);
ALTER TABLE "Session" ADD CONSTRAINT session_accuracy_range   CHECK (accuracy >= 0 AND accuracy <= 1);
ALTER TABLE "Session" ADD CONSTRAINT session_difficulty_range CHECK (difficulty >= 1 AND difficulty <= 10);

ALTER TABLE "TherapeuticSession"
  ADD CONSTRAINT ts_patient_fk   FOREIGN KEY ("patientId")   REFERENCES "Patient"(id) ON DELETE CASCADE;
ALTER TABLE "TherapeuticSession"
  ADD CONSTRAINT ts_therapist_fk FOREIGN KEY ("therapistId") REFERENCES "User"(id)    ON DELETE CASCADE;
```
Cada `ALTER` deve retornar "Success". Se algum falhar, **pare** e me mande o erro.

### ⚠️ Nota importante — convivência com `prisma db push`
O projeto sincroniza o schema via `prisma db push` (sem migrations versionadas). As **CHECK constraints não existem no `schema.prisma`** (o Prisma não as suporta no schema), então **um `db push` futuro pode tentar removê-las**. Duas saídas:
- **Recomendado:** ao mexer no schema de novo, eu adiciono as **FKs** ao `schema.prisma` (via `@relation` + `onDelete`) — essas o `db push` passa a respeitar. As CHECK ficam como SQL "extra" (reaplicar se um `db push` as remover).
- **Alternativa de longo prazo:** migrar de `db push` para `prisma migrate` (migrations versionadas), que versiona tudo isso.

Por isso o item está como **operacional/coordenado**, não como um `db push` automático.
