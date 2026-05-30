# BACKLOG — NeuroPeak

> **Fonte única de pendências.** Atualizado: 2026-05-30.
> Histórico/detalhes: `AUDITORIA-2026-05-30.md` (achados) · `PROGRESSO.md` (checkpoints).

## Onde estamos
A auditoria completa achou ~40 problemas. **Tudo o que é código** (segurança, bugs, confiabilidade, performance, testes, acessibilidade) **está resolvido e no ar** (produção), e o **SCHEMA-01 foi aplicado no banco de produção** (2 FKs + 3 CHECK, verificadas via `pg_get_constraintdef` em 2026-05-30). Restam **5 pendências**, abaixo, agrupadas por quem faz.

---

## 1. ⚡ VOCÊ — fazer agora (rápido)

| Item | O que fazer | Por quê |
|------|-------------|---------|
| **Smoke test** | Abrir **MOT** e **FocusAgents** no app e conferir: bolas/agentes se movem na velocidade certa e o clique acerta. | PERF-01/03 trocaram o motor de animação. `build` não detecta regressão visual — só o olho. |

---

## 2. 🔧 KAMYLLA (ou você, com acesso) — produção, não é código

| Item | O que fazer | ⚠️ Risco / cuidado |
|------|-------------|--------------------|
| **SEC-08** | No Vercel → Environment Variables → trocar `NEXTAUTH_SECRET` por um forte: `openssl rand -base64 48`. | **Desloga todas as sessões ativas** (todos relogam). |

---

## 3. ⏸️ DEFERIDO — decidi NÃO fazer agora (e por quê)

| Item | O que era | Por que ficou de fora |
|------|-----------|------------------------|
| **DUP-01** | Unificar os "temas" visuais em ~30 exercícios | **Não é correção, é redesenho.** Os exercícios hoje divergem no visual; unificar mudaria a aparência de vários → precisa decisão de design + smoke test dedicado. Risco alto, valor cosmético. |
| **PERF-02** | Over-fetch nas queries do dashboard | **Otimização prematura** (base = 1 terapeuta). E a solução simples regrediria a "última sessão" de pacientes inativos. Refazer com *window function* quando a base crescer. |
| **ARCH-02** | Quebrar arquivos de ~1150 linhas em módulos | **Alto risco / zero ganho funcional** em produção. Manutenibilidade pura. |

---

## 4. 🟢 MENOR / monitorar

| Item | Situação |
|------|----------|
| **SUP-02** | CVE moderate do `nodemailer` — **sem fix upstream**. Monitorar; não há ação possível hoje. |
| **DUP-02 (parcial)** | A locução do `SpanNumerico` ainda usa `speak()` local (precisa aguardar o fim da fala); o resto do TTS já foi centralizado. Cosmético. |

---

## ✅ Resolvido e no ar (referência rápida)
**Segurança:** C1, C2, SEC-01–07, SEC-09 · **Bugs:** A1–A4, BUG-01–04, BUG-06, M6 · **Confiabilidade:** REL-01–05 · **Performance:** PERF-01, PERF-03, SUP-01 (Next 15.5.18) · **Qualidade:** QUAL-01–05, LINT-01, TEST-01 (24 testes), A11Y-01, DUP-03/04, ARCH-01, DEAD-01 · **Banco:** SCHEMA-01 (2 FKs em `TherapeuticSession` + 3 CHECK em `Session`, aplicadas e verificadas no Supabase de produção em 2026-05-30; 3 `TherapeuticSession` órfãs removidas; FK no `schema.prisma` em `641bff5`).
*(BUG-05 foi avaliado e descartado — era calibração, não bug.)*
