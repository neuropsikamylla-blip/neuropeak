# BACKLOG — NeuroPeak

> **Fonte única de pendências.** Atualizado: 2026-05-30.
> Histórico/detalhes: `AUDITORIA-2026-05-30.md` (achados) · `PROGRESSO.md` (checkpoints).

## Onde estamos
A auditoria completa achou ~40 problemas. **Tudo o que é código está resolvido e no ar**, o **SCHEMA-01 foi aplicado no banco** (2 FKs + 3 CHECK, verificadas) e o **SEC-08 foi executado** (Production com `NEXTAUTH_SECRET` forte; redeploy `dpl_8zMx8EV4…` no ar em 2026-05-30). **Não resta nenhuma pendência de segurança nem operacional.** O que sobra: 1 smoke test visual (você) e 3 itens deferidos por decisão de design/escopo.

---

## 1. ⚡ VOCÊ — fazer agora (rápido)

| Item | O que fazer | Por quê |
|------|-------------|---------|
| **Smoke test** | Abrir **MOT** e **FocusAgents** no app e conferir: bolas/agentes se movem na velocidade certa e o clique acerta. | PERF-01/03 trocaram o motor de animação. `build` não detecta regressão visual — só o olho. |

---

## 2. 🔧 Operacional — ✅ tudo executado (2026-05-30)

**SEC-08** (rotação do `NEXTAUTH_SECRET`) e **SCHEMA-01** (FK + CHECK no banco) foram aplicados em produção via CLI. Sem pendências operacionais.

> ⚠️ **Nota — Preview sem `NEXTAUTH_SECRET`:** ao rotacionar, o ambiente **Preview** ficou sem a variável (o `vercel env add` não-interativo não cria env de preview "all branches" nesta versão do CLI). **Não é risco de segurança** — o secret fraco foi eliminado de todos os ambientes; só previews quebrariam o login se fossem criados (não fazem parte do fluxo atual: push direto na `main` → produção). Resolver no painel web (Settings → Environment Variables → `NEXTAUTH_SECRET` → Preview / all branches) **se/quando previews passarem a ser usados**.

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
**Segurança:** C1, C2, SEC-01–09 (inclui SEC-08 — `NEXTAUTH_SECRET` rotacionado e redeployado em 2026-05-30) · **Bugs:** A1–A4, BUG-01–04, BUG-06, M6 · **Confiabilidade:** REL-01–05 · **Performance:** PERF-01, PERF-03, SUP-01 (Next 15.5.18) · **Qualidade:** QUAL-01–05, LINT-01, TEST-01 (24 testes), A11Y-01, DUP-03/04, ARCH-01, DEAD-01 · **Banco:** SCHEMA-01 (2 FKs em `TherapeuticSession` + 3 CHECK em `Session`, aplicadas e verificadas no Supabase de produção em 2026-05-30; 3 `TherapeuticSession` órfãs removidas; FK no `schema.prisma` em `641bff5`).
*(BUG-05 foi avaliado e descartado — era calibração, não bug.)*
