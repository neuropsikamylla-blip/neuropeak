-- Migração manual — PIN legível para o terapeuta consultar
-- Data: 2026-07-11 · Versão: 2.14.0
--
-- Adiciona a coluna "pinPlain" (texto) ao Patient para guardar o PIN em forma
-- legível, de modo que o terapeuta dono consiga consultá-lo depois sem precisar
-- gerar um novo. O campo "pin" continua sendo o hash bcrypt usado no login.
-- Aditivo e idempotente: não altera dados existentes. PINs antigos ficam NULL
-- (legado) até o terapeuta gerar um novo.

ALTER TABLE "Patient"
  ADD COLUMN IF NOT EXISTS "pinPlain" TEXT;
