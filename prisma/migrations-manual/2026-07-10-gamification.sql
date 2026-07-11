-- Migração manual — ARQ-002 (gamificação persistida no servidor)
-- Data: 2026-07-10 · Versão: 2.12.0
--
-- Adiciona duas colunas JSONB opcionais ao Patient para guardar o estado do
-- bichinho (petState) e da árvore de habilidades (skillState), que antes ficavam
-- só no localStorage do navegador. É ADITIVO e idempotente: não altera dados
-- existentes nem toca em constraints/índices. Seguro rodar mais de uma vez.
--
-- Como aplicar (Supabase → SQL Editor, projeto de produção):
--   cole o bloco abaixo e execute.

ALTER TABLE "Patient"
  ADD COLUMN IF NOT EXISTS "petState"   JSONB,
  ADD COLUMN IF NOT EXISTS "skillState" JSONB;

-- Verificação (opcional): deve retornar as duas colunas.
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'Patient' AND column_name IN ('petState','skillState');
