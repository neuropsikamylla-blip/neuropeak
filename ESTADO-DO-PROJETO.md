# 📍 Estado do Projeto — NeuroPeak (LEIA PRIMEIRO)

> **Handoff / ponto de entrada.** Atualizado em **2026-05-30**. Versão **1.9.7**.
> Se você é o assistente (Claude) da Kamylla começando agora: **leia este arquivo inteiro antes de qualquer coisa.** Ele resume o que foi feito, onde estamos e o que falta. Os detalhes estão nos outros documentos (mapa no fim).

---

## 🎯 Resumo em 30 segundos

O app passou por uma **auditoria completa de segurança/qualidade** em 2026-05-30 (Jonathan como auditor + Claude). Foram encontrados **~40 problemas**. **Tudo o que é código foi corrigido e já está em produção.** Além disso, três itens de infraestrutura/banco foram aplicados em produção: **SCHEMA-01** (integridade do banco), **SEC-08** (rotação de secret) e **PERF-02** (otimização do dashboard).

**O app está sólido e no ar. Não há pendência de segurança, de código nem operacional.** O que resta é: 1 teste visual (Kamylla), 2 melhorias deferidas por decisão (não são bugs) e 1 CVE de dependência sem correção disponível (monitorar).

---

## ✅ Estado atual (o que está no ar)

| Camada | Estado |
|--------|--------|
| **Produção** | `https://neuropeak-5jyl.vercel.app` — versão **1.9.7** |
| **GitHub** | `neuropsikamylla-blip/neuropeak`, branch `main`, commit `bd3e5c4` — **sincronizado** |
| **Vercel** | deploy `dpl_ECnNbvxx…` no ar, `/api/health` → `{"ok":true}` |
| **Banco (Supabase)** | FKs + CHECK do SCHEMA-01 **aplicadas e verificadas** |
| **Auth** | `NEXTAUTH_SECRET` **rotacionado** (secret fraco eliminado) |

> ⚠️ **Importante para o primeiro acesso:** a rotação do secret (SEC-08) **deslogou todas as sessões**. Ao abrir o app, é **normal cair na tela de login** — basta **relogar**. Isso não é bug; é o efeito esperado da troca de secret.

---

## 🔧 O que foi feito nesta sessão (2026-05-30)

- **Auditoria completa** das 5 dimensões (correctness, security, architecture, performance, general) sobre ~149 arquivos. Detalhes e IDs em `AUDITORIA-2026-05-30.md`.
- **Corrigido e no ar (código):** segurança (C1, C2, SEC-01–09 — inclui IDORs multi-tenant, gate de CRP no servidor, headers/CSP, comparação time-safe de segredos), bugs clínicos (A1–A4, BUG-01–04, BUG-06, M6), confiabilidade (REL-01–05 — `withApiHandler` + transações atômicas), performance (PERF-01/02/03, SUP-01 → Next 15.5.18), qualidade (QUAL-01–05, LINT-01, **TEST-01: 24 testes Vitest**, A11Y-01, ARCH-01, DEAD-01).
- **SCHEMA-01** (banco): adicionadas FKs em `TherapeuticSession` (`patient`/`therapist`, `onDelete: Cascade`) + 3 CHECK em `Session` (`score` 0–100, `accuracy` 0–1, `difficulty` 1–10). Removidas 3 sessões órfãs. Verificado com `pg_get_constraintdef` — banco 100% alinhado ao `schema.prisma`.
- **SEC-08** (auth): `NEXTAUTH_SECRET` trocado por um forte (64 chars) via Vercel CLI + redeploy.
- **PERF-02** (perf): dashboard agora traz só o **top-20 sessões por paciente** (window function `$queryRaw`) em vez do histórico inteiro. Equivalência provada no banco real.

---

## ⏳ O que FALTA (pendências)

### 1. 👁️ Teste visual — **responsabilidade da Kamylla**
Abrir o app e conferir os exercícios cujo **motor de animação** foi reescrito (PERF-01/03). O `build` não detecta regressão visual — só o olho:
- **MOT** (Multiple Object Tracking) e **FocusAgents**: as bolas/agentes se movem na velocidade certa? O clique acerta o alvo?
- Recomendado também: abrir 3–4 exercícios variados e o **Dashboard** (validar que a nova query carrega a lista de pacientes e métricas).

### 2. ⏸️ Deferidos — **NÃO são bugs; decisão consciente de não fazer**
Foram avaliados e deixados de fora de propósito (risco > ganho). **Não refazer sem decisão explícita:**
- **ARCH-02** — quebrar 4 componentes grandes (+900 linhas: `DesafioCidade`, `CertoOuErrado`, `Labirinto`, `FocusAgents`) em módulos. Alto risco (sem testes E2E), zero ganho funcional.
- **DUP-01** — unificar os "temas" visuais de ~30 exercícios. É **redesenho** (muda a aparência), não correção — precisa de decisão de design da Kamylla.

### 3. 📡 Monitorar — sem ação possível hoje
- **SUP-02** — CVE *moderate* do `nodemailer`, **sem fix upstream**. Acompanhar; atualizar quando sair correção.

### 4. ⚠️ Nota operacional
- **`NEXTAUTH_SECRET` do ambiente Preview** ficou ausente (limitação do Vercel CLI não-interativo). **Não é risco de segurança.** Só relevante **se** previews passarem a ser usados — aí adicionar no painel web (Settings → Environment Variables → `NEXTAUTH_SECRET` → Preview / all branches). Hoje o fluxo é push direto na `main` → produção, sem previews.

---

## 👩‍⚕️ O que a Kamylla deve fazer agora

1. `git pull` na `main` (já está tudo lá).
2. Abrir `https://neuropeak-5jyl.vercel.app` → **relogar** (foi deslogada pelo SEC-08).
3. Conferir que o **Dashboard** carrega normal (lista de pacientes + métricas + alertas).
4. **Smoke test:** abrir **MOT** e **FocusAgents** e validar movimento/velocidade/clique.
5. (Opcional) Rodar alguns exercícios variados para validação funcional geral.

Se algo parecer errado no visual/jogabilidade, reportar — é exatamente o que o smoke test existe para pegar.

---

## 🤖 Para o Claude da Kamylla — como continuar

- **Ordem de leitura:** este arquivo → `BACKLOG.md` (pendências) → `AUDITORIA-2026-05-30.md` (achados/IDs) → `PROGRESSO.md` e `RUNBOOK-OPERACIONAL.md` (detalhes técnicos).
- **App clínico (LGPD):** dados sensíveis de pacientes. Achados de segurança têm peso real; nunca relaxe ownership/validação.
- **Deploy:** push na `main` dispara deploy de **produção** na Vercel. Versionar `package.json` a cada mudança (patch = fix/ajuste; minor = feature/exercício).
- **Banco:** o `schema.prisma` já reflete o banco. As 3 CHECK do SCHEMA-01 **não** estão no schema (Prisma não suporta) — um `prisma db push` futuro pode removê-las; reaplicar o SQL do `RUNBOOK-OPERACIONAL.md` se isso acontecer, ou migrar para `prisma migrate`.
- **Não reabra os deferidos** (ARCH-02, DUP-01) sem decisão da Kamylla — eles foram deixados de fora conscientemente.

---

## 🗺️ Mapa de documentos

| Arquivo | Para quê |
|---------|----------|
| `ESTADO-DO-PROJETO.md` (este) | Ponto de entrada / handoff — leia primeiro |
| `CLAUDE.md` | Guia do projeto: stack, rotas, modelos, comandos, convenções |
| `ARCHITECTURE.md` | Arquitetura do sistema |
| `BACKLOG.md` | **Fonte única de pendências**, organizada por quem faz |
| `AUDITORIA-2026-05-30.md` | Relatório completo da auditoria (achados por severidade + IDs) |
| `PROGRESSO.md` | Checkpoint detalhado da sessão (o que foi feito, decisões) |
| `RUNBOOK-OPERACIONAL.md` | Procedimentos de produção (SEC-08, SCHEMA-01) — já executados |
